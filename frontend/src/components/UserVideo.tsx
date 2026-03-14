"use client";

import { motion } from "framer-motion";
import { VideoTrack } from "@google_webrtc/react";
import type { TrackReference } from "@google_webrtc/react";

interface UserVideoProps {
  videoTrack?: TrackReference;
  isEnabled: boolean;
  onToggle?: () => void;
}

export function UserVideo({ videoTrack, isEnabled, onToggle }: UserVideoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Video Container */}
      <div className="relative aspect-video w-full max-w-sm rounded-2xl overflow-hidden bg-sage-100 shadow-card">
        {videoTrack && isEnabled ? (
          <VideoTrack
            trackRef={videoTrack}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Camera Off Placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-sage-200 flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-sage-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sage-500 text-sm text-center">
              Camera off
              <br />
              <span className="text-xs">
                Enable to show symptoms to Dr. Liv
              </span>
            </p>
          </div>
        )}

        {/* Camera Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={`
              absolute bottom-3 right-3 p-2.5 rounded-xl transition-all duration-200
              ${
                isEnabled
                  ? "bg-white/90 text-sage-700 hover:bg-white"
                  : "bg-sage-600 text-white hover:bg-sage-700"
              }
              shadow-soft backdrop-blur-sm
            `}
            title={isEnabled ? "Turn camera off" : "Turn camera on"}
          >
            {isEnabled ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            )}
          </button>
        )}

        {/* Live indicator */}
        {isEnabled && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-sage-700">Live</span>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="mt-3 text-center text-sm text-sage-500">
        Your camera (for visual assessment)
      </p>
    </motion.div>
  );
}
