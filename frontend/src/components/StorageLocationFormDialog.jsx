import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, MenuItem 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const STORAGE_TYPES = [
  { value: 'DISPLAY_CASE', label: 'Display Case' },
  { value: 'BINDER', label: 'Binder' },
  { value: 'BULK_BOX', label: 'Bulk Box' },
  { value: 'BACK_ROOM', label: 'Back Room' }
];

const CAPACITY_DEFAULTS = {
  'BINDER': 200,
  'DISPLAY_CASE': 25,
  'BULK_BOX': 1000,
  'BACK_ROOM': 10000
};

export default function StorageLocationFormDialog({ 
  open, onClose, onSubmit, onDelete, location, warehouseId, warehouses = [] 
}) {
  
  const [formData, setFormData] = useState({ 
    name: '', 
    maxCapacity: '', 
    type: '',
    targetWarehouseId: '' // New field to track parent warehouse
  });

  useEffect(() => {
    if (location) {
      setFormData({ 
        name: location.name, 
        maxCapacity: location.maxCapacity, 
        type: location.type,
        // If editing, use existing warehouse ID. If new, use the passed parent ID.
        targetWarehouseId: location.warehouse?.id || warehouseId
      });
    } else {
      setFormData({ 
        name: '', 
        maxCapacity: '', 
        type: '', 
        targetWarehouseId: warehouseId || '' 
      });
    }
  }, [location, warehouseId, open]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const defaultCapacity = CAPACITY_DEFAULTS[newType] || '';
    setFormData(prev => ({
      ...prev,
      type: newType,
      maxCapacity: defaultCapacity 
    }));
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name,
      type: formData.type,
      maxCapacity: parseInt(formData.maxCapacity, 10),
      // Use the selected warehouse from the dropdown
      warehouse: { 
        id: formData.targetWarehouseId 
      }
    };

    if (location) {
      payload.id = location.id;
    }

    onSubmit(payload);
  };

  const isValid = formData.name && formData.type && formData.maxCapacity && formData.targetWarehouseId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {location ? 'Edit Location' : 'Add New Location'}
      </DialogTitle>
      
      <DialogContent>
        
        <TextField
          select
          margin="dense"
          label="Store / Warehouse"
          fullWidth
          value={formData.targetWarehouseId}
          onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
          helperText="Select which store this binder belongs to."
        >
          {warehouses.map((w) => (
             <MenuItem key={w.id} value={w.id}>
               {w.name}
             </MenuItem>
          ))}
        </TextField>

        <TextField
          autoFocus
          margin="dense"
          label="Location Name"
          fullWidth
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <TextField
          select
          margin="dense"
          label="Type"
          fullWidth
          value={formData.type}
          onChange={handleTypeChange}
        >
          {STORAGE_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          margin="dense"
          label="Max Capacity"
          type="number"
          fullWidth
          value={formData.maxCapacity}
          onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
          helperText={formData.type ? `Default for ${formData.type.toLowerCase().replace('_', ' ')} is ${CAPACITY_DEFAULTS[formData.type]}` : ""}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        {location ? (
          <Button onClick={() => onDelete(location.id)} color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        ) : <Box />}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!isValid}
          >
            {location ? 'Save Changes' : 'Create'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}