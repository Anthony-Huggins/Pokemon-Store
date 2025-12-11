import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Box, Button, Container, Typography, Paper, Grid, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/axiosConfig';

import InventoryCard from '../components/InventoryCard'; // To display the result

export default function CardScanner() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState([]); // Results from backend
  const [selectedMatch, setSelectedMatch] = useState(null); // Valid card selected by user
  
  // Webcam video constraints (attempt high resolution)
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Use back camera on mobile
  };

  // 1. Capture Image from Webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    handleScan(imageSrc);
  }, [webcamRef]);

  // 2. Send to Backend for OCR/Matching
  const handleScan = async (base64Image) => {
    setScanning(true);
    setMatches([]);
    
    try {
      // We need to send the Base64 string (minus the "data:image/jpeg;base64," prefix)
      const cleanBase64 = base64Image.split(',')[1];
      
      const response = await api.post('/scan/identify', { image: cleanBase64 });
      setMatches(response.data); // Backend returns list of potential card matches
    } catch (error) {
      console.error("Scan failed", error);
      // Mock data for testing UI while backend is being built
      // setMatches([]); 
    } finally {
      setScanning(false);
    }
  };

  const handleRetake = () => {
    setImgSrc(null);
    setMatches([]);
    setSelectedMatch(null);
  };

  const handleConfirm = (card) => {
    // Logic to add to inventory (we can reuse your Modal or a simple API call)
    console.log("Adding to inventory:", card.name);
    // Ideally open your existing InventoryItemForm modal here
    setSelectedMatch(card);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Card Scanner
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Align your card within the frame and capture. Good lighting is key!
      </Typography>

      <Grid container spacing={3}>
        {/* --- LEFT COLUMN: CAMERA / PREVIEW --- */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              bgcolor: '#000', 
              borderRadius: 2, 
              position: 'relative', 
              minHeight: 400,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            {!imgSrc ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
                {/* Guide Overlay */}
                <Box sx={{ 
                  position: 'absolute', 
                  border: '2px dashed rgba(255,255,255,0.7)', 
                  width: '60%', 
                  height: '80%', 
                  borderRadius: 2,
                  pointerEvents: 'none'
                }} />
              </>
            ) : (
              <img src={imgSrc} alt="Captured" style={{ width: '100%', borderRadius: '8px' }} />
            )}
            
            {scanning && (
              <Box sx={{ 
                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
              }}>
                <CircularProgress color="primary" size={60} />
                <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>Analyzing...</Typography>
              </Box>
            )}
          </Paper>

          {/* Controls */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {!imgSrc ? (
              <Button 
                variant="contained" size="large" 
                startIcon={<CameraAltIcon />} 
                onClick={capture}
                sx={{ px: 5 }}
              >
                Capture
              </Button>
            ) : (
              <Button 
                variant="outlined" size="large" 
                startIcon={<ReplayIcon />} 
                onClick={handleRetake}
              >
                Retake
              </Button>
            )}
          </Box>
        </Grid>

        {/* --- RIGHT COLUMN: RESULTS --- */}
        <Grid item xs={12} md={5}>
           <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
             <Typography variant="h6" gutterBottom>Scan Results</Typography>
             
             {!imgSrc && (
               <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 10 }}>
                 Take a photo to identify card.
               </Typography>
             )}

             {imgSrc && !scanning && matches.length === 0 && (
               <Typography color="error" align="center" sx={{ mt: 5 }}>
                 No card identified. Try better lighting or a darker background.
               </Typography>
             )}

             <Grid container spacing={2} sx={{ mt: 1 }}>
               {matches.map((card) => (
                 <Grid item xs={12} key={card.id}>
                    <Box sx={{ 
                      display: 'flex', border: '1px solid #ddd', borderRadius: 2, p: 1, 
                      cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } 
                    }}
                    onClick={() => handleConfirm(card)}
                    >
                      {/* Simple thumbnail */}
                      <img 
                        src={`http://localhost:8080/images/${card.id.replace('/','-').replace(':','')}.png`} 
                        alt={card.name}
                        style={{ width: 60, objectFit: 'contain', marginRight: 16 }} 
                      />
                      <Box>
                        <Typography fontWeight="bold">{card.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {card.set?.name} ({card.localId})
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Button size="small" variant="contained" startIcon={<CheckCircleIcon />}>
                            Select
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                 </Grid>
               ))}
             </Grid>
           </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}