import { 
  Dialog, DialogContent, IconButton, Grid, Box, 
  Typography, Chip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Import sub-components
import InventoryItemForm from './InventoryItemForm';
import CardSpecs from './CardSpecs';

/**
 * A universal modal dialog that displays detailed information about a card.
 * <p>
 * <strong>Modes:</strong>
 * <ul>
 * <li><strong>Inventory Mode:</strong> Pass `item`. Shows edit form (Save/Delete).</li>
 * <li><strong>Library Mode:</strong> Pass `card`. Shows add form (Add to Inventory).</li>
 * </ul>
 * </p>
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is currently visible.
 * @param {Function} props.onClose - Handler to close the modal.
 * @param {Object} [props.item] - The existing inventory item (Inventory Mode).
 * @param {Object} [props.card] - The raw card definition (Library Mode).
 * @param {Array} props.warehouses - List of warehouses for the dropdowns.
 * @param {Function} props.onSubmit - Handler for "Save" (Inventory) or "Add" (Library).
 * @param {Function} [props.onDelete] - Handler for "Delete" (Inventory Mode only).
 * @returns {JSX.Element|null} The rendered modal.
 */
export default function CardDetailModal({ open, onClose, item, card, warehouses = [], onSubmit, onDelete }) {
  // Determine the definition to display. 
  // If editing an item, grab its definition. If browsing library, use the card directly.
  const cardDef = item ? item.cardDefinition : card;

  if (!cardDef) return null;

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
              src={cardDef.imageUrl} 
              alt={cardDef.name}
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
            {/* <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>{cardDef.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={cardDef.set?.name} size="small" variant="outlined" />
                <Chip label={cardDef.rarity} size="small" variant="outlined" />
                <Chip label={`#${cardDef.localId}`} size="small" variant="outlined" />
              </Box>
            </Box> */}

            {/* 1. Inventory Form (Editable Fields) */}
            {/* Pass the warehouses hierarchy down so the dropdown works */}
            <InventoryItemForm 
              existingItem={item}
              cardDefinition={cardDef}
              warehouses={warehouses}
              onSubmit={onSubmit}
              onDelete={onDelete}
            />

            {/* 2. Static Specs (Read-Only Data) */}
            <CardSpecs cardDefinition={cardDef} />

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}