import { 
  Dialog, DialogContent, IconButton, Grid, Box, 
  Typography, Chip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Import sub-components
import InventoryItemForm from './InventoryItemForm';
import CardSpecs from './CardSpecs';

/**
 * A modal dialog that displays detailed information about a selected Inventory Item.
 * It combines the visual card image with editable inventory details and static card specifications.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the modal is currently visible.
 * @param {Function} props.onClose - Handler to close the modal.
 * @param {Object} props.item - The inventory item object currently selected.
 * @param {Function} props.onSave - Callback passed down to the form for saving changes.
 * @param {Function} props.onDelete - Callback passed down to the form for deleting the item.
 * @param {Array<Object>} [props.warehouses=[]] - Hierarchical list of warehouses (and their nested locations) for the move dropdown.
 * @returns {JSX.Element|null} The rendered modal.
 */
export default function CardDetailModal({ open, onClose, item, onSave, onDelete, warehouses = [] }) {
  if (!item) return null;

  const { cardDefinition: card } = item;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Floating Close Button */}
      <IconButton 
        onClick={onClose} 
        sx={{ 
          position: 'absolute', 
          right: 8, 
          top: 8, 
          zIndex: 1, 
          bgcolor: 'rgba(0,0,0,0.3)', 
          color: 'white',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } 
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, minHeight: '500px', display: 'flex' }}>
        <Grid container sx={{ height: '100%' }}>
          
          {/* LEFT: Static Image Area */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ bgcolor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Box 
              component="img"
              src={card.imageUrl} 
              alt={card.name}
              sx={{ 
                width: '100%', 
                maxWidth: '350px', 
                borderRadius: 2, 
                boxShadow: '0px 10px 30px rgba(0,0,0,0.5)' 
              }} 
            />
          </Grid>

          {/* RIGHT: Dynamic Details Area */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
            
            {/* Header (Shared Info) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>{card.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={card.set?.name} size="small" variant="outlined" />
                <Chip label={card.rarity} size="small" variant="outlined" />
                <Chip label={`#${card.localId}`} size="small" variant="outlined" />
              </Box>
            </Box>

            {/* 1. Inventory Form (Editable Fields) */}
            {/* Pass the warehouses hierarchy down so the dropdown works */}
            <InventoryItemForm 
              item={item} 
              warehouses={warehouses} 
              onSave={onSave} 
              onDelete={onDelete} 
            />

            {/* 2. Static Specs (Read-Only Data) */}
            <CardSpecs cardDefinition={card} />

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}