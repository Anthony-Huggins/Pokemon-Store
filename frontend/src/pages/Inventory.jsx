import { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, TextField, MenuItem, Button, 
  Typography, InputAdornment, LinearProgress, Stack, Snackbar, Alert,
  IconButton, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import api from '../api/axiosConfig';

// Import Components
import InventoryCard from '../components/InventoryCard';
import CardDetailModal from '../components/CardDetailModal';

/**
 * The main Inventory Management Page.
 * <p>
 * Displays a searchable, sortable grid of all physical cards owned by the store.
 * Allows filtering by Warehouse and Binder (Cascading Dropdowns) and sorting by various metrics.
 * Handles opening the Detail Modal for editing or moving items.
 * </p>
 *
 * @component
 */
export default function Inventory() {
  // --- Data State ---
  /** @type {Array<Object>} List of inventory items fetched from the backend. */
  const [items, setItems] = useState([]);
  
  /** @type {Array<Object>} Hierarchical list of warehouses used for the filter dropdowns. */
  const [warehouses, setWarehouses] = useState([]); 
  
  /** @type {boolean} Loading indicator for API requests. */
  const [loading, setLoading] = useState(false);
  
  // --- UI State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // --- Filter & Sort State ---
  /** * Active filters for the query.
   * Note: 'locationId' depends on 'warehouseId' being selected first.
   */
  const [filters, setFilters] = useState({
    name: '',
    warehouseId: '',
    locationId: '',
  });

  /** @type {HTMLElement|null} Anchor element for the Sort Menu popup. */
  const [sortAnchor, setSortAnchor] = useState(null); 
  
  /** Current active sort configuration. Default: Date Modified Descending. */
  const [currentSort, setCurrentSort] = useState({ 
    field: 'updatedAt', 
    dir: 'desc', 
    label: 'Date Modified (Newest)' 
  });

  // --- Data Fetching Methods ---

  /**
   * Fetches the hierarchy of Warehouses and Storage Locations.
   * Called on mount and after mutations to ensure "Capacity Counts" (e.g., 45/50) are accurate.
   */
  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
    }
  };

  /**
   * Fetches inventory items based on current filters and sort order.
   * Hits the `/api/v1/inventory/search` endpoint.
   */
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Build a clean params object (exclude empty strings)
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters.locationId) params.locationId = filters.locationId;
      
      // Construct Sort parameter: "field,direction" (Spring Data JPA format)
      params.sort = `${currentSort.field},${currentSort.dir}`;

      const response = await api.get('/inventory', { params });
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial load: Fetch warehouse hierarchy immediately.
   */
  useEffect(() => {
    fetchWarehouses();
  }, []);

  /**
   * Reactive Fetch: Re-runs the inventory search whenever filters or sort order change.
   * Includes a 300ms debounce to prevent API spam while typing.
   */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchInventory();
    }, 300);
    return () => clearTimeout(delay);
  }, [filters, currentSort]);

  // --- Event Handlers ---

  /**
   * Handles changes to filter inputs (Name, Warehouse, Binder).
   * Implements Cascading Logic: If Warehouse changes, clear the Binder selection.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'warehouseId') {
      // Cascade: Clear child filter when parent changes
      setFilters(prev => ({ ...prev, warehouseId: value, locationId: '' }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Updates the sort state and closes the menu.
   * @param {string} field - The Java field name to sort by (e.g., 'setPrice').
   * @param {string} dir - Direction ('asc' or 'desc').
   * @param {string} label - Human-readable label for the button.
   */
  const handleSortSelect = (field, dir, label) => {
    setCurrentSort({ field, dir, label });
    setSortAnchor(null);
  };

  /**
   * Opens the detail modal for a clicked item.
   * @param {Object} item - The inventory item object.
   */
  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  /**
   * Submits updates to the backend (PUT /inventory).
   * Updates local state immediately for responsiveness, then refreshes warehouses to update counts.
   * @param {Object} updatedItem - The modified item object.
   */
  const handleSaveItem = async (updatedItem) => {
    try {
      const response = await api.put('/inventory', updatedItem);
      
      // Optimistic UI update: Swap the item in the list
      setItems(prev => prev.map(i => i.id === updatedItem.id ? response.data : i));
      setSelectedItem(response.data); 
      
      // Refresh warehouse counts (e.g. 25/50 -> 26/50)
      fetchWarehouses(); 
      
      // refetch the inventory to ensure all filters/sorts are respected
      fetchInventory();

      setNotification({ open: true, message: "Item updated!", type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      setNotification({ open: true, message: 'Storage location full. Please pick a diffrent one.', type: 'error' });
    }
  };
  /**
   * Deletes an item (DELETE /inventory/{id}).
   * Removes item from local state and refreshes warehouse counts.
   * @param {number} itemId - The ID of the item to delete.
   */
  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this card?")) return;
    try {
      await api.delete(`/inventory/${itemId}`);
      
      setItems(prev => prev.filter(i => i.id !== itemId));

      fetchWarehouses();
      
       // refetch the inventory to ensure all filters/sorts are respected
      fetchInventory();
      
      setNotification({ open: true, message: "Item deleted.", type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      setNotification({ open: true, message: "Failed to delete item.", type: 'error' });
    }
  };

  /**
   * Helper to derive the list of binders to show in the filter dropdown.
   * If a warehouse is selected, show only its binders. Otherwise, show all.
   */
  const visibleLocations = filters.warehouseId 
    ? warehouses.find(w => w.id === filters.warehouseId)?.storageLocations || []
    : warehouses.flatMap(w => w.storageLocations || []);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      
      {/* --- TOP BAR: FILTERS & SORT --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          
          {/* Sort Menu Button */}
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={(e) => setSortAnchor(e.currentTarget)}
            sx={{ minWidth: 200, justifyContent: 'space-between' }}
          >
            {currentSort.label}
          </Button>
          
          {/* Sort Menu Popup */}
          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
          >
            <MenuItem onClick={() => handleSortSelect('updatedAt', 'desc', 'Date Modified (Newest)')}>
              <ListItemIcon><CalendarMonthIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Date Modified (Newest)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortSelect('updatedAt', 'asc', 'Date Modified (Oldest)')}>
              <ListItemIcon><CalendarMonthIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Date Modified (Oldest)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortSelect('effectivePrice', 'desc', 'Price (High to Low)')}>
              <ListItemIcon><AttachMoneyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Price (High &rarr; Low)</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => handleSortSelect('effectivePrice', 'asc', 'Price (Low to High)')}>
              <ListItemIcon><AttachMoneyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Price (Low &rarr; High)</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleSortSelect('cardName', 'asc', 'Name (A to Z)')}>
              <ListItemIcon><SortByAlphaIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Name (A &rarr; Z)</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => handleSortSelect('cardName', 'desc', 'Name (Z to A)')}>
              <ListItemIcon><SortByAlphaIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Name (Z &rarr; A)</ListItemText>
            </MenuItem>
          </Menu>

          {/* Search Input */}
          <TextField 
            label="Search Inventory" 
            name="name" 
            value={filters.name} 
            onChange={handleFilterChange} 
            size="small"
            sx={{ flexGrow: 1 }} 
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />

          {/* Warehouse Dropdown */}
          <TextField 
            select 
            label="Warehouse" 
            name="warehouseId" 
            value={filters.warehouseId} 
            onChange={handleFilterChange} 
            size="small" 
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Warehouses</MenuItem>
            {warehouses.map(w => (
              <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
            ))}
          </TextField>

          {/* Binder Dropdown (Filtered by Warehouse) */}
          <TextField 
            select 
            label="Binder / Box" 
            name="locationId" 
            value={filters.locationId} 
            onChange={handleFilterChange} 
            size="small" 
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Locations</MenuItem>
            {visibleLocations.map(loc => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name} {filters.warehouseId ? '' : `(${loc.warehouse?.name})`}
              </MenuItem>
            ))}
          </TextField>
          
        </Stack>
      </Paper>

      {/* --- MAIN CONTENT GRID --- */}
    
      
      <Grid container spacing={2}>
        {items.map((item) => (
          // Grid v6 Syntax: using 'size' object for responsiveness
          <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <InventoryCard item={item} onClick={handleCardClick} />
          </Grid>
        ))}
      </Grid>
      
      {/* Empty State Message */}
      {!loading && items.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 5, color: 'text.secondary' }}>
          No cards found matching your filters.
        </Typography>
      )}

      {/* --- MODAL --- */}
      <CardDetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        item={selectedItem}
        warehouses={warehouses} // Pass fresh warehouse data for the move dropdown
        onSubmit={handleSaveItem}
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