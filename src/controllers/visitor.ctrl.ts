import { Request, Response } from "express";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { UAParser } from "ua-parser-js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Anonymise IP for GDPR compliance (same approach as requestLogger) */
function anonymizeIP(ip?: string): string {
  if (!ip) return "unknown";
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::xxx"; // IPv6
  return ip.replace(/\d+\.\d+$/, "xxx.xxx"); // IPv4
}

const BOT_REGEX =
  /bot|crawl|spider|slurp|postman|curl|wget|axios|node-fetch|python|headless|puppeteer/i;

function isBot(ua = ""): boolean {
  return BOT_REGEX.test(ua);
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/visitors
 * Public endpoint – called by the web-developer-folio VisitorTracker component.
 * Stores an anonymised visit record in MongoDB.
 */
export const logVisit = async (req: Request, res: Response): Promise<void> => {
  const rawUA = req.headers["user-agent"] || "";
  const uaParser = new UAParser(rawUA);
  const ua = uaParser.getResult();

  const bot = isBot(rawUA);

  const page = (req.body?.page as string) || "/";
  const referrer =
    (req.body?.referrer as string) || req.headers["referer"] || null;

  await db.visitorLog.create({
    data: {
      ip: anonymizeIP(req.ip),
      userAgent: rawUA || null,
      browser: ua.browser.name || null,
      os: ua.os.name || null,
      device: ua.device.type || "desktop",
      page,
      referrer: referrer as string | null,
      isBot: bot,
    },
  });

  res.status(201).json({ success: true });
};

/**
 * GET /api/visitors
 * Protected – admin only. Returns paginated visitor logs.
 * Query params: page, limit, isBot, device, from, to
 */
export const getLogs = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const skip = (page - 1) * limit;

  // Filters
  const where: Prisma.VisitorLogWhereInput = {};

  if (req.query.isBot !== undefined) {
    where.isBot = req.query.isBot === "true";
  }
  if (req.query.device) {
    where.device = req.query.device as string;
  }
  if (req.query.from || req.query.to) {
    where.createdAt = {};
    if (req.query.from)
      where.createdAt.gte = new Date(req.query.from as string);
    if (req.query.to) where.createdAt.lte = new Date(req.query.to as string);
  }

  const [logs, total] = await Promise.all([
    db.visitorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.visitorLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * GET /api/visitors/stats
 * Protected – admin only. Returns aggregated visitor analytics.
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    totalVisits,
    humanVisits,
    botVisits,
    deviceBreakdown,
    browserBreakdown,
    recentLogs,
  ] = await Promise.all([
    db.visitorLog.count(),
    db.visitorLog.count({ where: { isBot: false } }),
    db.visitorLog.count({ where: { isBot: true } }),
    db.visitorLog.groupBy({
      by: ["device"],
      _count: { device: true },
    }),
    db.visitorLog.groupBy({
      by: ["browser"],
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 6,
    }),
    // Last 30 days logs for trend chart (fetch all, aggregate in-memory)
    db.visitorLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, isBot: false },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build per-day counts for the last 30 days
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dailyCounts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const log of recentLogs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    if (key in dailyCounts) dailyCounts[key]++;
  }

  const dailyVisits = Object.entries(dailyCounts).map(([date, count]) => ({
    date,
    count,
  }));

  res.json({
    success: true,
    data: {
      totalVisits,
      humanVisits,
      botVisits,
      deviceBreakdown: deviceBreakdown.map((d) => ({
        device: d.device || "desktop",
        count: d._count.device,
      })),
      browserBreakdown: browserBreakdown.map((b) => ({
        browser: b.browser || "Unknown",
        count: b._count.browser,
      })),
      dailyVisits,
    },
  });
};

export default { logVisit, getLogs, getStats };
