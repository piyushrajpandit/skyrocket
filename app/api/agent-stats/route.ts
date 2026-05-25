import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { connectDB } from "@/lib/mongodb";
import AgentStat from "@/lib/models/AgentStat";
import { logger } from "@/lib/logger";

export const GET = apiHandler(async () => {
  await connectDB();

  const aggregation = await AgentStat.aggregate([
    {
      $group: {
        _id: "$provider",
        totalAttempts: { $sum: 1 },
        completedTasks: { $sum: { $cond: ["$success", 1, 0] } },
        totalDuration: { $sum: { $cond: ["$success", "$duration", 0] } },
      },
    },
  ]);

  const statsMap: Record<
    string,
    { totalAttempts: number; completedTasks: number; totalDuration: number }
  > = {};

  for (const record of aggregation) {
    if (record._id) {
      statsMap[record._id.toLowerCase()] = {
        totalAttempts: record.totalAttempts,
        completedTasks: record.completedTasks,
        totalDuration: record.totalDuration,
      };
    }
  }

  const providers = ["claude", "openai", "gemini"];
  const results = providers.map((p) => {
    const stats = statsMap[p] || {
      totalAttempts: 0,
      completedTasks: 0,
      totalDuration: 0,
    };
    const completedTasks = stats.completedTasks;
    const avgDurationMs =
      completedTasks > 0 ? stats.totalDuration / completedTasks : 0;
    const successRate =
      stats.totalAttempts > 0
        ? (completedTasks / stats.totalAttempts) * 100
        : 0;

    return {
      provider: p,
      completedTasks,
      averageDuration: avgDurationMs / 1000,
      successRate,
    };
  });

  logger.info("Agent stats fetched", { providers: results.length });

  return NextResponse.json({
    success: true,
    data: results,
    // Keep backward compat for demo page which reads `stats`
    stats: results,
  });
});
