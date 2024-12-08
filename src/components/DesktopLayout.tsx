import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Properties from '../pages/desktop/Properties';
import Conversations from '../pages/Conversations';
import Settings from '../pages/Settings';
import MobileChat from '../pages/MobileChat';
import ChatSandbox from '../pages/ChatSandbox';
import EmergencyCases from '../pages/EmergencyCases';

const DesktopLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed inset-y-0 left-0 w-64">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Properties />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:propertyId" element={<Conversations />} />
            <Route path="/chat/:conversationId" element={<MobileChat />} />
            <Route path="/emergency" element={<EmergencyCases />} />
            <Route path="/sandbox" element={<ChatSandbox />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
