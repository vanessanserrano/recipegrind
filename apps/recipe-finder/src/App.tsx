import React from "react";
import { Container, Stack, TextField, MenuItem, Select, InputLabel, FormControl, Slider, Button, Chip, Grid, Card, CardContent, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { searchRecipes } from "./lib/api";

export default function App() {
  const [q, setQ] = React.useState("pasta");
  const [diet, setDiet] = React.useState("");
  const [cuisine, setCuisine] = React.useState("");
  const [maxReadyTime, setMaxReadyTime] = React.useState<number | undefined>(30);

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["search", { q, diet, cuisine, maxReadyTime }],
    queryFn: () => searchRecipes({ q, diet, cuisine, maxReadyTime }),
    enabled: false,
  });

  React.useEffect(() => { refetch(); }, []); // initial fetch

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={2}>
        <TextField label="Search recipes" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && refetch()} />
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

          <Stack sx={{ width: 240 }}>
            <Typography variant="caption">Max Ready Time (min)</Typography>
            <Slider step={5} min={5} max={120} value={maxReadyTime ?? 30} onChange={(_, v)=>setMaxReadyTime(v as number)} />
          </Stack>

          <Button variant="contained" onClick={()=>refetch()} disabled={isFetching}>Search</Button>
        </Stack>

        {error ? <Typography color="error">Search failed. Try a different query.</Typography> : null}

        <Grid container spacing={2}>
          {data?.results?.map((r: any) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{r.title}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                    {r.readyInMinutes ? <Chip size="small" label={`${r.readyInMinutes} min`} /> : null}
                    {r.vegan ? <Chip size="small" label="Vegan" /> : null}
                    {r.vegetarian ? <Chip size="small" label="Vegetarian" /> : null}
                    {r.glutenFree ? <Chip size="small" label="Gluten Free" /> : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {isFetching ? <Typography>Loading…</Typography> : null}
      </Stack>
    </Container>
  );
}
