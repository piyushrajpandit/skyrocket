/**
 * Environment variable validation.
 * Call validateEnv() at app startup to fail fast if required vars are missing.
 */

const REQUIRED_VARS = [
  "MONGODB_URI",
  "AUTH_SECRET",
] as const;

const OPTIONAL_WARN_VARS = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RESEND_API_KEY",
] as const;

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}. Check your .env.local file.`
    );
  }

  // Warn about optional keys but don't crash
  if (process.env.NODE_ENV !== "production") {
    const optionalMissing = OPTIONAL_WARN_VARS.filter(
      (key) => !process.env[key]
    );
    if (optionalMissing.length > 0) {
      console.warn(
        `[ENV] ⚠️  Optional env vars not set: ${optionalMissing.join(", ")}. Some features may not work.`
      );
    }
  }
}
