import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma.js";

/**
 * List all active sources with article counts
 *
 * GET /api/sources
 */
export async function listSources(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Query all active sources with article count
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        websiteUrl: true,
        isActive: true,
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform to include articleCount at top level
    const sourcesWithCount = sources.map((source) => ({
      id: source.id,
      name: source.name,
      slug: source.slug,
      type: source.type,
      websiteUrl: source.websiteUrl,
      isActive: source.isActive,
      articleCount: source._count.articles,
    }));

    res.json({
      success: true,
      data: sourcesWithCount,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  listSources,
};
