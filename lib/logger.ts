/**
 * Structured logger for SkyMock.
 * - logger.info: Only logs in non-production environments.
 * - logger.error: Logs errors in all environments.
 * - logger.warn: Only logs in non-production environments.
 */

export const logger = {
  info: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${msg}`, data !== undefined ? data : "");
    }
  },

  warn: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[WARN] ${msg}`, data !== undefined ? data : "");
    }
  },

  error: (msg: string, err?: unknown) => {
    console.error(
      `[ERROR] ${msg}`,
      err instanceof Error ? err.message : err !== undefined ? err : ""
    );
    // Future: send to Sentry, LogRocket, or similar
  },
};
