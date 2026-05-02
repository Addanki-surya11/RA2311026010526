const axios = require("axios");
const logger = require("./logger");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_URL = "http://20.207.122.201/evaluation-service/notifications";
const TOP_N = 10;

// Bearer token — set via environment variable or pass as CLI arg
// Usage:
//   NOTIFY_TOKEN=<your-token> node priorityInbox.js
//   node priorityInbox.js <your-token>
const AUTH_TOKEN =
  process.env.NOTIFY_TOKEN || process.argv[2] || "";

// ---------------------------------------------------------------------------
// Type weights — Placement gets the highest band, Event the lowest
// ---------------------------------------------------------------------------

const TYPE_WEIGHT = {
  Placement: 300,
  Result: 200,
  Event: 100,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse "YYYY-MM-DD HH:MM:SS" into a Unix epoch (seconds).
 */
function parseTimestamp(ts) {
  const parsed = new Date(ts.replace(" ", "T"));
  if (isNaN(parsed.getTime())) {
    logger.warn("Unparseable timestamp, defaulting to 0", { raw: ts });
    return 0;
  }
  return Math.floor(parsed.getTime() / 1000);
}

/**
 * Attach a _priority score to every notification.
 *
 * Formula:
 *   priority = TYPE_WEIGHT[type] + normalizedRecency (range 0–99)
 *
 * Normalizing recency keeps it within the 100-point band of its type
 * so that type is always the primary sort key and timestamp is secondary.
 */
function computeScores(notifications) {
  if (notifications.length === 0) return [];

  const epochs = notifications.map((n) => parseTimestamp(n.Timestamp));
  const minEpoch = Math.min(...epochs);
  const maxEpoch = Math.max(...epochs);
  const range = maxEpoch - minEpoch || 1;

  return notifications.map((n, i) => {
    const typeWeight = TYPE_WEIGHT[n.Type] ?? 0;
    const recencyScore = ((epochs[i] - minEpoch) / range) * 99;
    const priority = typeWeight + recencyScore;

    return {
      ...n,
      _priority: parseFloat(priority.toFixed(4)),
      _epoch: epochs[i],
    };
  });
}

/**
 * Return the top N scored notifications sorted by priority (desc).
 */
function getTopN(scored, n) {
  return scored.slice().sort((a, b) => b._priority - a._priority).slice(0, n);
}

/**
 * Print a formatted table of top notifications to stdout.
 */
function printTable(topNotifications) {
  const SEP =
    "=".repeat(88);
  const ROW_SEP = "-".repeat(88);

  process.stdout.write("\n" + SEP + "\n");
  process.stdout.write(
    `  AFFORDMED — TOP ${topNotifications.length} PRIORITY NOTIFICATIONS\n`
  );
  process.stdout.write(SEP + "\n");
  process.stdout.write(
    `  ${"Rank".padEnd(5)} | ${"Type".padEnd(9)} | ${"Priority".padEnd(8)} | ${"Timestamp".padEnd(19)} | Message\n`
  );
  process.stdout.write(ROW_SEP + "\n");

  topNotifications.forEach((n, idx) => {
    const rank = `#${String(idx + 1).padStart(2, "0")}`;
    const type = n.Type.padEnd(9);
    const priority = n._priority.toFixed(2).padStart(8);
    const ts = n.Timestamp.padEnd(19);
    const msg = n.Message.slice(0, 40);
    process.stdout.write(
      `  ${rank}  | ${type} | ${priority} | ${ts} | ${msg}\n`
    );
  });

  process.stdout.write(SEP + "\n\n");
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

async function fetchNotifications() {
  logger.info("Fetching notifications from API", { url: API_URL });

  const headers = { Accept: "application/json" };
  if (AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  } else {
    logger.warn("No auth token provided — API may return 401");
  }

  try {
    const response = await axios.get(API_URL, { timeout: 15000, headers });

    const { data } = response;
    if (!data || !Array.isArray(data.notifications)) {
      logger.error("Unexpected API response shape", { body: data });
      throw new Error("API response missing 'notifications' array");
    }

    logger.info("Notifications fetched", {
      count: data.notifications.length,
      status: response.status,
    });

    return data.notifications;
  } catch (err) {
    logger.error("API request failed", {
      message: err.message,
      status: err.response?.status,
      hint:
        err.response?.status === 401
          ? "Set NOTIFY_TOKEN env var or pass token as first CLI argument"
          : undefined,
    });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  logger.info("=== AFFORDMED Campus Notification — Priority Inbox ===");
  logger.info(`Top N configured to: ${TOP_N}`);

  try {
    const raw = await fetchNotifications();

    logger.info("Computing priority scores", { totalNotifications: raw.length });
    const scored = computeScores(raw);

    const top = getTopN(scored, TOP_N);
    logger.info(`Top ${TOP_N} notifications selected`, {
      selected: top.map((n) => ({
        id: n.ID,
        type: n.Type,
        priority: n._priority,
        timestamp: n.Timestamp,
      })),
    });

    printTable(top);

    logger.info("Priority Inbox display complete");
  } catch (err) {
    logger.error("Fatal error — process exiting", { message: err.message });
    process.exitCode = 1;
  }
}

main();
