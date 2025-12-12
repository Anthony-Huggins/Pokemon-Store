import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Accordion, AccordionSummary, AccordionDetails, 
  Grid, IconButton, CircularProgress, Dialog, DialogContent, Stack, Paper, Alert, Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import FolderIcon from '@mui/icons-material/Folder';

import api from '../api/axiosConfig';
import InventoryCard from '../components/InventoryCard';
import WarehouseFormDialog from '../components/WarehouseFormDialog';
import StorageLocationFormDialog from '../components/StorageLocationFormDialog';
import CardDetailModal from '../components/CardDetailModal'; // Ensure this is imported

/**
 * Warehouses Page (Dashboard)
 * Displays a hierarchical view of Warehouses -> Storage Locations -> Cards.
 */
export default function Dashboard() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Warehouse/Location Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'WAREHOUSE' or 'LOCATION'
  const [selectedItem, setSelectedItem] = useState(null); // The Warehouse/Location being edited
  const [parentId, setParentId] = useState(null); // If adding a location, we need the warehouse ID

  // --- Card Detail Modal State ---
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null); // The Card Item being edited
  
  // --- Notifications ---
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      console.error("Failed to fetch warehouses", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Calculate Counts ---
  const getStorageSummary = (locations) => {
    if (!locations || locations.length === 0) return "Empty";
    
    const counts = locations.reduce((acc, loc) => {
      const type = loc.type ? loc.type.replace('_', ' ').toLowerCase() : "unknown";
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
      
      acc[formattedType] = (acc[formattedType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([type, count]) => `${count} ${type}(s)`)
      .join(', ');
  };

  // --- WAREHOUSE HANDLERS ---
  const handleEdit = (e, item, type) => {
    e.stopPropagation(); 
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);
  };

  const handleDelete = async (e, id, type) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const endpoint = type === 'WAREHOUSE' ? `/warehouses/${id}` : `/locations/${id}`;
      await api.delete(endpoint);
      fetchWarehouses(); 
      setNotification({ open: true, message: `${type} deleted successfully`, type: 'success' });
    } catch (err) {
      console.error("Delete failed", err);
      setNotification({ open: true, message: "Delete failed", type: 'error' });
    }
  };

  const handleAddLocation = (e, warehouseId) => {
    e.stopPropagation();
    setSelectedItem(null); 
    setParentId(warehouseId);
    setModalType('LOCATION');
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    fetchWarehouses();
  };

  // --- CARD HANDLERS (Matching Inventory.jsx) ---
  const handleCardClick = (item) => {
    setSelectedCard(item);
    setCardModalOpen(true);
  };

  const handleSaveCard = async (updatedItem) => {
    try {
      await api.put('/inventory', updatedItem);
      
      // Refresh warehouses to update capacity counts (e.g. 13/50 -> 14/50)
      fetchWarehouses();
      
      setNotification({ open: true, message: "Card updated!", type: 'success' });
      setCardModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      setNotification({ open: true, message: 'Storage location full. Please pick a diffrent one.', type: 'error' });
    }
  };

  const handleDeleteCard = async (itemId) => {
    if (!confirm("Delete this card from inventory?")) return;
    try {
      await api.delete(`/inventory/${itemId}`);
      
      fetchWarehouses(); // Refresh counts
      
      setNotification({ open: true, message: "Card deleted.", type: 'success' });
      setCardModalOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      setNotification({ open: true, message: "Failed to delete card.", type: 'error' });
      
    }
  };

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Stores</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => { 
            setSelectedItem(null); 
            setModalType('WAREHOUSE'); // 1. Set Type
            setModalOpen(true);        // 2. Open
          }}
        >
          New Store
        </Button>
      </Box>

      {/* LEVEL 1: WAREHOUSES ACCORDION LIST */}
      {warehouses.map((warehouse) => (
        <Accordion 
          key={warehouse.id} 
          disableGutters
          sx={{ mb: 2, borderRadius: 2, boxShadow: 2, border: '2px solid #293445', overflow: 'hidden', '&:before': { display: 'none' }}} 
        >
           {/* ... Accordion Content (Summary, Details, LocationAccordion) ... */}
           {/* (This part of your code was fine, no changes needed here) */}
           <AccordionSummary expandIcon={<ExpandMoreIcon color='primary' />}>
              <Grid container alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%', pr: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <WarehouseIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>{warehouse.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{warehouse.location}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={5} display="flex" justifyContent={{ xs: 'flex-start', sm: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                     {getStorageSummary(warehouse.storageLocations)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
                  <Box onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={(e) => handleEdit(e, warehouse, 'WAREHOUSE')} sx={{ mr: 1 }} component="div">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={(e) => handleDelete(e, warehouse.id, 'WAREHOUSE')} component="div">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
           </AccordionSummary>

           <AccordionDetails sx={{ bgcolor: '#0f172a', p: 3, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
               <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                 Storage Locations
               </Typography>
               <Button 
                 variant="contained"  startIcon={<AddIcon />} 
                 onClick={(e) => handleAddLocation(e, warehouse.id)}
                 
               >
                 Add Location
               </Button>
             </Box>
             
             {/* ... Storage Locations List ... */}
             <Stack spacing={1}>
                {warehouse.storageLocations?.map((location) => (
                  <LocationAccordion 
                    key={location.id} 
                    location={location} 
                    onEdit={(e) => handleEdit(e, location, 'LOCATION')}
                    onDelete={(e) => handleDelete(e, location.id, 'LOCATION')}
                    onCardClick={handleCardClick}
                  />
                ))}
             </Stack>
           </AccordionDetails>
        </Accordion>
      ))}

      {/* --- MODALS SECTION (FIXED) --- */}

      {/* 1. Warehouse Form Dialog */}
      {/* We render this DIRECTLY, not inside another <Dialog> */}
      {modalType === 'WAREHOUSE' && (
        <WarehouseFormDialog 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
          warehouse={selectedItem}
          // Match the props you used in Warehouses.jsx
          onSubmit={(data) => {
             const method = data.id ? 'put' : 'post';
             const url = data.id ? '/warehouses' : '/warehouses'; 
             api[method](url, data).then(handleFormSuccess).catch(console.error);
          }}
          onDelete={(id) => handleDelete({ stopPropagation: ()=>{} }, id, 'WAREHOUSE')}
        />
      )}

      {/* 2. Storage Location Form Dialog */}
      {/* Also rendered DIRECTLY */}
      {modalType === 'LOCATION' && (
        <StorageLocationFormDialog 
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          location={selectedItem}
          warehouseId={parentId} 
          warehouses={warehouses}
          onSuccess={handleFormSuccess}
          onSubmit={(data) => {
             const method = data.id ? 'put' : 'post';
             const url = data.id ? '/locations' : '/locations';
             api[method](url, data).then(handleFormSuccess).catch(console.error);
          }}
          onDelete={(id) => handleDelete({ stopPropagation: ()=>{} }, id, 'LOCATION')}
        />
      )}

      {/* 3. Card Detail Modal */}
      <CardDetailModal 
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        item={selectedCard}
        warehouses={warehouses}
        onSubmit={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      {/* 4. Notifications */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.type} variant="filled">{notification.message}</Alert>
      </Snackbar>

    </Container>
  );
}

/**
 * Nested Component for Level 2 (Storage Location)
 */
function LocationAccordion({ location, onEdit, onDelete, onCardClick }) {
  const [expanded, setExpanded] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/inventory/location/${location.id}`);
        setCards(res.data);
      } catch (err) {
        console.error("Failed to load cards", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (expanded) {
      fetchCards();
    }
  }, [expanded, location]);

  const formatType = (type) => {
    if (!type) return "Unknown";
    return type.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleExpand = async (e, isExpanded) => {
    setExpanded(isExpanded);
    if (isExpanded && cards.length === 0) {
      setLoading(true);
      try {
        const res = await api.get(`/inventory/location/${location.id}`);
        setCards(res.data);
      } catch (err) {
        console.error("Failed to load cards", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getCapacityColor = (current, max) => {
    if (!max) return 'text.secondary';
    const ratio = current / max;
    if (ratio >= 0.9) return 'error.main';
    if (ratio >= 0.75) return 'warning.main';
    return 'success.main';
  };
  
  const currentCount = location.currentCount || cards.length || 0;
  const capacityColor = getCapacityColor(currentCount, location.maxCapacity);

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleExpand} 
      sx={{ 
        '&:before': { display: 'none' },
        boxShadow: 1,
        borderRadius: '8px !important', 
        border: '1px solid #293445',
        bgcolor: '#293445' 
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon color='primary'/>}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
          <Grid item xs={12} sm={4} display="flex" alignItems="center">
            <FolderIcon color="primary" sx={{ mr: 2, fontSize: 24 }} />
            <Typography fontWeight="bold" variant="subtitle1">{location.name}</Typography>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Typography variant="body2" color="text.secondary" component="div">
               Type: <Box component="span" fontWeight="bold" sx={{ mr: 2 }}>{formatType(location.type)}</Box>
               Capacity: 
               <Box component="span" sx={{ color: capacityColor, fontWeight: '900', ml: 0.5, bgcolor: 'rgba(0,0,0,0.04)', px: 1, py: 0.5, borderRadius: 1 }}>
                 {currentCount} / {location.maxCapacity}
               </Box>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
            <Box onClick={(e) => e.stopPropagation()}>
              <IconButton size="small" onClick={onEdit} component="div"><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" color="error" onClick={onDelete} component="div"><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {loading ? (
           <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
        ) : (
          <>
            {cards.length === 0 ? (
               <Typography variant="body2" color="text.secondary" align="center" py={2}>
                 No cards in this location.
               </Typography>
            ) : (
               <Grid container spacing={2}>
                 {cards.map(item => (
                   <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                      <InventoryCard 
                        item={item} 
                        onClick={() => onCardClick(item)} // Trigger the modal
                      /> 
                   </Grid>
                 ))}
               </Grid>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}