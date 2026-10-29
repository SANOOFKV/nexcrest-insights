/**
 * Nexcrest Insights - Main Application Controller
 * Handles UI transitions, reactive stats updates, modal forms,
 * target management, and approval workflows.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    user: window.authService.getCurrentUser(),
    activeManagerTab: 'overview',
    memberCategory: 'all',
    pacingMode: 'calendar', // 'calendar' | 'working'
    tableSort: {
      col: 'program',
      order: 'asc'
    },
    charts: {
      category: null,
      role: null,
      format: null,
      pacing: null
    },
    filters: {
      role: 'all',
      category: 'all',
      brand: 'all',
      status: 'all',
      search: ''
    },
    pendingDeleteEmail: null,
    pendingDeleteName: null,
    pendingDeleteTargetId: null,
    activeTasksUserEmail: null,
    calendarModalYear: 2026
  };

  // DOM Element Selectors
  const elements = {
    // Top Bar
    monthSelector: document.getElementById('month-selector'),
    btnCalendarPicker: document.getElementById('btn-calendar-picker'),
    monthDisplay: document.getElementById('current-month-display'),
    headerUserProfileMenu: document.getElementById('header-user-profile-menu'),
    btnOpenUserProfile: document.getElementById('btn-open-user-profile'),
    headerUserAvatar: document.getElementById('header-user-avatar'),
    headerUserName: document.getElementById('header-user-name'),
    headerRoleBadge: document.getElementById('header-role-badge'),
    logoutBtn: document.getElementById('logout-btn'),
    btnMemberOpenProfile: document.getElementById('btn-member-open-profile'),

    // Views
    managerView: document.getElementById('manager-view'),
    memberView: document.getElementById('member-view'),
    authModal: document.getElementById('auth-modal'),
    reviewAlertBanner: document.getElementById('review-alert-banner'),
    alertText: document.getElementById('alert-text'),
    viewReviewsBtn: document.getElementById('view-reviews-btn'),

    // Overview Tab Elements (Matching User Photo)
    tabOverview: document.getElementById('tab-overview'),
    managerTableFilters: document.getElementById('manager-table-filters'),
    ovMonthTag: document.getElementById('ov-month-tag'),
    ovMonthlyTarget: document.getElementById('ov-monthly-target'),
    ovReelsCount: document.getElementById('ov-reels-count'),
    ovReelsPublished: document.getElementById('ov-reels-published'),
    ovReelsTarget: document.getElementById('ov-reels-target'),
    ovPostersCount: document.getElementById('ov-posters-count'),
    ovPostersPublished: document.getElementById('ov-posters-published'),
    ovPostersTarget: document.getElementById('ov-posters-target'),
    ovPublishedCount: document.getElementById('ov-published-count'),

    ovRingFill: document.getElementById('ov-ring-fill'),
    ovProgressPct: document.getElementById('ov-progress-pct'),
    ovProgressRatio: document.getElementById('ov-progress-ratio'),
    ovPacingText: document.getElementById('ov-pacing-text'),
    ovRemainingCount: document.getElementById('ov-remaining-count'),
    ovDaysLeft: document.getElementById('ov-days-left'),
    ovCatTotalPosts: document.getElementById('ov-cat-total-posts'),

    // Category Card Elements
    catBrandingPosts: document.getElementById('cat-branding-posts'),
    catBrandingReels: document.getElementById('cat-branding-reels'),
    catBrandingPosters: document.getElementById('cat-branding-posters'),
    catBrandingBar: document.getElementById('cat-branding-bar'),

    catCampusPosts: document.getElementById('cat-campus-posts'),
    catCampusReels: document.getElementById('cat-campus-reels'),
    catCampusPosters: document.getElementById('cat-campus-posters'),
    catCampusBar: document.getElementById('cat-campus-bar'),

    catMarketingPosts: document.getElementById('cat-marketing-posts'),
    catMarketingReels: document.getElementById('cat-marketing-reels'),
    catMarketingPosters: document.getElementById('cat-marketing-posters'),
    catMarketingBar: document.getElementById('cat-marketing-bar'),

    catMomentPosts: document.getElementById('cat-moment-posts'),
    catMomentReels: document.getElementById('cat-moment-reels'),
    catMomentPosters: document.getElementById('cat-moment-posters'),
    catMomentBar: document.getElementById('cat-moment-bar'),

    // Manager Tabs & Tables
    managerTabBtns: document.querySelectorAll('[data-manager-tab]'),
    tabAllTargets: document.getElementById('tab-all-targets'),
    tabReviewQueue: document.getElementById('tab-review-queue'),
    tabActivityLog: document.getElementById('tab-activity-log'),
    tabTeamRoster: document.getElementById('tab-team-roster'),
    tabBtnTeam: document.getElementById('tab-btn-team'),
    teamRosterCount: document.getElementById('team-roster-count'),
    teamRosterGrid: document.getElementById('team-roster-grid'),
    rosterSearchInput: document.getElementById('roster-search-input'),
    rosterRoleFilter: document.getElementById('roster-role-filter'),
    reviewQueueCount: document.getElementById('review-queue-count'),
    tableRowCount: document.getElementById('table-row-count'),
    managerTargetsTableBody: document.getElementById('manager-targets-table-body'),
    reviewCardsList: document.getElementById('review-cards-list'),
    activityLogTableBody: document.getElementById('activity-log-table-body'),
    btnBatchApprove: document.getElementById('btn-batch-approve'),
    btnExportData: document.getElementById('btn-export-data'),

    // Modals & Action Triggers
    btnRosterAddEmp: document.getElementById('btn-roster-add-emp'),
    addEmployeeModal: document.getElementById('add-employee-modal'),
    addEmployeeForm: document.getElementById('add-employee-form'),
    newEmpName: document.getElementById('new-emp-name'),
    newEmpEmail: document.getElementById('new-emp-email'),
    newEmpRole: document.getElementById('new-emp-role'),
    newEmpTitle: document.getElementById('new-emp-title'),
    newEmpBrand: document.getElementById('new-emp-brand'),
    newEmpPassword: document.getElementById('new-emp-password'),

    // Manager Filters
    filterSearchInput: document.getElementById('filter-search-input'),
    filterRoleSelect: document.getElementById('filter-role-select'),
    filterCategorySelect: document.getElementById('filter-category-select'),
    filterBrandSelect: document.getElementById('filter-brand-select'),
    filterStatusSelect: document.getElementById('filter-status-select'),

    // Member View Elements
    memberKpiTarget: document.getElementById('member-kpi-target'),
    memberKpiCompleted: document.getElementById('member-kpi-completed'),
    memberKpiReview: document.getElementById('member-kpi-review'),
    memberKpiRemaining: document.getElementById('member-kpi-remaining'),
    memberKpiPct: document.getElementById('member-kpi-pct'),
    memberKpiProgressBar: document.getElementById('member-kpi-progress-bar'),

    memberCatBtns: document.querySelectorAll('.member-cat-btn'),
    countAllTasks: document.getElementById('count-all-tasks'),
    countCampusTasks: document.getElementById('count-campus-tasks'),
    countBrandingTasks: document.getElementById('count-branding-tasks'),
    countMarketingTasks: document.getElementById('count-marketing-tasks'),
    countMomentTasks: document.getElementById('count-moment-tasks'),
    memberDeliverablesGrid: document.getElementById('member-deliverables-grid'),
    memberSubmissionsTableBody: document.getElementById('member-submissions-table-body'),

    // Modals
    btnOpenAssignModal: document.getElementById('btn-open-assign-modal'),
    btnMemberLogWork: document.getElementById('btn-member-log-work'),
    assignTargetModal: document.getElementById('assign-target-modal'),
    logWorkModal: document.getElementById('log-work-modal'),
    reviewActionModal: document.getElementById('review-action-modal'),

    // Assign Target Form
    assignTargetForm: document.getElementById('assign-target-form'),
    editTargetId: document.getElementById('edit-target-id'),
    targetAssignee: document.getElementById('target-assignee'),
    targetBrand: document.getElementById('target-brand'),
    targetCategory: document.getElementById('target-category'),
    targetFormat: document.getElementById('target-format'),
    targetProgram: document.getElementById('target-program'),
    targetQty: document.getElementById('target-qty'),
    targetNotes: document.getElementById('target-notes'),
    btnModalDeleteTarget: document.getElementById('btn-modal-delete-target'),
    btnSubmitTargetModal: document.getElementById('btn-submit-target-modal'),
    btnSubmitTargetText: document.getElementById('btn-submit-target-text'),

    // Delete Target Modal
    deleteTargetModal: document.getElementById('delete-target-modal'),
    btnConfirmDeleteTarget: document.getElementById('btn-confirm-delete-target'),
    deleteTargetTitleDisplay: document.getElementById('delete-target-title-display'),
    deleteTargetBrandBadge: document.getElementById('delete-target-brand-badge'),
    deleteTargetCatBadge: document.getElementById('delete-target-cat-badge'),
    deleteTargetFormatBadge: document.getElementById('delete-target-format-badge'),
    deleteTargetAssigneeDisplay: document.getElementById('delete-target-assignee-display'),

    // User Tasks Management Modal
    userTasksModal: document.getElementById('user-tasks-modal'),
    userTasksModalTitle: document.getElementById('user-tasks-modal-title'),
    userTasksModalSubtitle: document.getElementById('user-tasks-modal-subtitle'),
    userTasksModalList: document.getElementById('user-tasks-modal-list'),
    btnUserTasksAssignNew: document.getElementById('btn-user-tasks-assign-new'),

    // Log Work Form
    logWorkForm: document.getElementById('log-work-form'),
    logTargetSelect: document.getElementById('log-target-select'),
    logWorkTitle: document.getElementById('log-work-title'),
    logWorkUrl: document.getElementById('log-work-url'),
    logWorkNotes: document.getElementById('log-work-notes'),

    // Review Modal Form & Fields
    reviewDecisionForm: document.getElementById('review-decision-form'),
    reviewSubmissionId: document.getElementById('review-submission-id'),
    reviewModalAuthor: document.getElementById('review-modal-author'),
    reviewModalProgram: document.getElementById('review-modal-program'),
    reviewModalFormat: document.getElementById('review-modal-format'),
    reviewModalDate: document.getElementById('review-modal-date'),
    reviewModalLink: document.getElementById('review-modal-link'),
    reviewModalUrlText: document.getElementById('review-modal-url-text'),
    reviewModalNotes: document.getElementById('review-modal-notes'),
    reviewFeedbackInput: document.getElementById('review-feedback-input'),
    btnApproveWork: document.getElementById('btn-approve-work'),
    btnRequestRework: document.getElementById('btn-request-rework'),

    // Profile Management Modal Elements
    profileModal: document.getElementById('profile-management-modal'),
    btnCloseProfileModal: document.getElementById('btn-close-profile-modal'),
    btnCancelProfileDetails: document.getElementById('btn-cancel-profile-details'),
    btnCancelProfilePassword: document.getElementById('btn-cancel-profile-password'),
    profileModalAvatar: document.getElementById('profile-modal-avatar'),
    profileModalNameDisplay: document.getElementById('profile-modal-name-display'),
    profileModalRoleBadge: document.getElementById('profile-modal-role-badge'),
    profileModalBrandBadge: document.getElementById('profile-modal-brand-badge'),
    profileModalEmailDisplay: document.getElementById('profile-modal-email-display'),
    profileTabBtns: document.querySelectorAll('.profile-tab-btn'),
    profileTabPanels: document.querySelectorAll('.profile-tab-panel'),
    profileDetailsForm: document.getElementById('profile-details-form'),
    profileEditName: document.getElementById('profile-edit-name'),
    profileEditTitle: document.getElementById('profile-edit-title'),
    profileEditBrandReadonly: document.getElementById('profile-edit-brand-readonly'),
    profilePasswordForm: document.getElementById('profile-password-form'),
    profileCurrentPass: document.getElementById('profile-current-pass'),
    profileNewPass: document.getElementById('profile-new-pass'),
    profileConfirmPass: document.getElementById('profile-confirm-pass'),
    profilePasswordError: document.getElementById('profile-password-error'),

    // Historical Calendar Modal Elements
    historicalCalendarModal: document.getElementById('historical-calendar-modal'),
    btnCloseCalendarModal: document.getElementById('btn-close-calendar-modal'),
    btnCalClose: document.getElementById('btn-cal-close'),
    btnCalPrevYear: document.getElementById('btn-cal-prev-year'),
    btnCalNextYear: document.getElementById('btn-cal-next-year'),
    calSelectedYearText: document.getElementById('cal-selected-year-text'),
    calendarMonthsGrid: document.getElementById('calendar-months-grid'),
    btnCalJumpCurrent: document.getElementById('btn-cal-jump-current'),

    // Auth Form & Role Preset Tabs
    authForm: document.getElementById('auth-form'),
    authSubmitBtn: document.getElementById('auth-submit-btn'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginPasswordWrapper: document.getElementById('login-password-wrapper'),
    authErrorNotice: document.getElementById('auth-error-notice'),
    authErrorText: document.getElementById('auth-error-text'),
    roleLoginTabs: document.querySelectorAll('.role-login-tab'),
    authSubmitText: document.getElementById('auth-submit-text')
  };

  // Helper: Toast Notifications
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'warning' ? 'alert-triangle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auth Error State Management (Wrong Password / Invalid Account)
  function clearAuthError() {
    if (elements.authErrorNotice) {
      elements.authErrorNotice.classList.add('hidden');
    }
    if (elements.authErrorText) {
      elements.authErrorText.textContent = '';
    }
    if (elements.loginPasswordWrapper) {
      elements.loginPasswordWrapper.classList.remove('input-error', 'shake-anim');
    }
    if (elements.loginPassword) {
      elements.loginPassword.classList.remove('input-error');
    }
  }

  function showAuthError(message) {
    const errorText = message || 'Incorrect password. Please try again.';
    if (elements.authErrorText) {
      elements.authErrorText.textContent = errorText;
    }
    if (elements.authErrorNotice) {
      elements.authErrorNotice.classList.remove('hidden');
    }
    if (elements.loginPasswordWrapper) {
      elements.loginPasswordWrapper.classList.add('input-error');
      elements.loginPasswordWrapper.classList.remove('shake-anim');
      // Trigger browser DOM reflow so shake animation restarts on consecutive failures
      void elements.loginPasswordWrapper.offsetWidth;
      elements.loginPasswordWrapper.classList.add('shake-anim');
    }
    if (elements.loginPassword) {
      // Keep or select value so user can inspect with the eye toggle button
      if (typeof elements.loginPassword.select === 'function') {
        elements.loginPassword.select();
      }
    }
    refreshIcons();
  }

  // Debounce utility to prevent UI stutter on rapid search typing
  function debounce(fn, delay = 200) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  }

  function formatBrandName(brand) {
    if (!brand) return 'Both Brands';
    if (brand === 'Techschool' || brand === 'Insights' || brand === 'Nexcrest Techschool') return 'Nexcrest Techschool';
    if (brand === 'IT' || brand === 'Nexcrest IT') return 'Nexcrest IT';
    if (brand === 'Both' || brand === 'Both Brands') return 'Both Brands';
    return brand;
  }

  // Safe URL sanitizer to prevent javascript: pseudo-protocol XSS
  function safeUrl(url) {
    if (!url) return '#';
    const trimmed = url.toString().trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return '#';
  }

  // Rich Proof Link Chip Renderer
  function renderProofChip(url) {
    const cleanUrl = safeUrl(url);
    if (cleanUrl === '#') {
      return `<span style="color: var(--text-dim);">-</span>`;
    }

    const lower = cleanUrl.toLowerCase();
    let icon = 'external-link';
    let chipClass = 'generic';
    let label = 'View Proof';

    if (lower.includes('figma.com')) {
      icon = 'pen-tool';
      chipClass = 'figma';
      label = 'Figma File';
    } else if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
      icon = 'hard-drive';
      chipClass = 'drive';
      label = 'Google Drive';
    } else if (lower.includes('frame.io')) {
      icon = 'film';
      chipClass = 'frameio';
      label = 'Frame.io Edit';
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      icon = 'video';
      chipClass = 'youtube';
      label = 'YouTube Video';
    } else if (lower.includes('instagram.com') || lower.includes('linkedin.com')) {
      icon = 'share-2';
      chipClass = 'social';
      label = lower.includes('instagram') ? 'Instagram Reel' : 'LinkedIn Post';
    }

    return `
      <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="proof-chip ${chipClass}">
        <i data-lucide="${icon}"></i>
        <span>${label}</span>
      </a>
    `;
  }

  // Refresh Lucide Icons helper
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // FUTURISTIC VFX ENGINE (Awwwards / Linear / Raycast Micro-Physics)
  // =========================================================================

  // 1. Kinetic Odometer Number Rollers
  function animateCounter(el, endVal, duration = 750, suffix = '', prefix = '') {
    if (!el) return;
    const target = parseFloat(endVal);
    if (isNaN(target)) {
      el.textContent = `${prefix}${endVal}${suffix}`;
      return;
    }

    const currentVal = parseFloat(el.getAttribute('data-val') || el.textContent) || 0;
    el.setAttribute('data-val', target);

    if (currentVal === target) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }

    const startTime = performance.now();
    el.classList.add('kinetic-num');

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Exponential Out easing for snappy cybernetic tick feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = Math.round(currentVal + (target - currentVal) * ease);

      el.textContent = `${prefix}${val}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  // 2. Real-Time Cursor-Tracking Spotlight & Specular Border Reflection
  function initSpotlightTracking() {
    const spotlightCards = document.querySelectorAll('.spotlight-card');

    spotlightCards.forEach(card => {
      if (!card.querySelector('.spotlight-layer')) {
        const layer = document.createElement('div');
        layer.className = 'spotlight-layer';
        layer.setAttribute('aria-hidden', 'true');
        card.appendChild(layer);
      }
      if (!card.querySelector('.spotlight-border')) {
        const border = document.createElement('div');
        border.className = 'spotlight-border';
        border.setAttribute('aria-hidden', 'true');
        card.appendChild(border);
      }

      if (card._spotlightAttached) return;
      card._spotlightAttached = true;

      let rafId = null;

      card.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }

  // 3. 3D Interactive Card Parallax Tilt Micro-Physics
  function init3DParallaxTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
      if (card._tiltAttached) return;
      card._tiltAttached = true;

      let isHovered = false;

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        card.style.willChange = 'transform';
        card.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease';
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        // Subtle, elegant tilt (max 6.5 degrees on X & Y)
        const rotX = (-deltaY * 6.5).toFixed(2);
        const rotY = (deltaX * 6.5).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px) scale3d(1.015, 1.015, 1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  // 4. Magnetic Elastic Buttons & Pills
  function initMagneticButtons() {
    const magneticElements = document.querySelectorAll(
      '.btn-primary, .role-login-tab, .member-cat-btn, .btn-logout, .tab-pill'
    );

    magneticElements.forEach(el => {
      if (el._magneticAttached) return;
      el._magneticAttached = true;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        // Pull by up to 5px in direction of cursor
        const pullX = (deltaX * 5).toFixed(2);
        const pullY = (deltaY * 5).toFixed(2);

        el.style.transform = `translate(${pullX}px, ${pullY}px)`;
        el.style.transition = 'transform 0.1s ease-out';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0px, 0px)';
        el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  // Master VFX Refresh Dispatcher
  function refreshFuturisticEffects() {
    initSpotlightTracking();
    init3DParallaxTilt();
    initMagneticButtons();
    refreshIcons();
  }

  // Update User Header Info & Isolated Role Dashboard
  function updateHeader() {
    const user = state.user;
    if (!user) {
      elements.authModal.classList.remove('hidden');
      if (elements.headerUserProfileMenu) elements.headerUserProfileMenu.style.display = 'none';
      if (elements.btnCalendarPicker) elements.btnCalendarPicker.style.display = 'none';
      if (elements.reviewAlertBanner) elements.reviewAlertBanner.classList.add('hidden');
      elements.managerView.classList.remove('active');
      elements.managerView.classList.add('hidden');
      elements.memberView.classList.remove('active');
      elements.memberView.classList.add('hidden');
      return;
    }

    elements.authModal.classList.add('hidden');
    if (elements.headerUserProfileMenu) elements.headerUserProfileMenu.style.display = 'flex';
    if (elements.btnCalendarPicker) elements.btnCalendarPicker.style.display = 'inline-flex';

    elements.headerUserName.textContent = user.name;
    if (elements.headerRoleBadge) elements.headerRoleBadge.textContent = user.title;
    elements.headerUserAvatar.textContent = user.avatar || user.name.charAt(0);

    // Strict Role Dashboard Isolation:
    if (user.role === 'manager') {
      elements.managerView.classList.add('active');
      elements.managerView.classList.remove('hidden');
      elements.memberView.classList.remove('active');
      elements.memberView.classList.add('hidden');
    } else {
      elements.managerView.classList.remove('active');
      elements.managerView.classList.add('hidden');
      if (elements.reviewAlertBanner) elements.reviewAlertBanner.classList.add('hidden');
      elements.memberView.classList.add('active');
      elements.memberView.classList.remove('hidden');
    }
  }

  // =========================================================================
  // MANAGER VIEW CONTROLLER
  // =========================================================================
  function renderManagerView() {
    // Update review queue badge & alert banner
    const pendingSubs = window.dataStore.getSubmissions({ status: 'pending' });
    const pendingCount = pendingSubs.length;
    elements.reviewQueueCount.textContent = pendingCount;

    if (pendingCount > 0) {
      elements.reviewAlertBanner.classList.remove('hidden');
      elements.alertText.textContent = `You have ${pendingCount} deliverable submission${pendingCount > 1 ? 's' : ''} awaiting your review and approval.`;
    } else {
      elements.reviewAlertBanner.classList.add('hidden');
    }

    renderManagerActiveTab();
  }

  function renderManagerActiveTab() {
    const tabs = [
      { key: 'overview', el: elements.tabOverview },
      { key: 'all-targets', el: elements.tabAllTargets },
      { key: 'review-queue', el: elements.tabReviewQueue },
      { key: 'team-roster', el: elements.tabTeamRoster },
      { key: 'activity-log', el: elements.tabActivityLog }
    ];

    tabs.forEach(({ key, el }) => {
      if (!el) return;
      if (key === state.activeManagerTab) {
        el.classList.remove('hidden');
        el.classList.add('active');
      } else {
        el.classList.add('hidden');
        el.classList.remove('active');
      }
    });

    if (elements.managerTableFilters) {
      elements.managerTableFilters.style.display = state.activeManagerTab === 'all-targets' ? 'flex' : 'none';
    }

    if (state.activeManagerTab === 'overview') {
      renderOverviewDashboard();
    } else if (state.activeManagerTab === 'all-targets') {
      renderManagerTargetsTable();
    } else if (state.activeManagerTab === 'review-queue') {
      renderManagerReviewQueue();
    } else if (state.activeManagerTab === 'team-roster') {
      renderTeamRoster();
    } else if (state.activeManagerTab === 'activity-log') {
      renderManagerActivityLog();
    }
    refreshIcons();
  }

  function renderOverviewDashboard() {
    const ov = window.dataStore.getDashboardOverview();

    // 1. Month Tag
    const monthNames = {
      '2026-09': 'September 2026',
      '2026-10': 'October 2026',
      '2026-11': 'November 2026',
      '2026-12': 'December 2026'
    };
    if (elements.ovMonthTag) {
      elements.ovMonthTag.textContent = monthNames[ov.month] || ov.month;
    }

    // 2. The 4 Hero Dark Cards (Kinetic Number Rollers)
    animateCounter(elements.ovMonthlyTarget, ov.totalTarget);
    
    animateCounter(elements.ovReelsCount, ov.reelsVideosTarget);
    if (elements.ovReelsPublished) elements.ovReelsPublished.textContent = ov.reelsVideosPublished;
    if (elements.ovReelsTarget) elements.ovReelsTarget.textContent = ov.reelsVideosTarget;

    animateCounter(elements.ovPostersCount, ov.postersCarouselsTarget);
    if (elements.ovPostersPublished) elements.ovPostersPublished.textContent = ov.postersCarouselsPublished;
    if (elements.ovPostersTarget) elements.ovPostersTarget.textContent = ov.postersCarouselsTarget;

    animateCounter(elements.ovPublishedCount, ov.totalPublished);

    // 3. Circular Progress Ring Telemetry
    const circumference = 295.3;
    const offset = circumference - (circumference * (ov.pct / 100));
    if (elements.ovRingFill) {
      elements.ovRingFill.style.strokeDashoffset = offset;
      elements.ovRingFill.style.stroke = ov.pct >= 100 ? '#10B981' : '#0284C7';
    }
    animateCounter(elements.ovProgressPct, ov.pct, 750, '%');
    if (elements.ovProgressRatio) elements.ovProgressRatio.textContent = `${ov.totalPublished} / ${ov.totalTarget}`;
    animateCounter(elements.ovRemainingCount, ov.remaining);

    // Business Days vs Calendar Days Telemetry Pacing
    const ovDaysLeftLabel = document.getElementById('ov-days-left-label');
    const btnToggleWorkdays = document.getElementById('btn-toggle-workdays-mode');
    const workdaysToggleText = document.getElementById('workdays-toggle-text');

    const isWorkingDays = state.pacingMode === 'working';
    const effectiveDays = isWorkingDays ? ov.workingDaysLeft : ov.daysLeft;

    if (ovDaysLeftLabel) {
      ovDaysLeftLabel.textContent = isWorkingDays ? 'WORK DAYS' : 'DAYS LEFT';
    }
    if (btnToggleWorkdays) {
      if (isWorkingDays) {
        btnToggleWorkdays.classList.add('active');
        if (workdaysToggleText) workdaysToggleText.textContent = 'Mon-Fri Active';
      } else {
        btnToggleWorkdays.classList.remove('active');
        if (workdaysToggleText) workdaysToggleText.textContent = 'Working Days';
      }
    }

    animateCounter(elements.ovDaysLeft, effectiveDays);
    if (elements.ovCatTotalPosts) elements.ovCatTotalPosts.textContent = `${ov.totalTarget} Posts`;

    if (elements.ovPacingText) {
      if (ov.pct >= 100) {
        elements.ovPacingText.textContent = '100% Monthly Target Achieved!';
      } else {
        const pacePerDay = effectiveDays > 0 ? (ov.remaining / effectiveDays).toFixed(1) : ov.remaining;
        elements.ovPacingText.textContent = `${ov.remaining} posts remaining (${pacePerDay}/day needed across ${effectiveDays} ${isWorkingDays ? 'workdays' : 'days'})`;
      }
    }

    // 4. Categories Cards Grid (Matching Reference Photo)
    const branding = ov.categories['Branding'];
    if (branding) {
      animateCounter(elements.catBrandingPosts, branding.total, 750, ' Posts');
      animateCounter(elements.catBrandingReels, branding.reelsTarget);
      animateCounter(elements.catBrandingPosters, branding.postersTarget);
      const bPct = branding.total > 0 ? Math.min(100, Math.round((branding.published / branding.total) * 100)) : 0;
      if (elements.catBrandingBar) elements.catBrandingBar.style.width = `${bPct}%`;
    }

    const campus = ov.categories['Campus Happenings'];
    if (campus) {
      animateCounter(elements.catCampusPosts, campus.total, 750, ' Posts');
      animateCounter(elements.catCampusReels, campus.reelsTarget);
      animateCounter(elements.catCampusPosters, campus.postersTarget);
      const cPct = campus.total > 0 ? Math.min(100, Math.round((campus.published / campus.total) * 100)) : 0;
      if (elements.catCampusBar) elements.catCampusBar.style.width = `${cPct}%`;
    }

    const marketing = ov.categories['Marketing Creatives'];
    if (marketing) {
      animateCounter(elements.catMarketingPosts, marketing.total, 750, ' Posts');
      animateCounter(elements.catMarketingReels, marketing.reelsTarget);
      animateCounter(elements.catMarketingPosters, marketing.postersTarget);
      const mPct = marketing.total > 0 ? Math.min(100, Math.round((marketing.published / marketing.total) * 100)) : 0;
      if (elements.catMarketingBar) elements.catMarketingBar.style.width = `${mPct}%`;
    }

    const moment = ov.categories['Moment Marketing'];
    if (moment) {
      animateCounter(elements.catMomentPosts, moment.total, 750, ' Posts');
      animateCounter(elements.catMomentReels, moment.reelsTarget);
      animateCounter(elements.catMomentPosters, moment.postersTarget);
      const mmPct = moment.total > 0 ? Math.min(100, Math.round((moment.published / moment.total) * 100)) : 0;
      if (elements.catMomentBar) elements.catMomentBar.style.width = `${mmPct}%`;
    }

    // 5. Render Target vs Achievement Graphs
    renderCharts(ov);

    // 6. Refresh Futuristic VFX & Micro-Physics
    refreshFuturisticEffects();
  }

  function renderCharts(ov) {
    if (!window.Chart) return;

    // Pure Light Theme Chart Styling
    const textColor = '#475569';
    const gridColor = 'rgba(0, 0, 0, 0.06)';

    // Chart 1: Category Target vs Achievement Bar Chart
    const ctxCat = document.getElementById('categoryComparisonChart');
    if (ctxCat) {
      if (state.charts.category) state.charts.category.destroy();

      const catLabels = ['Branding', 'Campus Happenings', 'Marketing Creatives', 'Moment Marketing'];
      const catTargets = catLabels.map(k => ov.categories[k] ? ov.categories[k].total : 0);
      const catAchieved = catLabels.map(k => ov.categories[k] ? ov.categories[k].published : 0);

      const targetColor = '#EF2424';
      const achievedColor = '#10B981';
      const secondaryColor = '#B11414';

      state.charts.category = new Chart(ctxCat, {
        type: 'bar',
        data: {
          labels: catLabels,
          datasets: [
            {
              label: 'Target Quota',
              data: catTargets,
              backgroundColor: targetColor,
              borderRadius: 6,
              barPercentage: 0.65
            },
            {
              label: 'Achieved / Published',
              data: catAchieved,
              backgroundColor: achievedColor,
              borderRadius: 6,
              barPercentage: 0.65
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0F172A',
              titleColor: '#FFFFFF',
              bodyColor: '#E2E8F0',
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' } },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor, stepSize: 5 },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // Chart 2: Team Members Performance Target vs Achievement (Dynamic for all onboarded staff)
    const ctxRole = document.getElementById('rolePerformanceChart');
    if (ctxRole) {
      if (state.charts.role) state.charts.role.destroy();

      const employees = window.authService.getEmployees();
      const memberData = employees.map(emp => {
        const stats = window.dataStore.getEmployeeStats(emp);
        return {
          label: emp.name,
          target: stats.totalTarget,
          completed: stats.totalCompleted
        };
      });

      const roleTargetColor = '#EF2424';
      const roleAchievedColor = '#10B981';

      state.charts.role = new Chart(ctxRole, {
        type: 'bar',
        data: {
          labels: memberData.map(r => r.label),
          datasets: [
            {
              label: 'Assigned Target',
              data: memberData.map(r => r.target),
              backgroundColor: roleTargetColor,
              borderRadius: 6,
              barPercentage: 0.65
            },
            {
              label: 'Completed / Approved',
              data: memberData.map(r => r.completed),
              backgroundColor: roleAchievedColor,
              borderRadius: 6,
              barPercentage: 0.65
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0F172A',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return ` ${context.dataset.label}: ${context.raw} items`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' } },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor, precision: 0 },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // Chart 3: Format Distribution Donut Chart
    const ctxFmt = document.getElementById('formatDistributionChart');
    if (ctxFmt) {
      if (state.charts.format) state.charts.format.destroy();

      const reelsVal = ov.reelsVideosPublished || ov.reelsVideosTarget || 22;
      const postersVal = ov.postersCarouselsPublished || ov.postersCarouselsTarget || 18;

      state.charts.format = new Chart(ctxFmt, {
        type: 'doughnut',
        data: {
          labels: ['Reels & Videos', 'Posters & Carousels'],
          datasets: [
            {
              data: [reelsVal, postersVal],
              backgroundColor: ['#EF2424', '#B11414'],
              borderWidth: 0,
              hoverOffset: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Inter', size: 12, weight: '600' }, padding: 14 }
            },
            tooltip: {
              backgroundColor: '#0F172A',
              padding: 10,
              cornerRadius: 8
            }
          },
          cutout: '72%'
        }
      });
    }

    // Chart 4: Monthly Milestone Pacing Curve
    const ctxPacing = document.getElementById('monthlyPacingChart');
    if (ctxPacing) {
      if (state.charts.pacing) state.charts.pacing.destroy();

      const totalTgt = ov.totalTarget || 40;
      const totalPub = ov.totalPublished || 0;

      const idealCurve = [
        Math.round(totalTgt * 0.25),
        Math.round(totalTgt * 0.50),
        Math.round(totalTgt * 0.75),
        totalTgt
      ];

      const actualCurve = [
        Math.min(totalPub, Math.round(totalPub * 0.28)),
        Math.min(totalPub, Math.round(totalPub * 0.62)),
        Math.min(totalPub, Math.round(totalPub * 0.85)),
        totalPub
      ];

      state.charts.pacing = new Chart(ctxPacing, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4 (End)'],
          datasets: [
            {
              label: 'Ideal Pace Target',
              data: idealCurve,
              borderColor: '#94A3B8',
              borderDash: [5, 5],
              tension: 0.3,
              pointRadius: 4,
              fill: false
            },
            {
              label: 'Actual Achievements',
              data: actualCurve,
              borderColor: '#B11414',
              backgroundColor: 'rgba(239, 36, 36, 0.12)',
              tension: 0.3,
              pointRadius: 6,
              pointBackgroundColor: '#B11414',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' } }
            },
            tooltip: {
              backgroundColor: '#0F172A',
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          }
        }
      });
    }
  }

  function renderManagerTargetsTable() {
    let targets = window.dataStore.getTargets({
      assignee: state.filters.role,
      category: state.filters.category,
      brand: state.filters.brand
    });

    // Live search filter
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      targets = targets.filter(t => 
        (t.program && t.program.toLowerCase().includes(q)) ||
        (t.format && t.format.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.brand && t.brand.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (state.filters.status && state.filters.status !== 'all') {
      targets = targets.filter(t => {
        const prog = window.dataStore.getTargetProgress(t.id);
        if (state.filters.status === 'completed') return prog.completed >= prog.target;
        if (state.filters.status === 'in-progress') return prog.completed > 0 && prog.completed < prog.target;
        if (state.filters.status === 'not-started') return prog.completed === 0;
        return true;
      });
    }

    // Interactive Column Sorting
    const sortCol = state.tableSort ? state.tableSort.col : 'program';
    const sortOrder = state.tableSort ? state.tableSort.order : 'asc';
    const mult = sortOrder === 'asc' ? 1 : -1;

    targets.sort((a, b) => {
      const progA = window.dataStore.getTargetProgress(a.id);
      const progB = window.dataStore.getTargetProgress(b.id);

      switch (sortCol) {
        case 'assignee': {
          const userA = window.authService.getUserByEmail(a.assignee) || (a.assigneeEmail ? window.authService.getUserByEmail(a.assigneeEmail) : null);
          const userB = window.authService.getUserByEmail(b.assignee) || (b.assigneeEmail ? window.authService.getUserByEmail(b.assigneeEmail) : null);
          const valA = (userA ? userA.name : (a.assigneeName || a.assignee || '')).toLowerCase();
          const valB = (userB ? userB.name : (b.assigneeName || b.assignee || '')).toLowerCase();
          return valA.localeCompare(valB) * mult;
        }
        case 'brand': {
          const valA = (a.brand || '').toLowerCase();
          const valB = (b.brand || '').toLowerCase();
          return valA.localeCompare(valB) * mult;
        }
        case 'category': {
          const valA = (a.category || '').toLowerCase();
          const valB = (b.category || '').toLowerCase();
          return valA.localeCompare(valB) * mult;
        }
        case 'program': {
          const valA = (a.program || '').toLowerCase();
          const valB = (b.program || '').toLowerCase();
          return valA.localeCompare(valB) * mult;
        }
        case 'format': {
          const valA = (a.format || '').toLowerCase();
          const valB = (b.format || '').toLowerCase();
          return valA.localeCompare(valB) * mult;
        }
        case 'targetQty':
          return ((a.targetQty || 0) - (b.targetQty || 0)) * mult;
        case 'completed':
          return (progA.completed - progB.completed) * mult;
        case 'pending':
          return (progA.pending - progB.pending) * mult;
        case 'pct':
          return (progA.pct - progB.pct) * mult;
        case 'status': {
          const getStatusWeight = (p) => (p.completed >= p.target ? 3 : p.completed > 0 ? 2 : 1);
          return (getStatusWeight(progA) - getStatusWeight(progB)) * mult;
        }
        default:
          return 0;
      }
    });

    // Update active sort indicator in table headers
    document.querySelectorAll('#tab-all-targets .sortable-th').forEach(th => {
      const col = th.dataset.sortCol;
      const icon = th.querySelector('.sort-icon');
      if (col === sortCol) {
        th.classList.add('active-sort');
        if (icon) icon.setAttribute('data-lucide', sortOrder === 'asc' ? 'arrow-up' : 'arrow-down');
      } else {
        th.classList.remove('active-sort');
        if (icon) icon.setAttribute('data-lucide', 'arrow-up-down');
      }
    });

    elements.tableRowCount.textContent = `${targets.length} items`;

    if (targets.length === 0) {
      const allActiveTargets = window.dataStore.getTargets();
      const isFilterMismatch = allActiveTargets.length > 0;

      if (isFilterMismatch) {
        elements.managerTargetsTableBody.innerHTML = `
          <tr>
            <td colspan="11" class="text-center" style="padding: 36px; color: var(--text-muted);">
              <i data-lucide="search-x" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.6;"></i>
              <div>No deliverables match the filters.</div>
            </td>
          </tr>
        `;
      } else {
        const activeMonth = window.dataStore.getActiveMonth();
        elements.managerTargetsTableBody.innerHTML = `
          <tr>
            <td colspan="11">
              <div class="empty-cycle-banner">
                <i data-lucide="calendar-plus" style="width: 42px; height: 42px; color: var(--teal-primary);"></i>
                <h4>No Targets Assigned for ${escapeHtml(activeMonth)}</h4>
                <p>Clone standard quotas for this cycle?</p>
                <button id="btn-clone-quotas" class="btn btn-primary">
                  <i data-lucide="copy"></i> Clone Standard Quotas (${escapeHtml(activeMonth)})
                </button>
              </div>
            </td>
          </tr>
        `;
        const cloneBtn = document.getElementById('btn-clone-quotas');
        if (cloneBtn) {
          cloneBtn.addEventListener('click', () => {
            const count = window.dataStore.cloneMonthTargets('2026-10', activeMonth);
            showToast(`Successfully cloned ${count} deliverable targets into ${activeMonth}!`, 'success');
            renderApp();
          });
        }
      }
      refreshIcons();
      return;
    }

    elements.managerTargetsTableBody.innerHTML = targets.map(target => {
      const prog = window.dataStore.getTargetProgress(target.id);
      const isDone = prog.completed >= prog.target;
      const roleLabels = {
        designer: 'Graphic Designer',
        videographer: 'Videographer',
        marketing: 'Marketing Exec',
        content: 'Content Writer',
        motion: 'Motion Designer',
        community: 'Community Lead'
      };

      const userLookup = window.authService.getUserByEmail(target.assignee) ||
                         (target.assigneeEmail ? window.authService.getUserByEmail(target.assigneeEmail) : null);
      const displayName = userLookup ? userLookup.name : (target.assigneeName || roleLabels[target.assignee] || target.assignee);
      const displayRole = userLookup ? userLookup.role : (target.assigneeRole || target.assignee);
      const roleIcon = displayRole === 'designer' ? 'palette' :
                       displayRole === 'videographer' ? 'video' :
                       displayRole === 'marketing' ? 'trending-up' :
                       displayRole === 'content' ? 'feather' :
                       displayRole === 'motion' ? 'film' : 'user';

      const statusBadge = isDone
        ? `<span class="status-pill completed"><i data-lucide="check"></i> Completed</span>`
        : prog.completed > 0
          ? `<span class="status-pill in-progress"><i data-lucide="loader"></i> In Progress</span>`
          : `<span class="status-pill not-started">Not Started</span>`;

      return `
        <tr>
          <td>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <span class="badge-role">
                <i data-lucide="${roleIcon}"></i>
                ${escapeHtml(displayName)}
              </span>
              ${userLookup ? `<span style="font-size: 10px; color: var(--text-dim); margin-left: 4px;">${escapeHtml(userLookup.title)}</span>` : ''}
            </div>
          </td>
          <td><span class="badge-brand ${escapeHtml(target.brand)}">${formatBrandName(target.brand)}</span></td>
          <td><span class="badge-category">${escapeHtml(target.category)}</span></td>
          <td>
            <strong>${escapeHtml(target.program)}</strong>
            ${target.notes ? `<div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">${escapeHtml(target.notes)}</div>` : ''}
          </td>
          <td><span class="badge-format">${escapeHtml(target.format)}</span></td>
          <td class="text-center"><strong>${target.targetQty}</strong></td>
          <td class="text-center"><span style="color: var(--mint-light); font-weight: 700;">${prog.completed}</span></td>
          <td class="text-center">
            ${prog.pending > 0 ? `<span class="badge-pending">${prog.pending} pending</span>` : '<span style="color: var(--text-dim);">-</span>'}
          </td>
          <td style="min-width: 120px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
              <span>${prog.pct}%</span>
              <span>${prog.completed}/${prog.target}</span>
            </div>
            <div class="progress-bar-container" style="margin-bottom: 0;">
              <div class="progress-bar-fill" style="width: ${prog.pct}%"></div>
            </div>
          </td>
          <td>${statusBadge}</td>
          <td class="text-right">
            <div style="display: flex; gap: 6px; justify-content: flex-end;">
              <button class="btn btn-outline-sm btn-action-edit" data-id="${target.id}" title="Edit Target">
                <i data-lucide="edit-2"></i>
              </button>
              <button class="btn btn-outline-sm btn-action-log" data-id="${target.id}" title="Submit Work on Behalf">
                <i data-lucide="plus"></i>
              </button>
              <button class="btn btn-outline-sm btn-action-delete" data-id="${target.id}" title="Delete" style="color: var(--rose-light);">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderManagerReviewQueue() {
    const pendingSubs = window.dataStore.getSubmissions({ status: 'pending' });

    if (pendingSubs.length === 0) {
      elements.reviewCardsList.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <i data-lucide="check-circle" style="width: 48px; height: 48px; color: var(--mint-light); margin-bottom: 12px;"></i>
          <h3>All Caught Up!</h3>
          <p>No deliverables are waiting for review right now.</p>
        </div>
      `;
      return;
    }

    const roleNameMap = {
      designer: 'Graphic Designer',
      videographer: 'Videographer & Editor',
      marketing: 'Marketing Executive'
    };

    elements.reviewCardsList.innerHTML = pendingSubs.map(sub => `
      <div class="submission-item-card" data-sub-id="${sub.id}">
        <div class="sub-info-group">
          <div class="sub-avatar" style="background: ${sub.assignee === 'designer' ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : sub.assignee === 'videographer' ? 'linear-gradient(135deg, #1D4ED8, #38BDF8)' : 'linear-gradient(135deg, #EF2424, #B11414)'}">
            ${escapeHtml((sub.authorName || sub.assignee || 'U').substring(0, 2).toUpperCase())}
          </div>
          <div class="sub-details">
            <h4 class="sub-title">${escapeHtml(sub.title)}</h4>
            <div class="sub-meta">
              <span><strong>${escapeHtml(roleNameMap[sub.assignee] || sub.authorName || sub.assignee)}</strong></span>
              <span>•</span>
              <span class="badge-brand ${escapeHtml(sub.brand)}">${formatBrandName(sub.brand)}</span>
              <span>•</span>
              <span class="badge-category">${escapeHtml(sub.category)}</span>
              <span>•</span>
              <span class="badge-format">${escapeHtml(sub.format)}</span>
              <span>•</span>
              <span>${formatDate(sub.submittedAt)}</span>
            </div>
            ${sub.notes ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">"${escapeHtml(sub.notes)}"</p>` : ''}
          </div>
        </div>
        <div class="sub-actions">
          <a href="${escapeHtml(safeUrl(sub.url))}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Open proof link">
            <i data-lucide="external-link"></i> View Asset
          </a>
          <button class="btn btn-primary btn-sm btn-open-review-modal" data-sub-id="${sub.id}">
            <i data-lucide="check-square"></i> Review & Approve
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderManagerActivityLog() {
    const allSubs = window.dataStore.getSubmissions();

    if (allSubs.length === 0) {
      elements.activityLogTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 30px; color: var(--text-muted);">
            No submissions logged yet.
          </td>
        </tr>
      `;
      return;
    }

    const roleNameMap = {
      designer: 'Graphic Designer',
      videographer: 'Videographer',
      marketing: 'Marketing Exec'
    };

    elements.activityLogTableBody.innerHTML = allSubs.map(sub => {
      const subUser = window.authService.getUserByEmail(sub.assignee);
      const subAuthorName = subUser ? subUser.name : (roleNameMap[sub.assignee] || sub.assignee);
      const statusBadge = sub.status === 'approved'
        ? `<span class="status-pill completed"><i data-lucide="check"></i> Approved</span>`
        : sub.status === 'pending'
          ? `<span class="status-pill pending"><i data-lucide="clock"></i> Pending Review</span>`
          : `<span class="status-pill behind"><i data-lucide="rotate-ccw"></i> Revision</span>`;

      return `
        <tr>
          <td>${formatDate(sub.submittedAt)}</td>
          <td><strong>${escapeHtml(subAuthorName)}</strong></td>
          <td>
            <span class="badge-brand ${escapeHtml(sub.brand)}">${formatBrandName(sub.brand)}</span>
            <span style="margin-left: 4px;">${escapeHtml(sub.program)}</span>
          </td>
          <td>${escapeHtml(sub.title)}</td>
          <td>${renderProofChip(sub.url)}</td>
          <td>${statusBadge}</td>
          <td>${sub.feedback ? `<span class="feedback-table-text">${escapeHtml(sub.feedback)}</span>` : '<span style="color: var(--text-dim);">-</span>'}</td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // TEAM ROSTER & EMPLOYEE ONBOARDING CONTROLLER
  // =========================================================================
  function populateTargetAssigneeOptions(selectedVal = null) {
    if (!elements.targetAssignee) return;
    const employees = window.authService.getEmployees();

    let html = `
      <optgroup label="Functional Tracks (All Members)">
        <option value="designer">Graphic Designer (All)</option>
        <option value="videographer">Videographer + Editor (All)</option>
        <option value="marketing">Marketing Executive (All)</option>
      </optgroup>
    `;

    if (employees.length > 0) {
      html += `<optgroup label="Direct Team Members">`;
      employees.forEach(emp => {
        html += `<option value="${escapeHtml(emp.email)}">${escapeHtml(emp.name)} — ${escapeHtml(emp.title)} (${escapeHtml(emp.role)})</option>`;
      });
      html += `</optgroup>`;
    }

    elements.targetAssignee.innerHTML = html;
    if (selectedVal) {
      elements.targetAssignee.value = selectedVal;
    }
  }

  function populateRoleFilterOptions() {
    if (!elements.filterRoleSelect) return;
    const employees = window.authService.getEmployees();
    const currentVal = elements.filterRoleSelect.value || 'all';

    let html = `
      <option value="all">All Roles & Assignees</option>
      <optgroup label="Departments">
        <option value="designer">Graphic Designer</option>
        <option value="videographer">Videographer + Editor</option>
        <option value="marketing">Marketing Executive</option>
      </optgroup>
    `;

    if (employees.length > 0) {
      html += `<optgroup label="Team Members">`;
      employees.forEach(emp => {
        html += `<option value="${escapeHtml(emp.email)}">${escapeHtml(emp.name)} (${escapeHtml(emp.role)})</option>`;
      });
      html += `</optgroup>`;
    }

    elements.filterRoleSelect.innerHTML = html;
    elements.filterRoleSelect.value = currentVal;
  }

  function renderTeamRoster() {
    if (!elements.teamRosterGrid) return;
    const employees = window.authService.getEmployees();

    if (elements.teamRosterCount) {
      elements.teamRosterCount.textContent = employees.length;
    }

    const searchQuery = (elements.rosterSearchInput ? elements.rosterSearchInput.value : '').toLowerCase().trim();
    const roleFilter = elements.rosterRoleFilter ? elements.rosterRoleFilter.value : 'all';

    const filtered = employees.filter(emp => {
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
      if (searchQuery) {
        const matchName = emp.name.toLowerCase().includes(searchQuery);
        const matchEmail = emp.email.toLowerCase().includes(searchQuery);
        const matchTitle = (emp.title || '').toLowerCase().includes(searchQuery);
        const matchRole = (emp.role || '').toLowerCase().includes(searchQuery);
        if (!matchName && !matchEmail && !matchTitle && !matchRole) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      elements.teamRosterGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <i data-lucide="user-x" style="width: 40px; height: 40px; margin-bottom: 12px; color: var(--text-dim); opacity: 0.6;"></i>
          <h4 style="font-family: var(--font-heading); margin-bottom: 6px;">No Employees Found</h4>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Try adjusting your search criteria, onboard a new team member, or restore default team profiles.</p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary" id="btn-empty-roster-add">
              <i data-lucide="user-plus"></i> + Add Employee
            </button>
            <button type="button" class="btn btn-secondary" id="btn-empty-roster-restore">
              <i data-lucide="rotate-ccw"></i> Restore Default Team
            </button>
          </div>
        </div>
      `;
      const emptyAddBtn = document.getElementById('btn-empty-roster-add');
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', () => openAddEmployeeModal());
      }
      const emptyRestoreBtn = document.getElementById('btn-empty-roster-restore');
      if (emptyRestoreBtn) {
        emptyRestoreBtn.addEventListener('click', () => {
          window.authService.restoreDefaultUsers();
          populateTargetAssigneeOptions();
          populateRoleFilterOptions();
          renderApp();
          showToast('✅ Restored default Nexcrest team members.', 'success');
        });
      }
      refreshIcons();
      return;
    }

    elements.teamRosterGrid.innerHTML = filtered.map(emp => {
      const stats = window.dataStore.getEmployeeStats(emp);
      const isAhead = stats.pct >= 50;

      return `
        <div class="employee-card spotlight-card">
          <div class="employee-card-header">
            <div class="employee-avatar ${escapeHtml(emp.role)}">${escapeHtml(emp.avatar || 'U')}</div>
            <div class="employee-info">
              <div class="employee-name" title="${escapeHtml(emp.name)}">${escapeHtml(emp.name)}</div>
              <div class="employee-title" title="${escapeHtml(emp.title)}">${escapeHtml(emp.title)}</div>
              <div class="employee-tags-row">
                <span class="badge-role ${escapeHtml(emp.badgeClass || 'badge-designer')}">
                  ${escapeHtml((emp.role || '').toUpperCase())}
                </span>
                <span class="badge-brand ${escapeHtml(emp.brand || 'Both')}">${formatBrandName(emp.brand)}</span>
              </div>
            </div>
          </div>

          <div class="employee-email-row">
            <i data-lucide="mail"></i>
            <span>${escapeHtml(emp.email)}</span>
          </div>

          <!-- Pacing & Deliverable Stats -->
          <div class="employee-stats-strip">
            <div class="emp-stat-item">
              <span class="emp-stat-val">${stats.totalTarget}</span>
              <span class="emp-stat-lbl">Target</span>
            </div>
            <div class="emp-stat-item completed">
              <span class="emp-stat-val">${stats.totalCompleted}</span>
              <span class="emp-stat-lbl">Done</span>
            </div>
            <div class="emp-stat-item pending">
              <span class="emp-stat-val">${stats.totalPending}</span>
              <span class="emp-stat-lbl">Review</span>
            </div>
            <div class="emp-stat-item">
              <span class="emp-stat-val" style="color: ${isAhead ? 'var(--mint-success)' : 'var(--teal-primary)'};">${stats.pct}%</span>
              <span class="emp-stat-lbl">Pace</span>
            </div>
          </div>

          <div class="employee-pacing-section">
            <div class="emp-pacing-header">
              <span>Completion</span>
              <span>${stats.totalCompleted} / ${stats.totalTarget}</span>
            </div>
            <div class="progress-bar-container" style="margin: 0;">
              <div class="progress-bar-fill ${isAhead ? 'mint' : 'teal'}" style="width: ${stats.pct}%;"></div>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="employee-card-footer">
            <div class="emp-action-buttons" style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn-emp-assign btn-card-assign-task" data-emp-email="${escapeHtml(emp.email)}" data-emp-role="${escapeHtml(emp.role)}" data-emp-name="${escapeHtml(emp.name)}" title="Assign Target">
                <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> Assign
              </button>
              <button type="button" class="btn-emp-view-tasks btn-card-view-tasks" data-emp-email="${escapeHtml(emp.email)}" data-emp-name="${escapeHtml(emp.name)}" data-emp-role="${escapeHtml(emp.role)}" title="Manage & Delete Assigned Tasks">
                <i data-lucide="list-checks" style="width: 14px; height: 14px;"></i> Tasks (${stats.targetsCount})
              </button>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" class="btn-emp-edit btn-card-edit-emp" data-user-email="${escapeHtml(emp.email)}" title="Edit Profile for ${escapeHtml(emp.name)}">
                <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
              </button>
              <button type="button" class="btn-emp-delete btn-card-delete-emp" data-user-email="${escapeHtml(emp.email)}" data-user-name="${escapeHtml(emp.name)}" title="Delete ${escapeHtml(emp.name)}">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    refreshIcons();
  }

  // =========================================================================
  // TEAM MEMBER VIEW CONTROLLER (Graphic Designer / Video / Marketing)
  // =========================================================================
  function renderMemberView() {
    const user = state.user;
    if (!user) return;

    // Load Stats for this user (Kinetic Number Rollers)
    const stats = window.dataStore.getEmployeeStats(user);
    const remaining = Math.max(0, stats.totalTarget - stats.totalCompleted);

    animateCounter(elements.memberKpiTarget, stats.totalTarget);
    animateCounter(elements.memberKpiCompleted, stats.totalCompleted);
    animateCounter(elements.memberKpiReview, stats.totalPending);
    animateCounter(elements.memberKpiRemaining, remaining);
    animateCounter(elements.memberKpiPct, stats.pct, 750, '%');
    elements.memberKpiProgressBar.style.width = `${stats.pct}%`;

    // Category Task Counts
    const allUserTargets = window.dataStore.getTargetsForUser(user);
    const campusTargets = allUserTargets.filter(t => t.category === 'Campus Happenings');
    const brandingTargets = allUserTargets.filter(t => t.category === 'Branding');
    const marketingTargets = allUserTargets.filter(t => t.category === 'Marketing Creatives');
    const momentTargets = allUserTargets.filter(t => t.category === 'Moment Marketing');

    if (elements.countAllTasks) elements.countAllTasks.textContent = allUserTargets.length;
    if (elements.countCampusTasks) elements.countCampusTasks.textContent = campusTargets.length;
    if (elements.countBrandingTasks) elements.countBrandingTasks.textContent = brandingTargets.length;
    if (elements.countMarketingTasks) elements.countMarketingTasks.textContent = marketingTargets.length;
    if (elements.countMomentTasks) elements.countMomentTasks.textContent = momentTargets.length;

    // Filter targets by selected member category
    const filteredTargets = state.memberCategory === 'all'
      ? allUserTargets
      : allUserTargets.filter(t => t.category === state.memberCategory);

    // Render Cards Grid
    if (filteredTargets.length === 0) {
      elements.memberDeliverablesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
          <p>No deliverables assigned in this category for this month.</p>
        </div>
      `;
    } else {
      elements.memberDeliverablesGrid.innerHTML = filteredTargets.map(target => {
        const prog = window.dataStore.getTargetProgress(target.id);
        const isDone = prog.completed >= prog.target;

        const statusPill = isDone
          ? `<span class="status-pill completed"><i data-lucide="check"></i> Quota Met</span>`
          : prog.completed > 0
            ? `<span class="status-pill in-progress"><i data-lucide="loader"></i> ${prog.completed}/${prog.target} Completed</span>`
            : `<span class="status-pill not-started">Pending</span>`;

        return `
          <div class="deliverable-card spotlight-card tilt-card ${target.category === 'Campus Happenings' ? 'priority-hologram' : ''}">
            <div>
              <div class="del-card-header">
                <div class="del-badges-row">
                  <span class="badge-brand ${escapeHtml(target.brand)}">${formatBrandName(target.brand)}</span>
                  <span class="badge-category">${escapeHtml(target.category)}</span>
                  <span class="badge-format">${escapeHtml(target.format)}</span>
                </div>
                ${statusPill}
              </div>

              <h3 class="del-card-title">${escapeHtml(target.program)}</h3>
              ${target.notes ? `<p class="del-card-desc">${escapeHtml(target.notes)}</p>` : ''}
            </div>

            <div>
              <div class="del-progress-metric">
                <span>Target: <strong>${prog.target}</strong></span>
                <span>Approved: <strong style="color: var(--mint-light);">${prog.completed}</strong></span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${prog.pct}%"></div>
              </div>
              ${prog.pending > 0 ? `<div style="font-size: 11px; color: var(--amber-light); margin-top: 4px;">⏳ ${prog.pending} in review</div>` : ''}

              <div class="del-card-actions" style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-primary btn-sm btn-block btn-open-log-modal" data-target-id="${target.id}">
                  <i data-lucide="upload-cloud"></i> + Submit Deliverable
                </button>
                <button class="btn btn-outline-sm btn-action-delete btn-del-task-card" data-id="${target.id}" title="Delete Assigned Task" aria-label="Delete Task">
                  <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Member Submissions Table
    const userSubs = window.dataStore.getSubmissions({ assignee: user.role });
    if (userSubs.length === 0) {
      elements.memberSubmissionsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 24px; color: var(--text-muted);">
            No submissions yet this month.
          </td>
        </tr>
      `;
    } else {
      elements.memberSubmissionsTableBody.innerHTML = userSubs.map(sub => {
        const statusBadge = sub.status === 'approved'
          ? `<span class="status-pill completed"><i data-lucide="check"></i> Approved</span>`
          : sub.status === 'pending'
            ? `<span class="status-pill pending"><i data-lucide="clock"></i> Under Review</span>`
            : `<span class="status-pill behind"><i data-lucide="rotate-ccw"></i> Rework Needed</span>`;

        return `
          <tr>
            <td>${formatDate(sub.submittedAt)}</td>
            <td>
              <strong>${escapeHtml(sub.program)}</strong>
              <div style="font-size: 11px; color: var(--text-dim);">${escapeHtml(sub.title)}</div>
            </td>
            <td><span class="badge-format">${escapeHtml(sub.format)}</span></td>
            <td>${renderProofChip(sub.url)}</td>
            <td>${sub.notes ? escapeHtml(sub.notes) : '-'}</td>
            <td>${statusBadge}</td>
            <td>${sub.feedback ? `<span class="feedback-table-text">${escapeHtml(sub.feedback)}</span>` : '<span style="color: var(--text-dim);">-</span>'}</td>
          </tr>
        `;
      }).join('');
    }

    refreshFuturisticEffects();
  }

  function populateLoginProfileTabs(activeEmail = null) {
    const container = document.getElementById('role-login-tabs-container');
    if (!container) return;

    const allUsers = window.authService.getAllUsers();
    const currentEmail = elements.loginEmail ? elements.loginEmail.value : 'manager@nexcrest.com';
    const normActive = (activeEmail || currentEmail || 'manager@nexcrest.com').toLowerCase();

    container.innerHTML = allUsers.map(u => {
      const isMgr = u.role === 'manager';
      const isActive = u.email.toLowerCase() === normActive;
      let icon = 'user';
      if (isMgr) icon = 'shield-check';
      else if (u.role === 'designer') icon = 'palette';
      else if (u.role === 'videographer') icon = 'video';
      else if (u.role === 'marketing') icon = 'trending-up';
      else if (u.role === 'content') icon = 'file-text';
      else if (u.role === 'motion') icon = 'film';

      const roleDisplay = u.title || (u.role.charAt(0).toUpperCase() + u.role.slice(1));

      return `
        <button type="button" class="role-login-tab ${isActive ? 'active' : ''}" data-email="${escapeHtml(u.email)}" data-name="${escapeHtml(u.name)}" data-role="${escapeHtml(u.role)}" aria-pressed="${isActive ? 'true' : 'false'}" title="${escapeHtml(u.name)}">
          <div class="role-tab-badge role-badge-${escapeHtml(u.role)}">
            <i data-lucide="${icon}"></i>
          </div>
          <span class="role-tab-name">${escapeHtml(u.name)}</span>
          <div class="role-tab-indicator">
            <i data-lucide="check"></i>
          </div>
        </button>
      `;
    }).join('');

    refreshIcons();

    // Attach click handlers to each tab
    const tabs = container.querySelectorAll('.role-login-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        clearAuthError();
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');

        // Smooth scroll tab into view on mobile
        if (typeof tab.scrollIntoView === 'function') {
          tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        const email = tab.dataset.email;
        const name = tab.dataset.name;
        const role = tab.dataset.role;

        if (elements.loginEmail) elements.loginEmail.value = email;
        if (elements.loginPassword) {
          elements.loginPassword.value = '';
          elements.loginPassword.placeholder = 'Enter password';
          elements.loginPassword.focus();
        }

        if (elements.authSubmitText) {
          elements.authSubmitText.textContent = 'Sign In';
        }
        refreshIcons();
      });
    });
  }

  // 6-Month Rolling Horizon + Historical Archive & Calendar Picker
  function populateMonthSelector() {
    if (!elements.monthSelector) return;
    const activeMonth = window.dataStore.getActiveMonth(); // e.g. '2026-10'

    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1; // 1-12
    const currentYm = `${curY}-${String(curM).padStart(2, '0')}`;

    // Exactly 6-month rolling window starting from current active month
    // When a month completes, the next future month is automatically added!
    const rolling6 = [];
    const baseDate = new Date(curY, curM - 1, 1);
    for (let i = 0; i < 6; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      rolling6.push(ym);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function formatLabel(ym) {
      const [y, mStr] = ym.split('-');
      const mIdx = parseInt(mStr, 10) - 1;
      const mName = monthNames[mIdx] || ym;
      if (ym === currentYm) return `${mName} ${y} (Active)`;
      if (ym === '2026-09') return `${mName} ${y} (Archive)`;
      return `${mName} ${y}`;
    }

    // Collect past historical months (prior to current month)
    const pastMonths = new Set(['2026-09']);
    if (window.dataStore && Array.isArray(window.dataStore.targets)) {
      window.dataStore.targets.forEach(t => {
        if (t.month && t.month < currentYm) pastMonths.add(t.month);
      });
    }
    if (window.dataStore && Array.isArray(window.dataStore.submissions)) {
      window.dataStore.submissions.forEach(s => {
        if (s.month && s.month < currentYm) pastMonths.add(s.month);
      });
    }
    // If user selected a custom past/future month outside rolling6 and pastMonths, preserve it
    if (activeMonth && !rolling6.includes(activeMonth)) {
      pastMonths.add(activeMonth);
    }

    const sortedPast = Array.from(pastMonths).sort().reverse();

    let optionsHtml = '';

    // Group 1: 6-Month Rolling Horizon
    optionsHtml += `<optgroup label="Active 6-Month Horizon">`;
    rolling6.forEach(ym => {
      optionsHtml += `<option value="${ym}" ${ym === activeMonth ? 'selected' : ''}>${formatLabel(ym)}</option>`;
    });
    optionsHtml += `</optgroup>`;

    // Group 2: Past Month Archives (if any exist)
    if (sortedPast.length > 0) {
      optionsHtml += `<optgroup label="Past Month Archives">`;
      sortedPast.forEach(ym => {
        optionsHtml += `<option value="${ym}" ${ym === activeMonth ? 'selected' : ''}>${formatLabel(ym)}</option>`;
      });
      optionsHtml += `</optgroup>`;
    }

    // Special Action: Open Full Calendar
    optionsHtml += `<optgroup label="Calendar Actions">`;
    optionsHtml += `<option value="__pick_calendar__">📅 Choose from Calendar...</option>`;
    optionsHtml += `</optgroup>`;

    elements.monthSelector.innerHTML = optionsHtml;
    elements.monthSelector.value = activeMonth;

    if (elements.monthDisplay) {
      const selectedOpt = elements.monthSelector.options[elements.monthSelector.selectedIndex];
      if (selectedOpt) elements.monthDisplay.textContent = selectedOpt.text;
    }
  }

  // =========================================================================
  // HISTORICAL ARCHIVE & CYCLE CALENDAR MODAL CONTROLLERS
  // =========================================================================
  function openHistoricalCalendarModal() {
    const activeMonth = window.dataStore.getActiveMonth() || '2026-10';
    const parts = activeMonth.split('-');
    state.calendarModalYear = parseInt(parts[0], 10) || new Date().getFullYear();

    renderCalendarMonthsGrid(state.calendarModalYear);

    if (elements.historicalCalendarModal) {
      elements.historicalCalendarModal.classList.remove('hidden');
      refreshIcons();
    }
  }

  function closeHistoricalCalendarModal() {
    if (elements.historicalCalendarModal) {
      elements.historicalCalendarModal.classList.add('hidden');
    }
  }

  function renderCalendarMonthsGrid(year) {
    if (elements.calSelectedYearText) {
      elements.calSelectedYearText.textContent = year.toString();
    }
    if (!elements.calendarMonthsGrid) return;

    const activeMonth = window.dataStore.getActiveMonth();
    const now = new Date();
    const curYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthFull = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Compute target counts per month in this year
    const targets = (window.dataStore && window.dataStore.targets) || [];
    const counts = {};
    targets.forEach(t => {
      if (t.month && t.month.startsWith(`${year}-`)) {
        counts[t.month] = (counts[t.month] || 0) + (t.targetQty || 1);
      }
    });

    elements.calendarMonthsGrid.innerHTML = monthShorts.map((shortName, idx) => {
      const mNum = idx + 1;
      const ym = `${year}-${String(mNum).padStart(2, '0')}`;
      const isActive = ym === activeMonth;
      const isCurrent = ym === curYm;
      const totalTargets = counts[ym] || 0;
      const hasData = totalTargets > 0;

      let badgeHtml = '';
      if (isCurrent) {
        badgeHtml = `<span class="cal-month-badge">Current</span>`;
      } else if (hasData) {
        badgeHtml = `<span class="cal-month-badge">${totalTargets} targets</span>`;
      } else if (ym < curYm) {
        badgeHtml = `<span class="cal-month-badge" style="opacity: 0.6;">Past</span>`;
      } else {
        badgeHtml = `<span class="cal-month-badge" style="opacity: 0.6;">Future</span>`;
      }

      return `
        <button type="button" class="cal-month-btn ${isActive ? 'active' : ''} ${hasData ? 'has-data' : ''}" data-ym="${ym}">
          <span class="cal-month-name">${shortName}</span>
          ${badgeHtml}
        </button>
      `;
    }).join('');

    // Attach click listener to month buttons
    elements.calendarMonthsGrid.querySelectorAll('.cal-month-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ym = btn.dataset.ym;
        if (!ym) return;
        window.dataStore.setActiveMonth(ym);
        closeHistoricalCalendarModal();
        populateMonthSelector();
        renderApp();
        const [y, mStr] = ym.split('-');
        const mName = monthFull[parseInt(mStr, 10) - 1] || ym;
        showToast(`📅 Switched active cycle to ${mName} ${y}`, 'success');
      });
    });
  }

  // Hook up Calendar Modal Buttons
  if (elements.btnCalendarPicker) {
    elements.btnCalendarPicker.addEventListener('click', openHistoricalCalendarModal);
  }
  if (elements.btnCloseCalendarModal) {
    elements.btnCloseCalendarModal.addEventListener('click', closeHistoricalCalendarModal);
  }
  if (elements.btnCalClose) {
    elements.btnCalClose.addEventListener('click', closeHistoricalCalendarModal);
  }
  if (elements.btnCalPrevYear) {
    elements.btnCalPrevYear.addEventListener('click', () => {
      state.calendarModalYear--;
      renderCalendarMonthsGrid(state.calendarModalYear);
      refreshIcons();
    });
  }
  if (elements.btnCalNextYear) {
    elements.btnCalNextYear.addEventListener('click', () => {
      state.calendarModalYear++;
      renderCalendarMonthsGrid(state.calendarModalYear);
      refreshIcons();
    });
  }
  if (elements.btnCalJumpCurrent) {
    elements.btnCalJumpCurrent.addEventListener('click', () => {
      const now = new Date();
      const curYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      window.dataStore.setActiveMonth(curYm);
      closeHistoricalCalendarModal();
      populateMonthSelector();
      renderApp();
      showToast(`📅 Jumped to current month (${curYm})`, 'info');
    });
  }

  function updateCalendarBtnTooltip() {
    if (!elements.btnCalendarPicker) return;
    const activeMonth = window.dataStore.getActiveMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (activeMonth) {
      const [y, mStr] = activeMonth.split('-');
      const mIdx = parseInt(mStr, 10) - 1;
      const mName = monthNames[mIdx] || activeMonth;
      elements.btnCalendarPicker.title = `Cycle Calendar (${mName} ${y})`;
      elements.btnCalendarPicker.setAttribute('aria-label', `Cycle Calendar (${mName} ${y})`);
    }
  }

  // Master Render Loop
  function renderApp() {
    populateMonthSelector();
    updateCalendarBtnTooltip();
    updateHeader();
    populateLoginProfileTabs();
    populateTargetAssigneeOptions();
    populateRoleFilterOptions();
    if (state.user) {
      if (state.user.role === 'manager') {
        renderManagerView();
      } else {
        renderMemberView();
      }
    }
    refreshFuturisticEffects();
  }

  // =========================================================================
  // EVENT LISTENERS & MODAL HANDLERS
  // =========================================================================

  // Month Switcher (Dropdown if present)
  if (elements.monthSelector) {
    elements.monthSelector.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === '__pick_calendar__') {
        elements.monthSelector.value = window.dataStore.getActiveMonth();
        openHistoricalCalendarModal();
        return;
      }
      window.dataStore.setActiveMonth(val);
      if (elements.monthDisplay) {
        elements.monthDisplay.textContent = e.target.options[e.target.selectedIndex].text;
      }
      showToast(`Switched active cycle to ${e.target.options[e.target.selectedIndex].text}`, 'info');
      renderApp();
    });
  }



  // Manager Tab Switching
  elements.managerTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      elements.managerTabBtns.forEach(b => b.classList.remove('active'));
      const targetBtn = e.target.closest('[data-manager-tab]') || btn;
      targetBtn.classList.add('active');
      state.activeManagerTab = targetBtn.dataset.managerTab;
      renderManagerActiveTab();
    });
  });

  // Alert Banner View Reviews button
  elements.viewReviewsBtn.addEventListener('click', () => {
    elements.managerTabBtns.forEach(b => {
      if (b.dataset.managerTab === 'review-queue') b.classList.add('active');
      else b.classList.remove('active');
    });
    state.activeManagerTab = 'review-queue';
    renderManagerActiveTab();
  });

  // Filter Listeners
  if (elements.filterSearchInput) {
    elements.filterSearchInput.addEventListener('input', debounce((e) => {
      state.filters.search = e.target.value.trim();
      renderManagerTargetsTable();
      refreshIcons();
    }, 180));
  }

  if (elements.filterStatusSelect) {
    elements.filterStatusSelect.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      renderManagerTargetsTable();
      refreshIcons();
    });
  }

  elements.filterRoleSelect.addEventListener('change', (e) => {
    state.filters.role = e.target.value;
    renderManagerTargetsTable();
    refreshIcons();
  });

  elements.filterCategorySelect.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderManagerTargetsTable();
    refreshIcons();
  });

  elements.filterBrandSelect.addEventListener('change', (e) => {
    state.filters.brand = e.target.value;
    renderManagerTargetsTable();
    refreshIcons();
  });

  // Keyboard accessibility: Escape to close active modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
        if (modal.id === 'auth-modal' && !state.user) return; // Don't close login if signed out
        modal.classList.add('hidden');
      });
    }
  });

  // Member Category Filter Buttons
  elements.memberCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.memberCatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.memberCategory = btn.dataset.category;
      renderMemberView();
    });
  });

  // Close Modals (buttons and backdrop overlay clicks)
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.closeModal;
      const modalEl = document.getElementById(modalId);
      if (modalEl) modalEl.classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal.id === 'auth-modal' && !state.user) return;
        modal.classList.add('hidden');
      }
    });
  });

  // Open Assign Target Modal (Manager)
  function openAssignTargetModal(preselectedAssignee = null) {
    elements.assignTargetForm.reset();
    elements.editTargetId.value = '';
    populateTargetAssigneeOptions(preselectedAssignee);
    elements.assignTargetModal.querySelector('h3').textContent = 'Assign Target Deliverable';
    if (elements.btnSubmitTargetText) elements.btnSubmitTargetText.textContent = 'Assign Target';
    if (elements.btnModalDeleteTarget) elements.btnModalDeleteTarget.style.display = 'none';
    elements.assignTargetModal.classList.remove('hidden');
    refreshIcons();
  }

  elements.btnOpenAssignModal.addEventListener('click', () => {
    openAssignTargetModal();
  });

  // Open Onboard Employee Modal
  function openAddEmployeeModal() {
    if (!elements.addEmployeeModal) return;
    elements.addEmployeeForm.reset();
    elements.addEmployeeModal.classList.remove('hidden');
    refreshIcons();
  }

  if (elements.btnRosterAddEmp) {
    elements.btnRosterAddEmp.addEventListener('click', openAddEmployeeModal);
  }



  // Save Add Employee Form
  if (elements.addEmployeeForm) {
    elements.addEmployeeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = window.authService.addUser({
        name: elements.newEmpName.value,
        email: elements.newEmpEmail.value,
        role: elements.newEmpRole.value,
        title: elements.newEmpTitle.value,
        brand: elements.newEmpBrand.value,
        password: elements.newEmpPassword.value
      });

      if (!res.success) {
        showToast(res.error || 'Failed to onboard employee', 'error');
        return;
      }

      elements.addEmployeeModal.classList.add('hidden');
      populateTargetAssigneeOptions();
      populateRoleFilterOptions();
      renderApp();
      showToast(`🎉 Onboarded ${res.user.name} as ${res.user.title}!`, 'success');

      // Switch to Team Roster tab so they see the new employee card immediately
      state.activeManagerTab = 'team-roster';
      elements.managerTabBtns.forEach(btn => {
        if (btn.dataset.managerTab === 'team-roster') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      renderManagerActiveTab();
    });
  }

  // Delete Employee Confirmation Handler
  function executeDeleteEmployee(email, name) {
    const res = window.authService.deleteUser(email);
    if (res.success) {
      populateTargetAssigneeOptions();
      populateRoleFilterOptions();
      renderApp();
      showToast(`🗑️ ${name} was removed from the team roster.`, 'info');
    } else {
      showToast(res.error || 'Could not delete employee.', 'error');
    }
  }

  const btnConfirmDelete = document.getElementById('btn-confirm-delete-employee');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      const email = state.pendingDeleteEmail;
      const name = state.pendingDeleteName || email;
      const deleteModal = document.getElementById('delete-employee-modal');
      if (deleteModal) deleteModal.classList.add('hidden');
      if (email) {
        executeDeleteEmployee(email, name);
      }
      state.pendingDeleteEmail = null;
      state.pendingDeleteName = null;
    });
  }

  // Edit Employee Modal Handlers
  const editEmployeeModal = document.getElementById('edit-employee-modal');
  const editEmployeeForm = document.getElementById('edit-employee-form');
  const editEmpEmailOrig = document.getElementById('edit-emp-email-orig');
  const editEmpEmailDisplay = document.getElementById('edit-emp-email-display');
  const editEmpName = document.getElementById('edit-emp-name');
  const editEmpRole = document.getElementById('edit-emp-role');
  const editEmpTitle = document.getElementById('edit-emp-title');
  const editEmpBrand = document.getElementById('edit-emp-brand');
  const editEmpPassword = document.getElementById('edit-emp-password');

  function openEditEmployeeModal(email) {
    const user = window.authService.getUserByEmail(email);
    if (!user) {
      showToast('Employee profile not found.', 'error');
      return;
    }

    if (editEmpEmailOrig) editEmpEmailOrig.value = user.email;
    if (editEmpEmailDisplay) editEmpEmailDisplay.value = user.email;
    if (editEmpName) editEmpName.value = user.name || '';
    if (editEmpRole) editEmpRole.value = user.role || 'designer';
    if (editEmpTitle) editEmpTitle.value = user.title || '';
    if (editEmpBrand) editEmpBrand.value = user.brand || 'Both';
    if (editEmpPassword) editEmpPassword.value = '';

    if (editEmployeeModal) {
      editEmployeeModal.classList.remove('hidden');
      refreshIcons();
    }
  }

  if (editEmployeeForm) {
    editEmployeeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const origEmail = editEmpEmailOrig.value;
      const name = editEmpName.value.trim();
      const role = editEmpRole.value;
      const title = editEmpTitle.value.trim();
      const brand = editEmpBrand.value;
      const password = editEmpPassword.value.trim();

      const result = window.authService.updateUser(origEmail, {
        name,
        role,
        title,
        brand,
        password: password || undefined
      });

      if (!result.success) {
        showToast(result.error || 'Failed to update employee.', 'error');
        return;
      }

      if (editEmployeeModal) editEmployeeModal.classList.add('hidden');
      populateTargetAssigneeOptions();
      populateRoleFilterOptions();
      renderApp();
      showToast(`Updated profile for ${name}!`, 'success');
    });
  }

  // =========================================================================
  // USER SELF-PROFILE & SECURITY (CHANGE PASSWORD) CONTROLLERS
  // =========================================================================
  function openProfileModal(tab = 'details') {
    const user = state.user;
    if (!user) return;

    // Populate header summary
    if (elements.profileModalAvatar) {
      elements.profileModalAvatar.textContent = user.avatar || user.name.charAt(0);
    }
    if (elements.profileModalNameDisplay) {
      elements.profileModalNameDisplay.textContent = user.name;
    }
    if (elements.profileModalEmailDisplay) {
      elements.profileModalEmailDisplay.textContent = user.email;
    }
    if (elements.profileModalRoleBadge) {
      elements.profileModalRoleBadge.textContent = user.title || (user.role === 'manager' ? 'Lead Admin' : 'Team Member');
      elements.profileModalRoleBadge.className = `user-role-badge ${user.badgeClass || (user.role === 'manager' ? 'badge-lead' : 'badge-member')}`;
    }
    if (elements.profileModalBrandBadge) {
      elements.profileModalBrandBadge.textContent = formatBrandName(user.brand);
    }

    // Populate personal details form
    if (elements.profileEditName) {
      elements.profileEditName.value = user.name || '';
    }
    if (elements.profileEditTitle) {
      elements.profileEditTitle.value = user.title || '';
    }
    if (elements.profileEditBrandReadonly) {
      elements.profileEditBrandReadonly.value = formatBrandName(user.brand);
    }

    // Reset password form
    if (elements.profileCurrentPass) elements.profileCurrentPass.value = '';
    if (elements.profileNewPass) elements.profileNewPass.value = '';
    if (elements.profileConfirmPass) elements.profileConfirmPass.value = '';
    if (elements.profilePasswordError) {
      elements.profilePasswordError.textContent = '';
      elements.profilePasswordError.classList.add('hidden');
    }

    // Reset password input visibility icons
    document.querySelectorAll('.btn-toggle-pass-visibility').forEach(btn => {
      const targetId = btn.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (targetInput) targetInput.type = 'password';
      btn.innerHTML = '<i data-lucide="eye"></i>';
    });

    switchProfileTab(tab);

    if (elements.profileModal) {
      elements.profileModal.classList.remove('hidden');
      refreshIcons();
    }
  }

  function closeProfileModal() {
    if (elements.profileModal) {
      elements.profileModal.classList.add('hidden');
    }
  }

  function switchProfileTab(tabName) {
    if (elements.profileTabBtns) {
      elements.profileTabBtns.forEach(btn => {
        if (btn.dataset.profileTab === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const panelDetails = document.getElementById('profile-tab-details');
    const panelSecurity = document.getElementById('profile-tab-security');

    if (panelDetails && panelSecurity) {
      if (tabName === 'details') {
        panelDetails.classList.remove('hidden');
        panelDetails.classList.add('active');
        panelSecurity.classList.add('hidden');
        panelSecurity.classList.remove('active');
      } else {
        panelSecurity.classList.remove('hidden');
        panelSecurity.classList.add('active');
        panelDetails.classList.add('hidden');
        panelDetails.classList.remove('active');
      }
    }
    refreshIcons();
  }

  // Open / Close Profile Modal triggers
  if (elements.btnOpenUserProfile) {
    elements.btnOpenUserProfile.addEventListener('click', () => openProfileModal('details'));
  }
  if (elements.btnMemberOpenProfile) {
    elements.btnMemberOpenProfile.addEventListener('click', () => openProfileModal('security'));
  }
  if (elements.btnCloseProfileModal) {
    elements.btnCloseProfileModal.addEventListener('click', closeProfileModal);
  }
  if (elements.btnCancelProfileDetails) {
    elements.btnCancelProfileDetails.addEventListener('click', closeProfileModal);
  }
  if (elements.btnCancelProfilePassword) {
    elements.btnCancelProfilePassword.addEventListener('click', closeProfileModal);
  }

  // Tab switching buttons
  if (elements.profileTabBtns) {
    elements.profileTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.profileTab;
        switchProfileTab(tab);
      });
    });
  }

  // Save Personal Details Form
  if (elements.profileDetailsForm) {
    elements.profileDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = state.user;
      if (!user) return;

      const newName = elements.profileEditName.value.trim();
      const newTitle = elements.profileEditTitle.value.trim();

      if (!newName) {
        showToast('Please enter your full name.', 'error');
        return;
      }

      const res = window.authService.updateProfile(user.email, {
        name: newName,
        title: newTitle || user.title
      });

      if (!res.success) {
        showToast(res.error || 'Failed to update profile.', 'error');
        return;
      }

      state.user = res.user;
      closeProfileModal();
      populateTargetAssigneeOptions();
      populateRoleFilterOptions();
      renderApp();
      showToast('Profile updated successfully!', 'success');
    });
  }

  // Save Change Password Form
  if (elements.profilePasswordForm) {
    elements.profilePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = state.user;
      if (!user) return;

      const currentPass = elements.profileCurrentPass.value;
      const newPass = elements.profileNewPass.value;
      const confirmPass = elements.profileConfirmPass.value;

      if (elements.profilePasswordError) {
        elements.profilePasswordError.classList.add('hidden');
        elements.profilePasswordError.textContent = '';
      }

      if (newPass !== confirmPass) {
        if (elements.profilePasswordError) {
          elements.profilePasswordError.textContent = 'New password and confirmation do not match.';
          elements.profilePasswordError.classList.remove('hidden');
        } else {
          showToast('New password and confirmation do not match.', 'error');
        }
        return;
      }

      if (newPass.length < 6) {
        if (elements.profilePasswordError) {
          elements.profilePasswordError.textContent = 'Password must be at least 6 characters.';
          elements.profilePasswordError.classList.remove('hidden');
        } else {
          showToast('Password must be at least 6 characters.', 'error');
        }
        return;
      }

      const res = window.authService.changePassword(user.email, currentPass, newPass, confirmPass);
      if (!res.success) {
        if (elements.profilePasswordError) {
          elements.profilePasswordError.textContent = res.error;
          elements.profilePasswordError.classList.remove('hidden');
        }
        showToast(res.error, 'error');
        return;
      }

      // Success
      elements.profileCurrentPass.value = '';
      elements.profileNewPass.value = '';
      elements.profileConfirmPass.value = '';
      closeProfileModal();
      showToast('🔒 Password changed successfully! Keep it safe.', 'success');
    });
  }

  // Copy Mobile Sync Link Button Handler
  const btnCopySyncLink = document.getElementById('btn-copy-sync-link');
  if (btnCopySyncLink) {
    btnCopySyncLink.addEventListener('click', () => {
      const user = state.user;
      if (!user) {
        showToast('Please sign in first.', 'error');
        return;
      }
      try {
        const payload = {
          email: user.email,
          pass: user.password,
          t: Date.now()
        };
        const token = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        const syncUrl = `${window.location.origin}${window.location.pathname}?sync=${encodeURIComponent(token)}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(syncUrl).then(() => {
            showToast('📋 Mobile sync link copied! Open on your phone to sync instantly.', 'success');
          }).catch(() => {
            prompt('Copy this sync link and open on mobile:', syncUrl);
          });
        } else {
          prompt('Copy this sync link and open on mobile:', syncUrl);
        }
      } catch (err) {
        console.error('Failed to create sync URL', err);
        showToast('Failed to generate sync link.', 'error');
      }
    });
  }

  // Password visibility eye toggle handler (delegated)
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.btn-toggle-pass-visibility');
    if (toggleBtn) {
      e.preventDefault();
      const targetId = toggleBtn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        // Always enforce no autocapitalization even in text mode
        input.setAttribute('autocapitalize', 'none');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
        toggleBtn.innerHTML = isPass ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
        refreshIcons();
      }
      return;
    }
  });


  // Roster Search and Filter Listeners
  if (elements.rosterSearchInput) {
    elements.rosterSearchInput.addEventListener('input', debounce(() => {
      renderTeamRoster();
    }, 180));
  }
  if (elements.rosterRoleFilter) {
    elements.rosterRoleFilter.addEventListener('change', () => {
      renderTeamRoster();
    });
  }

  // Save Assign Target Form
  elements.assignTargetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const assigneeVal = elements.targetAssignee.value;
    const userMatch = window.authService.getUserByEmail(assigneeVal) || window.authService.getAllUsers().find(u => u.role === assigneeVal);

    const targetData = {
      id: elements.editTargetId.value || undefined,
      assignee: assigneeVal,
      assigneeName: userMatch ? userMatch.name : (assigneeVal.charAt(0).toUpperCase() + assigneeVal.slice(1)),
      assigneeRole: userMatch ? userMatch.role : assigneeVal,
      assigneeEmail: userMatch ? userMatch.email : undefined,
      brand: elements.targetBrand.value,
      category: elements.targetCategory.value,
      format: elements.targetFormat.value.trim(),
      program: elements.targetProgram.value.trim(),
      targetQty: parseInt(elements.targetQty.value, 10) || 1,
      notes: elements.targetNotes.value.trim()
    };

    window.dataStore.saveOrUpdateTarget(targetData);
    elements.assignTargetModal.classList.add('hidden');
    showToast(`Successfully assigned target to ${targetData.assigneeName || targetData.assignee}!`, 'success');
    renderApp();
  });

  // Open Log Work Modal (Global Button or Card Button)
  function openLogWorkModal(preselectedTargetId = null) {
    let availableTargets = [];
    if (state.user && state.user.role === 'manager') {
      availableTargets = window.dataStore.getTargets();
    } else if (state.user) {
      availableTargets = window.dataStore.getTargetsForUser(state.user);
    } else {
      availableTargets = window.dataStore.getTargets();
    }

    if (availableTargets.length === 0) {
      showToast('No targets available to submit for.', 'warning');
      return;
    }

    elements.logTargetSelect.innerHTML = availableTargets.map(t => `
      <option value="${t.id}" ${t.id === preselectedTargetId ? 'selected' : ''}>
        [${formatBrandName(t.brand)} - ${t.category}] ${t.program} (${t.format})
      </option>
    `).join('');

    elements.logWorkForm.reset();
    if (preselectedTargetId) {
      elements.logTargetSelect.value = preselectedTargetId;
    }
    elements.logWorkModal.classList.remove('hidden');
    refreshIcons();
  }

  elements.btnMemberLogWork.addEventListener('click', () => openLogWorkModal());

  // Submit Completed Work Form
  elements.logWorkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetId = elements.logTargetSelect.value;
    const target = window.dataStore.getTargetById(targetId);
    if (!target) return;

    const submissionData = {
      targetId: target.id,
      assignee: target.assignee,
      assigneeName: target.assigneeName,
      brand: target.brand,
      category: target.category,
      program: target.program,
      format: target.format,
      title: elements.logWorkTitle.value.trim(),
      url: elements.logWorkUrl.value.trim(),
      notes: elements.logWorkNotes.value.trim()
    };

    window.dataStore.addSubmission(submissionData);
    elements.logWorkModal.classList.add('hidden');
    showToast('Deliverable submitted successfully! Sent to Marketing Manager for review.', 'success');
    renderApp();
  });

  // Table & Card delegated actions
  document.addEventListener('click', (e) => {
    // Sortable Table Column Headers
    const sortTh = e.target.closest('.sortable-th');
    if (sortTh) {
      const col = sortTh.dataset.sortCol;
      if (col) {
        if (state.tableSort.col === col) {
          state.tableSort.order = state.tableSort.order === 'asc' ? 'desc' : 'asc';
        } else {
          state.tableSort.col = col;
          state.tableSort.order = 'asc';
        }
        renderManagerTargetsTable();
        refreshIcons();
        return;
      }
    }

    // Toggle Business Days (Mon-Fri) vs Calendar Days
    const toggleWorkdaysBtn = e.target.closest('#btn-toggle-workdays-mode');
    if (toggleWorkdaysBtn) {
      state.pacingMode = state.pacingMode === 'working' ? 'calendar' : 'working';
      renderOverviewDashboard();
      showToast(state.pacingMode === 'working' ? '💼 Mon-Fri Working Days Pacing activated' : '📅 Calendar Days Pacing activated', 'info');
      return;
    }

    // Quick Feedback Suggestion Chips
    const feedbackChip = e.target.closest('.feedback-chip');
    if (feedbackChip) {
      const chipText = feedbackChip.dataset.chip;
      const feedbackInput = document.getElementById('review-feedback-input');
      if (feedbackInput) {
        if (!feedbackInput.value.trim()) {
          feedbackInput.value = chipText;
        } else {
          feedbackInput.value += `\n${chipText}`;
        }
        feedbackInput.focus();
      }
      return;
    }

    // Card Log button
    const logBtn = e.target.closest('.btn-open-log-modal') || e.target.closest('.btn-action-log');
    if (logBtn) {
      const targetId = logBtn.dataset.targetId || logBtn.dataset.id;
      openLogWorkModal(targetId);
      return;
    }

    // Card Assign Task (Roster)
    const cardAssignBtn = e.target.closest('.btn-card-assign-task');
    if (cardAssignBtn) {
      const email = cardAssignBtn.dataset.empEmail;
      openAssignTargetModal(email);
      return;
    }

    // Card View/Delete Tasks per Employee (Roster)
    const viewTasksBtn = e.target.closest('.btn-card-view-tasks');
    if (viewTasksBtn) {
      const email = viewTasksBtn.dataset.empEmail;
      const name = viewTasksBtn.dataset.empName;
      const role = viewTasksBtn.dataset.empRole;
      openUserTasksModal(email, name, role);
      return;
    }

    // Card Edit Employee Profile (Roster or Overview)
    const cardEditBtn = e.target.closest('.btn-card-edit-emp');
    if (cardEditBtn) {
      const email = cardEditBtn.dataset.userEmail;
      openEditEmployeeModal(email);
      return;
    }

    // Card Delete Employee (Roster)
    const cardDeleteBtn = e.target.closest('.btn-card-delete-emp');
    if (cardDeleteBtn) {
      const email = cardDeleteBtn.dataset.userEmail;
      const name = cardDeleteBtn.dataset.userName || email;
      state.pendingDeleteEmail = email;
      state.pendingDeleteName = name;

      const nameDisplay = document.getElementById('delete-emp-name-display');
      if (nameDisplay) {
        nameDisplay.textContent = `${name} (${email})`;
      }

      const deleteModal = document.getElementById('delete-employee-modal');
      if (deleteModal) {
        deleteModal.classList.remove('hidden');
        refreshIcons();
      } else if (confirm(`Are you sure you want to remove ${name} (${email}) from the team roster?`)) {
        executeDeleteEmployee(email, name);
      }
      return;
    }

    // Edit Target button (Manager)
    const editBtn = e.target.closest('.btn-action-edit');
    if (editBtn) {
      const targetId = editBtn.dataset.id;
      const target = window.dataStore.getTargetById(targetId);
      if (target) {
        elements.editTargetId.value = target.id;
        populateTargetAssigneeOptions(target.assignee);
        elements.targetAssignee.value = target.assignee;
        elements.targetBrand.value = target.brand;
        elements.targetCategory.value = target.category;
        elements.targetFormat.value = target.format;
        elements.targetProgram.value = target.program;
        elements.targetQty.value = target.targetQty;
        elements.targetNotes.value = target.notes || '';
        elements.assignTargetModal.querySelector('h3').textContent = 'Edit Target Deliverable';
        if (elements.btnSubmitTargetText) elements.btnSubmitTargetText.textContent = 'Update Target';
        if (elements.btnModalDeleteTarget) elements.btnModalDeleteTarget.style.display = 'inline-flex';
        elements.assignTargetModal.classList.remove('hidden');
        refreshIcons();
      }
      return;
    }

    // Delete Target button (Manager or Member)
    const deleteBtn = e.target.closest('.btn-action-delete');
    if (deleteBtn) {
      const targetId = deleteBtn.dataset.id;
      if (targetId) {
        openDeleteTargetModal(targetId);
      }
      return;
    }

    // Open Review Modal button
    const reviewBtn = e.target.closest('.btn-open-review-modal');
    if (reviewBtn) {
      const subId = reviewBtn.dataset.subId;
      const sub = window.dataStore.getSubmissions().find(s => s.id === subId);
      if (sub) {
        elements.reviewSubmissionId.value = sub.id;
        const roleLabels = { designer: 'Graphic Designer', videographer: 'Videographer', marketing: 'Marketing Exec' };
        elements.reviewModalAuthor.textContent = `${roleLabels[sub.assignee] || sub.assignee} (${formatBrandName(sub.brand)})`;
        elements.reviewModalProgram.textContent = `${sub.program} - ${sub.title}`;
        elements.reviewModalFormat.textContent = sub.format;
        elements.reviewModalDate.textContent = formatDate(sub.submittedAt);
        elements.reviewModalLink.href = safeUrl(sub.url);
        elements.reviewModalUrlText.textContent = sub.url;
        elements.reviewModalNotes.textContent = sub.notes || 'No extra notes provided.';
        elements.reviewFeedbackInput.value = sub.feedback || '';

        elements.reviewActionModal.classList.remove('hidden');
        refreshIcons();
      }
      return;
    }
  });

  // Review Actions: Approve or Request Rework
  elements.btnApproveWork.addEventListener('click', () => {
    const subId = elements.reviewSubmissionId.value;
    const feedback = elements.reviewFeedbackInput.value.trim() || 'Approved by Marketing Manager!';
    window.dataStore.updateSubmissionStatus(subId, 'approved', feedback);
    elements.reviewActionModal.classList.add('hidden');
    showToast('Deliverable approved! Target count updated.', 'success');
    renderApp();
  });

  elements.btnRequestRework.addEventListener('click', () => {
    const subId = elements.reviewSubmissionId.value;
    const feedback = elements.reviewFeedbackInput.value.trim() || 'Revisions required. Please review notes.';
    window.dataStore.updateSubmissionStatus(subId, 'revision', feedback);
    elements.reviewActionModal.classList.add('hidden');
    showToast('Feedback sent back to team member for revision.', 'warning');
    renderApp();
  });

  // Batch Approve All Filtered
  elements.btnBatchApprove.addEventListener('click', () => {
    const pendingSubs = window.dataStore.getSubmissions({ status: 'pending' });
    if (pendingSubs.length === 0) {
      showToast('No pending items to approve.', 'info');
      return;
    }
    if (confirm(`Approve all ${pendingSubs.length} pending deliverables at once?`)) {
      pendingSubs.forEach(s => {
        window.dataStore.updateSubmissionStatus(s.id, 'approved', 'Batch approved by Marketing Manager');
      });
      showToast(`Approved ${pendingSubs.length} deliverables!`, 'success');
      renderApp();
    }
  });

  // Open Delete Target Confirmation Modal
  function openDeleteTargetModal(targetId) {
    const target = window.dataStore.getTargetById(targetId);
    if (!target) return;

    state.pendingDeleteTargetId = targetId;

    const userLookup = window.authService.getUserByEmail(target.assignee) ||
                       (target.assigneeEmail ? window.authService.getUserByEmail(target.assigneeEmail) : null);
    const roleLabels = { designer: 'Graphic Designer', videographer: 'Videographer', marketing: 'Marketing Executive', manager: 'Marketing Lead' };
    const assigneeName = userLookup ? userLookup.name : (target.assigneeName || roleLabels[target.assignee] || target.assignee);

    if (elements.deleteTargetTitleDisplay) {
      elements.deleteTargetTitleDisplay.textContent = target.program || 'Deliverable Target';
    }
    if (elements.deleteTargetBrandBadge) {
      elements.deleteTargetBrandBadge.textContent = formatBrandName(target.brand);
      elements.deleteTargetBrandBadge.className = `badge-brand ${target.brand || 'Techschool'}`;
    }
    if (elements.deleteTargetCatBadge) {
      elements.deleteTargetCatBadge.textContent = target.category || 'General';
    }
    if (elements.deleteTargetFormatBadge) {
      elements.deleteTargetFormatBadge.textContent = target.format || 'Creative';
    }
    if (elements.deleteTargetAssigneeDisplay) {
      elements.deleteTargetAssigneeDisplay.innerHTML = `Assigned to: <strong>${escapeHtml(assigneeName)}</strong>`;
    }

    if (elements.deleteTargetModal) {
      elements.deleteTargetModal.classList.remove('hidden');
      refreshIcons();
    } else if (confirm(`Are you sure you want to delete assigned task "${target.program}"?`)) {
      window.dataStore.deleteTarget(targetId);
      showToast('Assigned task deleted successfully', 'success');
      renderApp();
    }
  }

  // Confirm Delete Target Action
  if (elements.btnConfirmDeleteTarget) {
    elements.btnConfirmDeleteTarget.addEventListener('click', () => {
      if (state.pendingDeleteTargetId) {
        const idToDelete = state.pendingDeleteTargetId;
        window.dataStore.deleteTarget(idToDelete);
        if (elements.deleteTargetModal) elements.deleteTargetModal.classList.add('hidden');
        if (elements.assignTargetModal) elements.assignTargetModal.classList.add('hidden');

        if (state.activeTasksUserEmail) {
          renderUserTasksModal(state.activeTasksUserEmail);
        }

        showToast('Assigned deliverable task deleted successfully.', 'success');
        state.pendingDeleteTargetId = null;
        renderApp();
      }
    });
  }

  // Delete button inside Assign/Edit Target Modal
  if (elements.btnModalDeleteTarget) {
    elements.btnModalDeleteTarget.addEventListener('click', () => {
      const targetId = elements.editTargetId ? elements.editTargetId.value : null;
      if (targetId) {
        openDeleteTargetModal(targetId);
      }
    });
  }

  // Open User Tasks Management Modal (View & Delete per User)
  function openUserTasksModal(userEmail, userName = null, userRole = null) {
    state.activeTasksUserEmail = userEmail;
    renderUserTasksModal(userEmail, userName, userRole);
    if (elements.userTasksModal) {
      elements.userTasksModal.classList.remove('hidden');
      refreshIcons();
    }
  }

  function renderUserTasksModal(userEmail, userName = null, userRole = null) {
    if (!elements.userTasksModalList) return;
    const userObj = window.authService.getUserByEmail(userEmail) || {
      email: userEmail,
      name: userName || userEmail,
      role: userRole || 'designer'
    };

    const targets = window.dataStore.getTargetsForUser(userObj);

    if (elements.userTasksModalTitle) {
      elements.userTasksModalTitle.textContent = `Assigned Tasks – ${userObj.name}`;
    }
    if (elements.userTasksModalSubtitle) {
      elements.userTasksModalSubtitle.textContent = `${targets.length} deliverable task${targets.length === 1 ? '' : 's'} assigned for ${window.dataStore.getActiveMonth()}`;
    }

    if (targets.length === 0) {
      elements.userTasksModalList.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
          <i data-lucide="check-circle" style="width: 36px; height: 36px; color: var(--teal-primary); margin-bottom: 8px;"></i>
          <p style="margin: 0; font-weight: 600; color: var(--text-main);">No tasks currently assigned to ${escapeHtml(userObj.name)}.</p>
          <p style="margin: 4px 0 0; font-size: 12px;">Click 'Assign New Target' below to add a deliverable for this team member.</p>
        </div>
      `;
    } else {
      elements.userTasksModalList.innerHTML = targets.map(t => {
        const prog = window.dataStore.getTargetProgress(t.id);
        return `
          <div class="user-task-item">
            <div class="user-task-info">
              <div class="user-task-title" title="${escapeHtml(t.program)}">${escapeHtml(t.program)}</div>
              <div class="user-task-meta">
                <span class="badge-brand ${escapeHtml(t.brand)}">${formatBrandName(t.brand)}</span>
                <span class="badge-category">${escapeHtml(t.category)}</span>
                <span class="badge-format">${escapeHtml(t.format)}</span>
                <span>• Target: <strong>${t.targetQty}</strong></span>
                <span style="color: var(--mint-light); font-weight: 600;">• Done: ${prog.completed}</span>
                ${prog.pending > 0 ? `<span style="color: var(--amber-light); font-weight: 600;">• ${prog.pending} in review</span>` : ''}
              </div>
            </div>
            <div class="user-task-actions">
              <button type="button" class="btn btn-outline-sm btn-action-delete" data-id="${t.id}" title="Delete Task" style="color: var(--rose-light); border-color: rgba(239, 68, 68, 0.35);">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    refreshIcons();
  }

  if (elements.btnUserTasksAssignNew) {
    elements.btnUserTasksAssignNew.addEventListener('click', () => {
      const email = state.activeTasksUserEmail;
      if (elements.userTasksModal) elements.userTasksModal.classList.add('hidden');
      openAssignTargetModal(email);
    });
  }

  // Export Report Dropdown & Handlers (CSV, JSON, Print)
  const exportMenu = document.getElementById('export-dropdown-menu');
  if (elements.btnExportData && exportMenu) {
    elements.btnExportData.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.export-dropdown-wrapper')) {
        exportMenu.classList.add('hidden');
      }
    });

    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        exportMenu.classList.add('hidden');
        exportCSVReport();
      });
    }

    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        exportMenu.classList.add('hidden');
        exportJSONBackup();
      });
    }

    const btnExportPrint = document.getElementById('btn-export-print');
    if (btnExportPrint) {
      btnExportPrint.addEventListener('click', () => {
        exportMenu.classList.add('hidden');
        window.print();
      });
    }
  }

  function exportCSVReport() {
    const month = window.dataStore.getActiveMonth();
    const targets = window.dataStore.getTargets();

    const headers = [
      "Month",
      "Brand",
      "Category",
      "Program Title",
      "Format",
      "Target Quota",
      "Completed",
      "Pending Review",
      "Pacing %",
      "Assignee Name",
      "Assignee Email",
      "Guidelines & Notes"
    ];

    const rows = targets.map(t => {
      const prog = window.dataStore.getTargetProgress(t.id);
      const userLookup = window.authService.getUserByEmail(t.assignee) ||
                         (t.assigneeEmail ? window.authService.getUserByEmail(t.assigneeEmail) : null);
      const name = userLookup ? userLookup.name : (t.assigneeName || t.assignee);
      const email = userLookup ? userLookup.email : (t.assigneeEmail || '');

      return [
        month,
        formatBrandName(t.brand),
        t.category || '',
        t.program || '',
        t.format || '',
        t.targetQty || 0,
        prog.completed || 0,
        prog.pending || 0,
        `${prog.pct}%`,
        name,
        email,
        (t.notes || '').replace(/"/g, '""')
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexcrest_Marketing_Deliverables_${month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`📊 Downloaded CSV Report for ${month}!`, 'success');
  }

  function exportJSONBackup() {
    const month = window.dataStore.getActiveMonth();
    const targets = window.dataStore.getTargets();
    const submissions = window.dataStore.getSubmissions();
    const report = {
      generatedAt: new Date().toISOString(),
      month,
      overall: window.dataStore.getDashboardOverview(),
      targets,
      submissions
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Nexcrest_Marketing_Backup_${month}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast(`💾 Exported JSON Backup for ${month}!`, 'success');
  }

  // Auth / Login Handling
  elements.authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAuthError();
    const email = (elements.loginEmail ? elements.loginEmail.value : '').trim();
    const pass = (elements.loginPassword ? elements.loginPassword.value : '');
    const res = window.authService.login(email, pass);
    if (res.success) {
      state.user = res.user;
      clearAuthError();
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      renderApp();
    } else {
      const errorMsg = res.error || 'Incorrect password. Please try again.';
      showAuthError(errorMsg);
      showToast(errorMsg, 'error');
    }
  });

  // Automatically clear error notice as soon as user types in credentials
  if (elements.loginPassword) {
    elements.loginPassword.addEventListener('input', () => {
      clearAuthError();
    });
  }
  if (elements.loginEmail) {
    elements.loginEmail.addEventListener('input', () => {
      clearAuthError();
    });
  }

  // Logout Buttons (Inside Profile Settings Modal)
  document.querySelectorAll('.btn-logout-action, #logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeProfileModal();
      window.authService.logout();
      state.user = null;
      clearAuthError();
      showToast('Signed out', 'info');
      populateLoginProfileTabs('manager@nexcrest.com');
      renderApp();
    });
  });

  // Exclusive System Theme: High-End Light Theme Only (Dark theme removed entirely)
  function initTheme() {
    try {
      localStorage.removeItem('nexcrest_theme_mode');
    } catch (e) {}
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }

  // Reactive Auth Sync
  window.authService.onChange((user) => {
    state.user = user;
    renderApp();
  });

  // Initial Boot
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('sync')) {
      const syncRaw = urlParams.get('sync');
      const decoded = decodeURIComponent(escape(atob(decodeURIComponent(syncRaw))));
      const syncData = JSON.parse(decoded);
      if (syncData && syncData.email && syncData.pass) {
        const u = window.authService.getUserByEmail(syncData.email);
        if (u) {
          u.password = syncData.pass;
          window.authService.saveUsers(window.authService.users);
          window.authService.saveSession(u);
          state.user = u;
          showToast(`✨ Successfully synced credentials for ${u.name}!`, 'success');
          // Clean the address bar without reloading
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    }
    if (urlParams.has('reset') || urlParams.has('reset_pass')) {
      window.authService.restoreDefaultUsers();
      showToast('🔑 All account passwords restored to default: password123', 'info');
    }
  } catch (e) {
    console.error('URL params / sync check failed', e);
  }

  initTheme();
  renderApp();
  refreshFuturisticEffects();
});
