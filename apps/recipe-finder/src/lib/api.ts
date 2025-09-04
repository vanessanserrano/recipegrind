const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

export async function searchRecipes(params: { q: string; diet?: string; cuisine?: string; maxReadyTime?: number }) {
  const url = new URL('/api/search', API_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
