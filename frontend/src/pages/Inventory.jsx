import { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, TextField, MenuItem, Button, 
  Typography, InputAdornment, LinearProgress, Stack, Snackbar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import api from '../api/axiosConfig';

// Import Components
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal';

/**
 * Main Inventory Page.
 * Displays a grid of all cards owned by the store.
 * Handles fetching data, filtering, and opening the detail modal.
 *
 * @component
 */
export default function Inventory() {
  // --- Data State ---
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Needed for the modal dropdowns
  const [loading, setLoading] = useState(false);
  
  // --- UI State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // --- Filter State (Visual placeholders for now) ---
  const [filters, setFilters] = useState({
    name: '',
    cardType: '',
    rarity: '',
  });

  /**
   * Fetches all inventory items and the warehouse hierarchy on mount.
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Parallel fetch for speed
        const [itemsRes, warehousesRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/warehouses')
        ]);
        
        setItems(itemsRes.data);
        setWarehouses(warehousesRes.data);
      } catch (error) {
        console.error("Failed to load inventory data:", error);
        showNotification("Failed to load data. Check backend.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Opens the detail modal for a specific card.
   * @param {Object} item - The inventory item clicked.
   */
  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  /**
   * Handles saving changes from the Modal (PUT request).
   * @param {Object} updatedItem - The modified item object from the form.
   */
  const handleSaveItem = async (updatedItem) => {
    try {
      const response = await api.put('/inventory', updatedItem);
      
      // Update local state immediately (Optimistic UI update)
      setItems(prev => prev.map(i => i.id === updatedItem.id ? response.data : i));
      setSelectedItem(response.data); // Update modal view
      
      showNotification("Item updated successfully!", "success");
      setModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      showNotification("Failed to update item.", "error");
    }
  };

  /**
   * Handles deleting an item from the Modal (DELETE request).
   * @param {number} itemId - The ID of the item to delete.
   */
  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      await api.delete(`/inventory/${itemId}`);
      
      // Remove from local list
      setItems(prev => prev.filter(i => i.id !== itemId));
      
      showNotification("Item deleted.", "success");
      setModalOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      showNotification("Failed to delete item.", "error");
    }
  };

  // Helper for snackbar
  const showNotification = (message, type) => {
    setNotification({ open: true, message, type });
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      
      {/* --- TOP BAR: FILTERS --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <FilterAltIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">Inventory</Typography>
          </Box>

          <TextField 
            label="Search Card Name" 
            value={filters.name} 
            onChange={(e) => setFilters({...filters, name: e.target.value})} 
            size="small"
            sx={{ flexGrow: 1 }} 
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />

          <TextField select label="Type" value={filters.cardType} onChange={(e) => setFilters({...filters, cardType: e.target.value})} size="small" sx={{ minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Fire">Fire</MenuItem>
            <MenuItem value="Water">Water</MenuItem>
          </TextField>
          
          <Button variant="contained" onClick={() => window.location.reload()}>Refresh</Button>
        </Stack>
      </Paper>

      {/* --- MAIN CONTENT: CARD GRID --- */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <Grid container spacing={2}>
        {items.map((item) => (
          // Grid v6 Syntax: using 'size' object
          <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <InventoryCard item={item} onClick={handleCardClick} />
          </Grid>
        ))}
      </Grid>
      
      {!loading && items.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 5, color: 'text.secondary' }}>
          No cards found in inventory.
        </Typography>
      )}

      {/* --- MODAL --- */}
      <CardDetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        item={selectedItem}
        warehouses={warehouses} // Passing the hierarchy for the dropdowns
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      {/* --- NOTIFICATIONS --- */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.type} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}