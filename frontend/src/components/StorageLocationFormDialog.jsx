import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, MenuItem 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Standard types for your storage containers
const STORAGE_TYPES = [
  { value: 'BINDER', label: 'Binder' },
  { value: 'BOX', label: 'Storage Box' },
  { value: 'TIN', label: 'Tin' },
  { value: 'GRADED_CASE', label: 'Graded Slab Case' },
  { value: 'OTHER', label: 'Other' }
];

/**
 * Modal to Create or Edit a StorageLocation entity.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Visibility state.
 * @param {Function} props.onClose - Close handler.
 * @param {Function} props.onSubmit - Save handler.
 * @param {Function} props.onDelete - Delete handler.
 * @param {Object} [props.location] - The location object to edit (null for create).
 * @param {number} [props.warehouseId] - The ID of the parent warehouse (required for create).
 */
export default function StorageLocationFormDialog({ 
  open, onClose, onSubmit, onDelete, location, warehouseId 
}) {
  
  // Default State
  const [formData, setFormData] = useState({ 
    name: '', 
    capacity: 60, 
    type: 'BINDER' 
  });

  // Load data into form when opening for Edit
  useEffect(() => {
    if (location) {
      setFormData({ 
        name: location.name, 
        capacity: location.capacity || 60, 
        type: location.type || 'BINDER' 
      });
    } else {
      // Reset for "Add New"
      setFormData({ name: '', capacity: 60, type: 'BINDER' });
    }
  }, [location, open]);

  const handleSubmit = () => {
    // 1. Construct the payload
    const payload = {
      ...formData,
      // Ensure capacity is a number
      capacity: parseInt(formData.capacity, 10) 
    };

    // 2. Add ID context
    if (location) {
      // EDIT MODE: Include existing ID
      payload.id = location.id;
      // Keep original warehouseId if backend needs it, otherwise just send changes
      payload.warehouseId = location.warehouseId; 
    } else {
      // CREATE MODE: Attach the parent Warehouse ID
      payload.warehouseId = warehouseId;
    }

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {location ? 'Edit Storage Location' : 'Add New Location'}
      </DialogTitle>
      
      <DialogContent>
        {/* NAME FIELD */}
        <TextField
          autoFocus
          margin="dense"
          label="Location Name (e.g., 'Binder 1')"
          fullWidth
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {/* TYPE DROPDOWN */}
        <TextField
          select
          margin="dense"
          label="Storage Type"
          fullWidth
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          {STORAGE_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* CAPACITY FIELD */}
        <TextField
          margin="dense"
          label="Max Capacity (Cards)"
          type="number"
          fullWidth
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          helperText="Used to calculate how full this container is."
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        
        {/* LEFT: Delete Button (Edit Mode Only) */}
        {location ? (
          <Button 
            onClick={() => onDelete(location.id)} 
            color="error" 
            startIcon={<DeleteIcon />}
          >
            Delete Location
          </Button>
        ) : (
          <Box /> // Spacer
        )}

        {/* RIGHT: Cancel & Save */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.name}
          >
            {location ? 'Save Changes' : 'Create'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}