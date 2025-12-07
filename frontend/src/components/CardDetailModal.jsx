import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Grid, 
  Box, 
  Typography, 
  Chip, 
  Divider,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CardDetailModal({ open, onClose, item }) {
  if (!item) return null;

  const { cardDefinition: card, storageLocation: loc } = item;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      

      <DialogContent dividers>
          
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box 
              component="img"
              src={card.imageUrl} 
              alt={card.name}
              sx={{ 
                width: '100%', 
                borderRadius: 2, 
                boxShadow: 3,
                bgcolor: '#1e293b' // Dark background in case image has transparency
              }} 
            />
          </Grid>


          <Grid size={{ xs: 12, md: 7 }}>
            
            {/* Inventory Details Section */}
            <Typography variant="overline" color="text.secondary">Inventory Details</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={6}>
                <Typography variant="caption" display="block">Condition</Typography>
                <Chip label={item.condition} color={item.condition === 'NM' ? 'success' : 'default'} />
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" display="block">Price</Typography>
                <Typography variant="h6" color="success.main">
                  {item.setPrice ? `$${item.setPrice}` : 'Market Price'}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption" display="block">Location</Typography>
                <Typography variant="body1">
                   {loc?.name} <Typography component="span" variant="body2" color="text.secondary">in {loc?.warehouse?.name}</Typography>
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Card Stats Section */}
            <Typography variant="overline" color="text.secondary">Card Specs</Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="body2"><strong>Set:</strong> {card.set?.name}</Typography>
                <Typography variant="body2"><strong>Number:</strong> {card.localId}</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2"><strong>Rarity:</strong> {card.rarity}</Typography>
                <Typography variant="body2"><strong>HP:</strong> {card.hp || 'N/A'}</Typography>
              </Grid>
              <Grid size={12}>
                 <Typography variant="body2" component="span" sx={{ mr: 1 }}><strong>Types:</strong></Typography>
                 {card.types?.map(t => (
                   <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />
                 ))}
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<EditIcon />}>Edit Item</Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>Delete</Button>
            </Box>

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}