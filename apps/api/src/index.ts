import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import NodeCache from "node-cache";
import { PrismaClient } from "@prisma/client";

// Load .env from the current working directory explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const cache = new NodeCache({ stdTTL: 60 });

const API = process.env.RECIPE_API_BASE!;
const KEY = process.env.RECIPE_API_KEY!;
const PORT = Number(process.env.PORT || 4000);

app.get("/health", (_req, res) => res.send("ok"));

// TEMP: env sanity check (remove later)
app.get("/debug/env", (_req, res) => {
  res.json({
    hasRecipeApiKey: Boolean(process.env.RECIPE_API_KEY),
    hasDb: Boolean(process.env.DATABASE_URL),
    apiBase: process.env.RECIPE_API_BASE
  });
});

// Proxy search -> Spoonacular
// Supports: q, diet, cuisine, maxReadyTime
app.get("/api/search", async (req, res) => {
  try {
    const { q = "", diet = "", cuisine = "", maxReadyTime = "" } = req.query as Record<string, string>;
    const params = new URLSearchParams({
      apiKey: KEY, // Spoonacular expects apiKey in query
      query: q,
      number: "20",
      addRecipeInformation: "true",
    });
    if (diet) params.set("diet", diet);
    if (cuisine) params.set("cuisine", cuisine);
    if (maxReadyTime) params.set("maxReadyTime", String(maxReadyTime));

    const url = `${API}/recipes/complexSearch?${params.toString()}`;

    // basic cache
    const cached = cache.get(url);
    if (cached) return res.json(cached);

    // also send header just in case (some providers use it)
    const r = await fetch(url, { headers: { "x-api-key": KEY } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "Upstream error", details: text });
    }
    const data = await r.json();
    cache.set(url, data);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

// Minimal favorites (DB)
app.post("/api/favorites", async (req, res) => {
  const { userId, recipeId, data } = req.body ?? {};
  if (!userId || !recipeId) return res.status(400).json({ error: "userId and recipeId required" });
  const fav = await prisma.favorite.create({ data: { userId, recipeId, data } });
  res.json(fav);
});

app.get("/api/favorites", async (req, res) => {
  const { userId } = req.query as Record<string, string>;
  if (!userId) return res.status(400).json({ error: "userId required" });
  const favs = await prisma.favorite.findMany({ where: { userId } });
  res.json(favs);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Single recipe details (ingredients + instructions)
app.get("/api/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const params = new URLSearchParams({
      apiKey: KEY,
      includeNutrition: "false"
    });
    const url = `${API}/recipes/${id}/information?${params.toString()}`;

    const cached = cache.get(url);
    if (cached) return res.json(cached);

    const r = await fetch(url, { headers: { "x-api-key": KEY } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "Upstream error", details: text });
    }
    const data = await r.json();
    cache.set(url, data);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});
// Find by ingredients (reverse pantry)
app.get("/api/by-ingredients", async (req, res) => {
  try {
    const ing = req.query.ingredients;
    const ingredients = Array.isArray(ing) ? ing.join(",") : String(ing || "");
    if (!ingredients) return res.status(400).json({ error: "ingredients required (comma list)" });

    const number = Math.min(Number(req.query.limit) || 20, 50);
    const ranking = req.query.ranking?.toString() || "1"; // 1=max used, 2=min missing

    const params = new URLSearchParams({
      apiKey: KEY,
      ingredients,
      number: String(number),
      ignorePantry: "true",
      ranking
    });

    const url = `${API}/recipes/findByIngredients?${params.toString()}`;
    const cached = cache.get(url);
    if (cached) return res.json(cached);

    const r = await fetch(url, { headers: { "x-api-key": KEY } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "Upstream error", details: text });
    }
    const list = await r.json();
    const normalized = (list || []).map((it: any) => {
      const used = it.usedIngredientCount ?? 0;
      const missed = it.missedIngredientCount ?? 0;
      const denom = used + missed || 1;
      return {
        id: it.id,
        title: it.title,
        image: it.image,
        usedIngredientCount: used,
        missedIngredientCount: missed,
        usedIngredients: (it.usedIngredients || []).map((m: any) => m.original || m.name),
        missedIngredients: (it.missedIngredients || []).map((m: any) => m.original || m.name),
        matchScore: used / denom
      };
    }).sort((a: any, b: any) => b.matchScore - a.matchScore || a.missedIngredientCount - b.missedIngredientCount);

    // cache for 5 minutes
    cache.set(url, { results: normalized }, 60 * 5);
    res.json({ results: normalized });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});
