import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  Box, Button, Container, Typography, Paper, Grid, CircularProgress, 
  Snackbar, Alert 
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import api from '../api/axiosConfig';

// --- IMPORTS ---
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal'; 

/**
 * CardScanner Page Component.
 * <p>
 * This component provides a webcam interface for users to capture images of physical Pokémon cards.
 * It handles the full workflow of:
 * 1. Capturing a webcam image.
 * 2. Sending the image to the backend for OCR processing.
 * 3. Displaying matching cards from the database.
 * 4. Allowing the user to select a match and add it to their inventory.
 * </p>
 * * @component
 */
export default function CardScanner() {
  /** Reference to the webcam component to trigger screenshots. */
  const webcamRef = useRef(null);
  
  // --- Scanner State ---
  /** Stores the base64 screenshot string of the captured image. Null if camera is active. */
  const [imgSrc, setImgSrc] = useState(null);
  /** Boolean flag indicating if the backend OCR process is currently running. */
  const [scanning, setScanning] = useState(false);
  /** Array of card objects returned from the backend search based on the OCR text. */
  const [matches, setMatches] = useState([]); 

  // --- Data State ---
  /** List of available warehouses (binders) for the 'Add to Inventory' modal dropdowns. */
  const [warehouses, setWarehouses] = useState([]);
  
  // --- Modal & Notification State ---
  /** The specific card selected by the user to add to inventory. */
  const [selectedCard, setSelectedCard] = useState(null);
  /** Controls visibility of the Add Inventory Modal. */
  const [modalOpen, setModalOpen] = useState(false);
  /** Global notification state for success/error messages. */
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  /**
   * Fetches the list of warehouses from the backend on component mount.
   * This is required so the "Add to Inventory" modal can populate its location dropdowns.
   */
  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  /**
   * Captures the current frame from the webcam.
   * Sets the image source state and triggers the backend scan process.
   */
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      handleScan(imageSrc);
    }
  }, [webcamRef]);

  /**
   * Sends the captured base64 image to the backend for identification.
   * * @param {string} base64Image - The raw base64 string including the data URI prefix.
   */
  const handleScan = async (base64Image) => {
    setScanning(true);
    setMatches([]);
    
    try {
      // Remove 'data:image/jpeg;base64,' prefix before sending
      const cleanBase64 = base64Image.split(',')[1];
      const response = await api.post('/scan/identify', { image: cleanBase64 });
      setMatches(response.data); 
    } catch (error) {
      console.error("Scan failed", error);
      setNotification({ open: true, message: 'Scan failed. Please try again.', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  /**
   * Resets the scanner state to allow the user to take another photo.
   */
  const handleRetake = () => {
    setImgSrc(null);
    setMatches([]);
  };

  /**
   * Opens the "Add to Inventory" modal for a specific card.
   * @param {Object} card - The card object selected from the scan results.
   */
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  /**
   * Submits the new inventory item to the backend.
   * Triggered by the CardDetailModal when the user clicks "Add".
   * * @param {Object} newItemPayload - The constructed payload containing card ID, warehouse ID, etc.
   */
  const handleAddCard = async (newItemPayload) => {
    try {
      await api.post('/inventory', newItemPayload);
      
      fetchWarehouses(); // Refresh counts to keep UI in sync
      setNotification({ open: true, message: 'Card added to Inventory!', type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error("Add failed:", error);
      const msg = error.response?.data || 'Failed to add card. Is the binder full?';
      setNotification({ open: true, message: msg, type: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
        Card Scanner
      </Typography>

      {/* SECTION 1: CAMERA AREA */}
      <Grid container justifyContent="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={8} lg={6}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#000', textAlign: 'center', borderRadius: 2 }}>
            <Box sx={{ 
              height: 400, 
              bgcolor: '#222', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              overflow: 'hidden', borderRadius: 1, mb: 2
            }}>
              {!imgSrc ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  height="100%" 
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <img src={imgSrc} alt="captured" style={{ height: '100%', objectFit: 'contain' }} />
              )}
            </Box>

            {!imgSrc ? (
              <Button 
                variant="contained" size="large" fullWidth 
                onClick={capture} startIcon={<CameraAltIcon />}
              >
                Capture Photo
              </Button>
            ) : (
              <Button 
                variant="outlined" size="large" fullWidth 
                onClick={handleRetake} startIcon={<ReplayIcon />} 
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#ccc' } }}
              >
                Scan Another
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION 2: RESULTS AREA */}
      {scanning && (
        <Box display="flex" flexDirection="column" alignItems="center" my={4}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>Identifying Card...</Typography>
        </Box>
      )}

      {!scanning && matches.length > 0 && (
        <Box>
           <Typography variant="h5" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
             Scan Results ({matches.length})
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

      {!scanning && imgSrc && matches.length === 0 && (
         <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">No matching cards found.</Typography>
            <Typography variant="body2" color="text.secondary">Try ensuring the card name and HP are clearly visible.</Typography>
         </Box>
      )}

      {/* SECTION 3: MODAL & NOTIFICATIONS */}
      <CardDetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
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