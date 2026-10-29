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
  // ================= GRAPHIC DESIGNER (Exact chart provided: 25 deliverables) =================
  {
    id: 'gd-1',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'NexTalk Series',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: 'Cover guest speaker highlights and key takeaways'
  },
  {
    id: 'gd-2',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: "Let's Talk Series",
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: 'Q&A format with student community quotes'
  },
  {
    id: 'gd-3',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'LinkedIn Contest',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: 'Contest announcement, rules, and prize reveal slides'
  },
  {
    id: 'gd-4',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'Experts Talk',
    format: 'Poster',
    targetQty: 1,
    month: '2026-10',
    notes: 'Official high-contrast speaker announcement poster'
  },
  {
    id: 'gd-5',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'Experts Talk',
    format: 'Carousel',
    targetQty: 1,
    month: '2026-10',
    notes: 'Detailed session agenda, speaker bio, and key learning points'
  },
  {
    id: 'gd-6',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Informative Contents',
    format: 'Carousel',
    targetQty: 5,
    month: '2026-10',
    notes: 'Industry trends, programming cheat sheets, tech career tips'
  },
  {
    id: 'gd-7',
    assignee: 'designer',
    brand: 'IT',
    category: 'Branding',
    program: 'Informative Contents',
    format: 'Carousel',
    targetQty: 5,
    month: '2026-10',
    notes: 'Corporate tech updates, system architecture deep-dives'
  },
  {
    id: 'gd-8',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Marketing Creatives',
    program: 'Marketing Posters',
    format: 'Poster',
    targetQty: 5,
    month: '2026-10',
    notes: 'Admission batch announcements, fast-track program banners'
  },
  {
    id: 'gd-9',
    assignee: 'designer',
    brand: 'IT',
    category: 'Marketing Creatives',
    program: 'Marketing Posters',
    format: 'Poster',
    targetQty: 5,
    month: '2026-10',
    notes: 'Enterprise IT placement records, hiring partners showcase'
  },
  {
    id: 'gd-10',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Moment Marketing',
    program: 'Viral Tech Memes & Trending Topics',
    format: 'Poster',
    targetQty: 2,
    month: '2026-10',
    notes: 'Real-time trending tech news and viral developer culture'
  },

  // ================= VIDEOGRAPHER + EDITOR (18 video deliverables) =================
  {
    id: 've-1',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'NexTalk & Let\'s Talk Coverage',
    format: '9:16 Reel / Highlight',
    targetQty: 2,
    month: '2026-10',
    notes: 'Fast-paced event recap with trending audio and subtitles'
  },
  {
    id: 've-2',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'Experts Talk Speaker Clips & Student Reactions',
    format: 'Vertical Reels',
    targetQty: 3,
    month: '2026-10',
    notes: 'Bite-sized knowledge nuggets from the guest speaker session'
  },
  {
    id: 've-3',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Nexcrest Life & Culture Series',
    format: 'Cinematic 9:16 Reel',
    targetQty: 4,
    month: '2026-10',
    notes: 'Day in the life of a tech student, lab tours, peer collabs'
  },
  {
    id: 've-4',
    assignee: 'videographer',
    brand: 'IT',
    category: 'Branding',
    program: 'IT Program Explainers & Faculty Talks',
    format: 'Short Video Clips',
    targetQty: 4,
    month: '2026-10',
    notes: 'Mentors explaining modern DevOps, Cloud, and Fullstack roadmaps'
  },
  {
    id: 've-5',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Marketing Creatives',
    program: 'Course Admission Video Ads',
    format: 'Paid Ad Creative (9:16 & 1:1)',
    targetQty: 3,
    month: '2026-10',
    notes: 'High-conversion hooks targeting college grads & career switchers'
  },
  {
    id: 've-6',
    assignee: 'videographer',
    brand: 'IT',
    category: 'Marketing Creatives',
    program: 'Student Career Transformation Testimonials',
    format: 'Long-form Video (16:9)',
    targetQty: 2,
    month: '2026-10',
    notes: 'In-depth interview documenting salary hike and tech hiring story'
  },
  {
    id: 've-7',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Moment Marketing',
    program: 'Trending Audio Tech Skits',
    format: '9:16 Reel / Highlight',
    targetQty: 1,
    month: '2026-10',
    notes: 'Short viral trend recreation for campus students'
  },

  // ================= MARKETING EXECUTIVE (Campaigns & Outreach) =================
  {
    id: 'me-1',
    assignee: 'marketing',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'NexTalk & Let\'s Talk Audience Registrations',
    format: 'Event Registration Drive',
    targetQty: 2,
    month: '2026-10',
    notes: 'Target: 150 RSVP registrations and attendance coordination'
  },
  {
    id: 'me-2',
    assignee: 'marketing',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'LinkedIn Contest & Student Engagement Campaign',
    format: 'Organic Engagement Sprints',
    targetQty: 3,
    month: '2026-10',
    notes: 'Drive 50+ user generated submissions across colleges'
  },
  {
    id: 'me-3',
    assignee: 'marketing',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Multi-Platform Content Distribution & Growth',
    format: 'Daily Social Publishing',
    targetQty: 12,
    month: '2026-10',
    notes: 'Cross-posting on LinkedIn, Instagram, and Tech Community groups'
  },
  {
    id: 'me-4',
    assignee: 'marketing',
    brand: 'IT',
    category: 'Branding',
    program: 'IT Career Community & Newsletter Broadcasts',
    format: 'Bi-Weekly Tech Newsletter',
    targetQty: 2,
    month: '2026-10',
    notes: 'Tech hiring trends newsletter sent to subscriber database'
  },
  {
    id: 'me-5',
    assignee: 'marketing',
    brand: 'Techschool',
    category: 'Marketing Creatives',
    program: 'Meta & Google Lead Acquisition Ads',
    format: 'Paid Lead Funnel (Target: 300 Leads)',
    targetQty: 4,
    month: '2026-10',
    notes: 'Optimize CPL under ₹120 for upcoming batch intake'
  },
  {
    id: 'me-6',
    assignee: 'marketing',
    brand: 'IT',
    category: 'Marketing Creatives',
    program: 'IT Upskilling Conversion Campaign',
    format: 'Conversion Funnel (Target: 120 Inquiries)',
    targetQty: 2,
    month: '2026-10',
    notes: 'Direct outreach & webinar signups for working professionals'
  },

  // ================= SEPTEMBER 2026 (EXACT MATCH TO USER PHOTO: 40 TARGETS) =================
  // Branding (20 Posts: 13 Reels & Videos, 7 Posters & Carousels)
  { id: 'sep-1', assignee: 'videographer', brand: 'Techschool', category: 'Branding', program: 'Campus Story Reels', format: 'Reel (9:16)', targetQty: 13, month: '2026-09' },
  { id: 'sep-2', assignee: 'designer', brand: 'Techschool', category: 'Branding', program: 'Brand Identity Carousels', format: 'Carousel', targetQty: 7, month: '2026-09' },
  // Campus Happenings (9 Posts: 5 Reels & Videos, 4 Posters & Carousels)
  { id: 'sep-3', assignee: 'videographer', brand: 'Techschool', category: 'Campus Happenings', program: 'Event Recap Highlights', format: 'Reel (9:16)', targetQty: 5, month: '2026-09' },
  { id: 'sep-4', assignee: 'designer', brand: 'Techschool', category: 'Campus Happenings', program: 'Campus Activity Posters', format: 'Poster', targetQty: 4, month: '2026-09' },
  // Marketing Creatives (8 Posts: 2 Reels & Videos, 6 Posters & Carousels)
  { id: 'sep-5', assignee: 'videographer', brand: 'Techschool', category: 'Marketing Creatives', program: 'Ad Promo Videos', format: 'Video Ad', targetQty: 2, month: '2026-09' },
  { id: 'sep-6', assignee: 'designer', brand: 'Techschool', category: 'Marketing Creatives', program: 'Enrollment Ad Creatives', format: 'Poster', targetQty: 6, month: '2026-09' },
  // Moment Marketing (3 Posts: 2 Posters, 1 Reel)
  { id: 'sep-7', assignee: 'designer', brand: 'Techschool', category: 'Moment Marketing', program: 'Trending Topic Memes', format: 'Poster', targetQty: 2, month: '2026-09' },
  { id: 'sep-8', assignee: 'videographer', brand: 'Techschool', category: 'Moment Marketing', program: 'Viral Sound Clip', format: 'Reel (9:16)', targetQty: 1, month: '2026-09' }
];

// Seed Submissions for realistic demo
const SEED_SUBMISSIONS = [
  // October Submissions
  {
    id: 'sub-1',
    targetId: 'gd-1',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'NexTalk Series',
    format: 'Carousel',
    title: 'NexTalk Episode 4: Future of AI in Cloud Systems',
    url: 'https://figma.com/file/demo-nextalk-carousel',
    notes: 'Designed 6 slides in brand teal with key takeaways and quote cards.',
    submittedAt: '2026-10-14T11:20:00Z',
    status: 'approved',
    feedback: 'Excellent color harmony and typography hierarchy. Approved!'
  },
  {
    id: 'sub-2',
    targetId: 'gd-6',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Informative Contents',
    format: 'Carousel',
    title: 'Top 7 Git Commands Every Developer Must Know',
    url: 'https://drive.google.com/drive/folders/demo-git-carousel',
    notes: 'Carousel #1 of 5. Includes code snippets.',
    submittedAt: '2026-10-15T09:45:00Z',
    status: 'approved',
    feedback: 'Great format, carousel verified.'
  },
  {
    id: 'sub-3',
    targetId: 'gd-4',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'Experts Talk',
    format: 'Poster',
    title: 'Experts Talk with Google VP of Engineering Poster',
    url: 'https://drive.google.com/file/d/demo-experts-poster/view',
    notes: 'Draft 2 poster with updated speaker headshot and registration QR code.',
    submittedAt: '2026-10-16T10:15:00Z',
    status: 'approved',
    feedback: 'Clear typography and good contrast. Approved!'
  },
  {
    id: 'sub-4',
    targetId: 've-1',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Campus Happenings',
    program: 'NexTalk & Let\'s Talk Coverage',
    format: '9:16 Reel / Highlight',
    title: 'NexTalk Ep. 4 Flash Reel - 45s Cut',
    url: 'https://drive.google.com/file/d/demo-reel-nextalk/view',
    notes: 'Exported with dynamic auto-captions and upbeat soundtrack.',
    submittedAt: '2026-10-16T12:30:00Z',
    status: 'approved',
    feedback: 'Smooth cuts and great engagement hook. Approved!'
  },
  {
    id: 'sub-5',
    targetId: 'me-5',
    assignee: 'marketing',
    brand: 'Techschool',
    category: 'Marketing Creatives',
    program: 'Meta & Google Lead Acquisition Ads',
    format: 'Paid Lead Funnel (Target: 300 Leads)',
    title: 'October Admissions Meta Campaign Setup',
    url: 'https://adsmanager.facebook.com/campaign/demo-ads',
    notes: 'Campaign live. Generated first 85 verified leads at ₹92 CPL.',
    submittedAt: '2026-10-16T13:00:00Z',
    status: 'approved',
    feedback: 'Good lead quality and healthy CTR.'
  },
  {
    id: 'sub-6',
    targetId: 've-3',
    assignee: 'videographer',
    brand: 'Techschool',
    category: 'Branding',
    program: 'Nexcrest Life & Culture Series',
    format: 'Cinematic 9:16 Reel',
    title: 'Tech Lab Tour & Student Coding Sprint',
    url: 'https://drive.google.com/file/d/demo-lab-tour/view',
    notes: 'High-production 60fps cinematic vertical reel.',
    submittedAt: '2026-10-16T14:15:00Z',
    status: 'pending',
    feedback: ''
  },
  {
    id: 'sub-7',
    targetId: 'gd-8',
    assignee: 'designer',
    brand: 'Techschool',
    category: 'Marketing Creatives',
    program: 'Marketing Posters',
    format: 'Poster',
    title: 'Fullstack Batch Admissions Poster #1',
    url: 'https://drive.google.com/file/d/demo-fullstack-poster/view',
    notes: '1080x1350 format for Instagram and WhatsApp status.',
    submittedAt: '2026-10-16T14:30:00Z',
    status: 'pending',
    feedback: ''
  }
];

// Generate 40 approved submissions for September 2026 so September displays 100% complete
(function generateSeptemberApproved() {
  const sepTargets = SEED_TARGETS.filter(t => t.month === '2026-09');
  sepTargets.forEach(target => {
    for (let i = 1; i <= target.targetQty; i++) {
      SEED_SUBMISSIONS.push({
        id: `sep-sub-${target.id}-${i}`,
        targetId: target.id,
        assignee: target.assignee,
        brand: target.brand,
        category: target.category,
        program: target.program,
        format: target.format,
        title: `${target.program} - Deliverable #${i}`,
        url: 'https://drive.google.com/drive/folders/september-archive',
        notes: `September verified release #${i}`,
        submittedAt: '2026-09-28T16:00:00Z',
        status: 'approved',
        feedback: 'Published and live'
      });
    }
  });
})();

class DataStore {
  constructor() {
    this.targets = this.loadTargets();
    this.submissions = this.loadSubmissions();
    this.activeMonth = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH) || '2026-10';
    this.initCloudSync();
  }

  initCloudSync() {
    if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
      window.firebaseSync.seedTargetsIfEmpty(SEED_TARGETS);
      window.firebaseSync.seedSubmissionsIfEmpty(SEED_SUBMISSIONS);
      window.firebaseSync.subscribeTargets((cloudTargets) => {
        if (Array.isArray(cloudTargets) && cloudTargets.length > 0) {
          this.targets = cloudTargets;
          try { localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(this.targets)); } catch (e) {}
          if (typeof this.notify === 'function') this.notify();
        }
      });
      window.firebaseSync.subscribeSubmissions((cloudSubs) => {
        if (Array.isArray(cloudSubs)) {
          this.submissions = cloudSubs;
          try { localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions)); } catch (e) {}
          if (typeof this.notify === 'function') this.notify();
        }
      });
    }
  }

  loadTargets() {
    const raw = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (!raw) {
      this.saveTargets(SEED_TARGETS);
      return [...SEED_TARGETS];
    }
    try {
      const parsed = JSON.parse(raw);
      let migrated = false;
      parsed.forEach(t => {
        if (t.brand === 'Insights' || t.brand === 'Nexcrest Insights' || t.brand === 'Both' || t.brand === 'Both Brands' || t.brand === 'Nexcrest Techschool') {
          t.brand = 'Techschool';
          migrated = true;
        } else if (t.brand === 'Nexcrest IT') {
          t.brand = 'IT';
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
  }

  loadSubmissions() {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      this.saveSubmissions(SEED_SUBMISSIONS);
      return [...SEED_SUBMISSIONS];
    }
    try {
      const parsed = JSON.parse(raw);
      let migrated = false;
      parsed.forEach(s => {
        if (s.brand === 'Insights' || s.brand === 'Nexcrest Insights' || s.brand === 'Both' || s.brand === 'Both Brands' || s.brand === 'Nexcrest Techschool') {
          s.brand = 'Techschool';
          migrated = true;
        } else if (s.brand === 'Nexcrest IT') {
          s.brand = 'IT';
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
      if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.brand && filters.brand !== 'all') {
        const normFilter = (filters.brand === 'IT' || filters.brand === 'Nexcrest IT') ? 'IT' : 'Techschool';
        const normTarget = (t.brand === 'IT' || t.brand === 'Nexcrest IT') ? 'IT' : 'Techschool';
        if (normTarget !== normFilter) return false;
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
    if (!user) return { totalTarget: 0, totalCompleted: 0, totalPending: 0, pct: 0, targetsCount: 0 };
    const targets = this.getTargetsForUser(user);
    let totalTarget = 0;
    let totalCompleted = 0;
    let totalPending = 0;

    targets.forEach(t => {
      const prog = this.getTargetProgress(t.id);
      totalTarget += prog.target;
      totalCompleted += prog.completed;
      totalPending += prog.pending;
    });

    const pct = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;
    return { totalTarget, totalCompleted, totalPending, pct, targetsCount: targets.length };
  }

  getTargetById(id) {
    return this.targets.find(t => t.id === id);
  }

  saveOrUpdateTarget(targetData) {
    if (targetData.id) {
      const idx = this.targets.findIndex(t => t.id === targetData.id);
      if (idx !== -1) {
        this.targets[idx] = { ...this.targets[idx], ...targetData };
      }
    } else {
      const newTarget = {
        ...targetData,
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
      if (filters.targetId && s.targetId !== filters.targetId) return false;
      if (filters.assignee && filters.assignee !== 'all' && s.assignee !== filters.assignee) return false;
      if (filters.status && filters.status !== 'all' && s.status !== filters.status) return false;
      
      // Filter by active month
      const target = this.getTargetById(s.targetId);
      if (target && target.month && target.month !== this.activeMonth) return false;
      
      return true;
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  addSubmission(subData) {
    const newSubmission = {
      ...subData,
      id: 'sub-' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
      feedback: ''
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

  // Calculated Progress Metrics
  getTargetProgress(targetId) {
    const target = this.getTargetById(targetId);
    if (!target) return { completed: 0, pending: 0, target: 0, pct: 0 };

    const subs = this.submissions.filter(s => s.targetId === targetId);
    const completed = subs.filter(s => s.status === 'approved').length;
    const pending = subs.filter(s => s.status === 'pending').length;
    const targetQty = Number(target.targetQty) || 1;
    const pct = Math.min(100, Math.round((completed / targetQty) * 100));

    return { completed, pending, target: targetQty, pct };
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
      totalTarget += prog.target;
      totalCompleted += prog.completed;
      totalPending += prog.pending;
    });

    const pct = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;
    return { totalTarget, totalCompleted, totalPending, pct };
  }

  getOverallStats() {
    const designerStats = this.getRoleStats('designer');
    const videoStats = this.getRoleStats('videographer');
    const marketingStats = this.getRoleStats('marketing');

    const totalTarget = designerStats.totalTarget + videoStats.totalTarget + marketingStats.totalTarget;
    const totalCompleted = designerStats.totalCompleted + videoStats.totalCompleted + marketingStats.totalCompleted;
    const totalPending = designerStats.totalPending + videoStats.totalPending + marketingStats.totalPending;
    const pct = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;

    return {
      totalTarget,
      totalCompleted,
      totalPending,
      pct,
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
      'Campus Happenings': { name: 'Campus Happenings', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 },
      'Marketing Creatives': { name: 'Marketing Creatives', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 },
      'Moment Marketing': { name: 'Moment Marketing', total: 0, published: 0, reelsTarget: 0, reelsPublished: 0, postersTarget: 0, postersPublished: 0 }
    };

    function normalizeCat(cat) {
      if (cat === 'Campus Events' || cat === 'Campus Happenings') return 'Campus Happenings';
      if (cat === 'Marketing' || cat === 'Marketing Creatives') return 'Marketing Creatives';
      if (cat === 'Moment Marketing') return 'Moment Marketing';
      return 'Branding';
    }

    function isVideoFormat(fmt) {
      const f = (fmt || '').toLowerCase();
      return f.includes('reel') || f.includes('video') || f.includes('clip') || f.includes('aftermovie') || f.includes('short');
    }

    targets.forEach(t => {
      const q = Number(t.targetQty) || 1;
      totalTarget += q;

      const normCat = normalizeCat(t.category);
      if (catBuckets[normCat]) {
        catBuckets[normCat].total += q;
      }

      const isVideo = isVideoFormat(t.format);
      if (isVideo) {
        reelsVideosTarget += q;
        if (catBuckets[normCat]) catBuckets[normCat].reelsTarget += q;
      } else {
        postersCarouselsTarget += q;
        if (catBuckets[normCat]) catBuckets[normCat].postersTarget += q;
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

    const pct = totalTarget > 0 ? Math.min(100, Math.round((totalPublished / totalTarget) * 100)) : 0;
    const remaining = Math.max(0, totalTarget - totalPublished);

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
