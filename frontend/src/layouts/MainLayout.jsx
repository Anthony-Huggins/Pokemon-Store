import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Typography, Button, CssBaseline 
} from '@mui/material';

// Icons
import InventoryIcon from '@mui/icons-material/Inventory2'; 
import StoreIcon from '@mui/icons-material/Store'; 
import StyleIcon from '@mui/icons-material/Style'; 
import CloudSyncIcon from '@mui/icons-material/CloudSync'; 
import CameraAltIcon from '@mui/icons-material/CameraAlt'; 

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items
  const menuItems = [
    { text: 'Stores Dashboard', icon: <StoreIcon />, path: '/' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Library', icon: <StyleIcon />, path: '/library' },
    { text: 'Sync', icon: <CloudSyncIcon />, path: '/sync' },
    { text: 'Scan', icon: <CameraAltIcon />, path: '/scan' },
  ];

  return (
    // Switch to column layout so content sits below the header
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Top App Bar */}
      <AppBar position="fixed">
        <Toolbar>
          {/* Logo / Title */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ mr: 4, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Pokémon Inventory Admin
          </Typography>

          {/* Horizontal Navigation Links */}
          <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{ 
                    color: 'white',
                    px: 2,
                    textTransform: 'none',
                    fontWeight: isActive ? 'bold' : 'normal',
                    bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    borderBottom: isActive ? '3px solid white' : '3px solid transparent',
                    borderRadius: 0, // Squared look for nav tabs
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.08)',
                      borderBottom: '3px solid rgba(255,255,255,0.5)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar /> {/* Spacer to prevent content hiding behind fixed AppBar */}
        <Outlet /> 
      </Box>
    </Box>
  );
}