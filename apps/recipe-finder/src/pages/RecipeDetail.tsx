import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecipe } from "../lib/api";
import {
  Container, Stack, Typography, Chip, Button, List, ListItem, ListItemText, Divider, Box
} from "@mui/material";

function stripHtml(html: string) {
  return html?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractSteps(data: any): string[] {
  const ai = data?.analyzedInstructions?.[0]?.steps;
  if (Array.isArray(ai) && ai.length) {
    return ai.map((s: any) => (s.step || "").toString().trim()).filter(Boolean);
  }
  const html = data?.instructions || "";
  if (/<li/i.test(html)) {
    const items: string[] = [];
    const re = /<li[^>]*>(.*?)<\/li>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      items.push(stripHtml(String(m[1] ?? "")));
    }
    return items.filter(Boolean);
  }
  const text = stripHtml(html || data?.summary || "");
  if (!text) return [];
  return text
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
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
  const steps = extractSteps(data);

  // Build a crisp, responsive hero image with srcSet if we have a Spoonacular id
  const imgId = data.id as number | undefined;
  const heroSrc =
    data.image ||
    (imgId ? `https://img.spoonacular.com/recipes/${imgId}-636x393.jpg` : "");
  const heroSrcSet = imgId
    ? [
        `https://img.spoonacular.com/recipes/${imgId}-312x231.jpg 312w`,
        `https://img.spoonacular.com/recipes/${imgId}-480x360.jpg 480w`,
        `https://img.spoonacular.com/recipes/${imgId}-556x370.jpg 556w`,
        `https://img.spoonacular.com/recipes/${imgId}-636x393.jpg 636w`,
      ].join(", ")
    : undefined;

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button component={Link} to="/" variant="outlined">← Back to results</Button>

        {/* Hero image with aspect ratio and no cropping */}
        {heroSrc ? (
          <Box
            sx={{
              width: "100%",
              maxWidth: 900,
              mx: "auto",
              aspectRatio: "4 / 3",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "action.hover",
              boxShadow: 2,
            }}
          >
            <img
              src={heroSrc}
              srcSet={heroSrcSet}
              sizes="(max-width: 600px) 100vw, 900px"
              alt={data.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",   // show full image, no zoom/crop
                display: "block"
              }}
            />
          </Box>
        ) : null}

        <Stack spacing={1}>
          <Typography variant="h4">{data.title}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {data.readyInMinutes ? <Chip label={`${data.readyInMinutes} min`} /> : null}
            {data.vegan ? <Chip label="Vegan" /> : null}
            {data.vegetarian ? <Chip label="Vegetarian" /> : null}
            {data.glutenFree ? <Chip label="Gluten Free" /> : null}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h6">Ingredients</Typography>
          <List dense>
            {ingredients.map((ing, i) => (
              <ListItem key={i} disableGutters>
                <ListItemText primary={ing.original} />
              </ListItem>
            ))}
          </List>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography variant="h6">Instructions</Typography>
          {steps.length ? (
            <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
              {steps.map((s, i) => (
                <li key={i} style={{ marginBottom: "0.5rem" }}>
                  <Typography>{s}</Typography>
                </li>
              ))}
            </ol>
          ) : (
            <Typography>No instructions available.</Typography>
          )}
          {data.sourceUrl ? (
            <Button href={data.sourceUrl} target="_blank" rel="noreferrer" variant="text">
              View source recipe ↗
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
}
