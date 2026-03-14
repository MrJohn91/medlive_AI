"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GoogleWebRTCRoom,
  useLocalParticipant,
  useTracks,
  useRoomContext,
  useParticipants,
  TrackReference,
} from "@google_webrtc/react";
import { Track } from "google_webrtc_client";
import { AvatarDisplay } from "./AvatarDisplay";
import { UserVideo } from "./UserVideo";
import { PatientIntakeForm } from "./PatientIntakeForm";
import { ConnectionStatus } from "./ConnectionStatus";
import { usePatientForm } from "@/hooks/usePatientForm";
import { registerRPCHandlers } from "@/lib/google_webrtc";
import { FormFieldName } from "@/types/form";

interface ConsultationRoomProps {
  token: string;
  serverUrl: string;
  onDisconnect: () => void;
}

function RoomContent({ onDisconnect }: { onDisconnect: () => void }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const { formData, updateField, getFormState, recentlyUpdatedField } =
    usePatientForm();

  // Get all tracks
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

  // Find avatar participant (starts with "anam-")
  const avatarParticipant = participants.find((p) =>
    p.identity.startsWith("anam-")
  );

  // Get avatar video track - filter to only actual TrackReferences (not placeholders)
  const avatarVideoTrack = tracks.find(
    (track): track is TrackReference =>
      'publication' in track &&
      track.publication !== undefined &&
      track.participant.identity.startsWith("anam-") &&
      track.source === Track.Source.Camera
  );

  // Get avatar audio track
  const avatarAudioTrack = tracks.find(
    (track): track is TrackReference =>
      'publication' in track &&
      track.publication !== undefined &&
      track.participant.identity.startsWith("anam-") &&
      track.source === Track.Source.Microphone
  );

  // Get user's camera track
  const userVideoTrack = tracks.find(
    (track): track is TrackReference =>
      'publication' in track &&
      track.publication !== undefined &&
      track.participant === localParticipant &&
      track.source === Track.Source.Camera
  );

  // Register RPC handlers for agent communication
  useEffect(() => {
    if (!room) {
      console.log("[ConsultationRoom] No room yet, skipping RPC registration");
      return;
    }

    console.log("[ConsultationRoom] Registering RPC handlers for room:", room.name);

    const cleanup = registerRPCHandlers(room, {
      updateField: async (payload) => {
        console.log("[ConsultationRoom] updateField RPC received:", payload);
        const { fieldName, value } = payload;
        updateField(fieldName as FormFieldName, value);
        return JSON.stringify({ success: true });
      },
      getFormState: async () => {
        const state = getFormState();
        console.log("[ConsultationRoom] getFormState RPC called, returning:", state);
        return JSON.stringify(state);
      },
      submitForm: async () => {
        console.log("[ConsultationRoom] submitForm RPC called:", getFormState());
        return JSON.stringify({ success: true });
      },
      submitToSheets: async (payload) => {
        const state = getFormState();
        try {
          await fetch("/api/records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state)
          });
        } catch (e) { console.error("Could not save to DB", e) }
        return JSON.stringify({ success: true });
      },
      scheduleAppointment: async (payload) => {
        const state = getFormState();
        try {
          await fetch("/api/records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...state,
              status: "Appointment Booked",
              appointmentTime: payload.preferredDate + " " + payload.preferredTime,
              note: `Agent scheduled appointment for: ${payload.preferredDate} at ${payload.preferredTime}`
            })
          });
        } catch (e) { console.error("Could not save booking to DB", e) }

        return JSON.stringify({ success: true, appointmentId: "apt-123" });
      },
      requestCallback: async (payload) => {
        console.log("[ConsultationRoom] requestCallback RPC called:", payload);
        return JSON.stringify({ success: true, callbackId: "cb-456" });
      },
    });

    return cleanup;
  }, [room, updateField, getFormState]);

  // Track speaking state
  useEffect(() => {
    if (!avatarParticipant) return;

    const handleSpeaking = () => setIsSpeaking(true);
    const handleStopped = () => setIsSpeaking(false);

    avatarParticipant.on("isSpeakingChanged", (speaking: boolean) => {
      setIsSpeaking(speaking);
    });

    return () => {
      avatarParticipant.off("isSpeakingChanged", handleSpeaking);
    };
  }, [avatarParticipant]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    }
  }, [localParticipant, cameraEnabled]);

  return (
    <div className="min-h-screen bg-clinical-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-clinical-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-sage-800">
                  MedLive AI
                </h1>
                <p className="text-xs text-sage-500">
                  Your AI Health Assistant
                </p>
              </div>
            </div>

            <ConnectionStatus
              state="connected"
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Video Section */}
          <div className="lg:col-span-4 space-y-6">
            {/* Avatar Display */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-card"
            >
              <AvatarDisplay
                avatarTrack={avatarVideoTrack}
                avatarAudioTrack={avatarAudioTrack}
                isConnected={!!avatarParticipant}
                isSpeaking={isSpeaking}
              />
            </motion.div>

            {/* User Video */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-card"
            >
              <UserVideo
                videoTrack={userVideoTrack}
                isEnabled={cameraEnabled}
                onToggle={toggleCamera}
              />
            </motion.div>
          </div>

          {/* Right Column - Form Section */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-sage-800">
                    Patient Intake Form
                  </h2>
                  <p className="text-sage-500 mt-1">
                    Auto-filled by Dr. Liv as you speak
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                  <span className="text-sm font-medium text-sage-600">
                    Live
                  </span>
                </div>
              </div>

              <PatientIntakeForm
                formData={formData}
                recentlyUpdatedField={recentlyUpdatedField}
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function ConsultationRoom({
  token,
  serverUrl,
  onDisconnect,
}: ConsultationRoomProps) {
  return (
    <GoogleWebRTCRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={onDisconnect}
      options={{
        // Enable automatic reconnection on network issues
        reconnectPolicy: {
          nextRetryDelayInMs: (context) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, context.retryCount), 16000);
          },
        },
        // Keep connection alive
        disconnectOnPageLeave: false,
      }}
    >
      <RoomContent onDisconnect={onDisconnect} />
    </GoogleWebRTCRoom>
  );
}
