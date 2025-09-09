import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Box sx={{
        position: "absolute", inset: -120, zIndex: 0,
        background: "radial-gradient(400px 400px at 20% 20%, rgba(103,192,144,.25), transparent 60%), radial-gradient(500px 500px at 80% 30%, rgba(221,244,231,.18), transparent 60%)",
        filter: "blur(12px)"
      }} />
      <Container sx={{ py: { xs: 8, md: 12 }, position: "relative", zIndex: 1 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.75rem", md: "4.75rem" },
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(180deg, #DDF4E7 0%, #67C090 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            recipegrind
          </Typography>

          <Typography sx={{ maxWidth: 720, color: "text.secondary", fontSize: { xs: "1rem", md: "1.125rem" } }}>
            Fast recipe search and a smart pantry mode. Filter by time & diet, click the ingredients you have,
            and see what you can cook right now.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            <Chip label="Keyword + filters" />
            <Chip label="Pantry Mode" />
            <Chip label="Match score & gaps" />
            <Chip label="Quick minutes slider" />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Button size="large" component={RouterLink} to="/finder">Open Finder</Button>
            <Button size="large" variant="outlined" component={RouterLink} to="/pantry">Try Pantry Mode</Button>
          </Stack>

          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            No sign-up. Uses public recipe data.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
