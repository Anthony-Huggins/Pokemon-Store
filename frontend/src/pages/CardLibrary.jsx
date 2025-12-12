import { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Pagination, Typography, LinearProgress, Snackbar, Alert,
  Stack, TextField, MenuItem, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../api/axiosConfig';
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal';

// Filter constants
const cardTypes = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless'];
const rarities = ["ACE SPEC Rare","Amazing Rare","Black White Rare","Classic Collection","Common","Crown","Double rare","Four Diamond","Full Art Trainer","Holo Rare","Holo Rare V","Holo Rare VMAX","Holo Rare VSTAR","Hyper rare","Illustration rare","LEGEND","Mega Hyper Rare","None","One Diamond","One Shiny","One Star","Radiant Rare","Rare","Rare Holo","Rare Holo LV.X","Rare PRIME","Secret Rare","Shiny rare","Shiny rare V","Shiny rare VMAX","Shiny Ultra Rare","Special illustration rare","Three Diamond","Three Star","Two Diamond","Two Shiny","Two Star","Ultra Rare","Uncommon"];

/**
 * Main Card Library Page.
 * Displays a paginated grid of the master card database.
 * Allows users to browse all 22,000+ cards and add specific instances to their inventory.
 */
export default function CardLibrary() {
  // --- State ---
  const [cards, setCards] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    cardType: '',
    rarity: '',
    setId: '',
    hp: ''
  });
  const PAGE_SIZE = 24;

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

  useEffect(() => {
    fetchWarehouses();
    api.get('/library/sets').then(res => setSets(res.data));
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          activeFilters[key] = filters[key];
        }
      });

      const endpoint = '/library';

      const response = await api.get(endpoint, {
        params: {
          page: page - 1, 
          size: PAGE_SIZE,
          ...activeFilters
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

  // --- AUTOMATIC SEARCH EFFECT ---
  // This replaces the old useEffect that only watched 'page'.
  // Now it watches 'page' AND 'filters'.
  useEffect(() => {
    // We use a timer (debounce) to wait until you stop typing before searching.
    // This prevents the app from freezing or spamming the server while you type "Charizard".
    const timer = setTimeout(() => {
      fetchCards();
    }, 500); // 500ms delay

    // Cleanup: If you type again before 500ms, cancel the previous timer.
    return () => clearTimeout(timer);
  }, [page, filters]); 

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to page 1 on filter change
  };

  const handleAddCard = async (newItemPayload) => {
    try {
      await api.post('/inventory', newItemPayload);
      fetchWarehouses(); 
      setNotification({ open: true, message: 'Card added to Inventory!', type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error("Add failed:", error);
      const msg = 'Storage location full. Please pick a different one.';
      setNotification({ open: true, message: msg, type: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      
      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="h6" fontWeight="bold">Card Library</Typography>
          </Box>

          <TextField 
            label="Search Name" name="name" 
            value={filters.name} onChange={handleFilterChange} size="small" sx={{ flexGrow: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            // Removed onKeyDown (Enter key) as it's no longer needed
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
            label="HP"
            name="hp"
            type="number"
            value={filters.hp} 
            onChange={handleFilterChange} 
            size="small" 
            sx={{ width: 80 }}
            InputProps={{ inputProps: { min: 0, step: 10 } }}
          />
          
          {/* Removed the "Search" Button */}
        </Stack>
      </Paper>
      
      {/* PAGINATION */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); window.scrollTo({top:0, behavior:'smooth'}); }} color="primary" showFirstButton showLastButton />
      </Box>

      {/* CARD GRID */}
      <Grid container spacing={2}>
        {cards.map((card) => (
          // Grid v6 syntax or v5 syntax depending on your setup. Assuming v6 based on your provided code "size={{...}}"
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
        card={selectedCard} 
        warehouses={warehouses}
        onSubmit={handleAddCard} 
      />

      {/* Notifications */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.type} variant="filled">{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}