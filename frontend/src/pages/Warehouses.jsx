import { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Button, LinearProgress, Snackbar, Alert 
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import api from '../api/axiosConfig';

import WarehouseCard from '../components/WarehouseCard';
import WarehouseFormDialog from '../components/WarehouseFormDialog';
import StorageLocationManager from '../components/StorageLocationManager';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Modal State
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false); // Edit Store
  const [locationsModalOpen, setLocationsModalOpen] = useState(false); // Edit Binders

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error(error);
      showNotification("Failed to load warehouses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // --- Handlers for Warehouse CRUD ---

  const handleCreateWarehouse = async (warehouseData) => {
    try {
      await api.post('/warehouses', warehouseData);
      showNotification("Warehouse created!", "success");
      setWarehouseModalOpen(false);
      fetchWarehouses();
    } catch (error) {
      showNotification("Failed to create warehouse", "error");
    }
  };

  const handleUpdateWarehouse = async (warehouseData) => {
    try {
      await api.put('/warehouses', warehouseData);
      showNotification("Warehouse updated!", "success");
      setWarehouseModalOpen(false);
      fetchWarehouses();
    } catch (error) {
      showNotification("Failed to update warehouse", "error");
    }
  };

  const handleDeleteWarehouse = async (id) => {
    if (!confirm("Are you sure? This will delete the Store AND all binders/cards inside it!")) return;
    
    try {
      await api.delete(`/warehouses/${id}`);
      showNotification("Warehouse deleted successfully", "success");
      setWarehouseModalOpen(false); // Close the modal
      fetchWarehouses(); // Refresh the grid
    } catch (error) {
      showNotification("Failed to delete warehouse", "error");
    }
  };

  // --- Handlers for Storage Location CRUD (Inside the Manager Modal) ---

  const handleAddLocation = async (locationData) => {
    try {
      await api.post('/locations', locationData);
      showNotification("Location added!", "success");
      fetchWarehouses(); // Refresh to update the list inside the modal
    } catch (error) {
      showNotification("Failed to add location", "error");
    }
  };

  const handleUpdateLocation = async (locationData) => {
    try {
      await api.put('/locations', locationData);
      showNotification("Location updated!", "success");
      fetchWarehouses();
    } catch (error) {
      showNotification("Failed to update location", "error");
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!confirm("Delete this binder? All cards inside will be deleted!")) return;
    try {
      await api.delete(`/locations/${id}`);
      showNotification("Location deleted", "success");
      fetchWarehouses();
    } catch (error) {
      showNotification("Failed to delete location", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ open: true, message, type });
  };

  // Helper to find the currently selected warehouse data from the fresh list
  // This ensures the modal updates live when we add/remove binders
  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouse?.id) || selectedWarehouse;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      
      {/* Top Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Store Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddBusinessIcon />}
          onClick={() => { setSelectedWarehouse(null); setWarehouseModalOpen(true); }}
        >
          Add Store
        </Button>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {warehouses.map((wh) => (
          <Grid key={wh.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <WarehouseCard 
              warehouse={wh} 
              onEdit={(w) => { setSelectedWarehouse(w); setWarehouseModalOpen(true); }}
              onManageLocations={(w) => { setSelectedWarehouse(w); setLocationsModalOpen(true); }}
            />
          </Grid>
        ))}
      </Grid>

      {/* 1. Modal for Editing the Building itself */}
      <WarehouseFormDialog 
        open={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        warehouse={selectedWarehouse}
        onSubmit={selectedWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
        onDelete={handleDeleteWarehouse}
      />

      {/* 2. Modal for Managing Binders inside the building */}
      <StorageLocationManager 
        open={locationsModalOpen}
        onClose={() => setLocationsModalOpen(false)}
        warehouse={activeWarehouse}
        allWarehouses={warehouses}
        onAddLocation={handleAddLocation}
        onUpdateLocation={handleUpdateLocation}
        onDeleteLocation={handleDeleteLocation}
      />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.type} variant="filled">{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}