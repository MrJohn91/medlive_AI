"use client";

import { motion, AnimatePresence } from "framer-motion";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface ConnectionStatusProps {
  state: ConnectionState;
  onConnect?: () => void;
  onDisconnect?: () => void;
  errorMessage?: string;
}

export function ConnectionStatus({
  state,
  onConnect,
  onDisconnect,
  errorMessage,
}: ConnectionStatusProps) {
  return (
    <AnimatePresence mode="wait">
      {state === "disconnected" && (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center"
        >
          <div className="mb-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center mb-4"
            >
              <svg
                className="w-10 h-10 text-sage-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </motion.div>
            <h2 className="font-display text-2xl font-semibold text-sage-800 mb-2">
              Ready to talk with Dr. Liv?
            </h2>
            <p className="text-sage-500 max-w-md mx-auto leading-relaxed">
              Our AI health assistant will listen to your symptoms, triage your condition, and guide you to the right care, including booking an appointment with a doctor for you right away if needed.
            </p>
          </div>

          <button
            onClick={onConnect}
            className="inline-flex items-center gap-2 px-8 py-4 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-glow hover:shadow-lg"
          >
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
            Start Consultation
          </button>

          <p className="mt-4 text-xs text-sage-400">
            You'll need to allow microphone and camera access
          </p>
        </motion.div>
      )}

      {state === "connecting" && (
        <motion.div
          key="connecting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-12"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-sage-200 border-t-sage-500"
            />
            {/* Inner dot */}
            <div className="absolute inset-4 rounded-full bg-sage-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-sage-500 animate-pulse" />
            </div>
          </div>
          <p className="font-display text-lg text-sage-600">
            Connecting to Dr. Liv...
          </p>
          <p className="text-sm text-sage-400 mt-2">
            Setting up your secure consultation
          </p>
        </motion.div>
      )}

      {state === "connected" && (
        <motion.div
          key="connected"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-soft"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="font-medium text-sage-700">Session Active</p>
              <p className="text-sm text-sage-400">
                Connected securely with Dr. Liv
              </p>
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            End Session
          </button>
        </motion.div>
      )}

      {state === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center bg-red-50 rounded-2xl p-6"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-red-700 mb-2">
            Connection Error
          </h3>
          <p className="text-red-600 mb-4">
            {errorMessage || "Unable to connect. Please try again."}
          </p>
          <button
            onClick={onConnect}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
