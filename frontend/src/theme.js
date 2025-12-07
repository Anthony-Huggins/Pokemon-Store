import { createTheme } from '@mui/material/styles';

// You can swap these hex codes to change the entire app look instantly
const palette = {
  mode: 'dark', // Switches MUI components to dark mode logic
  primary: {
    main: '#6366f1', // "Indigo" - A modern, pleasing blue-purple
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ec4899', // "Pink/Magenta" - Good for 'Action' buttons like Sync
    light: '#f472b6',
    dark: '#db2777',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f172a', // Very dark slate blue (Not harsh black)
    paper: '#1e293b',   // Slightly lighter slate for Cards/Sidebars
  },
  text: {
    primary: '#f8fafc', // Off-white for readability
    secondary: '#94a3b8', // Muted grey for subtitles
  },
  success: {
    main: '#22c55e',
  },
  error: {
    main: '#ef4444',
  },
};

const theme = createTheme({
  palette: palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8, // Slightly more rounded corners are friendlier
  },
  components: {
    // Customizing the Sidebar (Drawer) to look distinct
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f172a', // Match background
          borderRight: '1px solid #334155', // Subtle border
        },
      },
    },
    // Customizing App Bar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b', // Match "Paper" color
          backgroundImage: 'none', // Remove default material shadow
          borderBottom: '1px solid #334155',
        },
      },
    },
    // Making buttons pop
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove ALL CAPS from buttons (looks cleaner)
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;