/**
 * API handler wrapper for Next.js App Router route handlers.
 * Provides consistent error catching and response formatting.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Wraps an App Router route handler with global error catching.
 * Usage:
 *   export const GET = apiHandler(async (request) => { ... })
 *   export const POST = apiHandler(async (request) => { ... })
 */
export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      logger.error("Unhandled API error", error);

      const message =
        error instanceof Error ? error.message : "Something went wrong";
      const code =
        error instanceof Error && "code" in error
          ? (error as any).code
          : "INTERNAL_ERROR";

      return NextResponse.json(
        {
          success: false,
          error: message,
          code,
        },
        { status: 500 }
      );
    }
  };
}
