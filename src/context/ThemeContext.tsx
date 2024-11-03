import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Add custom CSS variables for dark theme
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0F172A'); // Deep blue-gray
      root.style.setProperty('--bg-secondary', '#1E293B'); // Lighter blue-gray
      root.style.setProperty('--bg-tertiary', '#334155'); // Even lighter blue-gray
      root.style.setProperty('--text-primary', '#E2E8F0'); // Light gray
      root.style.setProperty('--text-secondary', '#94A3B8'); // Muted gray
      root.style.setProperty('--accent-primary', '#818CF8'); // Indigo
      root.style.setProperty('--accent-secondary', '#6366F1'); // Darker indigo
      root.style.setProperty('--border-color', '#2D3748'); // Dark blue-gray
      root.style.setProperty('--hover-bg', '#2D3748'); // Dark blue-gray for hover
    } else {
      // Reset to default light theme variables
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--bg-secondary');
      root.style.removeProperty('--bg-tertiary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-secondary');
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--hover-bg');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}