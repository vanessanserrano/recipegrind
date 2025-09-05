import { Routes, Route, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Stack, Button } from "@mui/material";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import Pantry from "./pages/Pantry";

export default function App() {
  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>recipegrind</Typography>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/">Finder</Button>
            <Button component={RouterLink} to="/pantry">Pantry</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<RecipeList />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/pantry" element={<Pantry />} />
      </Routes>
    </>
  );
}
