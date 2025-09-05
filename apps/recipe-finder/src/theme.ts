import { alpha, createTheme } from "@mui/material/styles";

const TEXT_PRIMARY = "#DDF4E7";
const TEXT_SECONDARY = "#67C090";
const BG_DEFAULT = "#124170";
const BG_PAPER = "#26667F";
const ACCENT = "#67C090";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: ACCENT },
    secondary: { main: TEXT_SECONDARY },
    background: {
      default: BG_DEFAULT,
      paper: BG_PAPER,
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundImage: "none" },
        a: { color: ACCENT },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: BG_PAPER,
          borderRadius: 16,
          border: `1px solid ${alpha(TEXT_PRIMARY, 0.12)}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { variant: "contained", color: "primary" },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 12 },
      },
    },
    MuiChip: {
      defaultProps: { color: "primary", variant: "outlined" },
      styleOverrides: {
        root: {
          color: TEXT_PRIMARY,
          borderColor: alpha(ACCENT, 0.6),
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        track: { color: ACCENT },
        rail: { color: alpha(TEXT_PRIMARY, 0.2) },
        thumb: { border: `2px solid ${BG_PAPER}` },
        valueLabel: {
          backgroundColor: ACCENT,
          color: BG_DEFAULT,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: { color: TEXT_PRIMARY },
      },
    },
  },
});

export default theme;
