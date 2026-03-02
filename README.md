# MedLive AI

**An AI medical triage assistant that sees, listens, and guides patients to the right care.**

---

## The Problem

Every day, millions of people face the same frustrating questions:

- *"Is this rash serious enough to see a doctor?"*
- *"Should I go to the ER or can this wait until morning?"*
- *"I've been on hold with the clinic for 45 minutes..."*

**The reality:**
- Clinics are overwhelmed with phone calls
- Patients wait hours for simple triage questions
- Many people delay care because they're unsure if it's "serious enough"
- Others rush to the ER for issues that could be handled at home

**The cost:**
- Delayed treatment leads to worse outcomes
- Unnecessary ER visits cost billions annually
- Healthcare workers burn out answering repetitive triage calls

---

## The Solution

MedLive AI is a voice-powered medical triage assistant with a friendly avatar that patients can talk to naturally - just like calling a nurse advice line, but available instantly, 24/7.

### How It Works

```
Patient joins the app
        ↓
Sees Dr. Liv (AI avatar) and starts talking
        ↓
"Hi, I have this rash on my arm. It's been there for 3 days and it's itchy."
        ↓
Dr. Liv asks follow-up questions, form auto-fills as patient speaks
        ↓
"Can you show me the rash?"
        ↓
Patient shows arm to camera → AI analyzes the image
        ↓
"I can see a red, raised rash with defined borders. Based on your symptoms,
 this looks like contact dermatitis. You should see a doctor within 24 hours."
        ↓
Patient record saved → Ready to share with their doctor
```

---

## Key Features

| Feature | What It Does |
|---------|--------------|
| **Voice Conversation** | Talk naturally - no typing, no menus |
| **Lifelike Avatar** | Dr. Liv responds with lip-synced video |
| **Visual Analysis** | Show symptoms via camera - AI sees and analyzes |
| **Auto Form Fill** | Information captured automatically as you speak |
| **Triage Guidance** | Clear recommendation: ER, urgent care, or home care |
| **Patient Record** | Summary saved to share with your doctor |

---

## Triage Levels

The AI guides patients to the right level of care:

| Level | Examples | Recommendation |
|-------|----------|----------------|
| **Emergency** | Chest pain, difficulty breathing, stroke symptoms | Call 911 now |
| **Urgent** | High fever with rash, severe pain, broken bones | ER within hours |
| **Semi-Urgent** | Moderate fever, minor cuts needing stitches | Urgent care today |
| **Routine** | Chronic symptom follow-up, minor rashes | Schedule appointment |
| **Self-Care** | Common cold, minor scrapes | Home treatment advice |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Meet Dr. Liv                                           │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Avatar     │  "Hi, I'm Dr. Liv. How can I help you today?" │
│  └──────────────┘                                               │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2: Describe symptoms (form auto-fills)                    │
│                                                                  │
│  ┌──────────────┐    ┌─────────────────────────┐                │
│  │   Avatar     │    │ Intake Form             │                │
│  │              │───►│ Symptoms: [Rash on arm] │ ← auto-filled  │
│  │  "Tell me    │    │ Duration: [3 days]      │ ← auto-filled  │
│  │   more..."   │    └─────────────────────────┘                │
│  └──────────────┘                                               │
├─────────────────────────────────────────────────────────────────┤
│  STEP 3: Show visible symptoms                                  │
│                                                                  │
│  ┌──────────────┐    ┌─────────────────────────┐                │
│  │   Avatar     │    │ Patient Camera          │                │
│  │              │◄───│ [Shows rash on arm]     │                │
│  │  "I can see  │    └─────────────────────────┘                │
│  │   redness..."│    Gemini Vision analyzes                     │
│  └──────────────┘                                               │
├─────────────────────────────────────────────────────────────────┤
│  STEP 4: Get triage recommendation                              │
│                                                                  │
│  ┌──────────────┐    ┌─────────────────────────┐                │
│  │   Avatar     │    │ TRIAGE RESULT           │                │
│  │              │    │ ⚠️ SEMI-URGENT          │                │
│  │  "You should │    │ See a doctor within     │                │
│  │   see a      │    │ 24 hours                │                │
│  │   doctor..." │    └─────────────────────────┘                │
│  └──────────────┘                                               │
├─────────────────────────────────────────────────────────────────┤
│  STEP 5: Save patient record                                    │
│                                                                  │
│  "Would you like me to save this so you can share it with       │
│   your doctor? What's your full name?"                          │
│                                                                  │
│  → Patient record saved to database                             │
│  → Ready to share with healthcare provider                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       LIVEKIT CLOUD                              │
│                  (Real-time voice/video)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                              ▼
┌───────────────────────┐      ┌───────────────────────────────┐
│   Frontend            │      │   Agent                       │
│   (Next.js)           │      │   (Python)                    │
│                       │      │                               │
│   • Avatar display    │ RPC  │   • Gemini LLM (conversation) │
│   • Patient camera    │◄────►│   • Gemini Vision (symptoms)  │
│   • Intake form       │      │   • Triage logic              │
│   • Triage result     │      │   • Anam avatar control       │
│                       │      │                               │
│   GCP Cloud Run       │      │   GCP Cloud Run               │
└───────────────────────┘      └───────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Google Cloud Platform  │
              │                          │
              │   • Firestore (records)  │
              │   • Gemini API           │
              │   • Cloud Build (CI/CD)  │
              └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **AI Model** | Google Gemini 2.0 Flash | Conversation + Vision |
| **Voice** | LiveKit Agents + LiveKit Cloud | Real-time audio/video |
| **Avatar** | Anam | Lip-synced AI avatar |
| **Frontend** | Next.js + TypeScript | Patient interface |
| **Backend** | Python + LiveKit SDK | Agent logic |
| **Database** | Firestore | Patient records |
| **Hosting** | GCP Cloud Run | Scalable containers |
| **CI/CD** | Cloud Build | Automated deployment |

---

## Who Is This For?

| User | Benefit |
|------|---------|
| **Patients** | Instant triage guidance, no phone hold times |
| **Clinics** | Reduce call volume, triage handled automatically |
| **Telehealth providers** | 24/7 first-contact screening |
| **Rural communities** | Access to medical guidance without travel |
| **After-hours care** | Guidance when clinics are closed |

---

## Challenge Submission

This project is a submission for the [Gemini Live Agent Challenge](https://geminiliveagentchallenge.devpost.com/).

**Category:** Live Agents

**Judging Criteria Addressed:**
- **Innovation & Multimodal (40%)**: Voice + Vision + Avatar - beyond text chatbots
- **Technical Implementation (30%)**: Gemini API + GCP Cloud Run + Firestore
- **Demo & Presentation (30%)**: Clear problem, working solution, GCP deployment

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud account with billing enabled
- LiveKit Cloud account
- Anam API key

### Environment Variables

```bash
# LiveKit
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Google
GOOGLE_API_KEY=your-gemini-api-key

# Anam
ANAM_API_KEY=your-anam-api-key
```

### Local Development

```bash
# Agent
cd agent
uv sync
uv run python src/agent.py dev

# Frontend (separate terminal)
cd frontend
pnpm install
pnpm dev
```

### Deploy to GCP

```bash
# Coming soon - Terraform + Cloud Build
```

---

## License

MIT

---

## Team

Built for the Gemini Live Agent Challenge 2026.
