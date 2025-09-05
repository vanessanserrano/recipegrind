const PROD_API = 'https://recipegrind.onrender.com';
const API_BASE =
  import.meta.env.VITE_API_BASE
  // On GitHub Pages, use the hosted API
  || (typeof window !== 'undefined' && /github\.io$/.test(window.location.hostname) ? PROD_API
  // Otherwise (local dev), use localhost
  : 'http://localhost:4000');

export async function searchRecipes(params: { q: string; diet?: string; cuisine?: string; maxReadyTime?: number }) {
  const url = new URL('/api/search', API_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

export async function getRecipe(id: string) {
  const url = new URL(`/api/recipes/${id}`, API_BASE);
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

export async function findByIngredients(ingredients: string[], opts?: { limit?: number; ranking?: 1 | 2 }) {
  if (!ingredients.length) throw new Error("No ingredients selected");
  const url = new URL('/api/by-ingredients', API_BASE);
  url.searchParams.set('ingredients', ingredients.join(','));
  if (opts?.limit) url.searchParams.set('limit', String(opts.limit));
  if (opts?.ranking) url.searchParams.set('ranking', String(opts.ranking));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
