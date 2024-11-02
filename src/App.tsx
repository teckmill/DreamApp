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

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
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
              </Routes>
            </main>
            <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 dark:text-gray-400">
              <p>© 2024 DreamScape. All rights reserved.</p>
            </footer>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;