import { RoomEvent, DataPacket_Kind } from "google_webrtc_client";
import type { Room, LocalParticipant, RemoteParticipant } from "google_webrtc_client";

const GOOGLE_WEBRTC_URL = process.env.NEXT_PUBLIC_GOOGLE_WEBRTC_URL || "";

export interface TokenResponse {
  token: string;
  roomName: string;
}

export async function getConnectionToken(
  roomName?: string
): Promise<TokenResponse> {
  const response = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName }),
  });

  if (!response.ok) {
    throw new Error("Failed to get connection token");
  }

  return response.json();
}

export function getGoogleWebRTCUrl(): string {
  return GOOGLE_WEBRTC_URL;
}

// RPC method names that the agent can call
export type RPCMethod =
  | "updateField"
  | "getFormState"
  | "submitForm"
  | "submitToSheets"
  | "scheduleAppointment"
  | "requestCallback";

export interface RPCPayload {
  updateField: { fieldName: string; value: string };
  getFormState: Record<string, never>;
  submitForm: Record<string, never>;
  submitToSheets: Record<string, unknown>;
  scheduleAppointment: {
    patientData: Record<string, unknown>;
    preferredDate: string;
    preferredTime: string;
  };
  requestCallback: {
    patientData: Record<string, unknown>;
    urgency: string;
    bestContactTime: string;
  };
}

export type RPCHandler<T extends RPCMethod> = (
  payload: RPCPayload[T]
) => Promise<string> | string;

export function registerRPCHandlers(
  room: Room,
  handlers: Partial<{ [K in RPCMethod]: RPCHandler<K> }>
) {
  const localParticipant = room.localParticipant;
  console.log("[RPC] Registering handlers for participant:", localParticipant.identity);

  // Register each handler
  for (const [method, handler] of Object.entries(handlers)) {
    if (handler) {
      console.log(`[RPC] Registering method: ${method}`);
      localParticipant.registerRpcMethod(method, async (data) => {
        console.log(`[RPC] Received call for method: ${method}`, data);
        try {
          const payload = JSON.parse(data.payload);
          console.log(`[RPC] Parsed payload for ${method}:`, payload);
          const result = await handler(payload);
          console.log(`[RPC] Handler result for ${method}:`, result);
          return result;
        } catch (error) {
          console.error(`[RPC] Error for ${method}:`, error);
          return JSON.stringify({ error: String(error) });
        }
      });
    }
  }

  return () => {
    console.log("[RPC] Cleaning up handlers");
    // Cleanup: unregister handlers
    for (const method of Object.keys(handlers)) {
      localParticipant.unregisterRpcMethod(method);
    }
  };
}
