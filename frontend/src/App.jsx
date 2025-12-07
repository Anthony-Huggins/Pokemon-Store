import { Typography, Container } from '@mui/material';

function App() {
  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Pokemon Inventory
      </Typography>
      <Typography variant="body1">
        Backend Connection: Pending...
      </Typography>
    </Container>
  );
}

export default App;