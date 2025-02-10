import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LifeTrack } from './pages/LifeTrack';
import { OlahragaTrack } from './pages/OlahragaTrack';
import { OCDSystems } from './pages/OCDSystems';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 mt-16 md:mt-0">
          <Routes>
            <Route path="/" element={<Navigate to="/life-track" replace />} />
            <Route path="/life-track" element={<LifeTrack />} />
            <Route path="/olahraga-track" element={<OlahragaTrack />} />
            <Route path="/ocd-systems" element={<OCDSystems />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;