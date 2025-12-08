import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, 
  List, ListItem, ListItemText, ListItemSecondaryAction,
  TextField, Button, Box, Typography, LinearProgress, MenuItem,
  Collapse, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

// Enum for Java LocationType
const locationTypes = ['BINDER', 'DISPLAY_CASE', 'BULK_BOX', 'BACK_ROOM'];

/**
 * A sub-component for adding or editing a storage location row inline.
 * * @component
 * @param {Object} props
 * @param {boolean} props.isAdding - If true, displays "New Storage Location". If false, "Edit".
 * @param {Object} props.formData - The current state of the input fields.
 * @param {Function} props.setFormData - State setter for the input fields.
 * @param {Function} props.onCancel - Handler to close the form without saving.
 * @param {Function} props.onSave - Handler to submit the form data.
 */
const InlineForm = ({ isAdding, formData, setFormData, onCancel, onSave }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      {isAdding ? 'New Storage Location' : 'Edit Storage Location'}
    </Typography>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField 
        label="Name" size="small" fullWidth 
        value={formData.name} 
        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} 
      />
      <TextField 
        select label="Type" size="small" sx={{ width: 150 }}
        value={formData.type} 
        onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
      >
        {locationTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      <TextField 
        label="Capacity" type="number" size="small" sx={{ width: 100 }}
        value={formData.maxCapacity} 
        onChange={(e) => setFormData(prev => ({...prev, maxCapacity: e.target.value}))} 
      />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <Button size="small" onClick={onCancel}>Cancel</Button>
      <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={onSave}>Save</Button>
    </Box>
  </Paper>
);

/**
 * A complex modal to manage the Storage Locations (Binders) within a specific Warehouse.
 * Allows viewing capacity, creating new binders, editing/deleting existing ones,
 * and moving binders to different warehouses.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible.
 * @param {Function} props.onClose - Handler to close the modal.
 * @param {Object} props.warehouse - The active Warehouse object containing the list of locations.
 * @param {Array<Object>} [props.allWarehouses] - List of ALL warehouses (used for the "Move" dropdown).
 * @param {Function} props.onAddLocation - Callback to create a new location.
 * @param {Function} props.onUpdateLocation - Callback to update/move an existing location.
 * @param {Function} props.onDeleteLocation - Callback to delete a location.
 */
export default function StorageLocationManager({ 
  open, 
  onClose, 
  warehouse, 
  allWarehouses = [], 
  onAddLocation, 
  onUpdateLocation, 
  onDeleteLocation 
}) {
  // --- Local State ---
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Move State
  const [moveTarget, setMoveTarget] = useState(null); // The binder object being moved
  const [destinationId, setDestinationId] = useState(''); // The selected target warehouse ID

  // Form State (Shared for Add and Edit)
  const [formData, setFormData] = useState({ name: '', type: 'BINDER', maxCapacity: 50 });

  if (!warehouse) return null;

  const locations = warehouse.storageLocations || [];

  // --- Handlers for Form Operations ---

  /**
   * Opens the InlineForm in "Add Mode".
   */
  const startAdd = () => {
    setFormData({ name: '', type: 'BINDER', maxCapacity: 50 });
    setIsAdding(true);
    setEditingId(null);
  };

  /**
   * Opens the InlineForm in "Edit Mode" for a specific location.
   * @param {Object} loc - The location object to edit.
   */
  const startEdit = (loc) => {
    setFormData({ name: loc.name, type: loc.type, maxCapacity: loc.maxCapacity });
    setEditingId(loc.id);
    setIsAdding(false);
  };

  /**
   * Closes the InlineForm.
   */
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  /**
   * Submits the InlineForm data. 
   * Calls either onAddLocation or onUpdateLocation based on state.
   */
  const handleSave = () => {
    // Construct payload. Note: We attach the current warehouse ID by default.
    const payload = { ...formData, warehouse: { id: warehouse.id } };
    
    if (isAdding) {
      onAddLocation(payload);
    } else {
      onUpdateLocation({ ...payload, id: editingId });
    }
    handleCancel();
  };

  /**
   * Determines the color of the progress bar based on capacity usage.
   * @param {number} current - Items currently in the binder.
   * @param {number} max - Max capacity.
   * @returns {string} Material UI color string ('success', 'warning', 'error').
   */
  const getCapacityColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 1) return 'error'; 
    if (ratio >= 0.8) return 'warning'; 
    return 'success';
  };

  // --- Handlers for Move Logic ---

  /**
   * Opens the "Move Confirmation" dialog for a specific location.
   * @param {Object} loc - The location to move.
   */
  const handleMoveClick = (loc) => {
    setMoveTarget(loc);
    setDestinationId(''); // Reset dropdown
  };

  /**
   * Submits the move request.
   * Calls onUpdateLocation but changes the parent Warehouse ID.
   */
  const submitMove = () => {
    if (!moveTarget || !destinationId) return;

    onUpdateLocation({
      id: moveTarget.id,
      name: moveTarget.name,
      type: moveTarget.type,
      maxCapacity: moveTarget.maxCapacity,
      warehouse: { id: destinationId } // <--- Trigger the move in Backend
    });

    setMoveTarget(null); // Close dialog
  };

  return (
    <>
      {/* --- MAIN MANAGER DIALOG --- */}
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
              fullWidth 
              variant="contained" 
              startIcon={<AddCircleIcon />} 
              sx={{ mb: 2 }} 
              onClick={startAdd}
            >
              Add New Binder / Box
            </Button>
          )}

          {/* Add Form Collapse */}
          <Collapse in={isAdding}>
            <InlineForm 
              isAdding={true}
              formData={formData}
              setFormData={setFormData}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </Collapse>

          {/* List of Existing Locations */}
          <List>
            {locations.map((loc) => (
              <Box key={loc.id}>
                {editingId === loc.id ? (
                  // Edit Form Mode
                  <InlineForm 
                    isAdding={false}
                    formData={formData}
                    setFormData={setFormData}
                    onCancel={handleCancel}
                    onSave={handleSave}
                  />
                ) : (
                  // Display Mode
                  <ListItem sx={{ borderBottom: '1px solid #334155', borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, pr: 14 }}>
                          <Typography fontWeight="bold" noWrap>
                            {loc.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ color: 'text.secondary', flexShrink: 0, bgcolor: 'rgba(255,255,255,0.05)', px: 1, borderRadius: 1 }}
                          >
                            {loc.type}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }} 
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
                    {/* Row Actions */}
                    <ListItemSecondaryAction sx={{ top: '30%', display: 'flex', gap: 0.5 }}>
                      
                      <IconButton size="small" color="primary" onClick={() => handleMoveClick(loc)} title="Move to another store">
                        <DriveFileMoveIcon fontSize="small" />
                      </IconButton>

                      <IconButton size="small" onClick={() => startEdit(loc)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton size="small" color="error" onClick={() => onDeleteLocation(loc.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

      {/* --- MOVE CONFIRMATION DIALOG --- */}
      <Dialog open={Boolean(moveTarget)} onClose={() => setMoveTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Move Storage Location</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Where would you like to move <strong>{moveTarget?.name}</strong>?
          </Typography>
          <TextField
            select
            fullWidth
            label="Destination Warehouse"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            size="small"
          >
            {allWarehouses
              .filter(w => w.id !== warehouse.id) // Filter out the current warehouse
              .map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveTarget(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={submitMove}
            disabled={!destinationId}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}