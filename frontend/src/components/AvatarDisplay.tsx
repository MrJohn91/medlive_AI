"use client";

import { motion } from "framer-motion";
import { VideoTrack, AudioTrack } from "@google_webrtc/react";
import type { TrackReference } from "@google_webrtc/react";

interface AvatarDisplayProps {
  avatarTrack?: TrackReference;
  avatarAudioTrack?: TrackReference;
  isConnected: boolean;
  isSpeaking: boolean;
}

export function AvatarDisplay({
  avatarTrack,
  avatarAudioTrack,
  isConnected,
  isSpeaking,
}: AvatarDisplayProps) {
  return (
    <div className="relative">
      {/* Avatar Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          avatar-container relative aspect-[3/4] w-full max-w-md mx-auto
          ${isSpeaking ? "pulse-ring" : ""}
        `}
        style={{ color: "#627462" }}
      >
        {avatarTrack ? (
          <>
            <VideoTrack
              trackRef={avatarTrack}
              className="w-full h-full object-cover"
            />
            {avatarAudioTrack && <AudioTrack trackRef={avatarAudioTrack} />}
          </>
        ) : (
          /* Premium loading state while avatar connects */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-sage-50 to-white">
            {/* Animated orb */}
            <div className="relative mb-8">
              {/* Outer pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-sage-300"
                style={{ width: 120, height: 120, margin: "-8px" }}
              />
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute inset-0 rounded-full bg-sage-400"
                style={{ width: 112, height: 112, margin: "-4px" }}
              />
              {/* Core orb */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-sage-300 via-sage-400 to-sage-600 flex items-center justify-center shadow-glow"
              >
                {/* Stethoscope / heartbeat icon */}
                <svg className="w-14 h-14 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Name */}
            <h3 className="font-display text-2xl font-bold text-sage-800 mb-2">
              Dr. Liv
            </h3>

            {/* Animated wave bars — speaking/loading indicator */}
            <div className="flex items-end gap-1 mb-4 h-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 rounded-full bg-sage-400"
                  style={{ height: "100%", originY: 1 }}
                />
              ))}
            </div>

            {/* Status text */}
            <p className="text-sage-500 text-sm font-medium tracking-wide">
              {isConnected ? "Preparing your consultation…" : "AI Health Assistant"}
            </p>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-soft"
          >
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-1 h-3 bg-sage-500 rounded-full"
                />
              ))}
            </div>
            <span className="text-sm text-sage-600 font-medium">Speaking</span>
          </motion.div>
        )}
      </motion.div>

      {/* Name Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
          />
          <span className="font-display font-semibold text-sage-700">
            Dr. Liv
          </span>
          <span className="text-sage-500 text-sm">AI Health Assistant</span>
        </div>
      </motion.div>
    </div>
  );
}
