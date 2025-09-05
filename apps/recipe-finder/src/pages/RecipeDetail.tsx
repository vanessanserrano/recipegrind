import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecipe } from "../lib/api";
import {
  Container, Stack, Typography, Chip, Button, List, ListItem, ListItemText, Divider
} from "@mui/material";

function stripHtml(html: string) {
  return html?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function RecipeDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => getRecipe(id!),
    enabled: Boolean(id),
  });

  if (isLoading) return <Container sx={{ py: 4 }}><Typography>Loading…</Typography></Container>;
  if (error || !data) return <Container sx={{ py: 4 }}><Typography color="error">Couldn’t load recipe.</Typography></Container>;

  const ingredients: Array<{ original: string }> = data.extendedIngredients ?? [];
  const instructions = stripHtml(data.instructions || data.summary || "");

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Button component={Link} to="/" variant="outlined">← Back to results</Button>
        <Typography variant="h4">{data.title}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {data.readyInMinutes ? <Chip label={`${data.readyInMinutes} min`} /> : null}
          {data.vegan ? <Chip label="Vegan" /> : null}
          {data.vegetarian ? <Chip label="Vegetarian" /> : null}
          {data.glutenFree ? <Chip label="Gluten Free" /> : null}
        </Stack>

        <Typography variant="h6">Ingredients</Typography>
        <List dense>
          {ingredients.map((ing, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText primary={ing.original} />
            </ListItem>
          ))}
        </List>

        <Divider />

        <Typography variant="h6">Instructions</Typography>
        <Typography whiteSpace="pre-wrap">{instructions || "No instructions available."}</Typography>

        {data.sourceUrl ? (
          <Button href={data.sourceUrl} target="_blank" rel="noreferrer" variant="text">
            View source recipe ↗
          </Button>
        ) : null}
      </Stack>
    </Container>
  );
}
