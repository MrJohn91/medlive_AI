# MedLive AI

**Your personal AI health assistant that listens to your concerns, sees your symptoms, fills out your medical forms automatically, and guides you to the right care - all through a simple video conversation.**

---

## Imagine This...

It's 11 PM. Your child has developed a strange rash on their arm. It's red, slightly raised, and appeared a few hours ago. You're worried, but not sure what to do:

- *Is this an allergic reaction? Should I rush to the ER?*
- *Can this wait until morning? What if it gets worse overnight?*
- *I could call the nurse hotline, but I've been on hold for 40 minutes before...*

**What if you could just... talk to someone? Right now?**

Someone who would listen to you describe what's happening, ask the right follow-up questions, actually *look* at the rash through your phone camera, and tell you whether you need emergency care or if it's safe to wait until morning.

**That's MedLive AI.**

---

## What Makes MedLive Different

This isn't a chatbot. This isn't a symptom checker where you click through endless dropdown menus.

MedLive AI is a **video conversation with an AI medical assistant named Dr. Liv** who:

### Listens Like a Real Person
You don't type anything. You just talk naturally:
> *"My son has this rash on his arm. It showed up after dinner, maybe 3 hours ago. He says it's a little itchy but it doesn't hurt."*

Dr. Liv listens, understands, and asks smart follow-up questions - just like a nurse on a phone call would.

### Sees What You're Describing
This is the breakthrough. When you mention something visible - a rash, a swollen ankle, a cut - Dr. Liv will ask:
> *"Can you show me the rash? Just point your camera at his arm."*

You show your phone camera, and the AI actually **analyzes what it sees**:
> *"I can see a red, raised rash with defined borders, approximately 3 inches across. It doesn't appear to have blisters or broken skin. Based on the appearance and the timing after dinner, this could be contact dermatitis or a mild allergic reaction."*

### Fills Out Your Medical Forms Automatically
Here's where it gets magical. As you're talking to Dr. Liv, **your medical intake form fills itself out in real-time**:

```
┌─────────────────────────────────────────────────────┐
│  PATIENT INTAKE FORM                                │
│                                                     │
│  You're talking...          Form fills itself:      │
│                                                     │
│  "My son Tommy..."    →     Name: Tommy             │
│  "He's 7 years old"   →     Age: 7                  │
│  "Rash on his arm"    →     Symptom: Rash (arm)     │
│  "Started 3 hours     →     Duration: 3 hours       │
│   ago after dinner"   →     Onset: After eating     │
│  "It's a bit itchy"   →     Severity: Mild, itchy   │
│                                                     │
│  [Form completes as you speak - no typing needed]   │
└─────────────────────────────────────────────────────┘
```

No clipboard. No "please spell your last name." No typing while trying to hold a sick child. **You just talk, and everything is captured.**

### Guides You to the Right Care
After understanding your situation - what you've described AND what the AI has seen - Dr. Liv gives you clear guidance:

| What Dr. Liv Might Say | What It Means |
|------------------------|---------------|
| *"Call 911 or go to the ER immediately"* | Emergency - don't wait |
| *"You should see a doctor within the next few hours"* | Urgent - ER or urgent care today |
| *"I recommend seeing a doctor within 24 hours"* | Semi-urgent - schedule soon |
| *"This can wait for a regular appointment"* | Routine - call your doctor's office |
| *"This can likely be treated at home"* | Self-care - with specific guidance |

### Saves Everything for Your Doctor
When you do see a doctor, you're not starting from scratch. Dr. Liv asks:
> *"Would you like me to save this information so you can share it with your doctor?"*

Your complete record is saved:
- Everything you described
- Images of visible symptoms
- The AI's observations
- Recommended level of care
- Timestamp of the consultation

**You walk into your appointment with documentation ready.**

---

## A Complete Consultation in 5 Minutes

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  STEP 1: Start the conversation                                     │
│  ════════════════════════════════                                   │
│                                                                      │
│  ┌──────────────┐                                                   │
│  │              │                                                   │
│  │   Dr. Liv    │  "Hi, I'm Dr. Liv, your AI health assistant.     │
│  │   (Avatar)   │   I'm here to help you understand your symptoms   │
│  │              │   and guide you to the right care. What's going   │
│  │              │   on today?"                                      │
│  └──────────────┘                                                   │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 2: Describe what's happening (form auto-fills)                │
│  ═══════════════════════════════════════════════════                │
│                                                                      │
│  You: "My son Tommy has a rash on his arm. He's 7. It started       │
│        about 3 hours ago after dinner. It's red and a bit itchy."  │
│                                                                      │
│  ┌──────────────┐         ┌─────────────────────────────┐           │
│  │              │         │  INTAKE FORM                │           │
│  │   Dr. Liv    │  ────►  │                             │           │
│  │              │   RPC   │  Patient: Tommy             │ ← AUTO    │
│  │  "I see.     │  sync   │  Age: 7                     │ ← AUTO    │
│  │   A rash     │         │  Chief Complaint: Rash      │ ← AUTO    │
│  │   that       │         │  Location: Arm              │ ← AUTO    │
│  │   started    │         │  Duration: 3 hours          │ ← AUTO    │
│  │   after      │         │  Onset: After dinner        │ ← AUTO    │
│  │   eating..." │         │  Symptoms: Red, itchy       │ ← AUTO    │
│  └──────────────┘         └─────────────────────────────┘           │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 3: Show the symptom                                           │
│  ════════════════════════                                           │
│                                                                      │
│  Dr. Liv: "Can you show me the rash? Just point your camera         │
│            at his arm and hold it steady for a moment."             │
│                                                                      │
│  ┌──────────────┐         ┌─────────────────────────────┐           │
│  │              │         │  YOUR CAMERA                │           │
│  │   Dr. Liv    │ ◄────── │  ┌─────────────────────┐    │           │
│  │              │  Gemini │  │                     │    │           │
│  │  "I can see  │  Vision │  │   [Image of rash]   │    │           │
│  │   a red,     │ analyzes│  │                     │    │           │
│  │   raised     │         │  └─────────────────────┘    │           │
│  │   area..."   │         │                             │           │
│  └──────────────┘         └─────────────────────────────┘           │
│                                                                      │
│  Dr. Liv: "I can see a red, raised rash approximately 3 inches      │
│            across with defined borders. It doesn't show signs of    │
│            blistering or infection. The pattern suggests contact    │
│            dermatitis - possibly a reaction to something he         │
│            touched or ate."                                         │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 4: Get your recommendation                                    │
│  ═══════════════════════════════                                    │
│                                                                      │
│  ┌──────────────┐         ┌─────────────────────────────┐           │
│  │              │         │  TRIAGE RECOMMENDATION      │           │
│  │   Dr. Liv    │         │  ┌─────────────────────┐    │           │
│  │              │         │  │  ⚠️ SEMI-URGENT      │    │           │
│  │  "Based on   │         │  │                     │    │           │
│  │   everything │         │  │  See a doctor       │    │           │
│  │   I've seen  │         │  │  within 24 hours    │    │           │
│  │   and heard, │         │  │                     │    │           │
│  │   Tommy      │         │  └─────────────────────┘    │           │
│  │   should..." │         │                             │           │
│  └──────────────┘         │  • Monitor for spreading    │           │
│                           │  • Give antihistamine       │           │
│                           │  • Watch for breathing      │           │
│                           │    difficulty               │           │
│                           └─────────────────────────────┘           │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 5: Save your record                                           │
│  ════════════════════════                                           │
│                                                                      │
│  Dr. Liv: "Would you like me to save this consultation so you       │
│            can share it with Tommy's doctor tomorrow?"              │
│                                                                      │
│  You: "Yes please"                                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────┐            │
│  │  PATIENT RECORD SAVED                               │            │
│  │                                                     │            │
│  │  Patient: Tommy                                     │            │
│  │  Date: March 2, 2026, 11:14 PM                     │            │
│  │  Symptoms: Red, raised, itchy rash on right arm    │            │
│  │  Duration: 3 hours, onset after dinner             │            │
│  │  Visual Assessment: Contact dermatitis suspected   │            │
│  │  Recommendation: See doctor within 24 hours        │            │
│  │  Home Care: Antihistamine, monitor for changes     │            │
│  │                                                     │            │
│  │  [Ready to share with healthcare provider]         │            │
│  └─────────────────────────────────────────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Problem We're Solving

### For Patients

| Today's Reality | With MedLive AI |
|-----------------|-----------------|
| 45-minute hold times for nurse hotlines | Instant access, 24/7 |
| "Describe your rash" over the phone (they can't see it) | AI actually looks at your symptoms |
| Typing symptoms into WebMD while panicking | Just talk naturally |
| Showing up to ER unsure if it's serious | Know your triage level before you go |
| Repeating your story to every new person | Documented record ready to share |

### For Healthcare

| Today's Reality | With MedLive AI |
|-----------------|-----------------|
| Nurses drowning in triage calls | AI handles first-contact screening |
| ER overcrowded with non-emergencies | Patients routed to appropriate care level |
| No documentation from phone triage | Complete records with visual evidence |
| After-hours coverage is expensive | AI available 24/7 at fraction of cost |

---

## Who Is This For?

**Worried parents** - It's midnight and your child has a fever. Is this ER-worthy or can it wait?

**Elderly patients** - Difficulty navigating complex phone menus and online symptom checkers.

**Rural communities** - Limited access to healthcare, long drives to the nearest clinic.

**Busy professionals** - No time to sit on hold, need quick guidance.

**Telehealth providers** - First-contact screening before connecting with a live doctor.

**Clinic administrators** - Reduce call volume while improving patient satisfaction.

---

## Built With

| Technology | What It Does |
|------------|--------------|
| **Google Gemini 2.0** | The AI brain - understands conversation AND analyzes images |
| **LiveKit** | Real-time video and audio communication |
| **Anam** | The lifelike avatar (Dr. Liv) with lip-synced responses |
| **Google Cloud Platform** | Secure, scalable hosting |

---

## Challenge Submission

This project is built for the [Gemini Live Agent Challenge](https://geminiliveagentchallenge.devpost.com/).

**Why MedLive AI should win:**

- **Truly multimodal** - Voice + Vision + Real-time action (form filling)
- **Solves a real problem** - Healthcare access and triage efficiency
- **Goes beyond chatbots** - Natural conversation with a lifelike avatar
- **Full GCP integration** - Cloud Run, Firestore, Gemini API

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud account with billing enabled
- LiveKit Cloud account
- Anam API key

### Quick Start

```bash
# Clone the repo
git clone https://github.com/MrJohn91/medlive-ai.git
cd medlive-ai

# Set up environment variables (see .env.example)
cp .env.example .env.local

# Run the agent
cd agent
uv sync
uv run python src/agent.py dev

# Run the frontend (separate terminal)
cd frontend
pnpm install
pnpm dev
```

---

## License

MIT
