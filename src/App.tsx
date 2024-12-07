import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';

const App: React.FC = () => {
  const isMobile = window.innerWidth <= 768;

  return (
    <Router>
      {isMobile ? (
        <Routes>
          <Route path="/properties/:propertyId/conversations" element={<Conversations />} />
          <Route path="/properties/:propertyId/conversations/:conversationId" element={<ConversationDetail />} />
          <Route path="/" element={<MobileLayout />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/properties/:propertyId/conversations" element={<Conversations />} />
          <Route path="/properties/:propertyId/conversations/:conversationId" element={<ConversationDetail />} />
          <Route path="/" element={<DesktopLayout />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
