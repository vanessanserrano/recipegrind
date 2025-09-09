import {
  Container, Stack, Typography, TextField, Chip, Button, Box, Card, CardContent,
  LinearProgress, Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { findByIngredients } from "../lib/api";
import { useState, useMemo } from "react";

const COMMON_INGREDIENTS = [
  "egg","milk","butter","olive oil","garlic","onion","tomato","chicken","ground beef","pasta",
  "rice","flour","sugar","salt","black pepper","soy sauce","cheese","lemon","bread","potato","carrot","bell pepper","spinach","beans"
];

export default function Pantry() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [ranking, setRanking] = useState<1|2>(1);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["pantry", selected, ranking],
    queryFn: async () => findByIngredients(selected, { ranking, limit: 30 }),
    enabled: false,
    retry: false,
  });

  const toggle = (name: string) => {
    const n = name.toLowerCase().trim();
    setSelected((prev) => prev.includes(n) ? prev.filter(i => i !== n) : [n, ...prev]);
    setLastAdded(n);
    setTimeout(() => setLastAdded((curr) => (curr === n ? null : curr)), 1200);
  };

  const addCustom = () => {
    const n = custom.toLowerCase().trim();
    if (!n) return;
    setSelected((prev) => prev.includes(n) ? prev : [n, ...prev]);
    setCustom("");
    setLastAdded(n);
    setTimeout(() => setLastAdded((curr) => (curr === n ? null : curr)), 1200);
  };

  const results: any[] = useMemo(() => {
    try {
      const arr = Array.isArray(data?.results) ? (data!.results as any[]) : [];
      return arr;
    } catch {
      return [];
    }
  }, [data]);

  const cards = useMemo(() => {
    try {
      return results.map((r: any) => {
        const used = Number(r?.usedIngredientCount || 0);
        const missed = Number(r?.missedIngredientCount || 0);
        const total = used + missed || 1;
        const pct = Math.round((used / total) * 100);
        const img = r?.image || (r?.id ? `https://img.spoonacular.com/recipes/${r.id}-312x231.jpg` : "");
        const title = String(r?.title ?? "Untitled");

        return (
          <Card key={r?.id ?? title} component={Link} to={`/recipe/${r?.id}`} style={{ textDecoration:"none" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: 1, overflow:"hidden", bgcolor: "action.hover", flexShrink:0 }}>
                    <img src={img} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} loading="lazy"/>
                  </Box>
                  <Typography variant="subtitle1" noWrap title={title}>{title}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption">Match: {isFinite(pct) ? pct : 0}%</Typography>
                  <LinearProgress variant="determinate" value={isFinite(pct) ? pct : 0} />
                </Stack>
                {Array.isArray(r?.missedIngredients) && r.missedIngredients.length ? (
                  <Box sx={{ display:"flex", gap:0.5, flexWrap:"wrap" }}>
                    {r.missedIngredients.slice(0,6).map((m: any, i: number) => (
                      <Chip key={i} size="small" label={String(m)} />
                    ))}
                    {r.missedIngredients.length > 6 ? <Chip size="small" label={`+${r.missedIngredients.length-6} more`} /> : null}
                  </Box>
                ) : <Typography variant="caption">You have everything 🎉</Typography>}
              </Stack>
            </CardContent>
          </Card>
        );
      });
    } catch {
      return [<Typography key="err" color="error">Error rendering results.</Typography>];
    }
  }, [results]);

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Pantry Mode</Typography>
        <Typography variant="body2" color="text.secondary">
          Click ingredients you have. Then hit <b>Find recipes</b>.
        </Typography>

        {/* Quick-pick chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {COMMON_INGREDIENTS.map((name) => (
            <Chip
              key={name}
              label={name}
              onClick={() => toggle(name)}
              color={selected.includes(name) ? "primary" : "default"}
              variant={selected.includes(name) ? "filled" : "outlined"}
            />
          ))}
        </Box>

        {/* Controls */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            label="Add ingredient"
            placeholder="e.g., basil"
            size="small"
            value={custom}
            onChange={(e)=>setCustom(e.target.value)}
            onKeyDown={(e)=> { if (e.key === "Enter") addCustom(); }}
          />
          <Button onClick={addCustom}>Add</Button>
          <Button variant="outlined" onClick={()=>setSelected([])}>Clear</Button>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="rank-label">Ranking</InputLabel>
            <Select labelId="rank-label" label="Ranking" value={ranking} onChange={(e)=>setRanking(Number(e.target.value) as 1|2)}>
              <MenuItem value={1}>Max used</MenuItem>
              <MenuItem value={2}>Min missing</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={()=>refetch()}
            disabled={!selected.length || isFetching}
          >
            Find recipes
          </Button>
        </Stack>

        {/* Selected display */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">Your ingredients</Typography>
          {selected.length ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selected.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onDelete={() => toggle(s)}
                  variant={lastAdded === s ? "filled" : "outlined"}
                  color={lastAdded === s ? "secondary" : "default"}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">Pick a few ingredients to start.</Typography>
          )}
        </Stack>

        {isFetching && <LinearProgress />}

        {error ? <Typography color="error">Search failed. Try adding/removing items.</Typography> : null}

        {!!data && !isFetching && results.length === 0 && !error && (
          <Typography>No recipes match those ingredients. Try adding one or two more.</Typography>
        )}

        {results.length > 0 && (
          <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(2, 1fr)", md:"repeat(3, 1fr)" }, gap:2 }}>
            {cards}
          </Box>
        )}
      </Stack>
    </Container>
  );
}
