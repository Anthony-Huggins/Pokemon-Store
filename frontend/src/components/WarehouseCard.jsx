import { 
  Card, CardContent, CardActions, Typography, 
  Button, Box, Chip, Divider, Stack 
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';

/**
 * Visual representation of a Warehouse (Store).
 * Displays breakdown of storage types and total card count.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.warehouse - The warehouse entity.
 * @param {Function} props.onEdit - Handler for "Edit Warehouse".
 * @param {Function} props.onManageLocations - Handler for "View Storage Locations".
 */
export default function WarehouseCard({ warehouse, onEdit, onManageLocations }) {
  const locations = warehouse.storageLocations || [];

  // 1. Calculate Total Cards
  const totalCards = locations.reduce((sum, loc) => sum + (loc.currentCount || 0), 0);

  // 2. Calculate Counts per Type (e.g. { BINDER: 5, BULK_BOX: 2 })
  const typeCounts = locations.reduce((acc, loc) => {
    const type = loc.type || 'UNKNOWN';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Helper to format enum keys (e.g. "DISPLAY_CASE" -> "Display Case")
  const formatType = (type) => type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white', mr: 2 }}>
            <StoreIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {warehouse.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
              <Typography variant="caption" noWrap>
                {warehouse.location || 'No address set'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stats Breakdown */}
        <Stack spacing={1}>
          {/* Total Cards Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold">Total Inventory</Typography>
            <Chip label={`${totalCards} Cards`} size="small" color="primary" />
          </Box>

          {/* Dynamic Rows for each Storage Type */}
          {Object.keys(typeCounts).length > 0 ? (
            Object.entries(typeCounts).map(([type, count]) => (
              <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatType(type)}s
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {count}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
              No storage units added yet.
            </Typography>
          )}
        </Stack>

      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" // <--- CHANGED: Filled in
          color="inherit"     // Optional: Makes it grey/neutral to distinguish from the primary "Manage" button
          sx={{ bgcolor: 'action.selected', color: 'text.primary' }} // Custom styling for a nice "Secondary Filled" look
          startIcon={<EditIcon />} 
          onClick={() => onEdit(warehouse)}
        >
          Edit
        </Button>
        <Button 
          fullWidth 
          variant="contained" 
          startIcon={<InventoryIcon />} 
          onClick={() => onManageLocations(warehouse)}
        >
          Manage Store
        </Button>
      </CardActions>
    </Card>
  );
}