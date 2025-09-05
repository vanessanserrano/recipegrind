import React from "react";
import {
  Container, Stack, TextField, MenuItem, Select, InputLabel,
  FormControl, Slider, Button, Chip, Card, CardContent, Typography, Box, Alert
} from "@mui/material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchRecipes } from "../lib/api";

export default function RecipeList() {
  const [q, setQ] = React.useState("");
  const [diet, setDiet] = React.useState("");
  const [cuisine, setCuisine] = React.useState("");
  const [maxReadyTime, setMaxReadyTime] = React.useState<number | undefined>(30);

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["search", { q, diet, cuisine, maxReadyTime }],
    queryFn: () => searchRecipes({ q, diet, cuisine, maxReadyTime }),
    enabled: false, // user must trigger
  });

  const doSearch = () => {
    if (q.trim().length === 0) return;
    refetch();
  };

  const hasResults = Array.isArray(data?.results) && data.results.length > 0;
  const searched = data !== undefined || isFetching || !!error;

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={2}>
        <TextField
          label="Search recipes"
          placeholder="Try: tacos, stir fry, brownies…"
          value={q}
          onChange={e=>setQ(e.target.value)}
          onKeyDown={(e)=> { if (e.key==='Enter') doSearch(); }}
          fullWidth
        />

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="diet-label">Diet</InputLabel>
            <Select labelId="diet-label" label="Diet" value={diet} onChange={(e)=>setDiet(e.target.value)}>
              <MenuItem value=""><em>Any</em></MenuItem>
              <MenuItem value="vegan">Vegan</MenuItem>
              <MenuItem value="vegetarian">Vegetarian</MenuItem>
              <MenuItem value="gluten free">Gluten Free</MenuItem>
              <MenuItem value="ketogenic">Keto</MenuItem>
              <MenuItem value="pescetarian">Pescetarian</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="cuisine-label">Cuisine</InputLabel>
            <Select labelId="cuisine-label" label="Cuisine" value={cuisine} onChange={(e)=>setCuisine(e.target.value)}>
              <MenuItem value=""><em>Any</em></MenuItem>
              <MenuItem value="Italian">Italian</MenuItem>
              <MenuItem value="Mexican">Mexican</MenuItem>
              <MenuItem value="Indian">Indian</MenuItem>
              <MenuItem value="Chinese">Chinese</MenuItem>
              <MenuItem value="Japanese">Japanese</MenuItem>
              <MenuItem value="American">American</MenuItem>
              <MenuItem value="Thai">Thai</MenuItem>
            </Select>
          </FormControl>

          <Stack sx={{ width: 260 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption">Max Ready Time</Typography>
              <Chip size="small" label={`${maxReadyTime ?? 30} min`} />
            </Stack>
            <Slider
              step={5}
              min={5}
              max={120}
              value={maxReadyTime ?? 30}
              onChange={(_, v)=>setMaxReadyTime(v as number)}
              valueLabelDisplay="auto"   // shows minutes while sliding
            />
          </Stack>

          <Button variant="contained" onClick={doSearch} disabled={isFetching || q.trim().length===0}>
            Search
          </Button>
        </Stack>

        {/* Helpful initial state */}
        {!searched && (
          <Typography variant="body2" color="text.secondary">
            Type a recipe idea above and press <b>Search</b>.
          </Typography>
        )}

        {/* No results state */}
        {searched && !isFetching && !error && !hasResults && (
          <Alert severity="info">No results found. Try different keywords or relax filters.</Alert>
        )}

        {error ? <Typography color="error">Search failed. Try a different query.</Typography> : null}

        {/* Results grid with thumbnail + text */}
        {hasResults && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2
            }}
          >
            {data.results.map((r: any) => {
              const img = r.image || (r.id ? `https://img.spoonacular.com/recipes/${r.id}-312x231.jpg` : "");
              return (
                <Card
                  key={r.id}
                  component={Link}
                  to={`/recipe/${r.id}`}
                  sx={{ textDecoration: "none", ":hover": { boxShadow: 6 }, transition: "box-shadow .2s ease" }}
                >
                  <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        overflow: "hidden",
                        flexShrink: 0,
                        bgcolor: "action.hover",
                      }}
                    >
                      <img
                        src={img}
                        alt={r.title}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" noWrap title={r.title}>{r.title}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                        {r.readyInMinutes ? <Chip size="small" label={`${r.readyInMinutes} min`} /> : null}
                        {r.vegan ? <Chip size="small" label="Vegan" /> : null}
                        {r.vegetarian ? <Chip size="small" label="Vegetarian" /> : null}
                        {r.glutenFree ? <Chip size="small" label="Gluten Free" /> : null}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {isFetching ? <Typography>Loading…</Typography> : null}
      </Stack>
    </Container>
  );
}
