"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { logger } from "@/lib/logger";

type Provider = "claude" | "openai" | "gemini";

interface LogEntry {
  emoji: string;
  text: string;
  timestamp: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  provider?: Provider;
  logs?: LogEntry[];
  duration?: number;
}

interface RaceResult {
  provider: string;
  reply: string;
  logs: LogEntry[];
  duration: number;
  status?: "running" | "completed" | "failed";
}

const PROVIDERS: {
  id: Provider;
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  glow: string;
}[] = [
  {
    id: "claude",
    name: "Claude",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: "🟠",
    glow: "shadow-orange-500/10 hover:shadow-orange-500/20 hover:border-orange-500/50",
  },
  {
    id: "openai",
    name: "GPT-4o",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: "🟢",
    glow: "shadow-green-500/10 hover:shadow-green-500/20 hover:border-green-500/50",
  },
  {
    id: "gemini",
    name: "Gemini",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "🔵",
    glow: "shadow-blue-500/10 hover:shadow-blue-500/20 hover:border-blue-500/50",
  },
];

// Animated Counter Component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();
    const duration = 1000; // ms

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      const current = start + (end - start) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return (
    <span className="font-mono font-bold tracking-tight">
      {displayValue.toFixed(suffix === "%" || value % 1 !== 0 ? 1 : 0)}
      {suffix}
    </span>
  );
}

export default function DemoPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [raceResults, setRaceResults] = useState<RaceResult[] | null>(null);
  const [raceLoading, setRaceLoading] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Leaderboard statistics from backend
  const [leaderboardStats, setLeaderboardStats] = useState<any[]>([]);

  // Shareable card states
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  const [bookingProvider, setBookingProvider] = useState<string | null>(null);
  const [bookingDuration, setBookingDuration] = useState<number | null>(null);

  // Live ticking timers
  const [tickingDurations, setTickingDurations] = useState<Record<string, number>>({
    claude: 0,
    openai: 0,
    gemini: 0,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  // Sync Voice Setting
  useEffect(() => {
    if (typeof window !== "undefined") {
      setVoiceEnabled(localStorage.getItem("skymock-voice-enabled") === "true");
    }

    const handleSync = () => {
      setVoiceEnabled(localStorage.getItem("skymock-voice-enabled") === "true");
    };

    window.addEventListener("skymock-voice-toggle", handleSync);
    return () => window.removeEventListener("skymock-voice-toggle", handleSync);
  }, []);

  // Poll leaderboard stats every 3 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/agent-stats");
        const data = await res.json();
        if (data.success) {
          setLeaderboardStats(data.stats);
        }
      } catch (err) {
        logger.error("Failed to fetch leaderboard stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Ticking durations for race progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (raceLoading) {
      const start = Date.now();
      timer = setInterval(() => {
        const elapsed = Date.now() - start;
        setTickingDurations((prev) => {
          const next = { ...prev };
          raceResults?.forEach((r) => {
            if (r.status === "running") {
              next[r.provider] = elapsed;
            }
          });
          return next;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [raceLoading, raceResults]);

  // Fetch booking details for card export
  useEffect(() => {
    if (!confirmedBookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${confirmedBookingId}`);
        const data = await res.json();
        if (data.success) {
          setBookingDetails(data.data);
        }
      } catch (err) {
        logger.error("Error fetching booking details", err);
      }
    };

    fetchBooking();
  }, [confirmedBookingId]);

  // Scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, raceResults]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (e: any) => {
        logger.error("Speech recognition error", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        
        // Scroll to chat and send
        chatSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          handleRace(transcript);
        }, 800);
      };

      recognition.start();
    } catch (err) {
      logger.error("Failed to start speech recognition", err);
      setIsListening(false);
    }
  };

  const handleRace = async (msg: string) => {
    setRaceResults(null);
    setRaceLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: `🏁 Race: ${msg}` }]);

    const providers: Provider[] = ["claude", "openai", "gemini"];
    const initialResults: RaceResult[] = providers.map((p) => ({
      provider: p,
      reply: "",
      logs: [{ emoji: "⏳", text: "Waiting to start...", timestamp: 0 }],
      duration: 0,
      status: "running",
    }));

    setRaceResults(initialResults);
    let winnerDeclared = false;

    const promises = providers.map(async (p) => {
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, provider: p }),
        });
        const data = await res.json();

        if (data.success) {
          setRaceResults((prev) => {
            if (!prev) return null;
            return prev.map((r) =>
              r.provider === p
                ? {
                    provider: p,
                    reply: data.reply,
                    logs: data.logs,
                    duration: data.duration,
                    status: "completed",
                  }
                : r
            );
          });

          if (!winnerDeclared) {
            winnerDeclared = true;
            const provName = p === "claude" ? "Claude" : p === "openai" ? "GPT-4o" : "Gemini";
            const textToSpeak = `${provName} completed the booking first in ${((data.duration) / 1000).toFixed(1)} seconds!`;
            if (voiceEnabled) {
              speak(textToSpeak);
            }
            import("canvas-confetti").then((module) => {
              const confetti = module.default;
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            });
          }

          if (data.bookingId) {
            setConfirmedBookingId(data.bookingId);
            setBookingProvider(p);
            setBookingDuration(data.duration);
          }
        } else {
          throw new Error(data.error || "Failed");
        }
      } catch (err: any) {
        setRaceResults((prev) => {
          if (!prev) return null;
          return prev.map((r) =>
            r.provider === p
              ? {
                  provider: p,
                  reply: `Error: ${err.message || "Failed"}`,
                  logs: [{ emoji: "❌", text: "Execution failed", timestamp: 0 }],
                  duration: 0,
                  status: "failed",
                }
              : r
          );
        });
      }
    });

    await Promise.allSettled(promises);
    setRaceLoading(false);
  };

  // One-click Auto Demo script
  const startAutoDemo = async () => {
    if (demoRunning || raceLoading) return;
    setDemoRunning(true);
    setRaceResults(null);
    setInput("");

    // Scroll to chat window first
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const command =
      "Book a flight from Bangalore to Patna for Judge Demo, phone 9876543210, use free coupon";
    
    // Typewriter effect
    let currentText = "";
    for (let i = 0; i < command.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      currentText += command[i];
      setInput(currentText);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setInput("");
    await handleRace(command);
    setDemoRunning(false);
  };

  const getProviderStat = (prov: string, key: "completedTasks" | "averageDuration" | "successRate") => {
    const statObj = leaderboardStats.find((s) => s.provider === prov);
    if (!statObj) return 0;
    return statObj[key];
  };

  const winner = raceResults?.length
    ? raceResults.reduce((a, b) =>
        a.duration > 0 && (b.duration === 0 || a.duration < b.duration) ? a : b
      )
    : null;

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col bg-[#0a0a0f] text-white">
        
        {/* Full-screen Hero Landing */}
        <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center py-12 px-4 overflow-hidden">
          
          {/* Background Radial Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />

          {/* Top Title Section */}
          <div className="text-center z-10 max-w-3xl mt-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3.5 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                Hackathon Live Demo
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Watch AI Agents <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Book Your Flight
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[var(--muted)] mt-4 max-w-xl mx-auto">
              Speak a command. Three AI agents compete to complete it.
            </p>
          </div>

          {/* Middle Microphone & Agent Cards */}
          <div className="relative z-10 flex flex-col items-center justify-center my-6 max-w-5xl w-full">
            
            {/* Horizontal Agent Cards Layout */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-3xl mb-12">
              {PROVIDERS.map((prov) => (
                <div
                  key={prov.id}
                  className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 text-center flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${prov.glow}`}
                >
                  <span className="text-3xl sm:text-4xl mb-2.5 block">{prov.icon}</span>
                  <h3 className="text-sm sm:text-lg font-bold text-white mb-1">
                    {prov.name}
                  </h3>
                  <span className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-widest">
                    Active Agent
                  </span>
                </div>
              ))}
            </div>

            {/* Giant Central Microphone */}
            <div className="relative flex flex-col items-center">
              <button
                onClick={handleMicClick}
                className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-2xl cursor-pointer ${
                  isListening
                    ? "bg-red-500 border-red-400 text-white scale-110 shadow-red-500/30"
                    : "bg-gradient-to-br from-green-400 to-emerald-600 border-green-300 text-white hover:scale-105 shadow-green-500/20 hover:shadow-green-500/40"
                }`}
                title="Tap to speak command"
              >
                <span className="text-4xl">🎤</span>
                {isListening && (
                  <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75" />
                )}
              </button>
              
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mt-4 animate-pulse">
                {isListening ? "Listening... Speak now" : "Tap center mic to speak"}
              </span>
            </div>
          </div>

          {/* Bottom Actions & Steps */}
          <div className="relative z-10 flex flex-col items-center w-full">
            
            {/* Steps representation */}
            <div className="grid grid-cols-3 gap-4 max-w-xl w-full text-center text-xs sm:text-sm text-[var(--muted)] border-t border-[var(--card-border)] pt-8 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">🎤</span>
                <span className="font-semibold text-white block">1. Speak Command</span>
                <span className="text-[10px] opacity-75">Tell AI where to go</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">🤖</span>
                <span className="font-semibold text-white block">2. 3 Agents Race</span>
                <span className="text-[10px] opacity-75">Simultaneous parallel execution</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">✅</span>
                <span className="font-semibold text-white block">3. Booking Done</span>
                <span className="text-[10px] opacity-75">Completed in seconds</span>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex gap-4">
              <button
                onClick={startAutoDemo}
                disabled={demoRunning || raceLoading}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 px-8 py-3.5 text-sm font-extrabold text-white transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                ⚡ Auto Demo
              </button>
              
              <button
                onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-green-400/30 px-8 py-3.5 text-sm font-semibold text-white transition-all cursor-pointer"
              >
                Try it now ↓
              </button>
            </div>
          </div>
        </section>

        {/* Live Leaderboard Section */}
        <section className="border-t border-b border-[var(--card-border)] bg-[var(--card-bg)] py-12 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Live Leaderboard
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Real-time aggregated engine speeds and success rates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROVIDERS.map((prov) => {
                const compTasks = getProviderStat(prov.id, "completedTasks");
                const avgSpeed = getProviderStat(prov.id, "averageDuration");
                const succRate = getProviderStat(prov.id, "successRate");

                return (
                  <div
                    key={prov.id}
                    className="border border-[var(--card-border)] bg-[var(--input-bg)] rounded-2xl p-6 relative overflow-hidden"
                  >
                    {/* Corner accent icon */}
                    <span className="absolute top-4 right-4 text-2xl opacity-10">
                      {prov.icon}
                    </span>

                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xl">{prov.icon}</span>
                      <h3 className={`text-base font-extrabold ${prov.color}`}>
                        {prov.name} Agent
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Metric 1 */}
                      <div className="flex justify-between items-end border-b border-[var(--card-border)] pb-2">
                        <span className="text-xs text-[var(--muted)]">Average Speed</span>
                        <div className="text-right">
                          <AnimatedCounter value={avgSpeed} suffix="s" />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="flex justify-between items-end border-b border-[var(--card-border)] pb-2">
                        <span className="text-xs text-[var(--muted)]">Tasks Completed</span>
                        <div className="text-right">
                          <AnimatedCounter value={compTasks} />
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="flex justify-between items-end pb-2">
                        <span className="text-xs text-[var(--muted)]">Success Rate</span>
                        <div className="text-right">
                          <AnimatedCounter value={succRate} suffix="%" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Embedded Race Chat Area */}
        <section ref={chatSectionRef} id="chat-section" className="py-12 px-4 max-w-6xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Agent Battleground
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Test your booking queries live and view real-time racing
            </p>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col min-h-[450px] max-h-[600px] shadow-2xl">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !raceResults && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-5xl mb-4">🏁</div>
                  <p className="text-base font-bold text-white mb-1">
                    Multi-Agent Race Environment
                  </p>
                  <p className="text-xs text-[var(--muted)] max-w-md">
                    Enter a command below or tap the microphone to command all three engines simultaneously.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}>
                  <div
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-green-500/20 border border-green-500/30 text-white"
                          : "bg-[var(--input-bg)] border border-[var(--card-border)] text-white"
                      }`}
                    >
                      {msg.role === "assistant" && msg.provider && (
                        <div className="flex items-center justify-between mb-1.5 gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">
                              {PROVIDERS.find((p) => p.id === msg.provider)?.icon}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                PROVIDERS.find((p) => p.id === msg.provider)?.color
                              }`}
                            >
                              {PROVIDERS.find((p) => p.id === msg.provider)?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => speak(msg.content)}
                            className="text-xs text-[var(--muted)] hover:text-green-400 p-0.5"
                          >
                            🔊
                          </button>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>

                  {msg.logs && msg.logs.length > 0 && (
                    <div className="mt-2 ml-2 space-y-0.5">
                      {msg.logs.map((log, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]"
                        >
                          <span>{log.emoji}</span>
                          <span>{log.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Race results columns */}
              {raceResults && raceResults.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-3">
                  {raceResults.map((r) => {
                    const prov = PROVIDERS.find((p) => p.id === r.provider);
                    const isWinner = winner && r.provider === winner.provider && r.status === "completed";
                    const isRunning = r.status === "running";

                    return (
                      <div
                        key={r.provider}
                        className={`rounded-xl border p-4 transition-all duration-300 ${
                          isWinner
                            ? `${prov?.border || ""} ${prov?.bg || ""} ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10`
                            : isRunning
                            ? "border-[var(--card-border)] bg-[var(--input-bg)] animate-pulse"
                            : "border-[var(--card-border)] bg-[var(--input-bg)] opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{prov?.icon}</span>
                            <span
                              className={`text-sm font-bold ${prov?.color}`}
                            >
                              {prov?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isWinner && (
                              <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">
                                🏆 FASTEST
                              </span>
                            )}
                            <span className="text-[11px] text-[var(--muted)] font-mono">
                              {isRunning
                                ? `${(tickingDurations[r.provider] / 1000).toFixed(1)}s`
                                : r.duration > 0
                                ? `${(r.duration / 1000).toFixed(1)}s`
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {isRunning ? (
                          <div className="space-y-2 py-4">
                            <div className="h-4 bg-[var(--card-border)] rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-[var(--card-border)] rounded w-5/6 animate-pulse" />
                            <div className="h-3 bg-[var(--card-border)] rounded w-1/2 animate-pulse mt-4" />
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              <p className="text-sm text-white whitespace-pre-wrap mb-3 pr-6">
                                {r.reply}
                              </p>
                              {r.reply && (
                                <button
                                  onClick={() => speak(r.reply)}
                                  className="absolute top-0 right-0 text-xs text-[var(--muted)] hover:text-green-400 p-0.5"
                                >
                                  🔊
                                </button>
                              )}
                            </div>
                            {r.logs.length > 0 && (
                              <div className="border-t border-[var(--card-border)] pt-2 space-y-0.5">
                                {r.logs.map((log, j) => (
                                  <div
                                    key={j}
                                    className="flex items-center gap-1 text-[10px] text-[var(--muted)]"
                                  >
                                    <span>{log.emoji}</span>
                                    <span>{log.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-[var(--card-border)] p-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={isListening ? undefined : handleMicClick}
                  className={`rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-center cursor-pointer border ${
                    isListening
                      ? "bg-red-500 border-red-600 text-white animate-pulse"
                      : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                  title={isListening ? "Listening..." : "Speech Input"}
                  disabled={demoRunning || raceLoading}
                >
                  <span className="text-base">🎤</span>
                  {isListening && (
                    <span className="text-[10px] ml-1.5 font-bold uppercase tracking-wider">
                      Listening...
                    </span>
                  )}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleRace(input);
                      setInput("");
                    }
                  }}
                  placeholder={
                    isListening
                      ? "Listening... Speak now!"
                      : "Type a flight command for Claude, GPT-4o, and Gemini to race..."
                  }
                  disabled={demoRunning || raceLoading || isListening}
                  className="flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors disabled:opacity-50"
                />
                
                <button
                  onClick={() => {
                    handleRace(input);
                    setInput("");
                  }}
                  disabled={demoRunning || raceLoading || !input.trim() || isListening}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  🏁 Race
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Shareable Card Modal */}
      {bookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-w-sm w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl p-6 glow-green flex flex-col text-white">
            
            <button
              onClick={() => {
                setConfirmedBookingId(null);
                setBookingDetails(null);
                setBookingProvider(null);
                setBookingDuration(null);
              }}
              className="absolute top-4 right-4 text-xs text-[var(--muted)] hover:text-white border border-[var(--card-border)] rounded-lg p-1.5 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Target element for screenshot */}
            <div id="share-card-node-demo" className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-5 mb-5 text-center flex flex-col">
              <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] px-2.5 py-1 rounded-full font-bold mb-4 self-center uppercase tracking-wider">
                Booked by {bookingProvider === "claude" ? "Claude" : bookingProvider === "openai" ? "GPT-4o" : "Gemini"} in {bookingDuration ? (bookingDuration / 1000).toFixed(1) : "—"}s ⚡
              </div>

              <div className="flex justify-between items-center border-b border-[#1e1e2a] pb-3 mb-3">
                <div className="text-left">
                  <span className="text-[9px] text-[var(--muted)] font-semibold uppercase tracking-wider block">Airline</span>
                  <span className="text-xs font-bold text-white">{bookingDetails.flightName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-[var(--muted)] font-semibold uppercase tracking-wider block">Flight ID</span>
                  <span className="text-xs font-mono text-green-400 font-bold">{bookingDetails.flightId}</span>
                </div>
              </div>

              <div className="flex justify-between items-center my-4 px-1">
                <div className="text-left">
                  <span className="text-xl font-black text-white">BLR</span>
                  <span className="text-[9px] text-[var(--muted)] block uppercase">Bangalore</span>
                </div>
                <div className="flex-1 flex items-center justify-center px-3">
                  <div className="h-[1px] bg-gradient-to-r from-green-500 to-transparent flex-1" />
                  <span className="text-sm mx-1.5">✈</span>
                  <div className="h-[1px] bg-gradient-to-r from-transparent to-green-500 flex-1" />
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">PAT</span>
                  <span className="text-[9px] text-[var(--muted)] block uppercase">Patna</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left border-t border-[#1e1e2a] pt-3 text-xs">
                <div>
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Passenger</span>
                  <span className="font-semibold text-white truncate block">{bookingDetails.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Seat</span>
                  <span className="font-semibold text-white block">{bookingDetails.seatPreference || "Window"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Price</span>
                  <span className="font-bold text-green-400 block">{bookingDetails.price === 0 ? "FREE" : `₹${bookingDetails.price.toLocaleString("en-IN")}`}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--muted)] block uppercase tracking-wider">Booking ID</span>
                  <span className="font-mono text-white truncate block">{bookingDetails._id}</span>
                </div>
              </div>

              <div className="text-[9px] text-[var(--muted)]/40 pt-2.5 mt-3 border-t border-[#1e1e2a]/50">
                Powered by <span className="font-bold text-green-400/80">SkyMock</span>
              </div>
            </div>

            <button
              onClick={async () => {
                const node = document.getElementById("share-card-node-demo");
                if (!node) return;
                try {
                  const html2canvas = (await import("html2canvas")).default;
                  const canvas = await html2canvas(node, {
                    backgroundColor: "#111118",
                    scale: 2,
                  });
                  const link = document.createElement("a");
                  link.download = `skymock-result-${bookingDetails._id.slice(-8)}.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                } catch (err) {
                  logger.error("Failed to generate image", err);
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-green-500/20 cursor-pointer"
            >
              📥 Download Result Card
            </button>
          </div>
        </div>
      )}
    </>
  );
}
