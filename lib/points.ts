import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { logger } from "@/lib/logger";

/**
 * Award points to a user and record the action in their history.
 */
export async function awardPoints(
  email: string,
  action: string,
  points: number
) {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $inc: { points },
      $push: {
        pointsHistory: {
          action,
          points,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
  if (user) {
    logger.info(
      `[Points] +${points} to ${email} for "${action}" (total: ${user.points})`
    );
  }
  return user;
}

/**
 * Deduct points from a user and record the action in their history.
 * Returns null if user doesn't have enough points.
 */
export async function deductPoints(
  email: string,
  points: number,
  reason: string
) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || user.points < points) {
    return null;
  }

  user.points -= points;
  user.pointsHistory.push({
    action: reason,
    points: -points,
    date: new Date(),
  });
  await user.save();

  logger.info(
    `[Points] -${points} from ${email} for "${reason}" (total: ${user.points})`
  );
  return user;
}

/**
 * Get a user's points balance and history.
 */
export async function getPointsBalance(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "points pointsHistory"
  );

  if (!user) {
    return { points: 0, history: [] };
  }

  return {
    points: user.points,
    history: user.pointsHistory.sort(
      (a: { date: Date }, b: { date: Date }) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
}

/**
 * Generate a unique referral code from a name.
 */
export function generateReferralCode(name: string): string {
  const clean = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${clean || "SKY"}${suffix}`;
}

/**
 * Award referral bonus when a referred user completes their first booking.
 */
export async function processReferralBonus(bookerEmail: string) {
  await connectDB();

  const booker = await User.findOne({ email: bookerEmail.toLowerCase() });
  if (!booker?.referredBy) return;

  // Check if this is the booker's first confirmed booking
  const { default: Booking } = await import("@/lib/models/Booking");
  const confirmedCount = await Booking.countDocuments({
    email: bookerEmail.toLowerCase(),
    status: "confirmed",
  });

  // Only award on first booking (the one just created counts as 1)
  if (confirmedCount > 1) return;

  // Find referrer by their referral code
  const referrer = await User.findOne({ referralCode: booker.referredBy });
  if (!referrer) return;

  // Award 500 points to referrer
  await awardPoints(
    referrer.email,
    `Referral booking by ${booker.name}`,
    500
  );
  logger.info(
    `[Referral] +500 to ${referrer.email} for ${bookerEmail}'s first booking`
  );
}
