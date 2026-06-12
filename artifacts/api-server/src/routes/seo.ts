import { Router, type IRouter, type Request } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, customPagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function resolveOrigin(req: Request): string {
  const envDomains = process.env.REPLIT_DOMAINS?.split(",").map((d) => d.trim()).filter(Boolean);
  if (envDomains && envDomains.length > 0) {
    return `https://${envDomains[0]}`;
  }
  const forwardedProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol || "https";
  const host = req.get("host") ?? "localhost";
  return `${proto}://${host}`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// GET /api/sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  const origin = resolveOrigin(req);

  const urls: { loc: string; lastmod?: string; priority?: string }[] = [];

  const staticPaths = ["/", "/categories", "/search", "/pc-builder", "/privacy-policy", "/terms", "/return-policy"];
  for (const p of staticPaths) {
    urls.push({ loc: `${origin}${p}`, priority: p === "/" ? "1.0" : "0.6" });
  }

  const categories = await db.select({ slug: categoriesTable.slug }).from(categoriesTable);
  for (const c of categories) {
    urls.push({ loc: `${origin}/categories/${c.slug}`, priority: "0.7" });
  }

  const products = await db
    .select({ id: productsTable.id, createdAt: productsTable.createdAt })
    .from(productsTable);
  for (const p of products) {
    urls.push({
      loc: `${origin}/products/${p.id}`,
      lastmod: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
      priority: "0.8",
    });
  }

  const pages = await db
    .select({ slug: customPagesTable.slug })
    .from(customPagesTable)
    .where(eq(customPagesTable.isPublished, true));
  for (const pg of pages) {
    urls.push({ loc: `${origin}/p/${pg.slug}`, priority: "0.5" });
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        const parts = [`    <loc>${xmlEscape(u.loc)}</loc>`];
        if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
        if (u.priority) parts.push(`    <priority>${u.priority}</priority>`);
        return `  <url>\n${parts.join("\n")}\n  </url>`;
      })
      .join("\n") +
    `\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(body);
});

export default router;
