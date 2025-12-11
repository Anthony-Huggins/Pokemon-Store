import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CardLibrary from './pages/CardLibrary';
import SyncManager from './pages/SyncManager';
import CardScanner from './pages/CardScanner';

function App() {
  return (
    <Routes>
      {/* The Layout wraps all these routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="library" element={<CardLibrary />} />
        <Route path="sync" element={<SyncManager />} />
        <Route path="scan" element={<CardScanner />} />
      </Route>
    </Routes>
  );
}

export default App;