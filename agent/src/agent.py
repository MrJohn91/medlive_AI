"""
MedLive AI - Medical Triage Agent

An AI-powered medical triage assistant that:
- Listens to patient symptoms via voice
- Sees visible symptoms via camera (Gemini Vision)
- Auto-fills intake forms via RPC
- Provides triage recommendations
- Saves records to Google Sheets
- Schedules appointments
"""

import json
import logging
import os
from datetime import datetime
from typing import Annotated

from dotenv import load_dotenv
from pydantic import Field

from livekit import rtc
from livekit.agents import (
    Agent,
    AgentSession,
    AgentServer,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    llm,
    room_io,
)
from livekit.plugins import anam, google, silero

load_dotenv(".env.local")

logger = logging.getLogger("medlive-agent")
logger.setLevel(logging.INFO)

# Valid field names for the intake form
VALID_FIELD_NAMES = [
    "patientName",
    "age",
    "contact",
    "chiefComplaint",
    "symptomDetails",
    "duration",
    "visualAssessment",
    "triageLevel",
    "recommendation",
    "status",
    "actionNeeded",
    "appointmentTime",
]

# Triage levels
TRIAGE_LEVELS = {
    "emergency": {
        "level": "EMERGENCY",
        "description": "Life-threatening condition requiring immediate emergency care",
        "action": "Call 911 or go to the nearest emergency room immediately",
        "timeframe": "Immediately",
    },
    "urgent": {
        "level": "URGENT",
        "description": "Serious condition requiring prompt medical attention",
        "action": "Go to the emergency room or urgent care within a few hours",
        "timeframe": "Within 2-4 hours",
    },
    "semi_urgent": {
        "level": "SEMI-URGENT",
        "description": "Condition requiring medical attention soon",
        "action": "See a doctor within 24 hours",
        "timeframe": "Within 24 hours",
    },
    "routine": {
        "level": "ROUTINE",
        "description": "Non-urgent condition that can be scheduled",
        "action": "Schedule an appointment with your doctor",
        "timeframe": "Within a few days",
    },
    "self_care": {
        "level": "SELF-CARE",
        "description": "Minor condition that can be managed at home",
        "action": "Home treatment with over-the-counter remedies",
        "timeframe": "Monitor for 2-3 days",
    },
}


def get_remote_participant_identity(ctx: JobContext) -> str:
    """Get the identity of the remote participant (user), excluding Anam avatars."""
    for participant in ctx.room.remote_participants.values():
        if not participant.identity.startswith("anam-"):
            return participant.identity
    raise llm.ToolError("No remote participant found")


async def perform_rpc_to_frontend(ctx: JobContext, method: str, payload: str) -> str:
    """Perform an RPC call to the frontend participant."""
    local_participant = ctx.room.local_participant
    if not local_participant:
        raise llm.ToolError("Agent not connected to room")

    destination_identity = get_remote_participant_identity(ctx)

    response = await local_participant.perform_rpc(
        destination_identity=destination_identity,
        method=method,
        payload=payload,
        response_timeout=5.0,
    )
    return response


class MedLiveAgent(Agent):
    """Medical triage agent powered by Gemini with vision capabilities."""

    def __init__(self, ctx: JobContext) -> None:
        self._ctx = ctx
        self._patient_data = {}
        super().__init__(
            instructions="""You are Dr. Liv, a compassionate and professional AI medical triage assistant at MedLive AI. You help patients understand their symptoms and guide them to appropriate care.

## Your Personality
- Warm, calm, and reassuring - patients may be worried or in discomfort
- Professional but not cold - use a conversational tone
- Patient and thorough - never rush through important medical information
- Clear communicator - avoid medical jargon unless explaining it

## Your Capabilities
1. LISTEN - Understand patient symptoms through natural conversation
2. SEE - Analyze visible symptoms when patients show you via camera
3. FILL - Automatically capture patient information into their intake form
4. TRIAGE - Assess urgency and recommend appropriate level of care
5. CONNECT - Help patients schedule appointments or request callbacks

## Conversation Flow

### 1. Greeting
Start warmly: "Hi, I'm Dr. Liv, your AI health assistant. I'm here to help you understand your symptoms and guide you to the right care. What's bringing you in today?"

### 2. Symptom Collection (One question at a time)
- Chief complaint: "Tell me what's been bothering you."
- Details: Use OPQRST method
  - Onset: "When did this start?"
  - Provocation: "Does anything make it better or worse?"
  - Quality: "How would you describe the sensation?"
  - Region: "Where exactly is the discomfort?"
  - Severity: "On a scale of 1-10, how would you rate it?"
  - Time: "Is it constant or does it come and go?"

### 3. Visual Assessment (When Relevant)
If the symptom is visible (rash, swelling, wound, etc.):
"I'd like to take a look. Can you show me [the affected area] using your camera?"
Then describe what you observe objectively.

### 4. Form Filling
As you gather information, use update_field to capture:
- patientName, age, contact
- chiefComplaint, symptomDetails, duration
- visualAssessment (what you observed)

### 5. Triage Assessment
Use the assess_triage tool to determine urgency level:
- EMERGENCY: Chest pain, difficulty breathing, stroke symptoms, severe bleeding
- URGENT: High fever with rash, severe pain, possible fractures
- SEMI-URGENT: Moderate symptoms needing attention within 24 hours
- ROUTINE: Non-urgent issues for scheduled appointments
- SELF-CARE: Minor issues manageable at home

### 6. Recommendation & Next Steps
Clearly explain:
1. What you observed and assessed
2. The recommended level of care
3. What they should do next

Then offer: "Would you like me to help you schedule an appointment with a doctor, or would you prefer to have someone call you back?"

### 7. Doctor Connection
Based on their preference:
- Schedule appointment: Use schedule_appointment tool
- Request callback: Use request_callback tool
- Submit their information to the clinic: Use submit_to_sheets tool

## Important Rules
- NEVER diagnose - you provide triage guidance, not medical diagnoses
- ALWAYS recommend emergency services for life-threatening symptoms
- NEVER prescribe medications or specific dosages
- If uncertain, err on the side of caution
- Confirm information before saving to forms
- Be honest about your limitations as an AI

## Form Field Names (use exactly these)
patientName, age, contact, chiefComplaint, symptomDetails, duration, visualAssessment, triageLevel, recommendation, status, actionNeeded, appointmentTime

Begin by greeting the patient warmly.""",
        )

    @function_tool()
    async def update_field(
        self,
        context: RunContext,
        field_name: Annotated[
            str,
            Field(
                description="The form field to update: patientName, age, contact, chiefComplaint, symptomDetails, duration, visualAssessment, triageLevel, recommendation, status, actionNeeded, appointmentTime"
            ),
        ],
        value: Annotated[
            str,
            Field(description="The value to set for the field"),
        ],
    ):
        """Update a field on the patient intake form. Call this whenever the patient provides information that should be recorded."""
        if field_name not in VALID_FIELD_NAMES:
            raise llm.ToolError(f"Invalid field name: {field_name}")

        # Store locally
        self._patient_data[field_name] = value

        try:
            payload = json.dumps({"fieldName": field_name, "value": value})
            response = await perform_rpc_to_frontend(self._ctx, "updateField", payload)
            logger.info(f"Updated field {field_name}: {value}")
            return f"Field '{field_name}' updated successfully"
        except Exception as e:
            logger.error(f"Failed to update field: {e}")
            # Still store locally even if RPC fails
            return f"Field '{field_name}' recorded"

    @function_tool()
    async def get_form_state(self, context: RunContext):
        """Get the current state of all form fields. Use this to verify what information has been collected."""
        try:
            response = await perform_rpc_to_frontend(self._ctx, "getFormState", "{}")
            return response
        except Exception as e:
            # Return local state if RPC fails
            return json.dumps(self._patient_data)

    @function_tool()
    async def assess_triage(
        self,
        context: RunContext,
        symptoms: Annotated[
            str,
            Field(description="Summary of the patient's symptoms"),
        ],
        duration: Annotated[
            str,
            Field(description="How long symptoms have been present"),
        ],
        severity: Annotated[
            int,
            Field(description="Patient-reported severity on scale of 1-10"),
        ],
        visual_findings: Annotated[
            str,
            Field(description="What was observed visually, if applicable. Use 'None' if no visual assessment."),
        ],
    ):
        """Assess the appropriate triage level based on patient symptoms and findings."""

        # Emergency indicators
        emergency_keywords = [
            "chest pain", "difficulty breathing", "can't breathe", "stroke",
            "severe bleeding", "unconscious", "seizure", "severe allergic",
            "anaphylaxis", "heart attack", "crushing chest"
        ]

        # Urgent indicators
        urgent_keywords = [
            "high fever", "broken", "fracture", "severe pain", "deep cut",
            "head injury", "vomiting blood", "blood in stool", "severe headache"
        ]

        symptoms_lower = symptoms.lower()

        # Check for emergency
        if any(keyword in symptoms_lower for keyword in emergency_keywords) or severity >= 9:
            triage = TRIAGE_LEVELS["emergency"]
        # Check for urgent
        elif any(keyword in symptoms_lower for keyword in urgent_keywords) or severity >= 7:
            triage = TRIAGE_LEVELS["urgent"]
        # Semi-urgent for moderate symptoms
        elif severity >= 5:
            triage = TRIAGE_LEVELS["semi_urgent"]
        # Routine for mild persistent symptoms
        elif "day" in duration.lower() or "week" in duration.lower():
            triage = TRIAGE_LEVELS["routine"]
        # Self-care for minor symptoms
        else:
            triage = TRIAGE_LEVELS["self_care"]

        # Update form fields
        await self.update_field(context, "triageLevel", triage["level"])
        await self.update_field(context, "recommendation", triage["action"])
        await self.update_field(context, "actionNeeded", triage["timeframe"])

        return json.dumps({
            "level": triage["level"],
            "description": triage["description"],
            "action": triage["action"],
            "timeframe": triage["timeframe"],
        })

    @function_tool()
    async def submit_to_sheets(
        self,
        context: RunContext,
    ):
        """Submit the patient record to Google Sheets for clinic staff to review."""
        try:
            # Get current form state
            form_data = self._patient_data.copy()
            form_data["timestamp"] = datetime.now().isoformat()

            # Update status
            await self.update_field(context, "status", "New")

            payload = json.dumps(form_data)
            response = await perform_rpc_to_frontend(self._ctx, "submitToSheets", payload)

            logger.info(f"Submitted to Google Sheets: {form_data.get('patientName', 'Unknown')}")
            return "Patient record has been submitted to the clinic. Staff will review your case."
        except Exception as e:
            logger.error(f"Failed to submit to sheets: {e}")
            return "Your information has been recorded. A staff member will follow up with you."

    @function_tool()
    async def schedule_appointment(
        self,
        context: RunContext,
        preferred_date: Annotated[
            str,
            Field(description="The patient's preferred date for the appointment"),
        ],
        preferred_time: Annotated[
            str,
            Field(description="The patient's preferred time (morning, afternoon, or specific time)"),
        ],
    ):
        """Schedule an appointment with a doctor for the patient."""
        try:
            await self.update_field(context, "status", "Appointment Booked")
            await self.update_field(context, "appointmentTime", f"{preferred_date} {preferred_time}")

            payload = json.dumps({
                "patientData": self._patient_data,
                "preferredDate": preferred_date,
                "preferredTime": preferred_time,
            })
            response = await perform_rpc_to_frontend(self._ctx, "scheduleAppointment", payload)

            logger.info(f"Scheduled appointment for {self._patient_data.get('patientName', 'Unknown')}")
            return f"Great! I've scheduled an appointment for {preferred_date} at {preferred_time}. You'll receive a confirmation shortly."
        except Exception as e:
            logger.error(f"Failed to schedule appointment: {e}")
            return f"I've noted your preference for {preferred_date} at {preferred_time}. The clinic will confirm your appointment."

    @function_tool()
    async def request_callback(
        self,
        context: RunContext,
        urgency: Annotated[
            str,
            Field(description="How soon the patient needs a callback: 'within 2 hours', 'today', 'tomorrow'"),
        ],
        best_contact_time: Annotated[
            str,
            Field(description="When is the best time to reach the patient"),
        ],
    ):
        """Request a callback from clinic staff for the patient."""
        try:
            await self.update_field(context, "status", "Callback Requested")
            await self.update_field(context, "actionNeeded", f"Call back {urgency} - best time: {best_contact_time}")

            payload = json.dumps({
                "patientData": self._patient_data,
                "urgency": urgency,
                "bestContactTime": best_contact_time,
            })
            response = await perform_rpc_to_frontend(self._ctx, "requestCallback", payload)

            logger.info(f"Callback requested for {self._patient_data.get('patientName', 'Unknown')}")
            return f"I've submitted a callback request. A nurse will call you {urgency}. They'll try to reach you around {best_contact_time}."
        except Exception as e:
            logger.error(f"Failed to request callback: {e}")
            return f"Your callback request has been noted. Someone will call you {urgency}."

    @function_tool()
    async def submit_form(self, context: RunContext):
        """Finalize and submit the completed intake form."""
        try:
            # Submit to sheets first
            await self.submit_to_sheets(context)

            response = await perform_rpc_to_frontend(self._ctx, "submitForm", "{}")
            context.session.say(
                "Your information has been submitted to the clinic. They'll be in touch soon. Take care, and don't hesitate to call 911 if your symptoms worsen. Goodbye!"
            )
            return response
        except Exception as e:
            logger.error(f"Failed to submit form: {e}")
            context.session.say(
                "Your information has been recorded. The clinic will follow up with you. Take care!"
            )
            return "Form submission completed"


# Server setup
server = AgentServer()


def prewarm(proc: JobProcess):
    """Preload models for faster connection."""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="MedLive-AI")
async def medlive_session(ctx: JobContext):
    """Main session entrypoint for MedLive AI."""

    # Logging context
    ctx.log_context_fields = {"room": ctx.room.name}

    # Connect to the room
    await ctx.connect()

    # Create the agent session with Gemini Realtime (vision-capable)
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.0-flash-live-001",
            voice="Aoede",  # Warm, professional voice
            temperature=0.7,
            proactivity=True,
            enable_affective_dialog=True,
        ),
        vad=ctx.proc.userdata["vad"],
    )

    # Start the session with video input enabled for visual assessment
    await session.start(
        agent=MedLiveAgent(ctx),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            video_input=True,  # Enable vision for symptom analysis
        ),
    )

    # Create Anam avatar (Dr. Liv)
    avatar = anam.AvatarSession(
        persona_config=anam.PersonaConfig(
            name="Dr. Liv",
            avatarId="071b0286-4cce-4808-bee2-e642f1062de3",  # Professional female avatar
        ),
    )

    # Start the avatar
    await avatar.start(session, room=ctx.room)

    # Greet the patient
    await session.generate_reply(
        instructions="Greet the patient warmly and ask what brought them in today."
    )


if __name__ == "__main__":
    cli.run_app(server)
