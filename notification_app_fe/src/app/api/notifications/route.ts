import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";
import { ApiResponse } from "@/lib/types";

const UPSTREAM = "http://20.207.122.201/evaluation-service/notifications";
const AUTH_TOKEN = process.env.NOTIFY_TOKEN || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "100";
  const page = searchParams.get("page") || "1";
  const notification_type = searchParams.get("notification_type") || "";

  const params = new URLSearchParams({ limit, page });
  if (notification_type) params.set("notification_type", notification_type);

  const url = `${UPSTREAM}?${params.toString()}`;

  logger.info("Proxying notification request", { url, limit, page, notification_type });

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  } else {
    logger.warn("NOTIFY_TOKEN not set — upstream may return 401");
  }

  try {
    const upstream = await fetch(url, { headers, cache: "no-store" });
    const text = await upstream.text();

    if (!upstream.ok) {
      logger.error("Upstream API error", { status: upstream.status, body: text });
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}`, detail: text },
        { status: upstream.status }
      );
    }

    const data: ApiResponse = JSON.parse(text);

    logger.info("Notifications proxied successfully", {
      count: data.notifications?.length ?? 0,
      status: upstream.status,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to reach upstream API", { message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
