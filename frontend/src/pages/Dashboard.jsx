import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Accordion, AccordionSummary, AccordionDetails, 
  Grid, IconButton, Chip, Divider, CircularProgress, Dialog, DialogContent, Stack, Paper
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

/**
 * Warehouses Page
 * Displays a hierarchical view of Warehouses -> Storage Locations -> Cards.
 */
export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'WAREHOUSE' or 'LOCATION'
  const [selectedItem, setSelectedItem] = useState(null); // The object being edited
  const [parentId, setParentId] = useState(null); // If adding a location, we need the warehouse ID

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
      // Clean up the type string (e.g. "GRADED_CASE" -> "Graded Case")
      const type = loc.type ? loc.type.replace('_', ' ').toLowerCase() : "unknown";
      // Capitalize first letter
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
      
      acc[formattedType] = (acc[formattedType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([type, count]) => `${count} ${type}(s)`)
      .join(', ');
  };

  // --- HANDLERS ---

  const handleEdit = (e, item, type) => {
    e.stopPropagation(); // Prevent accordion from toggling
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
      fetchWarehouses(); // Refresh list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleAddLocation = (e, warehouseId) => {
    e.stopPropagation();
    setSelectedItem(null); // New item
    setParentId(warehouseId);
    setModalType('LOCATION');
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    fetchWarehouses();
  };

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Warehouses</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => { setSelectedItem(null); setModalType('WAREHOUSE'); setModalOpen(true); }}
        >
          New Warehouse
        </Button>
      </Box>

      {/* LEVEL 1: WAREHOUSES */}
      {warehouses.map((warehouse) => (
        <Accordion 
          key={warehouse.id} 
          disableGutters
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            boxShadow: 2,
            border: '2px solid #293445',
            overflow: 'hidden', // Ensures corners stay rounded when expanded
            '&:before': { display: 'none' }, // Removes the default MUI separator line
          }} 
        >
          
          {/* LEVEL 1 SUMMARY */}
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%', pr: 1 }}>
              
              {/* LEFT: Icon & Name */}
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <WarehouseIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                      {warehouse.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {warehouse.location}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* CENTER: Storage Stats */}
              <Grid item xs={12} sm={5} display="flex" justifyContent={{ xs: 'flex-start', sm: 'center' }}>
                <Chip 
                  label={getStorageSummary(warehouse.storageLocations)} 
                  size="small" 
                  variant="outlined" 
                  sx={{ borderColor: 'divider', color: 'text.secondary' }}
                />
              </Grid>

              {/* RIGHT: Actions (Edit/Delete) */}
              <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
                <IconButton size="small" onClick={(e) => handleEdit(e, warehouse, 'WAREHOUSE')} sx={{ mr: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={(e) => handleDelete(e, warehouse.id, 'WAREHOUSE')}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>

            </Grid>
          </AccordionSummary>

          {/* LEVEL 2: STORAGE LOCATIONS (Expanded Area) */}
          <AccordionDetails sx={{ bgcolor: '#0f172a', p: 3, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            
            {/* NEW LOCATION HEADER ROW */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Storage Locations
              </Typography>
              
              {/* Add Location Button - Now Here! */}
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />} 
                onClick={(e) => handleAddLocation(e, warehouse.id)}
                sx={{ bgcolor: 'background.paper' }}
              >
                Add Location
              </Button>
            </Box>

            {(!warehouse.storageLocations || warehouse.storageLocations.length === 0) && (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed #ccc' }} elevation={0}>
                <Typography variant="body2" color="text.secondary">
                  No storage locations created yet.
                </Typography>
                <Button 
                  size="small" 
                  sx={{ mt: 1 }} 
                  onClick={(e) => handleAddLocation(e, warehouse.id)}
                >
                  Create your first container
                </Button>
              </Paper>
            )}

            <Stack spacing={1}>
              {warehouse.storageLocations?.map((location) => (
                <LocationAccordion 
                  key={location.id} 
                  location={location} 
                  onEdit={(e) => handleEdit(e, location, 'LOCATION')}
                  onDelete={(e) => handleDelete(e, location.id, 'LOCATION')}
                />
              ))}
            </Stack>

          </AccordionDetails>
        </Accordion>
      ))}

      {/* SHARED MODAL FOR FORMS */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {modalType === 'WAREHOUSE' ? (
            <WarehouseFormDialog 
              warehouse={selectedItem} 
              onSuccess={handleFormSuccess} 
              onClose={() => setModalOpen(false)}
              onSubmit={(data) => {
                 // Determine create vs update call here or in the Dialog?
                 // Based on your Dialog code, it calls 'onSubmit' with payload.
                 // We need to handle the API call here if the Dialog doesn't do it.
                 // Let's assume the Dialog just passes data back.
                 const method = data.id ? 'put' : 'post';
                 const url = data.id ? '/warehouses' : '/warehouses'; 
                 // Note: Usually PUT /warehouses or PUT /warehouses/{id}
                 // Adjust based on your API. Assuming standard POST/PUT to resource root or specific ID
                 api[method](url, data).then(handleFormSuccess).catch(console.error);
              }}
              onDelete={(id) => handleDelete({ stopPropagation: ()=>{} }, id, 'WAREHOUSE')}
            />
          ) : (
            <StorageLocationFormDialog 
              location={selectedItem}
              warehouseId={parentId} 
              onSuccess={handleFormSuccess}
              onClose={() => setModalOpen(false)}
              onSubmit={(data) => {
                 const method = data.id ? 'put' : 'post';
                 const url = data.id ? '/locations' : '/locations';
                 api[method](url, data).then(handleFormSuccess).catch(console.error);
              }}
              onDelete={(id) => handleDelete({ stopPropagation: ()=>{} }, id, 'LOCATION')}
            />
          )}
        </DialogContent>
      </Dialog>

    </Container>
  );
}

/**
 * Nested Component for Level 2 (Storage Location)
 * Handles fetching its own cards when expanded.
 */
function LocationAccordion({ location, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cards ONLY when user expands this location
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

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleExpand} 
      sx={{ 
        '&:before': { display: 'none' },
        boxShadow: 1,
        borderRadius: '8px !important', // Force rounded corners on child items too

      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
          
          <Grid item xs={12} sm={4} display="flex" alignItems="center">
            <FolderIcon color="action" sx={{ mr: 2, fontSize: 24 }} />
            <Box>
                <Typography fontWeight="bold" variant="subtitle1">{location.name}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Typography variant="body2" color="text.secondary">
               Type: {location.type} • Capacity: {cards.length}/{location.capacity}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
            <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" color="error" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton>
          </Grid>

        </Grid>
      </AccordionSummary>

      {/* LEVEL 3: INVENTORY CARDS */}
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
                   <Grid item key={item.id} xs={6} sm={4} md={3} lg={2}>
                      <InventoryCard item={item} /> 
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