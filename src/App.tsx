import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Moon, Sun, Menu } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DreamJournal from './pages/DreamJournal';
import Community from './pages/Community';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/journal" element={<DreamJournal />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;