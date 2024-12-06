import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
import Conversations from './pages/Conversations';

const App: React.FC = () => {
  // Détection d'un écran mobile ou non
  const isMobile = window.innerWidth <= 768;
  console.log('✅ App démarrée. Mode :', isMobile ? 'Mobile' : 'Desktop');

  return (
    <Router>
      {isMobile ? (
        <Routes>
          {/* Route pour afficher les conversations d'une propriété en mode mobile */}
          <Route path="/properties/:propertyId/conversations" element={<Conversations />} />
          {/* Page d'accueil pour mobile */}
          <Route path="/" element={<MobileLayout />} />
        </Routes>
      ) : (
        <Routes>
          {/* Route pour afficher les conversations d'une propriété en mode desktop */}
          <Route path="/properties/:propertyId/conversations" element={<Conversations />} />
          {/* Page d'accueil pour desktop */}
          <Route path="/" element={<DesktopLayout />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;

