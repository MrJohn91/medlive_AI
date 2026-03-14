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
from pathlib import Path
from typing import Annotated

import gspread
from google.auth import default as google_auth_default
from dotenv import load_dotenv
from pydantic import Field

from src.calendar_service import (
    get_available_slots,
    book_appointment,
    format_slots_for_speech,
)

from google_webrtc import rtc
from google_webrtc.agents import (
    Agent,
    AgentSession,
    AgentServer,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    llm,
    room_io,  # For video input configuration
)
from google_webrtc.plugins import anam, google, silero

# Load .env.local from the repo root (two levels up from src/agent.py)
_REPO_ROOT = Path(__file__).parent.parent.parent
load_dotenv(_REPO_ROOT / ".env.local", override=True)  # override=True to force reload

logger = logging.getLogger("medlive-agent")
logger.setLevel(logging.DEBUG)
# Add handler to ensure logs are visible
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)

# Google Sheets configuration (strip whitespace to handle secret trailing spaces)
GOOGLE_SHEET_ID = (os.getenv("GOOGLE_SHEET_ID") or "").strip()
GOOGLE_SHEET_NAME = (os.getenv("GOOGLE_SHEET_NAME") or "Sheet1").strip()

# Column headers for the patient records sheet
SHEET_HEADERS = [
    "Timestamp",
    "Patient Name",
    "Age",
    "Contact",
    "Chief Complaint",
    "Symptom Details",
    "Duration",
    "Triage Level",
    "Recommendation",
    "Status",
    "Appointment Time",
    "Action Needed",
]


def get_sheets_client():
    """Get authenticated Google Sheets client using Application Default Credentials."""
    try:
        credentials, project = google_auth_default(
            scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        client = gspread.authorize(credentials)
        return client
    except Exception as e:
        logger.error(f"Failed to authenticate with Google Sheets: {e}")
        return None


def append_to_sheet(data: dict) -> bool:
    """Append a patient record to the Google Sheet."""
    if not GOOGLE_SHEET_ID:
        logger.warning("GOOGLE_SHEET_ID not set, skipping sheet update")
        return False

    logger.info(f"[SHEETS] Attempting to write to sheet ID='{GOOGLE_SHEET_ID}', tab='{GOOGLE_SHEET_NAME}'")

    try:
        client = get_sheets_client()
        if not client:
            return False

        sheet = client.open_by_key(GOOGLE_SHEET_ID)
        worksheet = sheet.worksheet(GOOGLE_SHEET_NAME)

        # Check if headers exist, if not add them
        first_row = worksheet.row_values(1)
        if not first_row:
            worksheet.append_row(SHEET_HEADERS)

        # Prepare row data in order of headers
        row = [
            data.get("timestamp", datetime.now().isoformat()),
            data.get("patientName", ""),
            data.get("age", ""),
            data.get("contact", ""),
            data.get("chiefComplaint", ""),
            data.get("symptomDetails", ""),
            data.get("duration", ""),
            data.get("triageLevel", ""),
            data.get("recommendation", ""),
            data.get("status", "New"),
            data.get("appointmentTime", ""),
            data.get("actionNeeded", ""),
        ]

        worksheet.append_row(row)
        logger.info(f"[SHEETS] Successfully added patient record to Google Sheets")
        return True

    except gspread.exceptions.WorksheetNotFound:
        logger.error(f"[SHEETS] Worksheet tab '{GOOGLE_SHEET_NAME}' not found in spreadsheet")
        return False
    except gspread.exceptions.SpreadsheetNotFound:
        logger.error(f"[SHEETS] Spreadsheet with ID '{GOOGLE_SHEET_ID}' not found - check sharing with service account")
        return False
    except Exception as e:
        logger.error(f"[SHEETS] Failed to append to sheet: {type(e).__name__}: {e}")
        # Log more details if it's an API response error
        if hasattr(e, 'response'):
            logger.error(f"[SHEETS] Response status: {e.response.status_code}, body: {e.response.text[:500]}")
        return False


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
        "description": "Critical condition requiring immediate attention from our doctor",
        "action": "Immediate emergency appointment with the doctor",
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
    participants = list(ctx.room.remote_participants.values())
    logger.info(f"Remote participants: {[p.identity for p in participants]}")

    for participant in participants:
        if not participant.identity.startswith("anam-"):
            logger.info(f"Found user participant: {participant.identity}")
            return participant.identity

    raise llm.ToolError(f"No remote participant found. Available: {[p.identity for p in participants]}")


async def perform_rpc_to_frontend(ctx: JobContext, method: str, payload: str) -> str:
    """Perform an RPC call to the frontend participant."""
    local_participant = ctx.room.local_participant
    if not local_participant:
        raise llm.ToolError("Agent not connected to room")

    destination_identity = get_remote_participant_identity(ctx)
    logger.info(f"Sending RPC '{method}' to {destination_identity}")

    response = await local_participant.perform_rpc(
        destination_identity=destination_identity,
        method=method,
        payload=payload,
        response_timeout=5.0,
    )
    logger.info(f"RPC response: {response}")
    return response


class MedLiveAgent(Agent):
    """Medical triage agent powered by Gemini with vision capabilities."""

    def __init__(self, ctx: JobContext) -> None:
        self._ctx = ctx
        self._patient_data = {}
        self._sheet_row_saved = False  # Track if we've saved to sheets
        super().__init__(
            instructions="""# DR. LIV - FAST TRIAGE (2.5 MIN MAX)

You are Dr. Liv, an AI medical triage assistant with VISION capabilities. Be warm but EFFICIENT - complete the whole conversation in under 2.5 minutes.

# RULES
- ONE question at a time, keep responses SHORT (1-2 sentences max)
- NEVER repeat questions - remember everything
- Move FAST between stages
- You CAN SEE the patient's camera - use this for visual symptoms!

# FLOW (Target: 2.5 minutes total)

## 1. GREETING + NAME (25 sec)
Say: "Hi there! I'm Dr. Liv, your AI health assistant. I'm here to help understand your symptoms and guide you to the right care. What's your name?"
→ Wait for name
→ Say: "Nice to meet you, [Name]. And how old are you?"
→ Wait for age

## 2. CONTACT - MUST GET THIS RIGHT (30 sec)
Say: "What's the best email to reach you?"
→ Wait for email/phone
→ ALWAYS spell it back SLOWLY and CLEARLY:
  - For email: "Let me confirm: j-o-h-n, dot, s-m-i-t-h, at gmail dot com. Is that correct?"
  - For phone: "Let me confirm: zero-seven-seven, five-five-five, one-two-three-four. Is that correct?"
→ If they say NO or correct you: update and spell back again
→ Do NOT proceed until they confirm "yes" or "correct"

## 3. CHIEF COMPLAINT (15 sec)
Say: "Great. What's bringing you in today?"
→ Wait for complaint

## 4. SAVE INFO (5 sec)
→ Call save_patient_info immediately
→ Say: "Let me note that..."

## 5. QUICK SYMPTOMS (30 sec)
Ask only TWO questions:
- "When did this start?"
- "On a scale of 1 to 10, how bad is it?"
→ Call update_field with duration and symptomDetails

## 5b. VISUAL ASSESSMENT (if relevant)
- If the symptom is VISIBLE (rash, swelling, injury, skin issue, eye problem, etc.):
  - Say: "Can you show me? Hold it up to the camera so I can take a look."
  - Look at their camera feed and describe what you see
  - Include your visual findings in the triage assessment
- If you see something concerning, mention it specifically
- Note: You receive automatic video frames - just look and describe what you observe

## 6. TRIAGE (15 sec)
→ Call assess_triage
→ Give brief result: "Based on your symptoms, [triage level]. [One sentence recommendation]."

## 7. NEXT STEPS (30 sec)
- If NOT self-care: "Would you like me to book an appointment, or have someone call you back?"
- If YES to appointment:
  1. FIRST say: "Let me check what appointments we have available..." (SAY THIS BEFORE calling the tool!)
  2. THEN call check_available_slots
  3. Offer ONE slot: "I have [time] available. Does that work?"
- If YES to a slot:
  1. FIRST say: "Perfect, let me book that for you..."
  2. THEN call schedule_appointment
  3. Confirm: "Done! I've booked your appointment."
- If callback: "When's a good time?" → Call request_callback

**IMPORTANT: Always speak BEFORE calling tools so the patient knows you're working on something!**

**APPOINTMENT TYPES (based on triage):**
- EMERGENCY / URGENT → In-person at the clinic (patient must come to the hospital/clinic)
- SEMI-URGENT / ROUTINE → Virtual consultation via Google Meet (convenient for non-serious cases)

When booking, tell them:
- In-person: "This will be an in-person appointment at our clinic."
- Virtual: "This will be a virtual consultation - you'll receive a Google Meet link."

## 8. WRAP-UP + END SESSION (10 sec)
Say: "All set, [Name]. Take care and feel better soon!"
→ Then call end_session to close the consultation

# EXAMPLE CONVERSATION
Dr. Liv: "Hi there! I'm Dr. Liv, your AI health assistant. I'm here to help understand your symptoms and guide you to the right care. What's your name?"
Patient: "I'm John"
Dr. Liv: "Nice to meet you, John. And how old are you?"
Patient: "32"
Dr. Liv: "Great. What's the best email to reach you?"
Patient: "john.smith@gmail.com"
Dr. Liv: "Let me confirm: j-o-h-n, dot, s-m-i-t-h, at gmail dot com. Is that correct?"
Patient: "Yes that's right"
Dr. Liv: "Great. What's bringing you in today?"
Patient: "Bad headache for 3 days"
[Call save_patient_info]
Dr. Liv: "Noting that down. How bad is it, 1 to 10?"
Patient: "About a 6"
[Call assess_triage]
Dr. Liv: "This is routine - you should see a doctor soon. Want me to book an appointment?"
Patient: "Yes please"
Dr. Liv: "Let me check what appointments we have available..."
[Call check_available_slots]
Dr. Liv: "I have tomorrow at 10 AM. Does that work for you?"
Patient: "Yes"
Dr. Liv: "Perfect, let me book that for you..."
[Call schedule_appointment]
Dr. Liv: "All done! You will receive an email for the booking confirmation. Take care, John!"
[Call end_session]

# TOOLS
- **save_patient_info**: Call after getting name, age, contact, complaint
- **assess_triage**: Call after symptoms
- **check_available_slots**: Call if booking
- **schedule_appointment**: Call when they agree to a time (EMERGENCY/URGENT = in-person, others = Google Meet)
- **end_session**: Call after wrap-up to end the consultation""",
        )

    async def on_enter(self):
        """Called when the agent joins the session. Greet the patient."""
        # Use generate_reply for Gemini Realtime (not say)
        await self.session.generate_reply(
            instructions="Give a warm greeting: 'Hi there! I'm Dr. Liv, your AI health assistant. I'm here to help understand your symptoms and guide you to the right care. What's your name?'"
        )

    @function_tool
    async def update_field(
        self,
        context: RunContext,
        field_name: Annotated[
            str,
            Field(
                description="The form field to update: patientName, age, contact, chiefComplaint, symptomDetails, duration, triageLevel, recommendation, status, actionNeeded, appointmentTime"
            ),
        ],
        value: Annotated[
            str,
            Field(description="The value to set for the field"),
        ],
    ):
        """Update a field on the patient intake form. Call this whenever the patient provides information."""
        import asyncio

        if field_name not in VALID_FIELD_NAMES:
            raise llm.ToolError(f"Invalid field name: {field_name}")

        # Store in agent's local state
        self._patient_data[field_name] = value
        logger.info(f"[TOOL] update_field called: {field_name} = {value}")

        # Send to frontend - await directly to ensure it works
        try:
            payload = json.dumps({"fieldName": field_name, "value": value})
            logger.info(f"[RPC] Sending updateField to frontend: {payload}")
            response = await perform_rpc_to_frontend(self._ctx, "updateField", payload)
            logger.info(f"[RPC] Frontend response: {response}")
        except Exception as e:
            logger.warning(f"[RPC] Failed to send to frontend: {e}")

        # Return immediately so the conversation continues
        return f"Recorded {field_name}: {value}"

    @function_tool
    async def get_form_state(self, context: RunContext):
        """Get the current state of all form fields to see what has been collected."""
        return json.dumps(self._patient_data)

    @function_tool
    async def save_patient_info(
        self,
        context: RunContext,
        patient_name: Annotated[str, Field(description="Patient's full name")],
        age: Annotated[str, Field(description="Patient's age")],
        contact: Annotated[str, Field(description="Patient's email or phone number")],
        chief_complaint: Annotated[str, Field(description="Main reason for visit / primary symptom")],
    ):
        """REQUIRED: Save the patient's basic information. Call this IMMEDIATELY after collecting name, age, contact, and chief complaint - before asking about symptom details."""
        logger.info(f"[SAVE] save_patient_info called: name={patient_name}, age={age}, contact={contact}, complaint={chief_complaint}")

        # Store all fields
        self._patient_data["patientName"] = patient_name
        self._patient_data["age"] = age
        self._patient_data["contact"] = contact
        self._patient_data["chiefComplaint"] = chief_complaint

        # Send each to frontend
        for field, value in [("patientName", patient_name), ("age", age), ("contact", contact), ("chiefComplaint", chief_complaint)]:
            try:
                payload = json.dumps({"fieldName": field, "value": value})
                await perform_rpc_to_frontend(self._ctx, "updateField", payload)
            except Exception as e:
                logger.warning(f"[RPC] Failed to send {field} to frontend: {e}")

        # Save draft to Google Sheets immediately (so data isn't lost if disconnected)
        self._patient_data["timestamp"] = datetime.now().isoformat()
        self._patient_data["status"] = "In Progress"
        success = append_to_sheet(self._patient_data)
        self._sheet_row_saved = True

        if success:
            logger.info("[SAVE] Patient info saved to Google Sheets")
            return f"Patient information recorded: {patient_name}, {age} years old, contact: {contact}, complaint: {chief_complaint}. Now ask about symptom details."
        else:
            logger.warning("[SAVE] Failed to save to Sheets, but continuing")
            return f"Patient information noted. Now ask about symptom details."

    @function_tool
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

        # Emergency indicators - ONLY true emergencies
        emergency_keywords = [
            "chest pain", "difficulty breathing", "can't breathe", "stroke",
            "severe bleeding", "unconscious", "seizure", "severe allergic",
            "anaphylaxis", "heart attack", "crushing chest", "choking",
            "overdose", "suicidal", "not breathing"
        ]

        # Urgent indicators - needs attention within hours
        urgent_keywords = [
            "high fever", "broken", "fracture", "deep cut",
            "head injury", "vomiting blood", "blood in stool",
            "sudden severe headache", "worst headache of my life"
        ]

        # Common symptoms that are NOT emergencies by themselves
        non_emergency_symptoms = [
            "headache", "can't sleep", "insomnia", "tired", "fatigue",
            "mild pain", "cough", "cold", "runny nose", "sore throat"
        ]

        symptoms_lower = symptoms.lower()

        # Check if symptoms contain only common non-emergency symptoms
        has_emergency_keyword = any(keyword in symptoms_lower for keyword in emergency_keywords)
        has_urgent_keyword = any(keyword in symptoms_lower for keyword in urgent_keywords)
        only_common_symptoms = any(keyword in symptoms_lower for keyword in non_emergency_symptoms) and not has_emergency_keyword and not has_urgent_keyword

        # Check for emergency - ONLY if explicit emergency keywords present
        if has_emergency_keyword:
            triage = TRIAGE_LEVELS["emergency"]
        # Check for urgent - explicit urgent keywords OR severity 10 with concerning symptoms
        elif has_urgent_keyword or (severity == 10 and not only_common_symptoms):
            triage = TRIAGE_LEVELS["urgent"]
        # Semi-urgent for high severity (8-9) with non-common symptoms
        elif severity >= 8 and not only_common_symptoms:
            triage = TRIAGE_LEVELS["semi_urgent"]
        # Routine for moderate symptoms or persistent common symptoms
        elif severity >= 5 or "day" in duration.lower() or "week" in duration.lower():
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

    @function_tool
    async def submit_to_sheets(self, context: RunContext):
        """Submit the patient record to Google Sheets for clinic staff to review."""
        form_data = self._patient_data.copy()
        form_data["timestamp"] = datetime.now().isoformat()
        form_data["status"] = "New"

        # Actually submit to Google Sheets
        success = append_to_sheet(form_data)

        if success:
            logger.info(f"[SHEETS] Patient record submitted successfully")
            return "Patient record has been submitted to the clinic. Staff will review your case shortly."
        else:
            logger.warning(f"[SHEETS] Failed to submit, but continuing conversation")
            return "I've noted your information. The clinic will follow up with you."

    @function_tool
    async def check_available_slots(self, context: RunContext):
        """Check the doctor's available appointment slots for the next few days. Call this BEFORE asking the patient what time works for them."""
        slots = get_available_slots(days_ahead=7)
        self._available_slots = slots  # Store for later use

        if not slots:
            return "No available slots found in the next 7 days. Suggest requesting a callback instead."

        # Format for natural speech
        speech = format_slots_for_speech(slots, max_slots=3)
        return f"Available slots: {speech}"

    @function_tool
    async def schedule_appointment(
        self,
        context: RunContext,
        appointment_datetime: Annotated[
            str,
            Field(description="The selected appointment datetime in ISO format (e.g., '2026-03-10T10:00:00+01:00') from the available slots"),
        ],
    ):
        """Book the appointment on Google Calendar. The patient will receive an email confirmation automatically."""
        # Get triage level for booking type decision
        triage_level = self._patient_data.get("triageLevel", "ROUTINE").upper()

        patient_name = self._patient_data.get("patientName", "Patient")
        patient_email = self._patient_data.get("contact", "")
        chief_complaint = self._patient_data.get("chiefComplaint", "Medical consultation")
        phone_number = self._patient_data.get("contact", "")

        # Check if we have an email (contains @)
        if "@" not in patient_email:
            # Contact might be phone number, try to use it
            phone_number = patient_email
            patient_email = ""

        if not patient_email:
            logger.warning("[BOOKING] No email provided, booking without calendar invite")
            self._patient_data["status"] = "Appointment Booked (No Email)"
            self._patient_data["appointmentTime"] = appointment_datetime
            append_to_sheet(self._patient_data)
            return f"Appointment noted for {appointment_datetime}. The clinic will contact you to confirm."

        # Book on Google Calendar - triage_level determines in-person vs virtual
        # EMERGENCY/URGENT = in-person, SEMI-URGENT/ROUTINE = Google Meet
        result = book_appointment(
            patient_name=patient_name,
            patient_email=patient_email,
            appointment_datetime=appointment_datetime,
            chief_complaint=chief_complaint,
            triage_level=triage_level,
            phone_number=phone_number if phone_number != patient_email else None,
        )

        if result.get("success"):
            is_in_person = result.get("is_in_person", False)
            self._patient_data["status"] = "Appointment Booked"
            self._patient_data["appointmentTime"] = result.get("appointment_time", appointment_datetime)
            self._patient_data["timestamp"] = datetime.now().isoformat()

            # Add meet link or location based on appointment type
            if is_in_person:
                self._patient_data["location"] = result.get("location", "MedLive Clinic")
                self._patient_data["appointmentType"] = "In-Person"
            else:
                self._patient_data["meetLink"] = result.get("meet_link", "")
                self._patient_data["appointmentType"] = "Virtual (Google Meet)"

            # Save to Google Sheets
            append_to_sheet(self._patient_data)

            logger.info(f"[BOOKING] Successfully booked for {patient_name}: {result.get('appointment_time')} (in_person={is_in_person})")

            # Build response based on in-person vs virtual
            if is_in_person:
                if triage_level == "EMERGENCY":
                    return f"I've booked an emergency in-person appointment for {result.get('appointment_time')} at our clinic. You will receive an email for the booking confirmation. Please arrive as soon as possible and bring any relevant medical records."
                else:
                    return f"I've booked an in-person appointment for {result.get('appointment_time')} at our clinic. You will receive an email for the booking confirmation. Please arrive 10 minutes early."
            else:
                meet_link = result.get("meet_link")
                if meet_link:
                    return f"Your virtual consultation is confirmed for {result.get('appointment_time')}. You will receive an email for the booking confirmation. The doctor will meet you there."
                else:
                    return f"Your virtual consultation is confirmed for {result.get('appointment_time')}. You will receive an email for the booking confirmation."
        else:
            logger.error(f"[BOOKING] Failed: {result.get('error')}")
            return f"I wasn't able to book the appointment automatically. Let me have someone from the clinic call you to confirm the booking."

    @function_tool
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
        self._patient_data["status"] = "Callback Requested"
        self._patient_data["actionNeeded"] = f"Call back {urgency} - best time: {best_contact_time}"
        self._patient_data["timestamp"] = datetime.now().isoformat()

        # Submit to Google Sheets
        success = append_to_sheet(self._patient_data)

        logger.info(f"[CALLBACK] Requested for {self._patient_data.get('patientName', 'Unknown')}, Sheets: {'OK' if success else 'FAILED'}")
        return f"Callback request submitted. A nurse will call you {urgency}, around {best_contact_time}."

    @function_tool
    async def submit_form(self, context: RunContext):
        """Finalize and submit the completed intake form."""
        self._patient_data["timestamp"] = datetime.now().isoformat()
        if not self._patient_data.get("status"):
            self._patient_data["status"] = "Submitted"

        # Submit to Google Sheets
        success = append_to_sheet(self._patient_data)

        logger.info(f"[SUBMIT] Final form submitted, Sheets: {'OK' if success else 'FAILED'}")
        return "Form submitted successfully. The clinic will follow up with you."

    @function_tool
    async def end_session(self, context: RunContext):
        """End the consultation session after the wrap-up. Call this after saying goodbye to the patient."""
        import asyncio

        patient_name = self._patient_data.get("patientName", "the patient")
        logger.info(f"[SESSION] Ending session for {patient_name}")

        # Give a moment for the goodbye to be spoken before ending
        await asyncio.sleep(2)

        # End the session gracefully
        if self.session:
            await self.session.close()
            logger.info("[SESSION] Session closed by agent")

        return "Session ended."


# Server setup - configure health check on port 8080 for Cloud Run
server = AgentServer(
    port=int(os.getenv("PORT", "8080")),
)


def prewarm(proc: JobProcess):
    """Preload models for faster connection."""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="MedLive-AI")
async def medlive_session(ctx: JobContext):
    """Main session entrypoint for MedLive AI."""

    logger.info(f"[SESSION] New session starting for room")

    # Connect to the room first (per frontdesk example)
    await ctx.connect()
    logger.info(f"[SESSION] Connected to room: {ctx.room.name}")

    # Logging context
    ctx.log_context_fields = {"room": ctx.room.name}

    # Create the agent session with Gemini Realtime
    logger.info("[SESSION] Creating Gemini Realtime model")
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.5-flash-native-audio-preview-12-2025",
            voice="Aoede",  # Warm, professional voice
            temperature=0.7,
        ),
        vad=ctx.proc.userdata["vad"],
    )

    # Create and start Anam avatar FIRST (per official LiveKit pattern)
    # ANAM_API_KEY is read from environment automatically by the plugin
    avatar = None
    try:
        logger.info("[AVATAR] Creating Anam avatar session")
        logger.info(f"[AVATAR] ANAM_API_KEY set: {bool(os.getenv('ANAM_API_KEY'))}")
        avatar = anam.AvatarSession(
            persona_config=anam.PersonaConfig(
                name="Dr. Liv",
                avatarId="071b0286-4cce-4808-bee2-e642f1062de3",
            ),
        )
        await avatar.start(session, room=ctx.room)
        logger.info("[AVATAR] Anam avatar started successfully")
    except Exception as e:
        logger.error(f"[AVATAR] Failed to start: {type(e).__name__}: {e}")
        import traceback
        logger.error(f"[AVATAR] Traceback: {traceback.format_exc()}")

    # Start the session with agent
    # Enable video_input so Gemini can see the patient's camera (for visual symptoms)
    logger.info("[SESSION] Starting agent session with video input enabled")
    await session.start(
        agent=MedLiveAgent(ctx),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            video_input=True,  # Enable live video from patient's camera
        ),
    )
    logger.info("[SESSION] Agent session started with vision capabilities")


if __name__ == "__main__":
    cli.run_app(server)
