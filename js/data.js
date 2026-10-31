/**
 * Nexcrest Insights - Data Storage & Model Service
 * Manages targets, deliverables, and submissions across Graphic Designer,
 * Videographer + Editor, and Marketing Executive.
 */

const STORAGE_KEYS = {
  TARGETS: 'nexcrest_targets_v2',
  SUBMISSIONS: 'nexcrest_submissions_v2',
  SELECTED_MONTH: 'nexcrest_active_month_v2'
};

// Seed Targets based on exact user specification & chart + September 2026 Archive
const SEED_TARGETS = [
  // ================= GRAPHIC DESIGNER (15 Deliverables assigned by Manager) =================
  {
    id: 'target-1793365529125',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Best AI Tools Carousal',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365575079',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Branding',
    program: '5 Mistakes Carousal',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365599040',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'AI Replace Developers Carousal',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365625418',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Jailer Frontend vs Backend Carousal',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365658549',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'IT',
    category: 'Branding',
    program: '2nd Anniversary',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365692193',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Campus Events',
    program: 'Students Day Carousal',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365706869',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Campus Events',
    program: 'Halloween Poster',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365734373',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Marketing',
    program: 'Advanced AI Engineering Poster',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365760539',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Marketing',
    program: 'Master Advanced AI Engineering',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365785173',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'IT',
    category: 'Marketing',
    program: 'Sales officer B2B Hiring Poster',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365811566',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'IT',
    category: 'Marketing',
    program: 'One ERP Poster 1',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365830026',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'IT',
    category: 'Marketing',
    program: 'BDE Hiring Poster',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365848429',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'IT',
    category: 'Marketing',
    program: 'One ERP Poster 2',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365877870',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'IT',
    category: 'Marketing',
    program: 'UAE Business ERP',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  },
  {
    id: 'target-1793365899353',
    assignee: 'designer',
    assigneeName: 'Avanthika',
    assigneeEmail: 'designer@nexcrest.com',
    assigneeRole: 'designer',
    brand: 'Techschool',
    category: 'Marketing',
    program: 'BCA/MCA Poster',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: '',
    deadline: ''
  }
];

// Legacy demo targets & submissions to permanently purge from all clients and cloud
const LEGACY_DEMO_TARGET_IDS = [
  'gd-1', 'gd-2', 'gd-3', 'gd-4', 'gd-5', 'gd-6', 'gd-7', 'gd-8', 'gd-9', 'gd-10',
  've-1', 've-2', 've-3', 've-4', 've-5', 've-6', 've-7',
  'me-1', 'me-2', 'me-3', 'me-4', 'me-5', 'me-6',
  'sep-1', 'sep-2', 'sep-3', 'sep-4', 'sep-5', 'sep-6', 'sep-7', 'sep-8'
];

const LEGACY_DEMO_SUB_PREFIXES = ['sep-sub-', 'sub-'];

// Submissions start clean with 0 demo records
const SEED_SUBMISSIONS = [];

class DataStore {
  constructor() {
    this.listeners = [];
    this.targets = this.loadTargets();
    this.submissions = this.loadSubmissions();
    this.activeMonth = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH) || '2026-10';
    this.initCloudSync();
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notify() {
    if (Array.isArray(this.listeners)) {
      this.listeners.forEach(cb => {
        try { cb(); } catch (e) { console.error('DataStore listener notice:', e); }
      });
    }
  }

  initCloudSync() {
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.seedTargetsIfEmpty(SEED_TARGETS);
      window.firebaseSync.seedSubmissionsIfEmpty(SEED_SUBMISSIONS);

      // Permanently remove all legacy mock demo seed targets and submissions from Cloud Firestore
      window.firebaseSync.deleteMultipleTargets(LEGACY_DEMO_TARGET_IDS);

      const legacyTargetSet = new Set(LEGACY_DEMO_TARGET_IDS);

      window.firebaseSync.subscribeTargets((cloudTargets) => {
        if (Array.isArray(cloudTargets)) {
          this.targets = cloudTargets.filter(t => t && t.id && !legacyTargetSet.has(String(t.id)));
          try { localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(this.targets)); } catch (e) {}
          this.notify();
        }
      });
      window.firebaseSync.subscribeSubmissions((cloudSubs) => {
        if (Array.isArray(cloudSubs)) {
          this.submissions = cloudSubs.filter(s => {
            if (!s || !s.id) return false;
            const sid = String(s.id);
            if (LEGACY_DEMO_SUB_PREFIXES.some(prefix => sid.startsWith(prefix))) return false;
            return true;
          });
          try { localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions)); } catch (e) {}
          this.notify();
        }
      });
    }
  }

  loadTargets() {
    const legacyTargetSet = new Set(LEGACY_DEMO_TARGET_IDS);
    const raw = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (!raw) {
      this.saveTargets(SEED_TARGETS);
      return [...SEED_TARGETS];
    }
    try {
      let parsed = JSON.parse(raw);
      let migrated = false;

      // Purge all old mock seed targets from local cache if present
      const hadLegacy = parsed.some(t => legacyTargetSet.has(String(t.id)));
      if (hadLegacy) {
        parsed = parsed.filter(t => !legacyTargetSet.has(String(t.id)));
        migrated = true;
      }

      parsed.forEach(t => {
        if (t.brand === 'Insights' || t.brand === 'Nexcrest Insights' || t.brand === 'Nexcrest Techschool') {
          t.brand = 'Techschool';
          migrated = true;
        } else if (t.brand === 'Nexcrest IT') {
          t.brand = 'IT';
          migrated = true;
        } else if (t.brand === 'Both Brands') {
          t.brand = 'Both';
          migrated = true;
        }
      });
      if (migrated) this.saveTargets(parsed);
      return parsed;
    } catch (e) {
      console.error('Failed to parse targets', e);
      return [...SEED_TARGETS];
    }
  }

  saveTargets(data) {
    this.targets = Array.isArray(data) ? data : [];
    try {
      localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(this.targets));
    } catch (e) {
      console.error('Storage quota exceeded while saving targets', e);
    }
    // Broadcast target changes to Cloud Firestore
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      this.targets.forEach(t => window.firebaseSync.saveTarget(t));
    }
    this.notify();
  }

  loadSubmissions() {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      this.saveSubmissions(SEED_SUBMISSIONS);
      return [...SEED_SUBMISSIONS];
    }
    try {
      let parsed = JSON.parse(raw);
      let migrated = false;

      // Purge legacy mock demo submissions
      const initialCount = parsed.length;
      parsed = parsed.filter(s => {
        if (!s || !s.id) return false;
        const sid = String(s.id);
        if (LEGACY_DEMO_SUB_PREFIXES.some(prefix => sid.startsWith(prefix))) return false;
        return true;
      });
      if (parsed.length !== initialCount) {
        migrated = true;
      }

      parsed.forEach(s => {
        if (s.brand === 'Insights' || s.brand === 'Nexcrest Insights' || s.brand === 'Nexcrest Techschool') {
          s.brand = 'Techschool';
          migrated = true;
        } else if (s.brand === 'Nexcrest IT') {
          s.brand = 'IT';
          migrated = true;
        } else if (s.brand === 'Both Brands' || !s.brand) {
          s.brand = 'Both';
          migrated = true;
        }
      });
      if (migrated) this.saveSubmissions(parsed);
      return parsed;
    } catch (e) {
      console.error('Failed to parse submissions', e);
      return [...SEED_SUBMISSIONS];
    }
  }

  saveSubmissions(data) {
    this.submissions = Array.isArray(data) ? data : [];
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
    } catch (e) {
      console.error('Storage quota exceeded while saving submissions', e);
    }
    // Broadcast submission changes to Cloud Firestore
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      this.submissions.forEach(s => window.firebaseSync.saveSubmission(s));
    }
    this.notify();
  }

  setActiveMonth(month) {
    this.activeMonth = month;
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, month);
    } catch (e) {
      console.error('Storage error while saving active month', e);
    }
  }

  getActiveMonth() {
    return this.activeMonth;
  }

  normalizeCategory(cat) {
    if (!cat) return 'Branding';
    const c = String(cat).toLowerCase().trim();
    if (c.includes('campus') || c.includes('event') || c.includes('happening')) return 'Campus Events';
    if (c.includes('market') && !c.includes('moment')) return 'Marketing';
    if (c.includes('moment')) return 'Moment Marketing';
    if (c.includes('brand')) return 'Branding';
    return 'Branding';
  }

  // Target Methods
  getTargets(filters = {}) {
    return this.targets.filter(t => {
      if (t.month && t.month !== this.activeMonth) return false;
      if (filters.assignee && filters.assignee !== 'all') {
        const a = filters.assignee.toLowerCase();
        const matchesAssignee = (t.assignee && t.assignee.toLowerCase() === a) ||
                                (t.assigneeEmail && t.assigneeEmail.toLowerCase() === a) ||
                                (t.assigneeRole && t.assigneeRole.toLowerCase() === a);
        if (!matchesAssignee) return false;
      }
      if (filters.category && filters.category !== 'all') {
        const normFilterCat = this.normalizeCategory(filters.category);
        const normTargetCat = this.normalizeCategory(t.category);
        if (normFilterCat !== normTargetCat) return false;
      }
      if (filters.brand && filters.brand !== 'all') {
        if (filters.brand === 'Both') {
          if (t.brand !== 'Both') return false;
        } else {
          const normFilter = (filters.brand === 'IT' || filters.brand === 'Nexcrest IT') ? 'IT' : 'Techschool';
          const normTarget = (t.brand === 'IT' || t.brand === 'Nexcrest IT') ? 'IT' : (t.brand === 'Both' ? 'Both' : 'Techschool');
          if (normTarget !== 'Both' && normTarget !== normFilter) return false;
        }
      }
      return true;
    });
  }

  getTargetsForUser(user) {
    if (!user) return [];
    if (user.role === 'manager') return this.getTargets();
    const uEmail = (user.email || '').toLowerCase();
    const uRole = (user.role || '').toLowerCase();
    const uId = (user.id || '').toLowerCase();
    const uName = (user.name || '').toLowerCase();

    return this.targets.filter(t => {
      if (t.month && t.month !== this.activeMonth) return false;
      const tAssignee = (t.assignee || '').toLowerCase();
      const tEmail = (t.assigneeEmail || '').toLowerCase();
      const tRole = (t.assigneeRole || '').toLowerCase();
      const tName = (t.assigneeName || '').toLowerCase();

      // If target specifically has an assignee email, match user email
      if (tEmail) {
        return tEmail === uEmail;
      }
      if (tAssignee.includes('@')) {
        return tAssignee === uEmail;
      }
      return tAssignee === uRole || tRole === uRole || tAssignee === uId || (tName && tName === uName);
    });
  }

  getEmployeeStats(user) {
    if (!user) return { totalTarget: 0, totalCompleted: 0, totalPending: 0, pct: 0, extraCompleted: 0, remaining: 0, targetsCount: 0 };
    const targets = this.getTargetsForUser(user);
    let totalTarget = 0;
    let totalCompleted = 0;
    let totalPending = 0;

    targets.forEach(t => {
      const prog = this.getTargetProgress(t.id);
      if (!t.isExtra) {
        totalTarget += prog.target;
      }
      totalCompleted += prog.completed;
      totalPending += prog.pending;
    });

    const pct = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : (totalCompleted > 0 ? 100 : 0);
    const extraCompleted = Math.max(0, totalCompleted - totalTarget);
    const remaining = Math.max(0, totalTarget - totalCompleted);

    return { totalTarget, totalCompleted, totalPending, pct, extraCompleted, remaining, targetsCount: targets.length };
  }

  getTargetById(id) {
    return this.targets.find(t => t.id === id);
  }

  saveOrUpdateTarget(targetData) {
    const cleanTarget = { ...targetData };
    if (cleanTarget.deadline !== undefined) {
      cleanTarget.deadline = cleanTarget.deadline ? String(cleanTarget.deadline).trim() : '';
    }
    if (cleanTarget.id) {
      const idx = this.targets.findIndex(t => t.id === cleanTarget.id);
      if (idx !== -1) {
        this.targets[idx] = { ...this.targets[idx], ...cleanTarget };
      }
    } else {
      const newTarget = {
        ...cleanTarget,
        id: 'target-' + Date.now(),
        month: this.activeMonth
      };
      this.targets.push(newTarget);
    }
    this.saveTargets(this.targets);
  }

  deleteTarget(id) {
    const currentUser = (typeof window !== 'undefined' && window.authService) ? window.authService.getCurrentUser() : null;
    if (currentUser && currentUser.role !== 'manager' && currentUser.email !== 'manager@nexcrest.com') {
      console.warn('Unauthorized deleteTarget blocked: only the Marketing Manager (Admin) can delete assigned tasks.');
      return false;
    }
    this.targets = this.targets.filter(t => t.id !== id);
    this.saveTargets(this.targets);
    // Also remove associated submissions for this target
    if (Array.isArray(this.submissions)) {
      this.submissions = this.submissions.filter(s => s.targetId !== id);
      this.saveSubmissions(this.submissions);
    }
    // Delete from Cloud Firestore
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.deleteTarget(id);
    }
  }

  deleteMultipleTargets(targetIds) {
    const currentUser = (typeof window !== 'undefined' && window.authService) ? window.authService.getCurrentUser() : null;
    if (currentUser && currentUser.role !== 'manager' && currentUser.email !== 'manager@nexcrest.com') {
      console.warn('Unauthorized deleteMultipleTargets blocked: only the Marketing Manager (Admin) can delete assigned tasks.');
      return 0;
    }
    if (!Array.isArray(targetIds) || targetIds.length === 0) return 0;
    const idSet = new Set(targetIds.map(String));
    const initialLen = this.targets.length;
    this.targets = this.targets.filter(t => !idSet.has(String(t.id)));
    const deletedCount = initialLen - this.targets.length;
    this.saveTargets(this.targets);

    // Also remove associated submissions
    if (Array.isArray(this.submissions)) {
      this.submissions = this.submissions.filter(s => !idSet.has(String(s.targetId)));
      this.saveSubmissions(this.submissions);
    }

    // Delete in Cloud Firestore
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.deleteMultipleTargets(targetIds);
    }

    return deletedCount;
  }

  cloneMonthTargets(sourceMonth = '2026-10', destMonth = null) {
    const targetMonth = destMonth || this.activeMonth;
    const sourceTargets = this.targets.filter(t => t.month === sourceMonth);
    if (sourceTargets.length === 0) return 0;

    const cloned = sourceTargets.map(t => ({
      ...t,
      id: 'target-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      month: targetMonth
    }));

    this.targets.push(...cloned);
    this.saveTargets(this.targets);
    return cloned.length;
  }

  // Submission Methods
  getSubmissions(filters = {}) {
    return this.submissions.filter(s => {
      if (!s) return false;
      if (filters.targetId && s.targetId !== filters.targetId) return false;
      if (filters.status && filters.status !== 'all' && s.status !== filters.status) return false;

      if (filters.assignee && filters.assignee !== 'all') {
        const normFilter = String(filters.assignee).toLowerCase();
        const sAssignee = (s.assignee || '').toLowerCase();
        const sAuthorEmail = (s.authorEmail || '').toLowerCase();
        const sAuthorName = (s.authorName || '').toLowerCase();
        if (sAssignee !== normFilter && sAuthorEmail !== normFilter && sAuthorName !== normFilter) {
          return false;
        }
      }

      // Filter by active month
      const target = this.getTargetById(s.targetId);
      const subMonth = (target && target.month) || s.month || (s.submittedAt ? s.submittedAt.slice(0, 7) : null);
      if (subMonth && subMonth !== this.activeMonth) return false;

      return true;
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  addSubmission(subData) {
    if (!Array.isArray(this.submissions)) this.submissions = [];

    let target = this.getTargetById(subData.targetId);

    // If this is an extra / self-initiated task without a pre-assigned target, automatically generate a linked target record
    if (!target && subData.isExtra) {
      const newTarget = {
        id: 'target-extra-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        assignee: subData.assignee || 'designer',
        assigneeName: subData.assigneeName || subData.authorName || '',
        assigneeEmail: subData.authorEmail || '',
        brand: subData.brand || 'Both',
        category: subData.category || 'Branding',
        program: subData.program || 'Self-Initiated Task',
        format: subData.format || 'Poster',
        targetQty: 1,
        month: subData.month || this.activeMonth,
        notes: subData.notes || 'Self-logged extra deliverable task',
        isSelfInitiated: true,
        isExtra: true
      };
      this.targets.push(newTarget);
      this.saveTargets(this.targets);
      target = newTarget;
      subData.targetId = newTarget.id;
    }

    const newSubmission = {
      ...subData,
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      targetId: subData.targetId || (target ? target.id : 'unassigned'),
      submittedAt: new Date().toISOString(),
      month: (target && target.month) || subData.month || this.activeMonth,
      status: 'pending',
      feedback: '',
      isExtra: Boolean(subData.isExtra || (target && target.isExtra))
    };
    this.submissions.unshift(newSubmission);
    this.saveSubmissions(this.submissions);
    return newSubmission;
  }

  updateSubmissionStatus(id, status, feedback = '') {
    const sub = this.submissions.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      sub.feedback = feedback;
      sub.reviewedAt = new Date().toISOString();
      this.saveSubmissions(this.submissions);
    }
  }

  deleteSubmission(id) {
    if (!id) return false;
    const initialLen = this.submissions.length;
    this.submissions = this.submissions.filter(s => s.id !== id);
    if (this.submissions.length !== initialLen) {
      try {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
      } catch (e) {}
      if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
        window.firebaseSync.deleteSubmission(id);
      }
      this.notify();
      return true;
    }
    return false;
  }

  clearAllRecentSubmissions(month = null) {
    const targetMonth = month || this.activeMonth || '2026-10';
    const toRemove = [];
    this.submissions = this.submissions.filter(s => {
      if (!s) return false;
      const target = this.getTargetById(s.targetId);
      const isTargetMonth = (target && target.month === targetMonth) ||
                            (s.month === targetMonth) ||
                            (s.submittedAt && s.submittedAt.startsWith(targetMonth));
      if (isTargetMonth) {
        if (s.id) toRemove.push(String(s.id));
        return false;
      }
      return true;
    });

    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
    } catch (e) {}

    if (toRemove.length > 0 && typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.deleteMultipleSubmissions(toRemove);
    }

    this.notify();
    return toRemove.length;
  }

  // Calculated Progress Metrics
  getTargetProgress(targetId) {
    const target = this.getTargetById(targetId);
    if (!target) return { completed: 0, pending: 0, target: 0, pct: 0, extra: 0 };

    const subs = this.submissions.filter(s => s.targetId === targetId);
    const completed = subs.filter(s => s.status === 'approved').length;
    const pending = subs.filter(s => s.status === 'pending').length;
    const targetQty = Number(target.targetQty) || 1;
    const pct = targetQty > 0 ? Math.round((completed / targetQty) * 100) : (completed > 0 ? 100 : 0);
    const extra = Math.max(0, completed - targetQty);

    return { completed, pending, target: targetQty, pct, extra };
  }

  getRoleStats(assignee) {
    const a = (assignee || '').toLowerCase();
    const targets = this.targets.filter(t => {
      if (t.month && t.month !== this.activeMonth) return false;
      return (t.assignee && t.assignee.toLowerCase() === a) ||
             (t.assigneeRole && t.assigneeRole.toLowerCase() === a) ||
             (t.assigneeEmail && t.assigneeEmail.toLowerCase() === a);
    });
    let totalTarget = 0;
    let totalCompleted = 0;
    let totalPending = 0;

    targets.forEach(t => {
      const prog = this.getTargetProgress(t.id);
      if (!t.isExtra) {
        totalTarget += prog.target;
      }
      totalCompleted += prog.completed;
      totalPending += prog.pending;
    });

    const pct = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : (totalCompleted > 0 ? 100 : 0);
    const extraCompleted = Math.max(0, totalCompleted - totalTarget);
    return { totalTarget, totalCompleted, totalPending, pct, extraCompleted };
  }

  getOverallStats() {
    const designerStats = this.getRoleStats('designer');
    const videoStats = this.getRoleStats('videographer');
    const marketingStats = this.getRoleStats('marketing');

    const totalTarget = designerStats.totalTarget + videoStats.totalTarget + marketingStats.totalTarget;
    const totalCompleted = designerStats.totalCompleted + videoStats.totalCompleted + marketingStats.totalCompleted;
    const totalPending = designerStats.totalPending + videoStats.totalPending + marketingStats.totalPending;
    const pct = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : (totalCompleted > 0 ? 100 : 0);
    const extraCompleted = Math.max(0, totalCompleted - totalTarget);

    return {
      totalTarget,
      totalCompleted,
      totalPending,
      pct,
      extraCompleted,
      designer: designerStats,
      video: videoStats,
      marketing: marketingStats
    };
  }

  // Comprehensive Dashboard Overview Calculation (Matching user photo + Graphs)
  getDashboardOverview(customMonth = null) {
    const month = customMonth || this.activeMonth;
    const targets = this.targets.filter(t => t.month === month);

    let totalTarget = 0;
    let totalPublished = 0;
    let reelsVideosTarget = 0;
    let reelsVideosPublished = 0;
    let postersCarouselsTarget = 0;
    let postersCarouselsPublished = 0;

    const catBuckets = {
      'Branding': { name: 'Branding', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 },
      'Campus Events': { name: 'Campus Events', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 },
      'Marketing': { name: 'Marketing', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 },
      'Moment Marketing': { name: 'Moment Marketing', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 }
    };
    // Backward compatibility aliases
    catBuckets['Campus Happenings'] = catBuckets['Campus Events'];
    catBuckets['Marketing Creatives'] = catBuckets['Marketing'];

    function normalizeCat(cat) {
      if (!cat) return 'Branding';
      const c = cat.toLowerCase().trim();
      if (c.includes('campus') || c.includes('event') || c.includes('happening')) return 'Campus Events';
      if (c.includes('market') && !c.includes('moment')) return 'Marketing';
      if (c.includes('moment')) return 'Moment Marketing';
      if (c.includes('brand')) return 'Branding';
      return 'Branding';
    }

    function isVideoFormat(fmt) {
      const f = (fmt || '').toLowerCase();
      return f.includes('reel') || f.includes('video') || f.includes('clip') || f.includes('aftermovie') || f.includes('short');
    }

    targets.forEach(t => {
      const q = Number(t.targetQty) || 1;
      if (!t.isExtra) {
        totalTarget += q;
      }

      const normCat = normalizeCat(t.category);
      if (catBuckets[normCat] && !t.isExtra) {
        catBuckets[normCat].total += q;
      }

      const isVideo = isVideoFormat(t.format);
      if (isVideo) {
        if (!t.isExtra) {
          reelsVideosTarget += q;
          if (catBuckets[normCat]) catBuckets[normCat].reelsTarget += q;
        }
      } else {
        if (!t.isExtra) {
          postersCarouselsTarget += q;
          if (catBuckets[normCat]) catBuckets[normCat].postersTarget += q;
        }
      }

      // Check completions for this target
      const targetSubs = this.submissions.filter(s => s.targetId === t.id && s.status === 'approved');
      const approvedCount = targetSubs.length;

      totalPublished += approvedCount;
      if (catBuckets[normCat]) {
        catBuckets[normCat].published += approvedCount;
      }

      if (isVideo) {
        reelsVideosPublished += approvedCount;
        if (catBuckets[normCat]) catBuckets[normCat].reelsPublished += approvedCount;
      } else {
        postersCarouselsPublished += approvedCount;
        if (catBuckets[normCat]) catBuckets[normCat].postersPublished += approvedCount;
      }
    });

    const pct = totalTarget > 0 ? Math.round((totalPublished / totalTarget) * 100) : (totalPublished > 0 ? 100 : 0);
    const remaining = Math.max(0, totalTarget - totalPublished);
    const extraCompleted = Math.max(0, totalPublished - totalTarget);

    // Days left calculation (Calendar Days & Mon-Fri Working Days)
    let daysLeft = 0;
    let workingDaysLeft = 0;
    const now = new Date();
    const parts = month.split('-');
    const targetYear = parseInt(parts[0], 10);
    const targetMonth = parseInt(parts[1], 10); // 1-12
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

    if (now.getFullYear() === targetYear && (now.getMonth() + 1) === targetMonth) {
      const currentDay = now.getDate();
      daysLeft = Math.max(0, daysInMonth - currentDay);

      for (let d = currentDay + 1; d <= daysInMonth; d++) {
        const dayOfWeek = new Date(targetYear, targetMonth - 1, d).getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDaysLeft++;
        }
      }
    } else if (targetYear < now.getFullYear() || (targetYear === now.getFullYear() && targetMonth < (now.getMonth() + 1))) {
      daysLeft = 0;
      workingDaysLeft = 0;
    } else {
      daysLeft = daysInMonth;
      for (let d = 1; d <= daysInMonth; d++) {
        const dayOfWeek = new Date(targetYear, targetMonth - 1, d).getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDaysLeft++;
        }
      }
    }

    // Role breakdowns for graphs
    const designerStats = this.getRoleStats('designer');
    const videoStats = this.getRoleStats('videographer');
    const marketingStats = this.getRoleStats('marketing');

    return {
      month,
      totalTarget,
      totalPublished,
      reelsVideosTarget,
      reelsVideosPublished,
      postersCarouselsTarget,
      postersCarouselsPublished,
      pct,
      remaining,
      extraCompleted,
      daysLeft,
      workingDaysLeft,
      categories: catBuckets,
      roles: {
        designer: designerStats,
        video: videoStats,
        marketing: marketingStats
      }
    };
  }

  // Reset to original defaults
  resetAll() {
    this.saveTargets(SEED_TARGETS);
    this.saveSubmissions(SEED_SUBMISSIONS);
  }
}

// Global instance
window.dataStore = new DataStore();
