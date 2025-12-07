import { 
  Card, 
  CardMedia, 
  CardActionArea, 
  Box, 
  Chip, 
  Typography 
} from '@mui/material';

export default function InventoryCard({ item, onClick }) {
  const cardDef = item.cardDefinition;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.05)', // Pop effect on hover
          boxShadow: 6,
          zIndex: 10
        }
      }}
    >
      <CardActionArea onClick={() => onClick(item)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        
        {/* Card Image */}
        <Box sx={{ position: 'relative', pt: '140%' /* Aspect Ratio for Pokemon Cards */ }}>
          <CardMedia
            component="img"
            image={cardDef.imageUrl}
            alt={cardDef.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain', // Ensure the whole card is visible
              backgroundColor: '#1e293b' // Dark background for loading/transparency
            }}
          />
          
          {/* Condition Badge (Top Right) */}
          <Chip 
            label={item.condition} 
            size="small" 
            color={item.condition === 'NM' ? 'success' : 'warning'}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              fontWeight: 'bold',
              border: '1px solid rgba(0,0,0,0.5)'
            }} 
          />
        </Box>

        {/* Minimal Footer Info */}
        <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: '1px solid #334155' }}>
          <Typography variant="subtitle2" noWrap align="center" sx={{ fontWeight: 600 }}>
            {cardDef.name}
          </Typography>
          <Typography variant="caption" display="block" align="center" color="text.secondary">
             {cardDef.set?.name} • {item.storageLocation?.name}
          </Typography>
        </Box>

      </CardActionArea>
    </Card>
  );
}