import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Moon, Sun, Menu } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DreamJournal from './pages/DreamJournal';
import Community from './pages/Community';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Subscription from './pages/Subscription';
import AdminPanel from './pages/AdminPanel';
import { systemService } from './services/systemService';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAdmin, isAuthenticated } = useAuth();
  const isMaintenanceMode = systemService.isMaintenanceMode();

  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Maintenance Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The site is currently undergoing maintenance. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/journal" element={
            <ProtectedRoute>
              <DreamJournal />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>© 2024 DreamScape. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;