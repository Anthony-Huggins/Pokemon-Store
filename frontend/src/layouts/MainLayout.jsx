import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline 
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory2'; // Your Cards
import StoreIcon from '@mui/icons-material/Store'; // Warehouses
import StyleIcon from '@mui/icons-material/Style'; // Card Library
import CloudSyncIcon from '@mui/icons-material/CloudSync'; // Sync

const drawerWidth = 240;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'My Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Stores', icon: <StoreIcon />, path: '/warehouses' },
    { text: 'Card Library', icon: <StyleIcon />, path: '/library' },
    { text: 'Sync Manager', icon: <CloudSyncIcon />, path: '/sync' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Pokémon Inventory Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Drawer) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar /> {/* Spacer to push content down below AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Spacer to push content down below AppBar */}
        {/* The <Outlet /> renders the current page based on the URL */}
        <Outlet /> 
      </Box>
    </Box>
  );
}