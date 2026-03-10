# MedLive AI - Project Context & Status

## Hackathon Details
- **Competition**: Gemini Live Agent Challenge
- **Deadline**: March 16, 2026
- **Requirement**: Must use Google products (Gemini, GCP, etc.)
- **Judging Criteria**: Innovation, use of Gemini capabilities, user experience, real-world applicability
- **Current GCP Project**: `gemini-agent-challenge`

## Overview
MedLive AI is an AI-powered medical triage assistant designed to act as a frontline assistant for doctors. The goal is to help patients find the right care and book appointments seamlessly. The AI, "Dr. Liv", interacts with patients via voice, listens to their symptoms, automatically fills out a patient intake form, and determines the urgency of their condition.

## Core Components
1. **Frontend (Next.js)**
   - Landing page with "Start Consultation" and "How It Works".
   - Consultation Room that connects to LiveKit.
   - Live Patient Intake Form that auto-fills based on RPC calls from the agent.
   - Doctor Command Center (`/doctor`) to review patient records and confirm bookings.
   - **Deployment**: `https://medlive-frontend-272299131014.europe-west1.run.app`
2. **AI Agent (LiveKit + Gemini)**
   - Powered by `gemini-2.5-flash-native-audio-preview`.
   - Uses Anam AI avatars to provide a human-like visual experience for Dr. Liv.
   - Listens to symptoms, deduces triage levels, and calls LiveKit RPC tools (`updateField`, `scheduleAppointment`, `submitToSheets`, etc.) to update the frontend.
   - **Deployment**: `https://medlive-agent-272299131014.europe-west1.run.app`
3. **Google Calendar Integration**
   - Real-time availability checking (Mon-Fri, 9am-4pm, 30-min slots)
   - Automatic appointment booking with calendar invites
   - Emergency: In-person office visit
   - Non-emergency: Google Meet virtual consultation
   - Automatic email confirmation via calendar invite
4. **Google Sheets CRM**
   - Patient records saved automatically to Google Sheets
   - Includes triage level, symptoms, appointment details
5. **Local Database API (`/api/records`)**
   - Backup JSON file store for patient records

## Key Instructions & Context for Future Agents
- **Video Input is DISABLED**: Gemini Live's bidi websocket endpoint currently drops connections (1008 error) when streaming video frames. `video_input` in `agent.py` MUST remain `False`.
- **Environment Pathing**: `agent.py` uses an absolute path (`Path(__file__).parent.parent.parent / ".env.local"`) to ensure keys are loaded regardless of run directory.
- **Anam Avatar**: Uses Anam AI for Dr. Liv's visual avatar. Free tier limited to 30 min/month. If avatar fails to connect, check API key validity and quota.
- **RPC Communication**: Agent sends form updates to frontend via LiveKit RPC. Frontend registers handlers in `ConsultationRoom.tsx`.
- **Agent Dispatch**: Frontend dispatches agent via `AgentDispatchClient` in `/api/token/route.ts`. 
  - **CRITICAL**: The agent deployed at the URL above must be registered in the **LiveKit Cloud Dashboard** as an "Agent" or "Worker" with the name `MedLive-AI`.
- **Google APIs (ADC)**: Uses Application Default Credentials. Run `gcloud auth application-default login --scopes="https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/cloud-platform"` to authenticate. 
  - **Sheets API**: `sheets.googleapis.com`
  - **Calendar API**: `calendar-json.googleapis.com` (Note: In this project context, use `calendar-json`)
- **Triage Logic**: Conservative triage - only true emergencies (chest pain, stroke, etc.) trigger EMERGENCY. Headache/insomnia are ROUTINE, not emergency.

## Current State & Working Features
- ✅ LiveKit connection and Anam avatar video stream
- ✅ Live UI updates on the frontend when the AI listens to symptoms
- ✅ Triage logic (Emergency, Urgent, Semi-Urgent, Routine, Self-Care)
- ✅ Proactive Emergency Booking with in-person appointments
- ✅ Doctor Dashboard (`/doctor`) for reviewing patient information
- ✅ **Google Sheets Integration**: Patient records saved automatically
- ✅ **Google Calendar Integration**:
  - `check_available_slots()` - Shows real doctor availability
  - `schedule_appointment()` - Books on Google Calendar
  - Emergency → In-person office visit
  - Non-emergency → Google Meet link included
  - Automatic email confirmation via calendar invite
- ✅ **Contact Collection**: Agent asks for email/phone number

## Booking Flow
```
1. Patient describes symptoms
2. Dr. Liv assesses triage level
3. Dr. Liv: "Let me check Dr. Smith's availability..."
   → Calls check_available_slots()
4. Dr. Liv: "I have openings Monday at 10am, 2pm, and Tuesday at 11am"
5. Patient chooses a slot
6. Dr. Liv: "I've booked your appointment for Monday at 2pm"
   → Calls schedule_appointment()
   → Creates Google Calendar event
   → Sends email invite automatically
7. If Emergency: In-person at clinic
   If Non-emergency: Google Meet link included
```

## Known Issues & Troubleshooting
- **Anam avatar not appearing**: Check ANAM_API_KEY in `.env.local`, verify quota not exhausted
- **Agent not joining room**: Ensure agent is running and registered with LiveKit Cloud.
- **Form not updating**: Check browser console for RPC errors
- **Gemini connection drops**: Do NOT enable video_input - causes 1008 errors
- **Calendar not working**: Re-run ADC login with calendar scope

## Environment Variables Required
```
LIVEKIT_URL=wss://your-livekit-cloud.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
GOOGLE_API_KEY=...
ANAM_API_KEY=...
GOOGLE_SHEET_ID=...
GOOGLE_SHEET_NAME=MEDLIVE-AI
OFFICE_LOCATION=MedLive Clinic, Berlin, Germany
```

## Upcoming Roadmap
- [x] Deploy to GCP Cloud Run
- [ ] Create architecture diagram for submission
- [ ] Record demo video
- [ ] SMS confirmation via Twilio (optional)

---
*Note to future Agents: Always read this file to understand the architecture, known bugs, and product goals before making changes.*
