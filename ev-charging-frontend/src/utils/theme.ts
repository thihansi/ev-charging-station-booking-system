import { createTheme } from "@mui/material/styles";

// Gradient colors matching login page - use selectively
const gradientColors = {
  primary: "#667eea", // Login gradient start
  secondary: "#764ba2", // Login gradient end
  primaryDark: "#5a6fd8",
  secondaryDark: "#6a4190",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: gradientColors.primary, // #667eea - purple only for primary actions
      light: "#8b94ed",
      dark: gradientColors.primaryDark, // #5a6fd8
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#64748b", // Neutral gray for secondary actions
      light: "#94a3b8",
      dark: "#475569",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc", // Clean light gray background
      paper: "#ffffff", // Pure white for cards
    },
    text: {
      primary: "#0f172a", // Very dark gray for maximum readability
      secondary: "#334155", // Darker gray for secondary text - better contrast
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    info: {
      main: "#3b82f6", // Blue for info, not purple
      light: "#60a5fa",
      dark: "#2563eb",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.25rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#0f172a", // Very dark for maximum contrast
    },
    h2: {
      fontSize: "1.875rem",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "#0f172a",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#0f172a",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#0f172a",
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#0f172a",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#0f172a",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      color: "#0f172a", // Very dark for body text
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#334155", // Darker gray for secondary text
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8, // Less rounded for cleaner look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease-in-out",
        },
        contained: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${gradientColors.primaryDark} 0%, ${gradientColors.secondaryDark} 100%)`,
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff", // White background
          color: "#0f172a", // Very dark text for maximum contrast
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
          borderBottom: "1px solid #e2e8f0", // Subtle border
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#ffffff",
            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused fieldset": {
              borderColor: gradientColors.primary,
              borderWidth: "2px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: gradientColors.primary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          background: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`,
          color: "white",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
            color: "#475569", // Darker gray for better contrast
            fontSize: "0.95rem",
            "&.Mui-selected": {
              color: gradientColors.primary,
              fontWeight: 600,
            },
          },
          "& .MuiTabs-indicator": {
            background: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`,
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "#0f172a", // Very dark for primary list text
          fontWeight: 500,
        },
        secondary: {
          color: "#334155", // Darker gray for secondary list text
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#0f172a", // Very dark for table text
          borderBottom: "1px solid #e2e8f0",
        },
        head: {
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          fontWeight: 600,
          fontSize: "0.875rem",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#334155", // Darker gray for form labels
          "&.Mui-focused": {
            color: gradientColors.primary,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#0f172a", // Very dark for input text
        },
      },
    },
  },
});
