import { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  Grid, Alert, Chip, Paper, LinearProgress 
} from '@mui/material';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

// Note: EventSource is native to the browser, no import needed.
// We hardcode the base URL or grab it from env var since EventSource doesn't use Axios config
const API_BASE = 'http://localhost:8080/api/v1/sync'; 

export default function SyncManager() {
  const [activeJob, setActiveJob] = useState(null); // 'sets', 'inv-price', 'lib-price'
  const [progress, setProgress] = useState(0);      // 0 to 100
  const [status, setStatus] = useState(null);       // { type: 'success', message: '' }

  /**
   * Starts an SSE stream for the given endpoint.
   */
  const startStream = (endpoint, jobKey, label) => {
    // 1. Reset State
    setActiveJob(jobKey);
    setProgress(0);
    setStatus(null);

    // 2. Open Connection
    const url = `${API_BASE}${endpoint}`;
    const eventSource = new EventSource(url);

    // 3. Listen for "progress" events
    eventSource.addEventListener("progress", (event) => {
      const percent = parseFloat(event.data);
      setProgress(percent);
    });

    // 4. Listen for "complete" events
    eventSource.addEventListener("complete", (event) => {
      setStatus({ type: 'success', message: `${label} Completed Successfully!` });
      eventSource.close();
      setActiveJob(null);
      setProgress(100);
    });

    // 5. Handle Errors
    eventSource.onerror = (err) => {
      // EventSource often fires 'error' on normal close, so we check readyState
      if (eventSource.readyState === EventSource.CLOSED) return;

      console.error("Stream Error:", err);
      setStatus({ type: 'error', message: `Connection lost during ${label}.` });
      eventSource.close();
      setActiveJob(null);
    };
  };

  return (
    <Box sx={{ p: 0 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Sync Manager</Typography>
        <Typography variant="body1" color="text.secondary">
          Control connections to external APIs (TCGdex). 
          Operations run in the background with real-time progress updates.
        </Typography>
      </Paper>

      {/* STATUS & PROGRESS BAR */}
      <Box sx={{ mb: 4, height: 60 }}>
        {activeJob && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Processing... {Math.round(progress)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
        )}
        {status && (
          <Alert severity={status.type} onClose={() => setStatus(null)}>
            {status.message}
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        
        {/* BUTTON 1: Library Sync */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LibraryBooksIcon color="primary" sx={{ fontSize: 30, mr: 1.5 }} />
                <Typography variant="h6">Card Library</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Downloads new Sets and Card Definitions.
              </Typography>
            </CardContent>
            <Box sx={{ mt: 'auto', p: 2 }}>
              <Button 
                variant="contained" fullWidth startIcon={<CloudSyncIcon />}
                disabled={activeJob !== null}
                onClick={() => startStream('/sets', 'sets', 'Library Sync')}
              >
                Update Library
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* BUTTON 2: Inventory Prices */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #10b981' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon color="success" sx={{ fontSize: 30, mr: 1.5 }} />
                <Typography variant="h6">Inventory Prices</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Updates prices only for cards in stock.
              </Typography>
              <Chip label="Recommended" color="success" size="small" sx={{ mt: 2 }} />
            </CardContent>
            <Box sx={{ mt: 'auto', p: 2 }}>
              <Button 
                variant="contained" color="success" fullWidth startIcon={<AttachMoneyIcon />}
                disabled={activeJob !== null}
                onClick={() => startStream('/prices/inventory', 'inv-price', 'Inventory Price Sync')}
              >
                Sync Inventory Prices
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* BUTTON 3: Full Sync */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudSyncIcon color="warning" sx={{ fontSize: 30, mr: 1.5 }} />
                <Typography variant="h6">Full Price Database</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Updates prices for all 20,000+ cards.
              </Typography>
              <Chip label="Heavy Operation" color="warning" size="small" sx={{ mt: 2 }} />
            </CardContent>
            <Box sx={{ mt: 'auto', p: 2 }}>
              <Button 
                variant="outlined" color="warning" fullWidth startIcon={<CloudSyncIcon />}
                disabled={activeJob !== null}
                onClick={() => startStream('/prices/library', 'lib-price', 'Full Library Sync')}
              >
                Sync All Prices
              </Button>
            </Box>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}