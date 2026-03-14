"""
Tests for MedLive AI Agent

These tests verify the agent's behavior including:
- Greeting and introduction
- Symptom collection
- Triage assessment
- Form field updates
"""

import pytest
from google_webrtc.agents import AgentSession
from google_webrtc.plugins import google

# Import the agent
import sys
sys.path.insert(0, str(__file__).rsplit("/", 2)[0])
from src.agent import MedLiveAgent, TRIAGE_LEVELS


class MockJobContext:
    """Mock JobContext for testing."""
    def __init__(self):
        self.room = MockRoom()


class MockRoom:
    """Mock Room for testing."""
    def __init__(self):
        self.name = "test-room"
        self.remote_participants = {}
        self.local_participant = None


@pytest.mark.asyncio
async def test_agent_greeting():
    """Test that the agent greets patients warmly and offers assistance."""
    async with (
        google.LLM(model="gemini-2.0-flash") as llm,
        AgentSession(llm=llm) as session,
    ):
        mock_ctx = MockJobContext()
        agent = MedLiveAgent(mock_ctx)
        await session.start(agent)

        result = await session.run(user_input="Hello")

        await result.expect.next_event().is_message(role="assistant").judge(
            llm, intent="Makes a friendly introduction as Dr. Liv and asks what brought the patient in today."
        )


@pytest.mark.asyncio
async def test_agent_collects_symptoms():
    """Test that the agent asks follow-up questions about symptoms."""
    async with (
        google.LLM(model="gemini-2.0-flash") as llm,
        AgentSession(llm=llm) as session,
    ):
        mock_ctx = MockJobContext()
        agent = MedLiveAgent(mock_ctx)
        await session.start(agent)

        # Initial greeting
        await session.run(user_input="Hello")

        # Report symptom
        result = await session.run(user_input="I have a rash on my arm")

        await result.expect.next_event().is_message(role="assistant").judge(
            llm, intent="Asks follow-up questions about the rash such as duration, severity, or requests to see it."
        )


@pytest.mark.asyncio
async def test_triage_emergency():
    """Test that emergency symptoms trigger appropriate triage level."""
    async with (
        google.LLM(model="gemini-2.0-flash") as llm,
        AgentSession(llm=llm) as session,
    ):
        mock_ctx = MockJobContext()
        agent = MedLiveAgent(mock_ctx)
        await session.start(agent)

        # Report emergency symptom
        result = await session.run(user_input="I have severe chest pain and difficulty breathing")

        # Should contain emergency guidance
        await result.expect.next_event().is_message(role="assistant").judge(
            llm, intent="Recognizes this as an emergency and advises calling 911 or going to the ER immediately."
        )


@pytest.mark.asyncio
async def test_triage_self_care():
    """Test that minor symptoms trigger self-care recommendation."""
    async with (
        google.LLM(model="gemini-2.0-flash") as llm,
        AgentSession(llm=llm) as session,
    ):
        mock_ctx = MockJobContext()
        agent = MedLiveAgent(mock_ctx)
        await session.start(agent)

        # Report minor symptom
        result = await session.run(user_input="I have a minor headache that started an hour ago, about a 2 out of 10")

        await result.expect.next_event().is_message(role="assistant").judge(
            llm, intent="Provides reassurance and suggests home care remedies or monitoring."
        )


@pytest.mark.asyncio
async def test_form_field_update():
    """Test that the agent updates form fields when patient provides information."""
    async with (
        google.LLM(model="gemini-2.0-flash") as llm,
        AgentSession(llm=llm) as session,
    ):
        mock_ctx = MockJobContext()
        agent = MedLiveAgent(mock_ctx)
        await session.start(agent)

        # Provide name
        result = await session.run(user_input="My name is John Smith and I'm 35 years old")

        # Check for function call to update_field
        result.expect.contains_function_call(name="update_field")


def test_triage_levels_defined():
    """Test that all triage levels are properly defined."""
    expected_levels = ["emergency", "urgent", "semi_urgent", "routine", "self_care"]

    for level in expected_levels:
        assert level in TRIAGE_LEVELS
        assert "level" in TRIAGE_LEVELS[level]
        assert "description" in TRIAGE_LEVELS[level]
        assert "action" in TRIAGE_LEVELS[level]
        assert "timeframe" in TRIAGE_LEVELS[level]
