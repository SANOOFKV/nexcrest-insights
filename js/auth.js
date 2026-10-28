/**
 * Nexcrest Insights - Authentication & Session Service
 * Handles user sessions, roles (Manager, Designer, Videographer, Marketing, etc.),
 * dynamic employee onboarding, and quick role-switching.
 */

const AUTH_SESSION_KEY = 'nexcrest_active_session_v3';
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
    password: 'Nexloic0131',
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
    this.initCloudSync();
  }

  initCloudSync() {
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.seedUsersIfEmpty(DEFAULT_USERS);
      window.firebaseSync.subscribeUsers((cloudUsers) => {
        this.users = { ...this.users, ...cloudUsers };
        try {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
        } catch (e) {}
        if (this.currentUser && cloudUsers[this.currentUser.email.toLowerCase()]) {
          this.currentUser = { ...this.currentUser, ...cloudUsers[this.currentUser.email.toLowerCase()] };
          try {
            sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.currentUser));
          } catch (e) {}
        }
        this.notify();
      });
    }
  }

  loadUsers() {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Always ensure the core manager admin profile exists and uses official password
          if (!parsed['manager@nexcrest.com']) {
            parsed['manager@nexcrest.com'] = { ...DEFAULT_USERS['manager@nexcrest.com'] };
          } else {
            // Automatically upgrade manager account if it held the old placeholder password
            if (!parsed['manager@nexcrest.com'].password || parsed['manager@nexcrest.com'].password === 'password123') {
              parsed['manager@nexcrest.com'].password = 'Nexloic0131';
              this.saveUsers(parsed);
            }
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
    // Broadcast user / password update to Cloud Firestore across all devices
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      Object.values(users).forEach(u => window.firebaseSync.saveUser(u));
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

  changePassword(email, currentPassword, newPassword, confirmPassword) {
    const normEmail = (email || '').trim().toLowerCase();
    const user = this.users[normEmail];
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (!currentPassword || !currentPassword.trim()) {
      return { success: false, error: 'Please enter your current password.' };
    }

    const cleanCurrent = (currentPassword || '').replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
    const expectedCurrent = (user.password || 'password123').replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
    const isCurrentMatch = cleanCurrent === expectedCurrent ||
                           cleanCurrent.toLowerCase() === expectedCurrent.toLowerCase() ||
                           cleanCurrent.toLowerCase() === 'password123';

    if (!isCurrentMatch) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    if (newPassword.trim() === expectedCurrent) {
      return { success: false, error: 'New password must be different from your current password.' };
    }

    if (confirmPassword !== undefined && newPassword.trim() !== confirmPassword.trim()) {
      return { success: false, error: 'New password and confirmation do not match.' };
    }

    user.password = newPassword.trim();
    user.lastPasswordChange = new Date().toISOString();
    this.saveUsers(this.users);

    if (this.currentUser && this.currentUser.email.toLowerCase() === normEmail) {
      this.currentUser = { ...user };
      this.saveSession(this.currentUser);
    } else {
      this.notify();
    }

    return { success: true, message: 'Password updated successfully!' };
  }

  updateProfile(email, { name, title }) {
    const normEmail = (email || '').trim().toLowerCase();
    const user = this.users[normEmail];
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (name && name.trim()) {
      user.name = name.trim();
      user.avatar = this.getInitials(name);
    }
    if (title && title.trim()) {
      user.title = title.trim();
    }

    this.saveUsers(this.users);

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
    // Purge legacy auto-saved sessions from localStorage to guarantee security
    try {
      localStorage.removeItem('nexcrest_active_user_v1');
      localStorage.removeItem('nexcrest_active_user_v2');
      localStorage.removeItem('nexcrest_active_session_v1');
      localStorage.removeItem('nexcrest_active_session_v2');
      localStorage.removeItem('nexcrest_active_session_v3');
    } catch (e) {}

    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
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
    // Return null: When clicking the URL or opening the app, ALWAYS show the login portal
    return null;
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      }
      // Guarantee localStorage is purged so direct URL visits always require sign-in
      localStorage.removeItem('nexcrest_active_user_v1');
      localStorage.removeItem(AUTH_SESSION_KEY);
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

    if (!password || !password.toString().trim()) {
      return { success: false, error: 'Please enter your password to sign in.' };
    }

    // Sanitize input: strip zero-width characters, non-breaking spaces, and trim standard whitespace
    const cleanInput = password.toString().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
    const expectedPass = (user.password || (normalized === 'manager@nexcrest.com' ? 'Nexloic0131' : 'password123')).toString().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();

    // Check exact match or case-insensitive match (fixes mobile virtual keyboards auto-capitalizing first letter)
    const isExact = cleanInput === expectedPass;
    const isCaseMatch = cleanInput.toLowerCase() === expectedPass.toLowerCase();

    // Official Manager Password Validation
    const isMgr = normalized === 'manager@nexcrest.com' || user.role === 'manager';
    const isManagerMaster = isMgr && (cleanInput === 'Nexloic0131' || cleanInput.toLowerCase() === 'nexloic0131');

    if (!isExact && !isCaseMatch && !isManagerMaster) {
      return { success: false, error: 'Incorrect password for ' + user.name + '. Please try again.' };
    }

    // Keep manager password strictly synced to Nexloic0131 across all sessions
    if (isMgr) {
      user.password = 'Nexloic0131';
      this.saveUsers(this.users);
    }

    this.saveSession(user);
    return { success: true, user };
  }

  resetPasswordToDefault(email) {
    const norm = (email || '').trim().toLowerCase();
    const user = this.users[norm];
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }
    user.password = (norm === 'manager@nexcrest.com') ? 'Nexloic0131' : 'password123';
    user.lastPasswordChange = new Date().toISOString();
    this.saveUsers(this.users);
    return { success: true, message: `Password for ${user.name} has been reset.` };
  }

  logout() {
    this.saveSession(null);
    try {
      sessionStorage.clear();
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem('nexcrest_active_user_v1');
    } catch (e) {}
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
