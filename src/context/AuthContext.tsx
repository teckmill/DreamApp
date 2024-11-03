import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { moderationService } from '../services/moderationService';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(authService.isAuthenticated());
    
    // Check if user is admin
    if (currentUser) {
      const isUserAdmin = currentUser.email === 'teckmillion17@gmail.com' || 
                         moderationService.getModeratorRole(currentUser.id) === 'admin';
      setIsAdmin(isUserAdmin);

      // If this is the first user and no admins exist, make them an admin
      const allModerators = moderationService.getModerators();
      if (allModerators.length === 0) {
        moderationService.assignModerator(currentUser.id, 'admin', currentUser.id);
        setIsAdmin(true);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = authService.login({ email, password });
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.email === 'teckmillion17@gmail.com');
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const user = authService.register({ username, email, password });
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('No user logged in');
      
      const updatedUser = { ...currentUser, ...updates };
      const users = authService.getUsers();
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      
      authService.saveUsers(updatedUsers);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated, 
      isAdmin, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 