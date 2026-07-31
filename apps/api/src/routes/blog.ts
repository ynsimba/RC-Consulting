import { Router } from "express";
import { articleSchema, blogQuerySchema, categorySchema } from "@rc/shared";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";
import { requireAdmin } from "../middleware/auth.js";

export const blogRouter = Router();

blogRouter.get("/articles", async (req, res, next) => {
  try {
    const query = blogQuerySchema.parse(req.query);
    const where = {
      published: true,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { excerpt: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: { category: true, author: { select: { firstName: true, lastName: true } } },
        orderBy: { publishedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    res.json({
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    });
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/articles/:slug", async (req, res, next) => {
  try {
    const article = await prisma.article.findFirst({
      where: {
        slug: req.params.slug,
        OR: [{ published: true }, ...(req.user?.role === "ADMIN" ? [{}] : [])],
      },
      include: { category: true, author: { select: { firstName: true, lastName: true } } },
    });
    if (!article || (!article.published && req.user?.role !== "ADMIN")) {
      throw new HttpError(404, "Article introuvable");
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/categories", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/admin/articles", requireAdmin, async (_req, res, next) => {
  try {
    const items = await prisma.article.findMany({
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/admin/articles", requireAdmin, async (req, res, next) => {
  try {
    const data = articleSchema.parse(req.body);
    const article = await prisma.article.create({
      data: {
        ...data,
        coverImage: data.coverImage || null,
        categoryId: data.categoryId || null,
        authorId: req.user!.id,
        publishedAt: data.published ? new Date() : null,
      },
    });
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

blogRouter.put("/admin/articles/:id", requireAdmin, async (req, res, next) => {
  try {
    const data = articleSchema.parse(req.body);
    const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, "Article introuvable");

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        ...data,
        coverImage: data.coverImage || null,
        categoryId: data.categoryId || null,
        publishedAt:
          data.published && !existing.publishedAt
            ? new Date()
            : data.published
              ? existing.publishedAt
              : null,
      },
    });
    res.json(article);
  } catch (error) {
    next(error);
  }
});

blogRouter.delete("/admin/articles/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/admin/categories", requireAdmin, async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

blogRouter.delete("/admin/categories/:id", requireAdmin, async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
