import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Pagination, Typography, LinearProgress, Snackbar, Alert } from '@mui/material';
import api from '../api/axiosConfig';
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal';

/**
 * Main Card Library Page.
 * <p>
 * Displays a paginated grid of the master card database.
 * Allows users to browse all 22,000+ cards and add specific instances to their inventory.
 * </p>
 *
 * @component
 */
export default function CardLibrary() {
  // --- State ---
  const [cards, setCards] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Needed for the "Add to Inventory" dropdowns
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1); // MUI Pagination is 1-indexed
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 24; // 6 cols x 4 rows

  // Modal & Notification State
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  /**
   * Fetches the current page of cards and the warehouse list on mount or page change.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Cards (Page is 0-indexed in backend, 1-indexed in MUI)
        const cardsRes = await api.get(`/library?page=${page - 1}&size=${PAGE_SIZE}`);
        setCards(cardsRes.data.content);
        setTotalPages(cardsRes.data.totalPages);

        // Fetch Warehouses (for the Add Modal dropdowns) - only need to do this once technically
        if (warehouses.length === 0) {
            const whRes = await api.get('/warehouses');
            setWarehouses(whRes.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]); 

  /**
   * Handles pagination clicks.
   * @param {object} event - The change event.
   * @param {number} value - The new page number.
   */
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for better UX
  };

  /**
   * Submits a new Inventory Item to the backend.
   * @param {object} newItemPayload - The JSON body constructed by the form.
   */
  const handleAddCard = async (newItemPayload) => {
    try {
      await api.post('/inventory', newItemPayload);
      setNotification({ open: true, message: 'Card added to Inventory!', type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error("Add failed:", error);
      // Extract specific error message from backend if available
      const msg = error.response?.data || 'Failed to add card. Is the binder full?';
      setNotification({ open: true, message: msg, type: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Top Bar (Pagination) */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Card Library</Typography>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange} 
          color="primary" 
          showFirstButton 
          showLastButton 
        />
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <InventoryCard 
              card={card} 
              onClick={() => { setSelectedCard(card); setModalOpen(true); }} 
            />
          </Grid>
        ))}
      </Grid>

      {/* Add Modal */}
      <CardDetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        card={selectedCard} // Pass 'card' to trigger Library Mode
        warehouses={warehouses}
        onSubmit={handleAddCard} // Map the Add handler to onSubmit
        // onDelete is not passed, so the delete button will be hidden automatically
      />

      {/* Notifications */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.type} variant="filled">{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}