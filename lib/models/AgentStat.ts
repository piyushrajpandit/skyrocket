import mongoose, { Schema, Document, models } from "mongoose";

export interface IAgentStat extends Document {
  provider: string;
  duration: number;
  success: boolean;
  timestamp: Date;
}

const AgentStatSchema = new Schema<IAgentStat>(
  {
    provider: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "agent_stats",
    timestamps: false,
  }
);

const AgentStat =
  models.AgentStat || mongoose.model<IAgentStat>("AgentStat", AgentStatSchema);

export default AgentStat;
