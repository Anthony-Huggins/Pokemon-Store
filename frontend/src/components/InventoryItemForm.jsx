import { useState, useEffect } from 'react';
import { 
  Grid, Box, TextField, MenuItem, FormControlLabel, 
  Switch, InputAdornment, Button, Divider 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

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
 * A form component for editing the dynamic details of a specific inventory item.
 * Allows modifying condition, storage location, price, and markup settings.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.item - The inventory item object to edit.
 * @param {Array<Object>} props.warehouses - List of available storage locations for the dropdown.
 * @param {Function} props.onSave - Callback function fired when "Save Changes" is clicked. Receives the updated item object.
 * @param {Function} props.onDelete - Callback function fired when "Delete" is clicked. Receives the item ID.
 * @returns {JSX.Element} The rendered form.
 */
export default function InventoryItemForm({ item, warehouses = [], onSave, onDelete }) {
  // Local state to manage form inputs before saving
  const [formData, setFormData] = useState({
    condition: '',
    setPrice: '',
    matchMarketPrice: false,
    warehouseId: '', // Intermediate state for the first dropdown
    storageLocationId: ''
  });

  /**
   * Effect to populate form data when the passed `item` changes.
   */
  useEffect(() => {
    if (item) {
      const currentLoc = item.storageLocation;  

      setFormData({
        condition: item.condition || 'NM',
        setPrice: item.setPrice || '',
        matchMarketPrice: item.matchMarketPrice || false,
        markupPercentage: item.markupPercentage || 0,
        warehouseId: currentLoc?.warehouse?.id || '', 
        storageLocationId: currentLoc?.id || ''
      });
    }
  }, [item]);

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
  const handleSaveClick = () => {
    const updatedItem = {
      ...item,
      condition: formData.condition,
      // If matching market price, we clear the manual setPrice
      setPrice: formData.matchMarketPrice ? null : formData.setPrice,
      matchMarketPrice: formData.matchMarketPrice,
      markupPercentage: formData.markupPercentage,
      // Reconstruct the nested storageLocation object for the backend
      storageLocation: { id: formData.storageLocationId } 
    };
    onSave(updatedItem);
  };

  const availableLocations = warehouses.find(w => w.id === formData.warehouseId)?.storageLocations || [];

  return (
    <>
      <Divider sx={{ mb: 3 }}>INVENTORY SETTINGS</Divider>
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
            select fullWidth label="Binder / Shelf" name="storageLocationId"
            value={formData.storageLocationId} onChange={handleChange} size="small"
            disabled={!formData.warehouseId} 
          >
            {/* --- SAFETY FIX START --- */}
            {/* Always render the current value so MUI doesn't complain about "out of range".
                We use display: none so the user doesn't see it twice in the list. */}
            {item.storageLocation && (
               <MenuItem value={item.storageLocation.id} sx={{ display: 'none' }}>
                 {item.storageLocation.name}
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
              fullWidth label="Manual Price" name="setPrice" type="number"
              value={formData.setPrice} onChange={handleChange} size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          )}
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<SaveIcon />} fullWidth onClick={handleSaveClick}>
          Save Changes
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(item.id)}>
          Delete
        </Button>
      </Box>
    </>
  );
}