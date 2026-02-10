import { Router } from "express";
import {
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import { ArticleQuerySchema, ArticleIdSchema } from "../schemas/api.schemas.js";
import {
  listArticles,
  getArticle,
} from "../controllers/articles.controller.js";
import { listSources } from "../controllers/sources.controller.js";
import {
  triggerRefresh,
  getRefreshStatus,
} from "../controllers/refresh.controller.js";

const router = Router();

// ============================================
// Articles Routes
// ============================================

// GET /api/articles - List articles with pagination and filtering
router.get("/articles", validateQuery(ArticleQuerySchema), listArticles);

// GET /api/articles/:id - Get single article by ID
router.get("/articles/:id", validateParams(ArticleIdSchema), getArticle);

// ============================================
// Sources Routes
// ============================================

// GET /api/sources - List all active sources
router.get("/sources", listSources);

// ============================================
// Refresh Routes
// ============================================

// POST /api/refresh - Trigger content refresh
router.post("/refresh", triggerRefresh);

// GET /api/refresh/status - Get latest refresh status
router.get("/refresh/status", getRefreshStatus);

export default router;
