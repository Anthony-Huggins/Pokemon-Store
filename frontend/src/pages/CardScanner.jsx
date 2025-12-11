import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  Box, Button, Container, Typography, Paper, Grid, 
  Snackbar, Alert, FormControlLabel, Switch, Stack
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import api from '../api/axiosConfig';
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal'; 

/**
 * CardScanner Page (Live Mode Edition)
 * Allows users to capture a card image via webcam (manual or live) and find matches in the DB.
 */
export default function CardScanner() {
  const webcamRef = useRef(null);
  
  // State
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState([]); 
  const [isLive, setIsLive] = useState(false); 
  
  // New State: Remembers if we were live before opening the modal
  const [wasLiveBeforeModal, setWasLiveBeforeModal] = useState(false);

  // Data State
  const [warehouses, setWarehouses] = useState([]);
  
  // Modal & Notification State
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Load Warehouses
  useEffect(() => {
    api.get('/warehouses').then(res => setWarehouses(res.data)).catch(console.error);
  }, []);

  // --- CORE SCANNING LOGIC ---
  const handleScan = async (base64Image) => {
    if (scanning) return; 
    setScanning(true);
    
    try {
      const cleanBase64 = base64Image.split(',')[1];
      const response = await api.post('/scan/identify', { image: cleanBase64 });
      
      if (response.data && response.data.length > 0) {
        setMatches(response.data);
      }
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setScanning(false);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) handleScan(imageSrc);
    }
  }, [webcamRef, scanning]);

  // --- LIVE LOOP ---
  useEffect(() => {
    let intervalId;
    if (isLive) {
      // Scan every 2.5 seconds
      intervalId = setInterval(() => {
        if (!scanning) capture();
      }, 2500); 
    }
    return () => clearInterval(intervalId);
  }, [isLive, scanning, capture]);

  // --- HANDLERS ---
  
  /**
   * Pauses live scanning and opens the modal.
   * Remembers previous state to resume later.
   */
  const handleCardClick = (card) => {
    setWasLiveBeforeModal(isLive); // 1. Remember current state
    setIsLive(false);              // 2. Pause scanning
    setSelectedCard(card);
    setModalOpen(true);
  };

  /**
   * Closes the modal and restores Live Mode if it was active previously.
   */
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCard(null);

    // 3. Restore state
    if (wasLiveBeforeModal) {
      setIsLive(true);
    }
    setWasLiveBeforeModal(false); // Reset memory
  };

  const handleAddCard = async (newItemPayload) => {
    try {
      await api.post('/inventory', newItemPayload);
      setNotification({ open: true, message: 'Card added!', type: 'success' });
      
      // Use the shared close handler so it ALSO restores live mode
      handleModalClose(); 
    } catch (error) {
       const msg = error.response?.data || 'Failed to add card.';
       setNotification({ open: true, message: msg, type: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
        Card Scanner
      </Typography>

      {/* CAMERA SECTION */}
      <Grid container justifyContent="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={8} lg={6}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#000', textAlign: 'center', borderRadius: 2 }}>
            
            {/* Viewport */}
            <Box sx={{ 
              height: 400, bgcolor: '#222', borderRadius: 1, mb: 2,
              display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
              position: 'relative'
            }}>
               <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  height="100%" 
                  style={{ objectFit: 'contain' }}
                />
                
                {/* Live Indicator Overlay */}
                {isLive && (
                  <Box sx={{ 
                    position: 'absolute', top: 10, right: 10, 
                    bgcolor: 'rgba(255, 0, 0, 0.7)', color: 'white', 
                    px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold'
                  }}>
                    LIVE {scanning ? "..." : ""}
                  </Box>
                )}
            </Box>
            
            {/* CONTROLS ROW */}
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              
              {/* Capture Button */}
              <Button 
                variant="contained" 
                size="large" 
                onClick={capture} 
                startIcon={<CameraAltIcon />}
                disabled={isLive || scanning} 
                sx={{ minWidth: 200 }}
              >
                {isLive ? "Scanning..." : "Capture Photo"}
              </Button>

              {/* Live Toggle */}
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, px: 2, py: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isLive} 
                      onChange={() => { setIsLive(!isLive); setMatches([]); }} 
                      color="error" 
                    />
                  }
                  label={
                    <Typography variant="body2" color="white" fontWeight="bold">
                      Live Mode
                    </Typography>
                  }
                  sx={{ mr: 0 }} 
                />
              </Box>

            </Stack>

          </Paper>
        </Grid>
      </Grid>

      {/* RESULTS SECTION */}
      {matches.length > 0 && (
        <Box>
           <Typography variant="h5" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
             Matches Found ({matches.length})
           </Typography>
           
           <Grid container spacing={2}>
             {matches.map((card) => (
               <Grid key={card.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                 <InventoryCard 
                    card={card} 
                    onClick={() => handleCardClick(card)} 
                 />
               </Grid>
             ))}
           </Grid>
        </Box>
      )}

      {/* MODAL & TOASTS */}
      <CardDetailModal 
        open={modalOpen} 
        onClose={handleModalClose} // Now uses the smart handler
        card={selectedCard} 
        warehouses={warehouses}
        onSubmit={handleAddCard} 
      />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.type} variant="filled">{notification.message}</Alert>
      </Snackbar>

    </Container>
  );
}