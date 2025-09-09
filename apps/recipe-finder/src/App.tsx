import { Routes, Route, Link as RouterLink, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Stack, Button } from "@mui/material";
import Home from "./pages/Home";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import Pantry from "./pages/Pantry";

function Nav() {
  const { pathname } = useLocation();
  const is = (p: string) => pathname === p;
  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 800, textDecoration: "none", color: "inherit", "&:hover": { opacity: 0.85 } }}
        >
          recipegrind
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/" variant={is("/") ? "contained" : "text"}>Home</Button>
          <Button component={RouterLink} to="/finder" variant={is("/finder") ? "contained" : "text"}>Finder</Button>
          <Button component={RouterLink} to="/pantry" variant={is("/pantry") ? "contained" : "text"}>Pantry</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/finder" element={<RecipeList />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/pantry" element={<Pantry />} />
      </Routes>
    </>
  );
}
