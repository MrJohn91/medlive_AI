# MedLive AI - Project Context & Status

## Hackathon Details
- **Competition**: Gemini Live Agent Challenge
- **Deadline**: March 16, 2026
- **Requirement**: Must use Google products (Gemini, GCP, etc.)
- **Judging Criteria**: Innovation, use of Gemini capabilities, user experience, real-world applicability
- **Current GCP Project**: `gemini-agent-challenge`

## Live Demo
- **Frontend**: https://medlive-frontend-272299131014.europe-west1.run.app
- **Agent**: https://medlive-agent-272299131014.europe-west1.run.app
- **GitHub**: https://github.com/MrJohn91/medlive-ai

## Overview
MedLive AI is an AI-powered medical triage assistant designed to act as a frontline assistant for doctors. The goal is to help patients find the right care and book appointments seamlessly. The AI, "Dr. Liv", interacts with patients via voice AND vision, listens to their symptoms, sees visible symptoms through camera, automatically fills out a patient intake form, and determines the urgency of their condition.

## Core Components

### 1. Frontend (Next.js 16 + React 19)
- Landing page with "Start Consultation" and "How It Works"
- Consultation Room that connects to LiveKit
- Live Patient Intake Form that auto-fills based on RPC calls from the agent
- Doctor Dashboard (`/doctor`) to review patient records from Google Sheets
- Token-based agent dispatch via RoomConfiguration

### 2. AI Agent (LiveKit Agents SDK + Gemini)
- **Model**: `gemini-2.5-flash-native-audio-preview-12-2025` with native audio + vision
- **Avatar**: Anam AI provides lifelike Dr. Liv with lip-synced responses
- **Vision**: Live video input enabled - can see patient's camera for visual symptom assessment
- **Tools**: 8 function tools for form filling, triage, booking, and more
- **RPC**: Real-time form updates to frontend via LiveKit RPC

### 3. Google Calendar Integration
- Real-time availability checking (Mon-Fri, 9am-4pm, 30-min slots)
- Automatic appointment booking with calendar invites
- **EMERGENCY/URGENT**: In-person office visit at clinic
- **SEMI-URGENT/ROUTINE**: Google Meet virtual consultation
- Automatic Google Meet link generation

### 4. Google Sheets CRM
- Patient records saved automatically to Google Sheets
- Includes: name, age, contact, symptoms, triage level, appointment details
- Real-time updates during consultation

## Google Products Used
| Product | Purpose |
|---------|---------|
| **Gemini 2.5 Flash** | Native audio + vision for real-time conversation |
| **Google Cloud Run** | Serverless container deployment (agent + frontend) |
| **Google Calendar API** | Real-time availability and appointment booking |
| **Google Sheets API** | Patient records CRM |
| **GCP Secret Manager** | Secure API key storage |

## Key Technical Details

### Agent Dispatch (Token-Based)
Frontend dispatches agent via token with RoomConfiguration:
```typescript
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";

token.roomConfig = new RoomConfiguration({
  agents: [
    new RoomAgentDispatch({
      agentName: "MedLive-AI",
    }),
  ],
});
```
**CRITICAL**: Agent must be registered in LiveKit Cloud Dashboard with name `MedLive-AI`.

### Vision Capability
Video input is **ENABLED** via RoomOptions:
```python
await session.start(
    agent=MedLiveAgent(ctx),
    room=ctx.room,
    room_options=room_io.RoomOptions(
        video_input=True,  # Gemini receives video frames from patient's camera
    ),
)
```
Dr. Liv can see visible symptoms (rashes, injuries, swelling, skin issues) when patient shows camera.

### Google APIs (Application Default Credentials)
Uses ADC for Sheets and Calendar. On Cloud Run, uses the default compute service account.
- Service account needs Editor access to the Google Sheet
- Calendar events created on service account's primary calendar

### Triage Logic
Conservative triage - only true emergencies trigger EMERGENCY level:
- **EMERGENCY**: Chest pain, stroke symptoms, severe bleeding, unconscious
- **URGENT**: High fever, fractures, head injury
- **SEMI-URGENT**: Moderate symptoms needing attention within 24h
- **ROUTINE**: Non-urgent, can be scheduled
- **SELF-CARE**: Minor issues, home treatment

## Current State & Working Features
- ✅ LiveKit connection and Anam avatar video stream
- ✅ **Live Video Vision** - Dr. Liv can see patient's camera
- ✅ Live UI updates on frontend when AI listens to symptoms
- ✅ Triage logic (5 levels)
- ✅ Google Sheets CRM - records saved automatically
- ✅ Google Calendar - availability checking and booking
- ✅ Google Meet links for virtual consultations
- ✅ In-person appointments for urgent/emergency cases
- ✅ Contact collection (email/phone)
- ✅ Conversational fillers ("Let me check appointments...")
- ✅ Token-based agent dispatch
- ✅ Deployed to GCP Cloud Run

## Booking Flow
```
1. Patient describes symptoms (voice)
2. Patient shows visible symptoms (camera - optional)
3. Dr. Liv assesses triage level
4. Dr. Liv: "Let me check what appointments we have available..."
   → Calls check_available_slots()
5. Dr. Liv: "I have openings Monday at 10am, 2pm, and Tuesday at 11am"
6. Patient chooses a slot
7. Dr. Liv: "Perfect, let me book that for you..."
   → Calls schedule_appointment()
   → Creates Google Calendar event
   → Generates Google Meet link (if virtual)
8. If EMERGENCY/URGENT: In-person at clinic
   If SEMI-URGENT/ROUTINE: Google Meet virtual consultation
```

## Known Issues & Troubleshooting
| Issue | Solution |
|-------|----------|
| Anam avatar not appearing | Check ANAM_API_KEY validity, verify quota not exhausted (30 min/month free) |
| Agent not joining room | Ensure agent registered in LiveKit Cloud as `MedLive-AI` |
| Form not updating | Check browser console for RPC errors |
| Calendar booking fails (403) | Locally: ADC must include `calendar` and `spreadsheets` scopes AND point to the correct GCP project. See Local Development section below. On Cloud Run: ensure Calendar API is enabled on `gemini-agent-challenge` project. |
| Calendar 403 (attendees) | Service account can't invite external attendees without Domain-Wide Delegation - this is expected, patient info is in the event description |
| Sheets 404 error | Share the Google Sheet with the service account email |
| Agent 401 error | Check secrets in GCP Secret Manager for trailing whitespace |
| ADC wrong project | If you previously used `gcloud auth` for another project, ADC may point to the wrong project. Re-run the ADC login command below. |

## Local Development

### ADC Setup (Required for Calendar & Sheets)
When running locally, you must authenticate with Application Default Credentials (ADC) that include the correct project and scopes:

```bash
gcloud auth application-default login \
  --project=gemini-agent-challenge \
  --scopes="openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/spreadsheets"
```

> **Note**: On Cloud Run, ADC is handled automatically by the service account - no manual setup needed.

### Running Locally
```bash
# Start the agent (from repo root)
cd agent && .venv/bin/python -m src.agent dev

# Start the frontend (from repo root)
cd frontend && npm run dev
```

## Environment Variables Required
```env
LIVEKIT_URL=wss://your-livekit-cloud.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
GOOGLE_API_KEY=...
ANAM_API_KEY=...
GOOGLE_SHEET_ID=...
GOOGLE_SHEET_NAME=Sheet1
OFFICE_LOCATION=MedLive Clinic, Berlin, Germany
```

## Deployment Commands
```bash
# Build and deploy agent
cd agent
gcloud builds submit --tag gcr.io/gemini-agent-challenge/medlive-agent
gcloud run deploy medlive-agent \
  --image gcr.io/gemini-agent-challenge/medlive-agent \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-secrets="LIVEKIT_URL=LIVEKIT_URL:latest,..." \
  --memory 2Gi --cpu 2 --min-instances 1

# Build and deploy frontend
cd frontend
gcloud builds submit --tag gcr.io/gemini-agent-challenge/medlive-frontend
gcloud run deploy medlive-frontend \
  --image gcr.io/gemini-agent-challenge/medlive-frontend \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-secrets="LIVEKIT_API_KEY=LIVEKIT_API_KEY:latest,..."
```

## Roadmap
- [x] Deploy to GCP Cloud Run
- [x] Enable live video vision capability
- [x] Google Sheets CRM integration
- [x] Google Calendar booking integration
- [x] Comprehensive README documentation
- [ ] Record demo video
- [ ] Submit to Devpost

---
*Note to future agents: Always read this file to understand the architecture, known issues, and current state before making changes.*
