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

export default function CardScanner() {
  const webcamRef = useRef(null);
  
  // State
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState([]); 
  const [isLive, setIsLive] = useState(false); 
  const [wasLiveBeforeModal, setWasLiveBeforeModal] = useState(false);

  // Data State
  const [warehouses, setWarehouses] = useState([]);
  
  // Modal & Notification State
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

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
      intervalId = setInterval(() => {
        if (!scanning) capture();
      }, 100); 
    }
    return () => clearInterval(intervalId);
  }, [isLive, scanning, capture]);

  // --- HANDLERS ---
  const handleCardClick = (card) => {
    setWasLiveBeforeModal(isLive); 
    setIsLive(false);              
    setSelectedCard(card);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCard(null);
    if (wasLiveBeforeModal) {
      setIsLive(true);
    }
    setWasLiveBeforeModal(false);
  };

  const handleAddCard = async (newItemPayload) => {
    try {
      await api.post('/inventory', newItemPayload);
      setNotification({ open: true, message: 'Card added!', type: 'success' });
      handleModalClose(); 
    } catch (error) {
       const msg = 'Storage location full. Please pick a different one.';
       setNotification({ open: true, message: msg, type: 'error' });
    }
  };

  return (
    // Changed maxWidth to "lg" to keep it centered and not too wide
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ mb: 4 }}>
        Card Scanner
      </Typography>

      {/* alignItems="stretch" -> Makes both columns equal height 
         justifyContent="center" -> Centers the columns in the container
      */}
      <Grid container spacing={4} alignItems="stretch" justifyContent="center">
        
        {/* LEFT COLUMN: CAMERA */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ 
              p: 2, 
              bgcolor: '#000', 
              borderRadius: 2, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', // Centers camera vertically if right side is taller
              alignItems: 'center'
          }}>
            
            {/* Viewport */}
            <Box sx={{ 
              width: '100%', // Fill the paper
              height: 500,   // Fixed height for camera viewport
              bgcolor: '#222', 
              borderRadius: 1, 
              mb: 2,
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              overflow: 'hidden',
              position: 'relative'
            }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  height="100%" 
                  style={{ objectFit: 'contain' }}
                />
                
            </Box>
            
            {/* CONTROLS */}
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
              <Button 
                variant="contained" size="large" onClick={capture} 
                startIcon={<CameraAltIcon />}
                disabled={isLive || scanning} 
                sx={{ minWidth: 200 }}
              >
                {isLive ? "Scanning..." : "Capture Photo"}
              </Button>

              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, px: 2, py: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isLive} 
                      onChange={() => { setIsLive(!isLive); setMatches([]); }} 
                      color="error" 
                    />
                  }
                  label={<Typography variant="body2" color="white" fontWeight="bold">Live Mode</Typography>}
                  sx={{ mr: 0 }} 
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: RESULTS */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
           <Paper sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              bgcolor: '#0f172a', 
              border: '1px solid #1e293b' 
           }}>
              <Typography variant="h5" color="white" align="center" sx={{ borderBottom: '1px solid #334155', pb: 2 }}>
                Detected Card
              </Typography>

              {/* FlexGrow makes this Box fill all remaining space, centering content vertically */}
              <Box sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '100%',
                  mt: 2
              }}>
                  {matches.length > 0 ? (
                    <Box sx={{ width: '100%', maxWidth: 280 }}>
                       {matches.map((card) => (
                          <Box key={card.id}>
                            <InventoryCard 
                               card={card} 
                               onClick={() => handleCardClick(card)} 
                            />
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                               Click card to add to inventory
                            </Typography>
                          </Box>
                       ))}
                    </Box>
                  ) : (
                    <Box sx={{ opacity: 0.5, textAlign: 'center' }}>
                       <CameraAltIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                       <Typography variant="h6" color="text.secondary">
                         {isLive ? "Scanning..." : "No card detected"}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         Place a card in view and capture.
                       </Typography>
                    </Box>
                  )}
              </Box>
           </Paper>
        </Grid>

      </Grid>

      <CardDetailModal 
        open={modalOpen} 
        onClose={handleModalClose} 
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