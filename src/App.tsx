import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { LifeTrack } from './pages/LifeTrack';
import { OlahragaTrack } from './pages/OlahragaTrack';
import { OCDSystems } from './pages/OCDSystems';
import { Changelog } from './pages/Changelog';
import { AuthPage } from './pages/auth/AuthPage';
import { Console } from './pages/admin/Console';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 mt-16 md:mt-0">
            <Routes>
              <Route path="/" element={<Navigate to="/life-track" replace />} />
              <Route path="/life-track" element={<LifeTrack />} />
              <Route path="/olahraga-track" element={<OlahragaTrack />} />
              <Route path="/ocd-systems" element={<OCDSystems />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/admin/console"
                element={
                  <AdminRoute>
                    <Console />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App