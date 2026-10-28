/**
 * Nexcrest Media & Marketing - Authentication & Session Service
 * Handles user sessions, roles (Manager, Designer, Videographer, Marketing, etc.),
 * dynamic employee onboarding, and quick role-switching.
 */

const AUTH_STORAGE_KEY = 'nexcrest_active_user_v1';
const USERS_STORAGE_KEY = 'nexcrest_users_v2';

const DEFAULT_USERS = {
  'manager@nexcrest.com': {
    id: 'usr-manager',
    email: 'manager@nexcrest.com',
    role: 'manager',
    name: 'Marketing Manager',
    title: 'Operations & Strategy Lead',
    brand: 'Both',
    avatar: 'M',
    badgeClass: 'badge-manager',
    password: 'password123',
    createdAt: '2026-10-01T00:00:00Z',
    isSystem: true
  },
  'designer@nexcrest.com': {
    id: 'usr-designer',
    email: 'designer@nexcrest.com',
    role: 'designer',
    name: 'Graphic Designer',
    title: 'Visual & Brand Design Specialist',
    brand: 'Both',
    avatar: 'GD',
    badgeClass: 'badge-designer',
    password: 'password123',
    createdAt: '2026-10-01T00:00:00Z',
    isSystem: true
  },
  'videographer@nexcrest.com': {
    id: 'usr-videographer',
    email: 'videographer@nexcrest.com',
    role: 'videographer',
    name: 'Videographer + Editor',
    title: 'Video Production & Editing Lead',
    brand: 'Both',
    avatar: 'VE',
    badgeClass: 'badge-videographer',
    password: 'password123',
    createdAt: '2026-10-01T00:00:00Z',
    isSystem: true
  },
  'marketing@nexcrest.com': {
    id: 'usr-marketing',
    email: 'marketing@nexcrest.com',
    role: 'marketing',
    name: 'Marketing Executive',
    title: 'Campaigns & Lead Acquisition',
    brand: 'Both',
    avatar: 'ME',
    badgeClass: 'badge-marketing',
    password: 'password123',
    createdAt: '2026-10-01T00:00:00Z',
    isSystem: true
  }
};

class AuthService {
  constructor() {
    this.listeners = [];
    this.users = this.loadUsers();
    this.currentUser = this.loadSession();
  }

  loadUsers() {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Always ensure the core manager admin profile exists
          if (!parsed['manager@nexcrest.com']) {
            parsed['manager@nexcrest.com'] = { ...DEFAULT_USERS['manager@nexcrest.com'] };
          }
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }
    this.saveUsers(DEFAULT_USERS);
    return { ...DEFAULT_USERS };
  }

  restoreDefaultUsers() {
    this.users = { ...DEFAULT_USERS };
    this.saveUsers(this.users);
    this.notify();
    return this.users;
  }

  saveUsers(users) {
    this.users = users;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Storage quota exceeded while saving users', e);
    }
  }

  getAllUsers() {
    return Object.values(this.users);
  }

  getEmployees() {
    // Return all team members except the manager
    return this.getAllUsers().filter(u => u.role !== 'manager');
  }

  getUserByEmail(email) {
    if (!email) return null;
    const norm = email.trim().toLowerCase();
    return this.users[norm] || null;
  }

  getUserById(id) {
    return this.getAllUsers().find(u => u.id === id) || null;
  }

  getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  getRoleBadgeClass(role) {
    const map = {
      manager: 'badge-manager',
      designer: 'badge-designer',
      videographer: 'badge-videographer',
      marketing: 'badge-marketing',
      content: 'badge-content',
      motion: 'badge-motion',
      community: 'badge-community',
      uiux: 'badge-uiux'
    };
    return map[role] || 'badge-designer';
  }

  addUser({ name, email, role, title, brand = 'Both', password = 'password123' }) {
    const normEmail = (email || '').trim().toLowerCase();
    if (!normEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!name || !name.trim()) {
      return { success: false, error: 'Employee name is required.' };
    }
    if (this.users[normEmail]) {
      return { success: false, error: 'An employee with this email address already exists.' };
    }

    const newUser = {
      id: 'emp-' + Date.now(),
      email: normEmail,
      name: name.trim(),
      role: role || 'designer',
      title: (title || '').trim() || `${(role || 'Team').toUpperCase()} Specialist`,
      brand: brand || 'Both',
      avatar: this.getInitials(name),
      badgeClass: this.getRoleBadgeClass(role),
      password: password || 'password123',
      createdAt: new Date().toISOString(),
      isSystem: false
    };

    this.users[normEmail] = newUser;
    this.saveUsers(this.users);
    this.notify();
    return { success: true, user: newUser };
  }

  updateUser(email, { name, role, title, brand, password }) {
    const normEmail = (email || '').trim().toLowerCase();
    const user = this.users[normEmail];
    if (!user) return { success: false, error: 'Employee not found.' };

    if (name && name.trim()) {
      user.name = name.trim();
      user.avatar = this.getInitials(name);
    }
    if (role) {
      user.role = role;
      user.badgeClass = this.getRoleBadgeClass(role);
    }
    if (title && title.trim()) {
      user.title = title.trim();
    }
    if (brand) {
      user.brand = brand;
    }
    if (password && password.trim()) {
      user.password = password.trim();
    }

    this.saveUsers(this.users);

    // If current session is this user, refresh it
    if (this.currentUser && this.currentUser.email.toLowerCase() === normEmail) {
      this.currentUser = { ...user };
      this.saveSession(this.currentUser);
    } else {
      this.notify();
    }

    return { success: true, user };
  }

  deleteUser(email) {
    const normEmail = (email || '').trim().toLowerCase();
    const user = this.users[normEmail];
    if (!user) return { success: false, error: 'Employee not found.' };
    if (user.role === 'manager' || normEmail === 'manager@nexcrest.com') {
      return { success: false, error: 'The primary Marketing Manager account cannot be removed.' };
    }

    delete this.users[normEmail];
    this.saveUsers(this.users);

    // If current session is this deleted user, log out cleanly
    if (this.currentUser && this.currentUser.email.toLowerCase() === normEmail) {
      this.logout();
    } else {
      this.notify();
    }

    return { success: true, user };
  }

  loadSession() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Refresh with latest stored data if available
        if (parsed && parsed.email && this.users[parsed.email.toLowerCase()]) {
          return this.users[parsed.email.toLowerCase()];
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    // Default to Marketing Manager so the Command Center & Team Roster are immediately active and visible
    const defaultManager = this.users['manager@nexcrest.com'];
    if (defaultManager) {
      this.saveSession(defaultManager);
      return defaultManager;
    }
    return null;
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Storage error while saving session', e);
    }
    this.notify();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  login(email, password) {
    const normalized = (email || '').trim().toLowerCase();
    const user = this.users[normalized];

    if (!user) {
      return { success: false, error: 'User account not found. Please check your email or contact the administrator.' };
    }

    if (!password || !password.trim()) {
      return { success: false, error: 'Please enter your password to sign in.' };
    }

    const expectedPass = user.password || 'password123';
    if (password.trim() !== expectedPass) {
      return { success: false, error: 'Incorrect password for ' + user.name + '. Please try again.' };
    }

    this.saveSession(user);
    return { success: true, user };
  }

  logout() {
    this.saveSession(null);
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    if (Array.isArray(this.listeners)) {
      this.listeners.forEach(cb => cb(this.currentUser));
    }
  }
}

// Global instance
window.AuthService = AuthService;
window.authService = new AuthService();
