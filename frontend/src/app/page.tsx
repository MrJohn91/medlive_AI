"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultationRoom } from "@/components/ConsultationRoom";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { getConnectionToken, getGoogleWebRTCUrl } from "@/lib/google_webrtc";

type AppState = "landing" | "connecting" | "consultation" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [token, setToken] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleConnect = useCallback(async () => {
    setAppState("connecting");
    setError("");

    try {
      const { token, roomName } = await getConnectionToken();
      setToken(token);
      setRoomName(roomName);
      setAppState("consultation");
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect. Please try again.");
      setAppState("error");
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setToken("");
    setRoomName("");
    setAppState("landing");
  }, []);

  return (
    <div className="min-h-screen bg-clinical-bg">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="organic-blob w-[600px] h-[600px] bg-sage-200 -top-48 -right-48" />
        <div className="organic-blob w-[400px] h-[400px] bg-cream-200 bottom-0 -left-24" />
      </div>

      <AnimatePresence mode="wait">
        {appState === "consultation" && token ? (
          <ConsultationRoom
            key="consultation"
            token={token}
            serverUrl={getGoogleWebRTCUrl()}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-clinical-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-glow"
                    >
                      <svg
                        className="w-7 h-7 text-white"
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
                    </motion.div>
                    <div>
                      <h1 className="font-display text-2xl font-bold text-sage-800">
                        MedLive AI
                      </h1>
                      <p className="text-sm text-sage-500">
                        Your AI Health Assistant
                      </p>
                    </div>
                  </div>

                  <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <a
                      href="#privacy"
                      className="text-sage-600 hover:text-sage-800 transition-colors"
                    >
                      Privacy
                    </a>
                  </nav>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex items-center justify-center px-4 py-16">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm font-medium mb-8">
                    <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                    AI-Powered Health Guidance
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-5xl md:text-6xl font-bold text-sage-900 mb-6 leading-tight"
                >
                  Meet Dr. Liv,
                  <br />
                  <span className="text-sage-600">Your AI Health Assistant</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-sage-600 mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                  Tell us what's bothering you. Dr. Liv will listen to your symptoms, assess your urgency, and instantly book an appointment with a human doctor to get you the right care.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-md mx-auto"
                >
                  <ConnectionStatus
                    state={
                      appState === "connecting"
                        ? "connecting"
                        : appState === "error"
                          ? "error"
                          : "disconnected"
                    }
                    onConnect={handleConnect}
                    errorMessage={error}
                  />
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {[
                    {
                      icon: (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                      ),
                      title: "Voice-Powered",
                      description:
                        "Just talk naturally. Dr. Liv understands your symptoms through conversation.",
                    },
                    {
                      icon: (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ),
                      title: "Visual Analysis",
                      description:
                        "Show visible symptoms via camera. Dr. Liv can see rashes, swelling, and more.",
                    },
                    {
                      icon: (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      ),
                      title: "Smart Triage",
                      description:
                        "Get guidance on urgency level and next steps, from self-care to emergency.",
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
                    >
                      <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600 mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-sage-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sage-500">{feature.description}</p>
                    </div>
                  ))}
                </motion.div>

                {/* How It Works Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-32 mb-12"
                  id="how-it-works"
                >
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-sage-900 mb-4 text-center">How It Works</h2>
                  <p className="text-lg text-sage-600 mb-16 max-w-2xl mx-auto text-center">
                    A simple, seamless experience designed to get you the care you need.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      {
                        step: "1",
                        title: "Connect",
                        desc: "Start a secure voice consultation with Dr. Liv instantly."
                      },
                      {
                        step: "2",
                        title: "Share Symptoms",
                        desc: "Speak naturally about your symptoms. Dr. Liv listens and automatically fills your intake form."
                      },
                      {
                        step: "3",
                        title: "Get Triaged",
                        desc: "Receive an immediate assessment of urgency and recommended next steps."
                      },
                      {
                        step: "4",
                        title: "Book & Follow Up",
                        desc: "The agent instantly books an appointment with a human doctor or drops a callback request."
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sage-100 rounded-bl-full -z-10 opacity-50" />
                        <div className="w-14 h-14 rounded-full bg-sage-600 text-white font-display text-xl font-bold flex items-center justify-center mb-6 shadow-glow relative z-10">
                          {item.step}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-sage-800 mb-3">{item.title}</h3>
                        <p className="text-sage-500 leading-relaxed text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-clinical-border bg-white/60 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-sage-500">
                    MedLive AI is not a substitute for professional medical
                    advice. In an emergency, call 911.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-sage-400">
                    <a href="#" className="hover:text-sage-600">
                      Privacy Policy
                    </a>
                    <a href="#" className="hover:text-sage-600">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
