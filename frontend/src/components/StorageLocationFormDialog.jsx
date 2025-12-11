import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, MenuItem 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// 1. Define the dropdown options
const STORAGE_TYPES = [
  { value: 'BINDER', label: 'Binder' },
  { value: 'DISPLAY_CASE', label: 'Display Case' },
  { value: 'BULK_BOX', label: 'Bulk Box' },
  { value: 'BACK_ROOM', label: 'Back Room' }
];

// 2. Define the Capacity Defaults Map
const CAPACITY_DEFAULTS = {
  'BINDER': 200,
  'DISPLAY_CASE': 25,
  'BULK_BOX': 1000,
  'BACK_ROOM': 10000
};

export default function StorageLocationFormDialog({ 
  open, onClose, onSubmit, onDelete, location, warehouseId 
}) {
  
  const [formData, setFormData] = useState({ 
    name: '', 
    maxCapacity: '', // Start blank
    type: ''       // Start blank
  });

  // Load data or reset to blank on open
  useEffect(() => {
    if (location) {
      setFormData({ 
        name: location.name, 
        maxCapacity: location.maxCapacity, 
        type: location.type 
      });
    } else {
      // "Start out blank" for new items
      setFormData({ name: '', maxCapacity: '', type: '' });
    }
  }, [location, open]);

  // 3. New Handler: Sets Type AND updates Capacity automatically
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const defaultCapacity = CAPACITY_DEFAULTS[newType] || '';

    setFormData(prev => ({
      ...prev,
      type: newType,
      maxCapacity: defaultCapacity // Auto-fill based on selection
    }));
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name,
      type: formData.type,
      maxCapacity: parseInt(formData.maxCapacity, 10),
      warehouse: { 
        id: location ? location.warehouse?.id : warehouseId 
      }
    };

    if (location) {
      payload.id = location.id;
    }

    onSubmit(payload);
  };

  // Helper to check if form is valid for submission
  const isValid = formData.name && formData.type && formData.maxCapacity;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {location ? 'Edit Location' : 'Add New Location'}
      </DialogTitle>
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name (e.g. 'Ultra Rare Binder')"
          fullWidth
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {/* TYPE DROPDOWN with Auto-Fill Logic */}
        <TextField
          select
          margin="dense"
          label="Type"
          fullWidth
          value={formData.type}
          onChange={handleTypeChange} // <--- Uses our new handler
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
          helperText={formData.type ? `Default for ${formData.type.toLowerCase().replace('_', ' ')} is ${CAPACITY_DEFAULTS[formData.type]}` : "Select a type to see default"}
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
            disabled={!isValid} // Disable if fields are empty
          >
            {location ? 'Save Changes' : 'Create'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}