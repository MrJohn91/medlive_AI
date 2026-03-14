import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "google_webrtc_server";
import { RoomAgentDispatch, RoomConfiguration } from "@google_webrtc/protocol";

// Trim whitespace from secrets (common issue with Secret Manager)
const GOOGLE_WEBRTC_API_KEY = (process.env.GOOGLE_WEBRTC_API_KEY || "").trim();
const GOOGLE_WEBRTC_API_SECRET = (process.env.GOOGLE_WEBRTC_API_SECRET || "").trim();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName } = body;

    // Generate a unique room name if not provided
    const room = roomName || `medlive-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Generate a unique identity for this patient
    const identity = `patient-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Create access token with agent dispatch built into the token
    // This is more reliable than using AgentDispatchClient
    const token = new AccessToken(GOOGLE_WEBRTC_API_KEY, GOOGLE_WEBRTC_API_SECRET, {
      identity,
      name: "Patient",
    });

    // Grant permissions
    token.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Dispatch agent via token - agent joins when participant connects
    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "MedLive-AI",
        }),
      ],
    });

    const jwt = await token.toJwt();

    console.log(`[Token API] Created token for room: ${room}, identity: ${identity}, with MedLive-AI agent dispatch`);

    return NextResponse.json({
      token: jwt,
      roomName: room,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
