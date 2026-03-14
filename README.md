# MedLive AI

**Your personal AI health assistant that listens to your concerns, sees your symptoms, fills out your medical forms automatically, guides you to the right care, and connects you with a doctor - all through a simple video conversation.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-medlive--ai-blue?style=for-the-badge)](https://medlive-frontend-272299131014.europe-west1.run.app)
[![Built for](https://img.shields.io/badge/Built%20for-Gemini%20Live%20Agent%20Challenge-orange?style=for-the-badge)](https://geminiliveagentchallenge.devpost.com/)

---

![MedLive AI Architecture](docs/architecture.png)

---

## Live Demo

**Try it now:** [https://medlive-frontend-272299131014.europe-west1.run.app](https://medlive-frontend-272299131014.europe-west1.run.app)

> Click "Start Consultation" and talk to Dr. Liv - your AI medical triage assistant!

---

---

## Inspiration

Administrative burnout is a massive issue in healthcare. Front-desk staff and triage nurses spend countless hours on the phone collecting patient symptoms, filling out intake forms, and managing calendar bookings. Meanwhile, patients often face long wait times on the phone just to get an introductory assessment and schedule an appointment. 

We wanted to build something that acts as a smart, autonomous front-line assistant for clinics, freeing up human workers to focus on actual patient care.

## The Problem

When something feels wrong with your health, getting help is still way too hard:

- *Am I overreacting, or should I go to the ER?*
- *Do I really have to fill out three forms just to talk to someone?*
- *Why am I stuck in a phone queue while I’m worried and in pain?*

Today’s options are slow, rigid, and built around paperwork—not conversations.

**MedLive AI flips that:** you speak naturally, it listens, understands your symptoms, sees what you show it on camera, decides how urgent it is, and **books the right kind of care for you in minutes**.

---

## What Makes MedLive Different

This isn't a chatbot. This isn't a symptom checker with endless dropdown menus.

MedLive AI is a **live video conversation with Dr. Liv**, an AI medical assistant who:

| Feature | How It Works |
|---------|--------------|
| **Listens naturally** | Just talk - no typing, no menus |
| **Sees symptoms** | Show your camera, AI analyzes what it sees |
| **Auto-fills forms** | Patient intake form populates as you speak |
| **Triages accurately** | 5-level triage: Emergency → Self-care |
| **Books appointments** | Checks real availability, books on Google Calendar |
| **Saves records** | Everything saved to Google Sheets for clinic staff |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **AI Model** | Gemini 2.5 Flash via Gemini Live API (Realtime Audio + Vision) | Real-time voice + live video for visual symptom analysis |
| **Avatar** | Anam AI | Lifelike Dr. Liv with lip-synced responses |
| **Realtime Transport** | High-Performance WebRTC Layer | Low-latency audio/video streaming |
| **Frontend** | Next.js 16 + React 19 | Patient consultation UI |
| **Backend** | Python + Google GenAI SDK Approach | AI agent logic, tool calls |
| **Database** | Google Sheets | Patient records CRM |
| **Scheduling** | Google Calendar API | Real-time appointment booking |
| **Hosting** | Google Cloud Run | Serverless container deployment |
| **Secrets** | GCP Secret Manager | API keys and credentials |

---

## Detailed Implementation

- **AI Core:** Built on the Gemini 2.5 Flash model leveraging the Multimodal Live API to handle both native audio streaming and live video frame processing.
- **Agent Framework:** We utilized the Google GenAI SDK approach to connect to the Gemini Live API, implementing a high-performance WebRTC transport layer to manage the low-latency audio/video connection, handle conversational interruptions, and maintain the state of the consultation block.
- **Avatar:** Integrated Anam AI to give the agent a human-like, lip-synced visual presence.
- **Frontend & Backend:** A Next.js (React) application deployed on Google Cloud Run. The backend containerizes the AI agent and uses function calling to interact with the Google Calendar API and the Google Sheets API.

---

## Features

### AI Agent Capabilities

| Capability | Implementation |
|------------|----------------|
| **Native Audio Understanding** | Gemini 2.5 Flash via Gemini Live API processes speech directly - no STT/TTS latency |
| **Live Video Vision** | Sees patient's camera in real-time for visual symptom assessment (rashes, injuries, swelling) |
| **Lifelike Avatar** | Anam AI provides Dr. Liv with realistic lip-sync and expressions |
| **Function Calling** | 8 custom tools for form filling, triage, booking, and more |
| **Real-time Data Sync** | WebRTC Data Channels sync form fields to frontend instantly |
| **Intelligent Triage** | 5-level assessment based on symptoms and severity |
| **Calendar Integration** | Checks real availability, books Google Calendar events |
| **Google Meet Links** | Auto-generates Meet links for virtual consultations |
| **Conversational Fillers** | Natural speech like "Let me check appointments..." while processing |

### Agent Tools (Function Calling)

```python
@function_tool
async def save_patient_info(...)      # Save name, age, contact, complaint
async def update_field(...)           # Update individual form fields via RPC
async def assess_triage(...)          # 5-level triage assessment
async def check_available_slots(...)  # Query Google Calendar availability
async def schedule_appointment(...)   # Book on Google Calendar + Meet link
async def request_callback(...)       # Request clinic callback
async def submit_to_sheets(...)       # Save record to Google Sheets CRM
async def end_session(...)            # Gracefully close consultation
```

### Triage Levels

| Level | Criteria | Action |
|-------|----------|--------|
| **EMERGENCY** | Chest pain, stroke symptoms, severe bleeding | In-person immediately |
| **URGENT** | High fever, fractures, head injury | In-person within hours |
| **SEMI-URGENT** | Moderate symptoms, needs attention | Appointment within 24h |
| **ROUTINE** | Non-urgent, can be scheduled | Virtual consultation |
| **SELF-CARE** | Minor issues, home treatment | Guidance provided |

### For Patients
- **Voice-first interaction** - Just talk, no typing
- **Real-time form filling** - Watch your intake form populate as you speak
- **5-level triage** - Emergency, Urgent, Semi-Urgent, Routine, Self-Care
- **Instant booking** - Check availability and book appointments by voice
- **24/7 availability** - AI assistant available anytime

### For Clinics
- **Google Sheets CRM** - Patient cases appear in real-time
- **Reduced call volume** - AI handles first-contact screening
- **Better documentation** - Complete records with triage assessment
- **Calendar integration** - Appointments sync to Google Calendar

---

## Project Structure

```
medlive-ai/
├── agent/                    # Python AI agent
│   ├── src/
│   │   ├── agent.py         # Main agent logic (Dr. Liv)
│   │   └── calendar_service.py  # Google Calendar integration
│   ├── Dockerfile           # Cloud Run container
│   └── pyproject.toml       # Python dependencies
├── frontend/                 # Next.js frontend
│   ├── src/app/
│   │   ├── page.tsx         # Landing page
│   │   ├── consultation/    # Consultation room
│   │   ├── doctor/          # Doctor dashboard
│   │   └── api/token/       # WebRTC token API
│   └── Dockerfile           # Cloud Run container
├── deploy.sh                 # Deployment script
└── .env.example             # Environment template
```

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [pnpm](https://pnpm.io/) (Node.js package manager)

### 1. Clone & Configure

```bash
git clone https://github.com/MrJohn91/medlive-ai.git
cd medlive-ai
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
GOOGLE_WEBRTC_URL=wss://generativelanguage.googleapis.com
GOOGLE_WEBRTC_API_KEY=your_key
GOOGLE_WEBRTC_API_SECRET=your_secret
GOOGLE_API_KEY=your_gemini_key
ANAM_API_KEY=your_anam_key
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SHEET_NAME=Sheet1
```

### 2. Run the Agent

```bash
cd agent
uv sync
uv run python -m src.agent dev
```

### 3. Run the Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Google Cloud Run)

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- APIs enabled: Cloud Run, Secret Manager, Sheets, Calendar

### Deploy

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create secrets
gcloud secrets create GOOGLE_WEBRTC_URL --data-file=- <<< "wss://your.webrtc.cloud"
gcloud secrets create GOOGLE_WEBRTC_API_KEY --data-file=- <<< "your_key"
gcloud secrets create GOOGLE_WEBRTC_API_SECRET --data-file=- <<< "your_secret"
gcloud secrets create GOOGLE_API_KEY --data-file=- <<< "your_gemini_key"
gcloud secrets create ANAM_API_KEY --data-file=- <<< "your_anam_key"
gcloud secrets create GOOGLE_SHEET_ID --data-file=- <<< "your_sheet_id"
gcloud secrets create GOOGLE_SHEET_NAME --data-file=- <<< "Sheet1"

# Deploy agent
cd agent
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/medlive-agent
gcloud run deploy medlive-agent \
  --image gcr.io/YOUR_PROJECT_ID/medlive-agent \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_WEBRTC_URL=GOOGLE_WEBRTC_URL:latest,..." \
  --memory 2Gi --cpu 2 --min-instances 1

# Deploy frontend
cd ../frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/medlive-frontend
gcloud run deploy medlive-frontend \
  --image gcr.io/YOUR_PROJECT_ID/medlive-frontend \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_WEBRTC_API_KEY=GOOGLE_WEBRTC_API_KEY:latest,..."
```

---

## API Keys Required

| Service | Get Key From |
|---------|--------------|
| WebRTC Cloud | [generativelanguage.googleapis.com](https://generativelanguage.googleapis.com/) |
| Gemini | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Anam | [lab.anam.ai](https://lab.anam.ai/api-keys) |
| Google Sheets | Enable Sheets API in GCP Console |
| Google Calendar | Enable Calendar API in GCP Console |

---

## Behind the Scenes

### Challenges We Ran Into
Integrating the Google Calendar API within a service account environment on Cloud Run proved tricky. Service accounts lack the built-in domain-wide delegation required to send automated invite emails directly to patients or use the native `hangoutsMeet` conference creation in the Calendar API. We solved this by generating unique Google Meet links dynamically and modifying the agent to write the booking directly to the doctor's personal calendar via delegated access, ensuring the calendar was accurately blocked without failing.

### Accomplishments That We're Proud Of
We are incredibly proud of the seamless multimodal experience. The fact that a patient can both *talk* to the AI and *show* the AI their physical symptoms in real-time—and have that instantly translated into a booked calendar appointment and a filled-out CRM row on Google Sheets—feels like magic and represents a real leap forward in telehealth.

### What We Learned
We learned a massive amount about WebRTC, managing real-time streaming latency, and effectively using function tools within the Gemini Live framework. Handling context and ensuring the agent didn't "hallucinate" medical advice (sticking strictly to symptom collection, triage, and booking) required careful prompt engineering and system instructions. 

### What's Next for MedLive AI
In the future, we'd like to integrate MedLive directly with standard Electronic Health Record (EHR) systems (like Epic or Cerner) via FHIR APIs, add multi-language support so non-English speakers can easily get triaged without translators, and implement an SMS notification module for appointment reminders.

---

## Team

Built with love for the Gemini Live Agent Challenge 2026.

---

## License

MIT
