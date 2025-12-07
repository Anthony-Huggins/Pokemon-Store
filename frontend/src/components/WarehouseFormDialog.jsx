import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Modal to Create or Edit a Warehouse entity.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Visibility state.
 * @param {Function} props.onClose - Close handler.
 * @param {Function} props.onSubmit - Save handler.
 * @param {Object} [props.warehouse] - The warehouse to edit (null for create).
 */
export default function WarehouseFormDialog({ open, onClose, onSubmit, onDelete, warehouse }) {
  const [formData, setFormData] = useState({ name: '', location: '' });

  useEffect(() => {
    if (warehouse) {
      setFormData({ name: warehouse.name, location: warehouse.location || '' });
    } else {
      setFormData({ name: '', location: '' });
    }
  }, [warehouse, open]);

  const handleSubmit = () => {
    // If editing, preserve ID. If creating, ID is undefined.
    onSubmit({ ...warehouse, ...formData });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Store Name"
          fullWidth
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Location / Address"
          fullWidth
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        {/* LEFT SIDE: Delete Button (Only in Edit Mode) */}
        {warehouse ? (
          <Button 
            onClick={() => onDelete(warehouse.id)} 
            color="error" 
            startIcon={<DeleteIcon />}
          >
            Delete Store
          </Button>
        ) : (
          <Box /> // Empty spacer to keep Save button on the right
        )}

        {/* RIGHT SIDE: Cancel & Save */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
            {warehouse ? 'Save Changes' : 'Create'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}