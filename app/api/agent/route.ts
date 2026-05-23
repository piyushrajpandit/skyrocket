import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SYSTEM_PROMPT,
  toClaudeTools,
  toOpenAITools,
  toGeminiTools,
} from "@/lib/agent-tools";
import { executeTool } from "@/lib/tool-executor";

export const maxDuration = 60;

interface LogEntry {
  emoji: string;
  text: string;
  timestamp: number;
}

// ════════════════════════════════════════
// Claude (Anthropic)
// ════════════════════════════════════════
async function handleClaude(userMessage: string) {
  const logs: LogEntry[] = [];
  const start = Date.now();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  logs.push({ emoji: "🟠", text: "Claude thinking...", timestamp: Date.now() - start });

  type ClaudeMessage = Anthropic.Messages.Message;
  type ClaudeContentBlock = Anthropic.Messages.ContentBlock;
  type ClaudeToolUseBlock = Anthropic.Messages.ToolUseBlock;
  type ClaudeToolResultBlockParam = Anthropic.Messages.ToolResultBlockParam;
  type ClaudeMessageParam = Anthropic.Messages.MessageParam;

  let messages: ClaudeMessageParam[] = [
    { role: "user", content: userMessage },
  ];

  let response: ClaudeMessage = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: toClaudeTools() as Anthropic.Messages.Tool[],
    messages,
  });

  // Tool use loop
  while (response.stop_reason === "tool_use") {
    const toolBlocks = response.content.filter(
      (b: ClaudeContentBlock): b is ClaudeToolUseBlock => b.type === "tool_use"
    );

    const toolResults: ClaudeToolResultBlockParam[] = [];

    for (const tb of toolBlocks) {
      logs.push({
        emoji: "🔧",
        text: `Tool: ${tb.name}`,
        timestamp: Date.now() - start,
      });

      const result = await executeTool(
        tb.name,
        tb.input as Record<string, unknown>
      );

      logs.push({
        emoji: result.success ? "✅" : "❌",
        text: result.success
          ? `${tb.name} succeeded`
          : `${tb.name} failed: ${result.error}`,
        timestamp: Date.now() - start,
      });

      toolResults.push({
        type: "tool_result",
        tool_use_id: tb.id,
        content: JSON.stringify(result),
      });
    }

    messages = [
      ...messages,
      { role: "assistant", content: response.content },
      { role: "user", content: toolResults },
    ];

    response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: toClaudeTools() as Anthropic.Messages.Tool[],
      messages,
    });
  }

  const textBlock = response.content.find(
    (b: ClaudeContentBlock) => b.type === "text"
  );
  const reply =
    textBlock && "text" in textBlock ? textBlock.text : "No response from Claude.";

  logs.push({
    emoji: "⏱️",
    text: `Total: ${((Date.now() - start) / 1000).toFixed(1)}s`,
    timestamp: Date.now() - start,
  });

  return { reply, logs, duration: Date.now() - start };
}

// ════════════════════════════════════════
// GPT-4o (OpenAI)
// ════════════════════════════════════════
async function handleOpenAI(userMessage: string) {
  const logs: LogEntry[] = [];
  const start = Date.now();

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  logs.push({ emoji: "🟢", text: "GPT-4o thinking...", timestamp: Date.now() - start });

  type OAIMessage = OpenAI.Chat.ChatCompletionMessageParam;

  const messages: OAIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  let response = await client.chat.completions.create({
    model: "gpt-4o",
    tools: toOpenAITools(),
    messages,
  });

  // Tool call loop
  while (response.choices[0]?.finish_reason === "tool_calls") {
    const toolCalls = response.choices[0].message.tool_calls || [];

    messages.push(response.choices[0].message as OAIMessage);

    for (const tc of toolCalls) {
      const args = JSON.parse(tc.function.arguments);

      logs.push({
        emoji: "🔧",
        text: `Tool: ${tc.function.name}`,
        timestamp: Date.now() - start,
      });

      const result = await executeTool(tc.function.name, args);

      logs.push({
        emoji: result.success ? "✅" : "❌",
        text: result.success
          ? `${tc.function.name} succeeded`
          : `${tc.function.name} failed: ${result.error}`,
        timestamp: Date.now() - start,
      });

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    response = await client.chat.completions.create({
      model: "gpt-4o",
      tools: toOpenAITools(),
      messages,
    });
  }

  const reply =
    response.choices[0]?.message?.content || "No response from GPT-4o.";

  logs.push({
    emoji: "⏱️",
    text: `Total: ${((Date.now() - start) / 1000).toFixed(1)}s`,
    timestamp: Date.now() - start,
  });

  return { reply, logs, duration: Date.now() - start };
}

// ════════════════════════════════════════
// Gemini (Google)
// ════════════════════════════════════════
async function handleGemini(userMessage: string) {
  const logs: LogEntry[] = [];
  const start = Date.now();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  logs.push({ emoji: "🔵", text: "Gemini thinking...", timestamp: Date.now() - start });

  const chat = model.startChat({
    tools: toGeminiTools(),
  });

  let result = await chat.sendMessage(userMessage);
  let response = result.response;

  // Tool call loop
  let maxIterations = 5;
  while (maxIterations > 0) {
    const fnCalls = response.functionCalls();
    if (!fnCalls || fnCalls.length === 0) break;

    const fnResponses = [];

    for (const fc of fnCalls) {
      logs.push({
        emoji: "🔧",
        text: `Tool: ${fc.name}`,
        timestamp: Date.now() - start,
      });

      const toolResult = await executeTool(
        fc.name,
        (fc.args as Record<string, unknown>) || {}
      );

      logs.push({
        emoji: toolResult.success ? "✅" : "❌",
        text: toolResult.success
          ? `${fc.name} succeeded`
          : `${fc.name} failed: ${toolResult.error}`,
        timestamp: Date.now() - start,
      });

      fnResponses.push({
        functionResponse: {
          name: fc.name,
          response: toolResult,
        },
      });
    }

    result = await chat.sendMessage(fnResponses);
    response = result.response;
    maxIterations--;
  }

  const reply = response.text() || "No response from Gemini.";

  logs.push({
    emoji: "⏱️",
    text: `Total: ${((Date.now() - start) / 1000).toFixed(1)}s`,
    timestamp: Date.now() - start,
  });

  return { reply, logs, duration: Date.now() - start };
}

// ════════════════════════════════════════
// Unified POST handler
// ════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const { message, provider, race } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Race mode — run all 3 simultaneously
    if (race) {
      const providers = ["claude", "openai", "gemini"];
      const results = await Promise.allSettled(
        providers.map(async (p) => {
          try {
            switch (p) {
              case "claude":
                return { provider: p, ...(await handleClaude(message)) };
              case "openai":
                return { provider: p, ...(await handleOpenAI(message)) };
              case "gemini":
                return { provider: p, ...(await handleGemini(message)) };
              default:
                throw new Error("Unknown provider");
            }
          } catch (err) {
            return {
              provider: p,
              reply: `Error: ${err instanceof Error ? err.message : "Failed"}`,
              logs: [
                {
                  emoji: "❌",
                  text: `${p} failed: ${err instanceof Error ? err.message : "Unknown"}`,
                  timestamp: 0,
                },
              ],
              duration: 0,
            };
          }
        })
      );

      const raceResults = results.map((r) =>
        r.status === "fulfilled"
          ? r.value
          : {
              provider: "unknown",
              reply: "Provider failed",
              logs: [],
              duration: 0,
            }
      );

      return NextResponse.json({ success: true, race: true, results: raceResults });
    }

    // Single provider mode
    const p = (provider || "claude").toLowerCase();
    let result;

    switch (p) {
      case "claude":
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json(
            { success: false, error: "ANTHROPIC_API_KEY not configured" },
            { status: 500 }
          );
        }
        result = await handleClaude(message);
        break;
      case "openai":
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json(
            { success: false, error: "OPENAI_API_KEY not configured" },
            { status: 500 }
          );
        }
        result = await handleOpenAI(message);
        break;
      case "gemini":
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json(
            { success: false, error: "GEMINI_API_KEY not configured" },
            { status: 500 }
          );
        }
        result = await handleGemini(message);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown provider: ${p}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      provider: p,
      reply: result.reply,
      logs: result.logs,
      duration: result.duration,
    });
  } catch (error) {
    console.error("[Agent API] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
