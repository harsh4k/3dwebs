import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { getServerEnv } from "@/env";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  message: z.string().min(1).max(2000),
});

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function POST(req: Request) {
  try {
    const input = contactSchema.parse(await req.json());
    const { CONTACT_ENDPOINT } = getServerEnv();

    if (CONTACT_ENDPOINT) {
      const upstream = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!upstream.ok) {
        throw new ApiError(502, "upstream_error", "Failed to deliver the message.");
      }
    } else {
      console.log("[api/contact] submission:", input);
    }

    return NextResponse.json({ data: { received: true } }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_input",
            message: "Invalid request payload.",
            issues: error.issues.map((issue) => ({
              path: issue.path.map(String).join("."),
              message: issue.message,
            })),
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "invalid_json", message: "Request body is not valid JSON." } },
        { status: 400 },
      );
    }
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[api] unhandled error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Something went wrong." } },
      { status: 500 },
    );
  }
}
