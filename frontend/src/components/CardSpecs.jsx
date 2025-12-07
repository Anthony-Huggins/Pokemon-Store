import { Typography, Grid, Chip, Divider, Box } from '@mui/material';

/**
 * A presentation component that displays the immutable, static specifications of a card.
 * Used in both Inventory views and Library views.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.cardDefinition - The Card Definition entity containing API data (Set, Rarity, HP, etc.).
 * @returns {JSX.Element|null} The rendered specs or null if data is missing.
 */
export default function CardSpecs({ cardDefinition }) {
  if (!cardDefinition) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 2 }}>CARD SPECS</Divider>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Typography variant="body2" color="text.secondary">Set</Typography>
          <Typography variant="body2" fontWeight="bold">{cardDefinition.set?.name}</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="body2" color="text.secondary">Number</Typography>
          <Typography variant="body2" fontWeight="bold">{cardDefinition.localId}</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="body2" color="text.secondary">Rarity</Typography>
          <Typography variant="body2" fontWeight="bold">{cardDefinition.rarity}</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="body2" color="text.secondary">HP</Typography>
          <Typography variant="body2" fontWeight="bold">{cardDefinition.hp || 'N/A'}</Typography>
        </Grid>
        <Grid size={12}>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Types</Typography>
           {/* Render a Chip for every Energy Type (e.g. Fire, Water) */}
           {cardDefinition.types?.map(t => (
             <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} variant="outlined" />
           ))}
        </Grid>
      </Grid>
    </Box>
  );
}