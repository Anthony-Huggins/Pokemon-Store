import { useState, useEffect } from 'react';
import { 
  Grid, Box, TextField, MenuItem, FormControlLabel, 
  Switch, InputAdornment, Button, Divider 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

/**
 * Mapping of backend Enum codes to user-friendly display labels.
 * The 'value' is what gets sent to the API. The 'label' is what the user sees.
 * @type {Array<{value: string, label: string}>}
 */
const conditionOptions = [
  { value: 'NM', label: 'Near Mint' },
  { value: 'LP', label: 'Lightly Played' },
  { value: 'MP', label: 'Moderately Played' },
  { value: 'HP', label: 'Heavily Played' },
  { value: 'DMG', label: 'Damaged' },
  { value: 'SEALED', label: 'Sealed' }
];

/**
 * A unified form component for BOTH creating and editing inventory items.
 * <p>
 * <strong>Modes:</strong>
 * <ul>
 * <li><strong>Edit Mode:</strong> Pass `existingItem`. Form pre-fills. Shows "Save" and "Delete".</li>
 * <li><strong>Create Mode:</strong> Pass `cardDefinition` (but no `existingItem`). Form defaults to NM. Shows "Add".</li>
 * </ul>
 * </p>
 *
 * @component
 * @param {Object} props
 * @param {Object} [props.existingItem] - The item being edited (Edit Mode only).
 * @param {Object} [props.cardDefinition] - The card definition to link to (Create Mode only).
 * @param {Array} props.warehouses - List of warehouses for the dropdowns.
 * @param {Function} props.onSubmit - Handler for Save/Add. Receives the payload object.
 * @param {Function} [props.onDelete] - Handler for Delete (Edit Mode only).
 */
export default function InventoryItemForm({ 
    existingItem, 
    cardDefinition, 
    warehouses = [], 
    onSubmit, 
    onDelete
}) {
  const isEditMode = Boolean(existingItem);

  // Local state to manage form inputs before saving
  const [formData, setFormData] = useState({
    condition: 'NM',
    setPrice: '',
    matchMarketPrice: false,
    markupPercentage: 0,
    warehouseId: '', // Intermediate state for the first dropdown
    storageLocationId: ''
  });

  /**
   * Effect to populate form data when the passed `item` changes.
   */
  useEffect(() => {
    if (isEditMode && existingItem) {
      const currentLoc = existingItem.storageLocation;
      setFormData({
        condition: existingItem.condition || 'NM',
        setPrice: existingItem.setPrice || '',
        matchMarketPrice: existingItem.matchMarketPrice || false,
        markupPercentage: existingItem.markupPercentage || 0,
        warehouseId: currentLoc?.warehouse?.id || '', 
        storageLocationId: currentLoc?.id || ''
      });
    } else {
      // Reset to defaults for Create Mode
      setFormData({
        condition: 'NM',
        setPrice: '',
        matchMarketPrice: false,
        markupPercentage: 0,
        warehouseId: '',
        storageLocationId: ''
      });
    }
  }, [existingItem, isEditMode]);

  /**
   * Handles changes to input fields.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    // If Warehouse changes, we must clear the selected Storage Location
    if (name === 'warehouseId') {
      setFormData(prev => ({
        ...prev,
        warehouseId: value,
        storageLocationId: '' // Reset child dropdown
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  /**
   * Constructs the updated item object and calls the parent onSave handler.
   */
  const handleSubmit = () => {
    // 1. Build the base payload (shared fields)
    const payload = {
      condition: formData.condition,
      setPrice: formData.matchMarketPrice ? null : formData.setPrice,
      matchMarketPrice: formData.matchMarketPrice,
      markupPercentage: formData.markupPercentage,
      storageLocation: { id: formData.storageLocationId }
    };

    // 2. Add specific fields based on mode
    if (isEditMode) {
      // Edit: Merge with existing item ID
      onSubmit({ ...existingItem, ...payload });
    } else {
      // Create: Attach the Card Definition ID
      payload.cardDefinition = { id: cardDefinition.id };
      onSubmit(payload);
    }
  };

  const availableLocations = warehouses.find(w => w.id === formData.warehouseId)?.storageLocations || [];
  const hasPriceError = !formData.matchMarketPrice && (formData.setPrice === '' || formData.setPrice === null);
  
  return (
    <>
      <Divider sx={{ mb: 3 }}>
        {isEditMode ? 'INVENTORY SETTINGS' : 'ADD TO INVENTORY'}
      </Divider>
      <Grid container spacing={3}>
        {/* Condition Selection */}
        <Grid size={6}>
          <TextField
            select fullWidth label="Condition" name="condition"
            value={formData.condition} onChange={handleChange} size="small"
          >
            {conditionOptions.map(option => 
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            )}
          </TextField>
        </Grid>

        {/* Location Selection */}
        {/* 1. Warehouse (Parent Dropdown) */}
        <Grid size={6}>
          <TextField
            select fullWidth label="Warehouse" name="warehouseId"
            value={formData.warehouseId} onChange={handleChange} size="small"
          >
            {warehouses.map(w => (
              <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* 2. Storage Location (Child Dropdown) */}
        <Grid size={12}>
          <TextField
            select fullWidth label="Storage Location" name="storageLocationId"
            value={formData.storageLocationId} onChange={handleChange} size="small"
            disabled={!formData.warehouseId} 
          >
            {/* --- SAFETY FIX START --- */}
            {/* Always render the current value so MUI doesn't complain about "out of range".
                We use display: none so the user doesn't see it twice in the list. */}
            {isEditMode && existingItem?.storageLocation && (
              <MenuItem value={existingItem.storageLocation.id} sx={{ display: 'none' }}>
                {existingItem.storageLocation.name}
              </MenuItem>
            )}
            {/* --- SAFETY FIX END --- */}

            {availableLocations.map(loc => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name} ({loc.currentCount || 0}/{loc.maxCapacity})
              </MenuItem>
            ))}
          </TextField>
        </Grid>  

        {/* Pricing Strategy Section */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
             <FormControlLabel
              control={<Switch checked={formData.matchMarketPrice} onChange={handleChange} name="matchMarketPrice" />}
              label="Sync with Market Price"
            />
          </Box>
          
          {formData.matchMarketPrice ? (
            <TextField
              fullWidth label="Markup Percentage" name="markupPercentage" type="number"
              value={formData.markupPercentage} onChange={handleChange} size="small"
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              helperText="Auto-updates daily based on TCGdex"
            />
          ) : (
            <TextField
              fullWidth 
              label="Manual Price" 
              name="setPrice" 
              type="number"
              value={formData.setPrice} 
              onChange={handleChange} 
              size="small"
              required // Visual indicator
              error={hasPriceError} // Turns red if empty
              helperText={hasPriceError ? "Price is required" : ""}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          )}
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          startIcon={isEditMode ? <SaveIcon /> : <AddCircleIcon />} 
          onClick={handleSubmit}
          disabled={!formData.storageLocationId || hasPriceError} // Block submit if no location
        >
          {isEditMode ? 'Save Changes' : 'Add to Inventory'}
        </Button>
        {isEditMode && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={() => onDelete(existingItem.id)}
          >
            Delete
          </Button>
        )}
      </Box>
    </>
  );
}