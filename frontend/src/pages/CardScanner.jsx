import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Box, Button, Container, Typography, Paper, Grid, CircularProgress, 
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/axiosConfig';

/**
 * CardScanner Page
 * Allows users to capture a card image via webcam and find matches in the DB.
 */
export default function CardScanner() {
  const webcamRef = useRef(null);
  
  // State
  const [imgSrc, setImgSrc] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState([]); 
  const [cameraReady, setCameraReady] = useState(false); // <--- Controls visibility

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      handleScan(imageSrc);
    }
  }, [webcamRef]);

  const handleScan = async (base64Image) => {
    setScanning(true);
    setMatches([]);
    
    try {
      const cleanBase64 = base64Image.split(',')[1];
      console.log("Sending payload:", { image: cleanBase64.substring(0, 50) + "..." });
      const response = await api.post('/scan/identify', { image: cleanBase64 });
      setMatches(response.data); 
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setScanning(false);
    }
  };

  const handleRetake = () => {
    setImgSrc(null);
    setMatches([]);
    // Note: We keep cameraReady=true so it doesn't flicker when retaking
  };

  const handleConfirm = (card) => {
    console.log("Adding to inventory:", card.name);
    // TODO: Open modal
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Card Scanner
      </Typography>

      <Grid container spacing={3}>
        
        {/* --- LEFT: WEBCAM --- */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#000', textAlign: 'center', minHeight: 100 }}>
            
            {/* 1. Initialization State (Hidden Webcam Placeholder) */}
            {!cameraReady && !imgSrc && (
              <Box sx={{ p: 4, color: 'grey.500', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress color="inherit" size={30} sx={{ mb: 2 }} />
                <Typography>Initializing Camera...</Typography>
                
                {/* HIDDEN WEBCAM: 
                   We must render it to trigger 'onUserMedia', 
                   but we hide it visually with height: 0 and opacity: 0.
                */}
                <Box sx={{ height: 0, opacity: 0, overflow: 'hidden' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      onUserMedia={() => setCameraReady(true)}
                      onUserMediaError={(e) => console.error("Camera Error:", e)}
                    />
                </Box>
              </Box>
            )}

            {/* 2. Active Camera State (Only shown when ready) */}
            {cameraReady && !imgSrc && (
               <Box sx={{ 
                 width: '100%', 
                 height: 450, // Fixed height for stable UI
                 bgcolor: '#1a1a1a', 
                 borderRadius: 2, 
                 overflow: 'hidden',
                 display: 'flex', 
                 justifyContent: 'center', 
                 alignItems: 'center'
               }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'contain' }}
                  />
               </Box>
            )}

            {/* 3. Captured Image State */}
            {imgSrc && (
              <Box sx={{ 
                 width: '100%', 
                 height: 450, 
                 bgcolor: '#1a1a1a', 
                 borderRadius: 2, 
                 overflow: 'hidden',
                 display: 'flex', 
                 justifyContent: 'center', 
                 alignItems: 'center'
               }}>
                <img 
                  src={imgSrc} 
                  alt="Captured" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </Box>
            )}

            {/* Loading Overlay (Analysis) */}
            {scanning && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <CircularProgress size={24} sx={{ mr: 2 }} />
                 <Typography>Analyzing Image...</Typography>
              </Box>
            )}

            {/* Buttons (Only show if camera is ready or image captured) */}
            {(cameraReady || imgSrc) && (
              <Box sx={{ mt: 3, mb: 1 }}>
                {!imgSrc ? (
                  <Button 
                    variant="contained" size="large" 
                    startIcon={<CameraAltIcon />} 
                    onClick={capture}
                    fullWidth
                  >
                    Capture Photo
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" size="large" 
                    startIcon={<ReplayIcon />} 
                    onClick={handleRetake}
                    fullWidth
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.400' } }}
                  >
                    Retake
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* --- RIGHT: RESULTS --- */}
        <Grid item xs={12} md={5}>
           <Paper variant="outlined" sx={{ p: 2, height: '100%', minHeight: 450 }}>
             <Typography variant="h6" gutterBottom>
               Results
             </Typography>

             {!imgSrc && (
               <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                 Waiting for capture...
               </Typography>
             )}

             <Grid container spacing={1} sx={{ mt: 1 }}>
               {matches.map((card) => (
                 <Grid item xs={12} key={card.id}>
                    <Box 
                      onClick={() => handleConfirm(card)}
                      sx={{ 
                        display: 'flex', alignItems: 'center', p: 1, 
                        border: '1px solid #eee', borderRadius: 1, 
                        cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } 
                      }}
                    >
                      <img 
                        src={`http://localhost:8080/images/${card.id.replace('/','-').replace(':','')}.png`} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                        alt="thumb"
                        style={{ width: 40, height: 55, objectFit: 'contain', marginRight: 10 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{card.name}</Typography>
                        <Typography variant="caption">{card.set?.name} (#{card.localId})</Typography>
                      </Box>
                      <CheckCircleIcon color="action" fontSize="small" />
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