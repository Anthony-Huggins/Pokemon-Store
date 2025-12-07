import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';

// 1. Create a React Query Client (handles caching)
const queryClient = new QueryClient();

// 2. Create a basic MUI Theme (Dark mode is easy to add later!)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Professional Blue
    },
    background: {
      default: '#f4f6f8', // Light Grey background for dashboard feel
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kicks start an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);