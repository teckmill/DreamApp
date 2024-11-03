interface User {
  id: string;
  username: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  username: string;
}

// Simulate a users database using localStorage
const USERS_KEY = 'dreamscape_users';
const CURRENT_USER_KEY = 'dreamscape_current_user';

export const authService = {
  // Get all users from localStorage
  getUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  // Save users to localStorage
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Register a new user
  register(credentials: RegisterCredentials): User {
    const users = this.getUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === credentials.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: credentials.username,
      email: credentials.email
    };

    users.push(newUser);
    this.saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return newUser;
  },

  // Login user
  login(credentials: LoginCredentials): User {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, you'd hash passwords and compare them properly
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Logout user
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },

  // Add new getUserById method
  getUserById(userId: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === userId) || null;
  },
}; 