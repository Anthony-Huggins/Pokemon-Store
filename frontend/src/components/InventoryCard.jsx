import { 
  Card, 
  CardMedia, 
  CardActionArea, 
  Box, 
  Chip, 
  Typography 
} from '@mui/material';

const LOCAL_IMAGE_BASE = 'http://localhost:8080/images/';

/**
 * A universal card component that displays either an Inventory Item or a generic Card Definition.
 * <p>
 * <strong>Modes:</strong>
 * <ul>
 * <li><strong>Inventory Mode:</strong> Pass `item`. Displays Condition and Location info.</li>
 * <li><strong>Library Mode:</strong> Pass `card`. Displays only the image and set info.</li>
 * </ul>
 * </p>
 *
 * @component
 * @param {Object} props
 * @param {Object} [props.item] - The inventory item (contains .cardDefinition, .condition, etc.).
 * @param {Object} [props.card] - The raw card definition (if item is not present).
 * @param {Function} props.onClick - Handler called with the object passed in (item or card).
 */
export default function InventoryCard({ item, card, onClick }) {
  // Determine which object to display
  // If 'item' exists, we are in Inventory Mode. If not, use 'card' (Library Mode).
  const cardDef = item ? item.cardDefinition : card;

  if (!cardDef) return null;

  const imageURL = "http://localhost:8080/images/" + cardDef.id + ".png";

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
      <CardActionArea onClick={() => onClick(item || card)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        
        {/* Card Image */}
        <Box sx={{ position: 'relative', pt: '140%' /* Aspect Ratio for Pokemon Cards */ }}>
          <CardMedia
            component="img"
            image= {imageURL} 
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
          {item && (
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
          )}
        </Box>

        

      </CardActionArea>
    </Card>
  );
}