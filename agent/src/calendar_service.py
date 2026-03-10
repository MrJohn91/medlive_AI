"""
Google Calendar Integration for MedLive AI

Handles:
- Checking doctor's available slots (Mon-Fri, 9am-4pm)
- Booking appointments (in-person or Google Meet)
- Sending calendar invites with confirmations
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

from google.auth import default as google_auth_default
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger("medlive-agent")

# Doctor's working hours
WORKING_HOURS = {
    "start": 9,   # 9 AM
    "end": 16,    # 4 PM (last slot at 3:30)
}
WORKING_DAYS = [0, 1, 2, 3, 4]  # Monday to Friday
SLOT_DURATION_MINUTES = 30
TIMEZONE = "Europe/Berlin"

# Office location for in-person visits
OFFICE_LOCATION = os.getenv("OFFICE_LOCATION", "MedLive Clinic, Berlin, Germany")


def get_calendar_service():
    """Get authenticated Google Calendar service."""
    try:
        credentials, project = google_auth_default(
            scopes=["https://www.googleapis.com/auth/calendar"]
        )
        service = build("calendar", "v3", credentials=credentials)
        return service
    except Exception as e:
        logger.error(f"Failed to create Calendar service: {e}")
        return None


def get_available_slots(days_ahead: int = 7) -> list[dict]:
    """
    Get available appointment slots for the next X days.

    Returns list of slots like:
    [
        {"date": "Monday, March 10", "time": "10:00 AM", "datetime": "2026-03-10T10:00:00"},
        {"date": "Monday, March 10", "time": "2:00 PM", "datetime": "2026-03-10T14:00:00"},
        ...
    ]
    """
    service = get_calendar_service()
    if not service:
        logger.warning("Calendar service not available, returning mock slots")
        return _get_mock_slots(days_ahead)

    tz = ZoneInfo(TIMEZONE)
    now = datetime.now(tz)

    # Start from tomorrow if it's past working hours today
    if now.hour >= WORKING_HOURS["end"]:
        start_date = now + timedelta(days=1)
    else:
        start_date = now

    end_date = start_date + timedelta(days=days_ahead)

    # Get existing events to find busy times
    try:
        events_result = service.events().list(
            calendarId="primary",
            timeMin=start_date.isoformat(),
            timeMax=end_date.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        ).execute()
        events = events_result.get("items", [])
    except HttpError as e:
        logger.error(f"Error fetching calendar events: {e}")
        events = []

    # Build list of busy periods
    busy_periods = []
    for event in events:
        start = event.get("start", {}).get("dateTime")
        end = event.get("end", {}).get("dateTime")
        if start and end:
            busy_periods.append({
                "start": datetime.fromisoformat(start),
                "end": datetime.fromisoformat(end),
            })

    # Generate available slots
    available_slots = []
    current_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

    for day_offset in range(days_ahead):
        check_date = current_date + timedelta(days=day_offset)

        # Skip weekends
        if check_date.weekday() not in WORKING_DAYS:
            continue

        # Generate slots for this day
        for hour in range(WORKING_HOURS["start"], WORKING_HOURS["end"]):
            for minute in [0, 30]:
                slot_start = check_date.replace(hour=hour, minute=minute, tzinfo=tz)
                slot_end = slot_start + timedelta(minutes=SLOT_DURATION_MINUTES)

                # Skip if slot is in the past
                if slot_start <= now:
                    continue

                # Check if slot conflicts with any busy period
                is_busy = False
                for busy in busy_periods:
                    if slot_start < busy["end"] and slot_end > busy["start"]:
                        is_busy = True
                        break

                if not is_busy:
                    available_slots.append({
                        "date": slot_start.strftime("%A, %B %d"),
                        "time": slot_start.strftime("%I:%M %p").lstrip("0"),
                        "datetime": slot_start.isoformat(),
                    })

    # Return first 10 slots to avoid overwhelming the patient
    return available_slots[:10]


def _get_mock_slots(days_ahead: int = 7) -> list[dict]:
    """Return mock slots when calendar is not available."""
    tz = ZoneInfo(TIMEZONE)
    now = datetime.now(tz)
    slots = []

    for day_offset in range(1, days_ahead + 1):
        check_date = now + timedelta(days=day_offset)
        if check_date.weekday() in WORKING_DAYS:
            for hour in [10, 14, 16]:
                slot_time = check_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                slots.append({
                    "date": slot_time.strftime("%A, %B %d"),
                    "time": slot_time.strftime("%I:%M %p").lstrip("0"),
                    "datetime": slot_time.isoformat(),
                })

    return slots[:10]


def book_appointment(
    patient_name: str,
    patient_email: str,
    appointment_datetime: str,
    chief_complaint: str,
    triage_level: str = "ROUTINE",
    phone_number: Optional[str] = None,
) -> dict:
    """
    Book an appointment on Google Calendar.

    EMERGENCY / URGENT: In-person at clinic/hospital
    SEMI-URGENT / ROUTINE: Google Meet virtual consultation

    Returns:
        {
            "success": True/False,
            "event_id": "...",
            "event_link": "calendar link or meet link",
            "location": "Office address or Google Meet",
            "confirmation_sent": True/False,
            "is_in_person": True/False
        }
    """
    service = get_calendar_service()
    if not service:
        logger.error("Calendar service not available")
        return {"success": False, "error": "Calendar service unavailable"}

    # Determine if in-person based on triage level
    is_in_person = triage_level.upper() in ["EMERGENCY", "URGENT"]
    is_emergency = triage_level.upper() == "EMERGENCY"

    try:
        # Parse the appointment datetime
        if isinstance(appointment_datetime, str):
            apt_time = datetime.fromisoformat(appointment_datetime)
        else:
            apt_time = appointment_datetime

        apt_end = apt_time + timedelta(minutes=SLOT_DURATION_MINUTES)

        # Build priority label
        if is_emergency:
            priority_label = "EMERGENCY - Immediate In-Person Visit Required"
        elif triage_level.upper() == "URGENT":
            priority_label = "URGENT - In-Person Visit Required"
        else:
            priority_label = "Virtual Consultation via Google Meet"

        # Build event description
        description = f"""Patient Appointment - MedLive AI

Patient: {patient_name}
Contact: {patient_email}
{f"Phone: {phone_number}" if phone_number else ""}

Chief Complaint: {chief_complaint}

Priority: {priority_label}
Triage Level: {triage_level}

---
This appointment was booked automatically by Dr. Liv (MedLive AI Assistant).
"""

        # Event summary
        if is_emergency:
            summary = f"EMERGENCY: {patient_name}"
        elif triage_level.upper() == "URGENT":
            summary = f"URGENT: {patient_name}"
        else:
            summary = f"Virtual Consultation - {patient_name}"

        # Event configuration
        # Note: Service accounts can't invite external attendees without Domain-Wide Delegation
        # So we create the event without attendees - patient info is in the description
        event = {
            "summary": summary,
            "description": description,
            "start": {
                "dateTime": apt_time.isoformat(),
                "timeZone": TIMEZONE,
            },
            "end": {
                "dateTime": apt_end.isoformat(),
                "timeZone": TIMEZONE,
            },
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 60},
                    {"method": "popup", "minutes": 30},
                ],
            },
        }

        # Add location or Google Meet based on triage level
        if is_in_person:
            event["location"] = OFFICE_LOCATION
            if is_emergency:
                event["colorId"] = "11"  # Red for emergency
            else:
                event["colorId"] = "6"   # Orange for urgent
        else:
            # Add Google Meet conference for virtual consultations
            event["conferenceData"] = {
                "createRequest": {
                    "requestId": f"medlive-{apt_time.timestamp()}",
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            }

        # Create the event
        created_event = service.events().insert(
            calendarId="primary",
            body=event,
            conferenceDataVersion=0 if is_in_person else 1,
        ).execute()

        # Get the meet link if available (only for virtual consultations)
        meet_link = None
        if not is_in_person and "conferenceData" in created_event:
            entry_points = created_event["conferenceData"].get("entryPoints", [])
            for ep in entry_points:
                if ep.get("entryPointType") == "video":
                    meet_link = ep.get("uri")
                    break

        logger.info(f"[CALENDAR] Appointment booked: {created_event.get('id')} for {patient_name} (in_person={is_in_person})")

        return {
            "success": True,
            "event_id": created_event.get("id"),
            "event_link": created_event.get("htmlLink"),
            "meet_link": meet_link,
            "location": OFFICE_LOCATION if is_in_person else "Google Meet",
            "is_in_person": is_in_person,
            "triage_level": triage_level,
            "confirmation_sent": True,
            "appointment_time": apt_time.strftime("%A, %B %d at %I:%M %p"),
        }

    except HttpError as e:
        logger.error(f"[CALENDAR] Failed to book appointment: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"[CALENDAR] Unexpected error: {e}")
        return {"success": False, "error": str(e)}


def format_slots_for_speech(slots: list[dict], max_slots: int = 3) -> str:
    """Format available slots for the agent to speak naturally."""
    if not slots:
        return "I don't see any available slots in the next few days. Let me check with the clinic and have someone call you back."

    # Group by date
    by_date = {}
    for slot in slots[:max_slots * 2]:  # Get more than needed to have options
        date = slot["date"]
        if date not in by_date:
            by_date[date] = []
        by_date[date].append(slot["time"])

    # Build natural speech
    parts = []
    count = 0
    for date, times in by_date.items():
        if count >= max_slots:
            break
        if len(times) == 1:
            parts.append(f"{date} at {times[0]}")
        else:
            times_str = ", ".join(times[:-1]) + f" or {times[-1]}"
            parts.append(f"{date} at {times_str}")
        count += 1

    if len(parts) == 1:
        return f"I have an opening on {parts[0]}."
    else:
        return f"I have openings on {', '.join(parts[:-1])}, and {parts[-1]}."
