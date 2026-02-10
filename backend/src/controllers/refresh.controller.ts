import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma.js";
import { logger } from "../utils/logger.js";
import { refreshAllSources } from "../services/scraper.service.js";
import { summarizeUnsummarized } from "../services/summarizer.service.js";

/**
 * Trigger a content refresh from all sources
 *
 * POST /api/refresh
 */
export async function triggerRefresh(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    logger.info("Starting content refresh...");

    // Create fetch record with status 'running'
    const fetch = await prisma.fetch.create({
      data: {
        status: "running",
        articlesFound: 0,
        articlesNew: 0,
      },
    });

    try {
      // Refresh all sources
      const refreshResult = await refreshAllSources();

      // Summarize unsummarized articles
      const summarizedCount = await summarizeUnsummarized();

      // Update fetch record with results
      const completedFetch = await prisma.fetch.update({
        where: { id: fetch.id },
        data: {
          status: "completed",
          articlesFound: refreshResult.found,
          articlesNew: refreshResult.new,
          completedAt: new Date(),
        },
      });

      logger.info("Content refresh completed successfully");

      res.json({
        success: true,
        data: {
          id: completedFetch.id,
          status: completedFetch.status,
          articlesFound: completedFetch.articlesFound,
          articlesNew: completedFetch.articlesNew,
          summarized: summarizedCount,
          startedAt: completedFetch.startedAt,
          completedAt: completedFetch.completedAt,
        },
      });
    } catch (error) {
      // Update fetch record with error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await prisma.fetch.update({
        where: { id: fetch.id },
        data: {
          status: "failed",
          errorMessage,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get the status of the latest refresh operation
 *
 * GET /api/refresh/status
 */
export async function getRefreshStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Get the most recent fetch record
    const latestFetch = await prisma.fetch.findFirst({
      orderBy: { startedAt: "desc" },
    });

    if (!latestFetch) {
      res.json({
        success: true,
        data: null,
        message: "No refresh operations found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: latestFetch.id,
        status: latestFetch.status,
        articlesFound: latestFetch.articlesFound,
        articlesNew: latestFetch.articlesNew,
        errorMessage: latestFetch.errorMessage,
        startedAt: latestFetch.startedAt,
        completedAt: latestFetch.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  triggerRefresh,
  getRefreshStatus,
};
