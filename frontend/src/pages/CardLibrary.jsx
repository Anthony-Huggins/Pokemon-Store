import { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Pagination, Typography, LinearProgress, Snackbar, Alert,
  Stack, TextField, MenuItem, Button, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import api from '../api/axiosConfig';
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal';

// Filter constants
const cardTypes = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless'];
const rarities = ["ACE SPEC Rare","Amazing Rare","Black White Rare","Classic Collection","Common","Crown","Double rare","Four Diamond","Full Art Trainer","Holo Rare","Holo Rare V","Holo Rare VMAX","Holo Rare VSTAR","Hyper rare","Illustration rare","LEGEND","Mega Hyper Rare","None","One Diamond","One Shiny","One Star","Radiant Rare","Rare","Rare Holo","Rare Holo LV.X","Rare PRIME","Secret Rare","Shiny rare","Shiny rare V","Shiny rare VMAX","Shiny Ultra Rare","Special illustration rare","Three Diamond","Three Star","Two Diamond","Two Shiny","Two Star","Ultra Rare","Uncommon"];

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
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1); // MUI Pagination is 1-indexed
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    cardType: '',
    rarity: '',
    setId: '',
    hp: ''
  });
  const PAGE_SIZE = 24; // 6 cols x 4 rows

  // Modal & Notification State
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
    }
  };

  /**
   * Fetches warehouses and sets on mount.
   */
  useEffect(() => {
    fetchWarehouses();
    api.get('/library/sets').then(res => setSets(res.data));
  }, []);

  /**
   * Fetches cards from the backend based on current filters and pagination.
   * 
   */
  const fetchCards = async () => {
    setLoading(true);
    try {
      // 1. Create a clean params object
      // We only want to include keys that actually have a value
      const activeFilters = {};
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          activeFilters[key] = filters[key];
        }
      });

      // 2. Determine Endpoint
      // If we have any active filters (keys > 0), use search. Otherwise get all.
      const hasActiveFilters = Object.keys(activeFilters).length > 0;
      const endpoint = hasActiveFilters ? '/library/search' : '/library';

      // 3. Send Request
      const response = await api.get(endpoint, {
        params: {
          page: page - 1, 
          size: PAGE_SIZE,
          ...activeFilters // <--- Only send the non-empty filters
        }
      });

      setCards(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 
   * Effect to fetch cards when page or filters change.
   */
  useEffect(() => {
    fetchCards();
  }, [page]);

  /**
   * Handles page changes from the Pagination component.
   * @param {React.ChangeEvent<unknown>} event - The change event.
   * @param {number} value - The new page number.
   */
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to page 1 on filter change
  };

  /**
   * Handles the Search button click to fetch cards based on current filters.
   *
   */
  const handleSearchClick = () => {
    setPage(1);
    fetchCards();
  };

  /**
   * Submits a new Inventory Item to the backend.
   * @param {object} newItemPayload - The JSON body constructed by the form.
   */
  const handleAddCard = async (newItemPayload) => {
    try {
      await api.post('/inventory', newItemPayload);

      fetchWarehouses(); // Refresh warehouse data to update counts

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
      
      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <FilterAltIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">Library</Typography>
          </Box>

          <TextField 
            label="Search Name" name="name" 
            value={filters.name} onChange={handleFilterChange} size="small" sx={{ flexGrow: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchClick();
              }
            }}
          />

          <TextField select label="Set" name="setId" value={filters.setId} onChange={handleFilterChange} size="small" sx={{ width: 150 }}>
            <MenuItem value="">All Sets</MenuItem>
            {sets.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>

          <TextField select label="Type" name="cardType" value={filters.cardType} onChange={handleFilterChange} size="small" sx={{ width: 120 }}>
            <MenuItem value="">All</MenuItem>
            {cardTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <TextField select label="Rarity" name="rarity" value={filters.rarity} onChange={handleFilterChange} size="small" sx={{ width: 120 }}>
            <MenuItem value="">All</MenuItem>
            {rarities.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          
          <TextField 
            label="HP" // Just "HP" implies exact
            name="hp"  // Match state name
            type="number"
            value={filters.hp} 
            onChange={handleFilterChange} 
            size="small" 
            sx={{ width: 80 }} // Made slightly narrower
            InputProps={{ inputProps: { min: 0, step: 10 } }}
          />

          <Button variant="contained" onClick={handleSearchClick}>Search</Button>
        </Stack>
      </Paper>
      
      {/* Top Bar (Pagination) */}
      {/* PAGINATION (Top) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); window.scrollTo({top:0, behavior:'smooth'}); }} color="primary" showFirstButton showLastButton />
      </Box>

    

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