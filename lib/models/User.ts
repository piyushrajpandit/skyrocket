import mongoose, { Schema, Document, models } from "mongoose";

export interface IPointsHistory {
  action: string;
  points: number;
  date: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  points: number;
  pointsHistory: IPointsHistory[];
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
}

const PointsHistorySchema = new Schema<IPointsHistory>(
  {
    action: { type: String, required: true },
    points: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    points: {
      type: Number,
      default: 0,
    },
    pointsHistory: {
      type: [PointsHistorySchema],
      default: [],
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
