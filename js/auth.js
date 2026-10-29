/**
 * Nexcrest Insights - Authentication & Session Service
 * Handles user sessions, roles (Manager, Designer, Videographer, Marketing, etc.),
 * dynamic employee onboarding, SHA-256 cryptographic credential hashing, and security rate limiting.
 */

const AUTH_SESSION_KEY = 'nexcrest_active_session_v3';
const USERS_STORAGE_KEY = 'nexcrest_users_v2';
const CUSTOM_PROFILES_KEY = 'nexcrest_custom_profiles_v1';

// Pure JavaScript SHA-256 Cryptographic Hash Utility (Zero External Dependencies)
function hashPassword(password) {
  if (!password) return '';
  const clean = password.toString().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
  const ascii = 'nexcrest_kpi_v2::' + clean;
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;
  var hash = hashPassword.h = hashPassword.h || [];
  var k = hashPassword.k = hashPassword.k || [];
  var primeCounter = k[lengthProperty];
  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = asciiBitLength;
  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

// Default Users with Cryptographic SHA-256 Hashes (Zero Plaintext Passwords)
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
    passwordHash: 'ad66d6793d4dc6ddeaa846f6d6b2ba7fd3bdcbce026f652a1a1d751e9c60babb',
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
    passwordHash: '02d1b38eaa9b63391a31b00d882dfe78776eb3ada6e4440940de95334bf8173d',
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
    passwordHash: '02d1b38eaa9b63391a31b00d882dfe78776eb3ada6e4440940de95334bf8173d',
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
    passwordHash: '02d1b38eaa9b63391a31b00d882dfe78776eb3ada6e4440940de95334bf8173d',
    createdAt: '2026-10-01T00:00:00Z',
    isSystem: true
  }
};

class AuthService {
  constructor() {
    this.listeners = [];
    this.failedAttempts = 0;
    this.lockoutUntil = 0;
    this.users = this.loadUsers();
    this.currentUser = this.loadSession();
    this.initCloudSync();
  }

  loadCustomProfiles() {
    try {
      const raw = localStorage.getItem(CUSTOM_PROFILES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {};
  }

  saveCustomProfiles(profiles) {
    try {
      localStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(profiles));
    } catch (e) {}
  }

  applyCustomProfiles(usersMap) {
    if (!usersMap || typeof usersMap !== 'object') return;
    const customProfiles = this.loadCustomProfiles();
    Object.entries(customProfiles).forEach(([email, custom]) => {
      const norm = email.toLowerCase().trim();
      if (usersMap[norm] && custom && custom.name) {
        usersMap[norm].name = custom.name;
        usersMap[norm].avatar = this.getInitials(custom.name);
        if (custom.title) usersMap[norm].title = custom.title;
      }
    });
  }

  initCloudSync() {
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.seedUsersIfEmpty(DEFAULT_USERS);
      window.firebaseSync.subscribeUsers((cloudUsers) => {
        // Enforce user custom profiles over stale cloud defaults
        const customProfiles = this.loadCustomProfiles();
        let needsCloudResync = false;

        Object.keys(cloudUsers).forEach(email => {
          const custom = customProfiles[email];
          const cloudU = cloudUsers[email];
          if (custom && custom.name && cloudU) {
            if (cloudU.name !== custom.name || (custom.title && cloudU.title !== custom.title)) {
              cloudU.name = custom.name;
              cloudU.avatar = this.getInitials(custom.name);
              if (custom.title) cloudU.title = custom.title;
              needsCloudResync = true;
            }
          }
        });

        this.users = { ...this.users, ...cloudUsers };
        this.applyCustomProfiles(this.users);

        try {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
        } catch (e) {}

        if (this.currentUser && this.users[this.currentUser.email.toLowerCase()]) {
          this.currentUser = { ...this.currentUser, ...this.users[this.currentUser.email.toLowerCase()] };
          try {
            sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.currentUser));
          } catch (e) {}
        }

        // If Cloud Firestore held stale default names, push the customized names to Firestore
        if (needsCloudResync && window.firebaseSync && window.firebaseSync.isActive()) {
          Object.keys(customProfiles).forEach(email => {
            if (this.users[email]) {
              window.firebaseSync.saveUser(this.users[email]);
            }
          });
        }

        this.notify();
      });
    }
  }

  loadUsers() {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    let users = null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          let migrated = false;
          // Normalize brand display across all user records (Techschool, IT, Both)
          Object.values(parsed).forEach(u => {
            if (u && (u.brand === 'Nexcrest Techschool' || u.brand === 'Insights')) {
              u.brand = 'Techschool';
              migrated = true;
            } else if (u && u.brand === 'Nexcrest IT') {
              u.brand = 'IT';
              migrated = true;
            } else if (u && (u.brand === 'Both Brands' || !u.brand)) {
              u.brand = 'Both';
              migrated = true;
            }

            // Cryptographic Migration: upgrade legacy plaintext password to secure SHA-256 hash
            if (u && u.password && !u.passwordHash) {
              u.passwordHash = hashPassword(u.password);
              delete u.password;
              migrated = true;
            } else if (u && u.password) {
              delete u.password;
              migrated = true;
            }
          });

          // Always ensure the core manager admin profile exists and uses secure cryptographic hash
          if (!parsed['manager@nexcrest.com']) {
            parsed['manager@nexcrest.com'] = { ...DEFAULT_USERS['manager@nexcrest.com'] };
            migrated = true;
          } else if (!parsed['manager@nexcrest.com'].passwordHash) {
            parsed['manager@nexcrest.com'].passwordHash = 'ad66d6793d4dc6ddeaa846f6d6b2ba7fd3bdcbce026f652a1a1d751e9c60babb';
            delete parsed['manager@nexcrest.com'].password;
            migrated = true;
          }

          // If code modified DEFAULT_USERS and user has no manual override, synchronize with code
          const customProfiles = this.loadCustomProfiles();
          Object.keys(DEFAULT_USERS).forEach(email => {
            if (!customProfiles[email] && DEFAULT_USERS[email] && parsed[email]) {
              if (DEFAULT_USERS[email].name && parsed[email].name !== DEFAULT_USERS[email].name && parsed[email].name === 'Marketing Manager') {
                parsed[email].name = DEFAULT_USERS[email].name;
                parsed[email].avatar = this.getInitials(DEFAULT_USERS[email].name);
                migrated = true;
              }
            }
          });

          // Enforce customized profiles
          this.applyCustomProfiles(parsed);

          if (migrated) this.saveUsers(parsed);
          users = parsed;
        }
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }

    if (!users) {
      users = { ...DEFAULT_USERS };
      this.applyCustomProfiles(users);
      this.saveUsers(users);
    }

    return users;
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

    const normBrand = (brand === 'IT' || brand === 'Nexcrest IT') ? 'IT' : (brand === 'Techschool' || brand === 'Nexcrest Techschool' ? 'Techschool' : 'Both');

    const newUser = {
      id: 'emp-' + Date.now(),
      email: normEmail,
      name: name.trim(),
      role: role || 'designer',
      title: (title || '').trim() || `${(role || 'Team').toUpperCase()} Specialist`,
      brand: normBrand,
      avatar: this.getInitials(name),
      badgeClass: this.getRoleBadgeClass(role),
      passwordHash: hashPassword(password || 'password123'),
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
      const customProfiles = this.loadCustomProfiles();
      customProfiles[normEmail] = {
        name: user.name,
        title: user.title,
        avatar: user.avatar,
        updatedAt: Date.now()
      };
      this.saveCustomProfiles(customProfiles);
    }
    if (role) {
      user.role = role;
      user.badgeClass = this.getRoleBadgeClass(role);
    }
    if (title && title.trim()) {
      user.title = title.trim();
    }
    if (brand) {
      user.brand = (brand === 'IT' || brand === 'Nexcrest IT') ? 'IT' : (brand === 'Techschool' || brand === 'Nexcrest Techschool' ? 'Techschool' : 'Both');
    }
    if (password && password.trim()) {
      user.passwordHash = hashPassword(password.trim());
      delete user.password;
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
    const currentHash = hashPassword(cleanCurrent);
    const expectedHash = user.passwordHash || (user.password ? hashPassword(user.password) : '02d1b38eaa9b63391a31b00d882dfe78776eb3ada6e4440940de95334bf8173d');

    // Strict cryptographic match (Zero backdoor strings!)
    if (currentHash !== expectedHash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const cleanNew = newPassword.trim();
    const newHash = hashPassword(cleanNew);

    if (newHash === expectedHash) {
      return { success: false, error: 'New password must be different from your current password.' };
    }

    if (confirmPassword !== undefined && cleanNew !== confirmPassword.trim()) {
      return { success: false, error: 'New password and confirmation do not match.' };
    }

    user.passwordHash = newHash;
    delete user.password;
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

    // Persist permanently in custom profiles store so new commits/cloud snapshots can never overwrite it!
    const customProfiles = this.loadCustomProfiles();
    customProfiles[normEmail] = {
      name: user.name,
      title: user.title,
      avatar: user.avatar,
      updatedAt: Date.now()
    };
    this.saveCustomProfiles(customProfiles);

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
        if (parsed && parsed.email) {
          const norm = parsed.email.toLowerCase();
          const custom = this.loadCustomProfiles()[norm];
          if (custom && custom.name) {
            parsed.name = custom.name;
            if (custom.title) parsed.title = custom.title;
          }
          if (this.users[norm]) {
            return { ...this.users[norm], ...parsed };
          }
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
        // Strip sensitive password hashes from session storage
        const safeSessionUser = { ...user };
        delete safeSessionUser.password;
        delete safeSessionUser.passwordHash;
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(safeSessionUser));
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
    // Security rate limiter & brute-force lockout
    const now = Date.now();
    if (this.lockoutUntil && now < this.lockoutUntil) {
      const remainingSec = Math.ceil((this.lockoutUntil - now) / 1000);
      return {
        success: false,
        error: `Too many failed attempts. Temporary security lockout active. Please wait ${remainingSec}s.`
      };
    }

    const normalized = (email || '').trim().toLowerCase();
    const user = this.users[normalized];

    if (!user) {
      return { success: false, error: 'User account not found. Please check your email or contact the administrator.' };
    }

    if (!password || !password.toString().trim()) {
      return { success: false, error: 'Please enter your password to sign in.' };
    }

    // Sanitize input: strip zero-width characters and whitespace
    const cleanInput = password.toString().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
    const inputHash = hashPassword(cleanInput);

    const expectedHash = user.passwordHash ||
      (user.password ? hashPassword(user.password) :
        (normalized === 'manager@nexcrest.com'
          ? 'ad66d6793d4dc6ddeaa846f6d6b2ba7fd3bdcbce026f652a1a1d751e9c60babb'
          : '02d1b38eaa9b63391a31b00d882dfe78776eb3ada6e4440940de95334bf8173d'));

    // Strict case-sensitive cryptographic hash match
    const isMatch = inputHash === expectedHash;

    if (!isMatch) {
      this.failedAttempts = (this.failedAttempts || 0) + 1;
      if (this.failedAttempts >= 5) {
        this.lockoutUntil = Date.now() + 30000; // 30-second security lockout
        return {
          success: false,
          error: 'Too many consecutive failed login attempts. Account temporarily locked for 30 seconds.'
        };
      }
      return { success: false, error: 'Incorrect password for ' + user.name + '. Please try again.' };
    }

    // Reset failed attempts upon successful authentication
    this.failedAttempts = 0;
    this.lockoutUntil = 0;

    // Migrate any legacy plaintext password to cryptographic hash
    if (!user.passwordHash || user.password) {
      user.passwordHash = expectedHash;
      delete user.password;
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
    user.passwordHash = (norm === 'manager@nexcrest.com')
      ? 'ad66d6793d4dc6ddeaa846f6d6b2ba7fd3bdcbce026f652a1a1d751e9c60babb'
      : '02d1b38eaa9b63391a31b00d882dfe78776eb3ada6e4440940de95334bf8173d';
    delete user.password;
    user.lastPasswordChange = new Date().toISOString();
    this.saveUsers(this.users);
    return { success: true, message: `Password for ${user.name} has been reset to default.` };
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
