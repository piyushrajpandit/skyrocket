"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";

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
}

const PROVIDERS: {
  id: Provider;
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}[] = [
  {
    id: "claude",
    name: "Claude",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: "🟠",
  },
  {
    id: "openai",
    name: "GPT-4o",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: "🟢",
  },
  {
    id: "gemini",
    name: "Gemini",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "🔵",
  },
];

export default function AgentPage() {
  const [provider, setProvider] = useState<Provider>("claude");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [raceMode, setRaceMode] = useState(false);
  const [raceResults, setRaceResults] = useState<RaceResult[] | null>(null);
  const [raceLoading, setRaceLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, raceResults]);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading || raceLoading) return;
    setInput("");

    if (raceMode) {
      await handleRace(msg);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, provider }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            provider,
            logs: data.logs,
            duration: data.duration,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error}`,
            provider,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again.", provider },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRace = async (msg: string) => {
    setRaceResults(null);
    setRaceLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: `🏁 Race: ${msg}` }]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, race: true }),
      });
      const data = await res.json();

      if (data.success && data.results) {
        setRaceResults(data.results);
      }
    } catch {
      setRaceResults([]);
    } finally {
      setRaceLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const winner = raceResults?.length
    ? raceResults.reduce((a, b) =>
        a.duration > 0 && (b.duration === 0 || a.duration < b.duration) ? a : b
      )
    : null;

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                AI Travel Agent
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Chat with AI to search, book, cancel & modify flights
              </p>
            </div>

            {/* Race Mode Toggle */}
            <button
              onClick={() => {
                setRaceMode(!raceMode);
                setRaceResults(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                raceMode
                  ? "bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 text-white shadow-lg"
                  : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--muted)]"
              }`}
              aria-label="Toggle race mode"
            >
              {raceMode ? "🏁 Race Mode ON" : "🏁 Race Mode"}
            </button>
          </div>

          {/* Agent Selector */}
          {!raceMode && (
            <div className="flex gap-3 mb-6">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    provider === p.id
                      ? `${p.bg} ${p.border} border-2 ${p.color} shadow-sm`
                      : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                  aria-label={`Select ${p.name} agent`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {raceMode && (
            <div className="flex gap-2 mb-6">
              {PROVIDERS.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 rounded-xl ${p.bg} ${p.border} border px-3 py-2 text-xs font-medium ${p.color}`}
                >
                  <span>{p.icon}</span> {p.name}
                </div>
              ))}
              <span className="self-center text-xs text-[var(--muted)] ml-1">
                All 3 agents will race!
              </span>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col min-h-[400px] max-h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !raceResults && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-5xl mb-4">🤖</div>
                  <p className="text-lg font-semibold text-[var(--foreground)] mb-1">
                    {raceMode
                      ? "Race 3 AI agents against each other!"
                      : `Chat with ${currentProvider.name}`}
                  </p>
                  <p className="text-sm text-[var(--muted)] max-w-md">
                    Try: &quot;Search flights from Bangalore to Patna&quot; or
                    &quot;Book a flight for Piyush with coupon HACKATHON2026&quot;
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}>
                  {/* Message bubble */}
                  <div
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-green-500/20 border border-green-500/30 text-[var(--foreground)]"
                          : "bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)]"
                      }`}
                    >
                      {msg.role === "assistant" && msg.provider && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs">
                            {PROVIDERS.find((p) => p.id === msg.provider)?.icon}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              PROVIDERS.find((p) => p.id === msg.provider)
                                ?.color
                            }`}
                          >
                            {PROVIDERS.find((p) => p.id === msg.provider)?.name}
                          </span>
                          {msg.duration && (
                            <span className="text-[10px] text-[var(--muted)]">
                              {(msg.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>

                  {/* Activity log */}
                  {msg.logs && msg.logs.length > 0 && (
                    <div className="mt-2 ml-2 space-y-0.5">
                      {msg.logs.map((log, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]"
                        >
                          <span>{log.emoji}</span>
                          <span>{log.text}</span>
                          <span className="text-[var(--muted)]/50 ml-auto">
                            {(log.timestamp / 1000).toFixed(1)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Race results */}
              {raceResults && raceResults.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-3">
                  {raceResults.map((r) => {
                    const prov = PROVIDERS.find((p) => p.id === r.provider);
                    const isWinner = winner && r.provider === winner.provider && r.duration > 0;

                    return (
                      <div
                        key={r.provider}
                        className={`rounded-xl border p-4 ${
                          isWinner
                            ? `${prov?.border || ""} ${prov?.bg || ""} ring-2 ring-offset-2 ring-offset-[var(--background)]`
                            : "border-[var(--card-border)] bg-[var(--input-bg)]"
                        }`}
                        style={
                          isWinner
                            ? {
                                ringColor:
                                  prov?.color.replace("text-", "") || undefined,
                              }
                            : undefined
                        }
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
                            <span className="text-[11px] text-[var(--muted)]">
                              {r.duration > 0
                                ? `${(r.duration / 1000).toFixed(1)}s`
                                : "—"}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap mb-3">
                          {r.reply}
                        </p>
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
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading */}
              {(loading || raceLoading) && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {raceLoading
                        ? "Racing all 3 agents..."
                        : `${currentProvider.name} is thinking...`}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--card-border)] p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    raceMode
                      ? "Type a task for all 3 agents to race on..."
                      : `Ask ${currentProvider.name} anything about flights...`
                  }
                  disabled={loading || raceLoading}
                  className="flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors disabled:opacity-50"
                  aria-label="Message input"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || raceLoading || !input.trim()}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    raceMode
                      ? "bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 hover:brightness-110"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110"
                  }`}
                  aria-label="Send message"
                >
                  {raceMode ? "🏁 Race" : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Search flights from Bangalore to Patna",
              "Book a flight for Piyush, email piyush@test.com, phone 9876543210, coupon HACKATHON2026",
              "Check booking status",
              "Cancel my booking",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:border-green-400/30 transition-colors"
              >
                {q.length > 40 ? q.slice(0, 40) + "..." : q}
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
