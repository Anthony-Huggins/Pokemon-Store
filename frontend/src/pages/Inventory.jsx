import { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, TextField, MenuItem, Button, 
  Typography, InputAdornment, LinearProgress, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import api from '../api/axiosConfig';

import Card from '../components/Card';
import CardDetailModal from '../components/CardDetailModal';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter State (Visual only for now, until backend search is ready)
  const [filters, setFilters] = useState({
    name: '',
    cardType: '',
    rarity: '',
    locationType: '',
  });

  // Fetch ALL items on load
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Calling our new "Get All" endpoint
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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

          {/* Search Name */}
          <TextField 
            label="Search Card Name" 
            name="name" 
            value={filters.name} 
            onChange={handleFilterChange} 
            size="small"
            sx={{ flexGrow: 1 }} // Takes up available space
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />

          {/* Filters (Visual Placeholders for now) */}
          <TextField select label="Type" name="cardType" value={filters.cardType} onChange={handleFilterChange} size="small" sx={{ minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Fire">Fire</MenuItem>
            <MenuItem value="Water">Water</MenuItem>
          </TextField>

          <TextField select label="Rarity" name="rarity" value={filters.rarity} onChange={handleFilterChange} size="small" sx={{ minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Rare Holo">Holo</MenuItem>
            <MenuItem value="Secret Rare">Secret</MenuItem>
          </TextField>
          
          <Button variant="contained" onClick={fetchInventory}>
             Refresh
          </Button>
        </Stack>
      </Paper>

      {/* --- MAIN CONTENT: CARD GRID --- */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <Grid container spacing={2}>
        {items.map((item) => (
        
            <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Card item={item} onClick={handleCardClick} />
            </Grid>
        ))}
      </Grid>
      
      {!loading && items.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 5, color: 'text.secondary' }}>
          No cards found in inventory.
        </Typography>
      )}

      {/* Details Modal */}
      <CardDetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        item={selectedItem} 
      />
    </Box>
  );
}