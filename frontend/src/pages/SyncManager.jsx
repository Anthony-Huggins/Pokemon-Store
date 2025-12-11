import { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  Alert, Chip, Paper, LinearProgress, Stack 
} from '@mui/material';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const API_BASE = 'http://localhost:8080/api/v1/sync'; 

export default function SyncManager() {
  const [activeJob, setActiveJob] = useState(null); 
  const [progress, setProgress] = useState(0);      
  const [status, setStatus] = useState(null);       

  const startStream = (endpoint, jobKey, label) => {
    setActiveJob(jobKey);
    setProgress(0);
    setStatus(null);

    const url = `${API_BASE}${endpoint}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("progress", (event) => {
      setProgress(parseFloat(event.data));
    });

    eventSource.addEventListener("complete", (event) => {
      setStatus({ type: 'success', message: `${label} Completed Successfully!` });
      eventSource.close();
      setActiveJob(null);
      setProgress(100);
    });

    eventSource.onerror = (err) => {
      if (eventSource.readyState === EventSource.CLOSED) return;
      console.error("Stream Error:", err);
      setStatus({ type: 'error', message: `Connection lost during ${label}.` });
      eventSource.close();
      setActiveJob(null);
    };
  };

  return (
    <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: '#1e293b', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sync Manager
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
          Control connections to external APIs (TCGdex). 
          Operations run in the background with real-time progress updates.
        </Typography>
      </Paper>

      {/* STATUS BAR */}
      <Box sx={{ mb: 4, minHeight: 60 }}>
        {activeJob ? (
          <Paper sx={{ p: 2, bgcolor: '#0f172a', border: '1px solid #334155', maxWidth: 800, mx: 'auto' }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="white">
                 Processing Job: <strong>{activeJob.toUpperCase()}</strong>
              </Typography>
              <Typography variant="body2" color="white">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </Paper>
        ) : status && (
          <Alert severity={status.type} onClose={() => setStatus(null)} variant="filled" sx={{ maxWidth: 800, mx: 'auto' }}>
            {status.message}
          </Alert>
        )}
      </Box>

      {/* MAIN CARDS AREA - Using Stack + Flex to fill space */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={3} 
        sx={{ flexGrow: 1, width: '100%' }} // Ensure full width
      >
        
        {/* CARD 1: Library Sync */}
        <Box sx={{ flex: 1, display: 'flex' }}> {/* flex: 1 makes it grow to fill space */}
          <Card 
            elevation={4}
            sx={{ 
              width: '100%', // Take full width of the flex parent
              height: '100%', minHeight: 400,
              display: 'flex', flexDirection: 'column', 
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <LibraryBooksIcon color="primary" sx={{ fontSize: 80, mb: 3, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>Card Library</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300 }}>
                Downloads new Sets and Card Definitions to keep your local database up to date.
              </Typography>
            </CardContent>
            <Box sx={{ p: 4 }}>
              <Button 
                variant="contained" size="large" fullWidth startIcon={<CloudSyncIcon />}
                disabled={activeJob !== null}
                onClick={() => startStream('/sets', 'sets', 'Library Sync')}
                sx={{ py: 1.5 }}
              >
                Update Library
              </Button>
            </Box>
          </Card>
        </Box>

        {/* CARD 2: Inventory Prices */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Card 
            elevation={4}
            sx={{ 
              width: '100%',
              height: '100%', minHeight: 400,
              display: 'flex', flexDirection: 'column',
              border: '2px solid #10b981', 
              bgcolor: 'rgba(16, 185, 129, 0.04)'
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <AttachMoneyIcon color="success" sx={{ fontSize: 80, mb: 3, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>Inventory Prices</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mb: 2 }}>
                Updates prices only for cards currently in your stock. Faster and recommended daily.
              </Typography>
              <Chip label="Recommended Daily" color="success" />
            </CardContent>
            <Box sx={{ p: 4 }}>
              <Button 
                variant="contained" color="success" size="large" fullWidth startIcon={<AttachMoneyIcon />}
                disabled={activeJob !== null}
                onClick={() => startStream('/prices/inventory', 'inv-price', 'Inventory Price Sync')}
                sx={{ py: 1.5 }}
              >
                Sync Inventory Prices
              </Button>
            </Box>
          </Card>
        </Box>

        {/* CARD 3: Full Database */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Card 
            elevation={4}
            sx={{ 
              width: '100%',
              height: '100%', minHeight: 400,
              display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <CloudSyncIcon color="warning" sx={{ fontSize: 80, mb: 3, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>Full Price Database</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mb: 2 }}>
                Force updates prices for all 20,000+ cards in the database. Use sparingly.
              </Typography>
              <Chip label="Heavy Operation" color="warning" variant="outlined" />
            </CardContent>
            <Box sx={{ p: 4 }}>
              <Button 
                variant="outlined" color="warning" size="large" fullWidth startIcon={<CloudSyncIcon />}
                disabled={activeJob !== null}
                onClick={() => startStream('/prices/library', 'lib-price', 'Full Library Sync')}
                sx={{ py: 1.5 }}
              >
                Sync All Prices
              </Button>
            </Box>
          </Card>
        </Box>

      </Stack>
    </Box>
  );
}