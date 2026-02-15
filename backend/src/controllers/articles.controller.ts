import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma.js";
import { NotFoundError } from "../middleware/error.middleware.js";
import type { ArticleQuery, ArticleId } from "../schemas/api.schemas.js";

/**
 * List articles with pagination and optional source filtering
 *
 * GET /api/articles
 * Query params: source (slug), page, limit
 */
export async function listArticles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { source, page, limit, sortBy, sortOrder } =
      req.query as unknown as ArticleQuery;

    // Build where clause
    const where: { source?: { slug: string } } = {};
    if (source) {
      where.source = { slug: source };
    }

    // Get total count for pagination
    const total = await prisma.article.count({ where });

    // Query articles with pagination and dynamic sorting
    const articles = await prisma.article.findMany({
      where,
      include: {
        source: {
          select: {
            id: true,
            name: true,
            slug: true,
            websiteUrl: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single article by ID
 *
 * GET /api/articles/:id
 */
export async function getArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as unknown as ArticleId;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            slug: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!article) {
      throw NotFoundError("Article not found");
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  listArticles,
  getArticle,
};
