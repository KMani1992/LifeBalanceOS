
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E88E5",
      light: "#64B5F6",
      dark: "#0D47A1",
    },
    secondary: {
      main: "#43A047",
      light: "#81C784",
      dark: "#1B5E20",
    },
    background: {
      default: "#F4F8FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#16324F",
      secondary: "#4F6B84",
    },
    success: {
      main: "#43A047",
    },
    warning: {
      main: "#FB8C00",
    },
  },
  shape: {
    borderRadius: 22,
  },
  typography: {
    fontFamily: "var(--font-manrope), 'Segoe UI', sans-serif",
    h1: {
      fontSize: "clamp(2.8rem, 4vw, 4.6rem)",
      fontWeight: 800,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontSize: "clamp(2rem, 3vw, 3rem)",
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    button: {
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.84))",
          backdropFilter: "blur(18px)",
          boxShadow: "0 20px 45px rgba(31, 64, 104, 0.08)",
          border: "1px solid rgba(100, 181, 246, 0.12)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 700,
          paddingInline: 18,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,250,255,0.92))",
          borderRight: "1px solid rgba(22,50,79,0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;