import mongoose, { Schema, Document, models } from "mongoose";

export interface IBooking extends Document {
  name: string;
  phone: string;
  email: string;
  flightId: string;
  flightName: string;
  price: number;
  seatPreference?: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentId?: string;
  orderId?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    flightId: {
      type: String,
      required: [true, "Flight ID is required"],
    },
    flightName: {
      type: String,
      required: [true, "Flight name is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    seatPreference: {
      type: String,
      enum: ["Window", "Middle", "Aisle"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentId: {
      type: String,
    },
    orderId: {
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

const Booking = models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
