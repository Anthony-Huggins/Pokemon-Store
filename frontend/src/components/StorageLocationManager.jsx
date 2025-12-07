import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, IconButton, 
  List, ListItem, ListItemText, ListItemSecondaryAction,
  TextField, Button, Box, Typography, LinearProgress, MenuItem,
  Collapse, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';

// Enum for Java LocationType
const locationTypes = ['BINDER', 'DISPLAY_CASE', 'BULK_BOX', 'BACK_ROOM'];

/**
 * A complex modal to manage the Storage Locations (Binders) within a specific Warehouse.
 * Allows viewing capacity, creating new binders, and editing/deleting existing ones.
 *
 * @component
 */
export default function StorageLocationManager({ 
  open, 
  onClose, 
  warehouse, 
  onAddLocation, 
  onUpdateLocation, 
  onDeleteLocation 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State (Shared for Add and Edit)
  const [formData, setFormData] = useState({ name: '', type: 'BINDER', maxCapacity: 50 });

  if (!warehouse) return null;

  const locations = warehouse.storageLocations || [];

  // --- Handlers ---

  const startAdd = () => {
    setFormData({ name: '', type: 'BINDER', maxCapacity: 50 });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (loc) => {
    setFormData({ name: loc.name, type: loc.type, maxCapacity: loc.maxCapacity });
    setEditingId(loc.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    const payload = { ...formData, warehouse: { id: warehouse.id } };
    
    if (isAdding) {
      onAddLocation(payload);
    } else {
      onUpdateLocation({ ...payload, id: editingId });
    }
    handleCancel();
  };

  // Helper to calculate capacity color
  const getCapacityColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 1) return 'error'; // Full
    if (ratio >= 0.8) return 'warning'; // Near Full
    return 'success';
  };

  // --- Inline Form Component (Used for both Add and Edit row) ---
  const InlineForm = () => (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {isAdding ? 'New Storage Location' : 'Edit Storage Location'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField 
          label="Name" size="small" fullWidth 
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
        />
        <TextField 
          select label="Type" size="small" sx={{ width: 150 }}
          value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
        >
          {locationTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField 
          label="Capacity" type="number" size="small" sx={{ width: 100 }}
          value={formData.maxCapacity} onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})} 
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button size="small" onClick={handleCancel}>Cancel</Button>
        <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save</Button>
      </Box>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {warehouse.name}
          <Typography variant="body2" color="text.secondary">Manage Storage Locations</Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        
        {/* Add Button (Hidden if form is open) */}
        {!isAdding && !editingId && (
          <Button 
            fullWidth variant="outlined" startIcon={<AddCircleIcon />} sx={{ mb: 2, borderStyle: 'dashed' }}
            onClick={startAdd}
          >
            Add New Binder / Box
          </Button>
        )}

        {/* Add Form */}
        <Collapse in={isAdding}>
          <InlineForm />
        </Collapse>

        {/* List of Existing Locations */}
        <List>
          {locations.map((loc) => (
            <Box key={loc.id}>
              {/* If editing this specific row, show form instead of list item */}
              {editingId === loc.id ? (
                <InlineForm />
              ) : (
                <ListItem sx={{ borderBottom: '1px solid #334155', borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">{loc.name}</Typography>
                        <Typography variant="caption">{loc.type}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', mb: 0.5 }}>
                          <span>Capacity: {loc.currentCount} / {loc.maxCapacity}</span>
                          <span>{Math.round((loc.currentCount / loc.maxCapacity) * 100)}%</span>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((loc.currentCount / loc.maxCapacity) * 100, 100)} 
                          color={getCapacityColor(loc.currentCount, loc.maxCapacity)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction sx={{ top: '30%' }}>
                    <IconButton size="small" onClick={() => startEdit(loc)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteLocation(loc.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </Box>
          ))}
          {locations.length === 0 && !isAdding && (
            <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
              No storage locations yet. Click "Add" to create one.
            </Typography>
          )}
        </List>

      </DialogContent>
    </Dialog>
  );
}