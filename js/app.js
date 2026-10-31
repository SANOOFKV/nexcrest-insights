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
    memberStatusFilter: 'pending', // Option B: 'pending' (default) | 'delivered' | 'all'
    modalTasksFilter: 'pending',   // 'pending' (default) | 'delivered' | 'all'
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
    calendarModalYear: 2026,
    selectedTargetIds: new Set(),
    selectedMemberTargetIds: new Set(),
    selectedUserModalTargetIds: new Set(),
    pendingBatchDeleteIds: [],
    pendingBatchDeleteSource: null
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
    adminTargetsStatusBar: document.getElementById('admin-targets-status-bar'),
    adminStatusBtnAll: document.getElementById('admin-status-btn-all'),
    adminStatusBtnPending: document.getElementById('admin-status-btn-pending'),
    adminStatusBtnDelivered: document.getElementById('admin-status-btn-delivered'),
    adminCountStatusAll: document.getElementById('admin-count-status-all'),
    adminCountStatusPending: document.getElementById('admin-count-status-pending'),
    adminCountStatusDelivered: document.getElementById('admin-count-status-delivered'),

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
    memberDeliverablesGrid: document.getElementById('grid-pending-deliverables') || document.getElementById('member-deliverables-grid'),
    memberStatusFilterBar: document.getElementById('member-status-filter-bar'),
    statusBtnPending: document.getElementById('status-btn-pending'),
    statusBtnDelivered: document.getElementById('status-btn-delivered'),
    statusBtnAll: document.getElementById('status-btn-all'),
    countStatusAll: document.getElementById('count-status-all'),
    countStatusPending: document.getElementById('count-status-pending'),
    countStatusDelivered: document.getElementById('count-status-delivered'),
    statusHintText: document.getElementById('status-hint-text'),
    sectionPendingDeliverables: document.getElementById('section-pending-deliverables'),
    sectionDeliveredDeliverables: document.getElementById('section-delivered-deliverables'),
    gridPendingDeliverables: document.getElementById('grid-pending-deliverables'),
    gridDeliveredDeliverables: document.getElementById('grid-delivered-deliverables'),
    badgePendingCount: document.getElementById('badge-pending-count'),
    badgeDeliveredCount: document.getElementById('badge-delivered-count'),
    modalCountPending: document.getElementById('modal-count-pending'),
    modalCountDelivered: document.getElementById('modal-count-delivered'),
    modalCountAll: document.getElementById('modal-count-all'),
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
    targetDeadline: document.getElementById('target-deadline'),
    targetDeadlinePresets: document.getElementById('target-deadline-presets'),
    targetDeadlineQuickPreview: document.getElementById('target-deadline-quick-preview'),
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

    // Batch Target Actions (Manager Table)
    targetsBatchActions: document.getElementById('targets-batch-actions'),
    batchSelectedCountBadge: document.getElementById('batch-selected-count-badge'),
    btnBatchDeleteTargets: document.getElementById('btn-batch-delete-targets'),
    btnBatchClearSelection: document.getElementById('btn-batch-clear-selection'),
    btnSelectAllTargetsToggle: document.getElementById('btn-select-all-targets-toggle'),
    selectAllBtnText: document.getElementById('select-all-btn-text'),
    selectAllTargetsCheckbox: document.getElementById('select-all-targets-checkbox'),

    // Batch Delete Confirmation Modal
    deleteBatchTargetsModal: document.getElementById('delete-batch-targets-modal'),
    deleteBatchCountDisplay: document.getElementById('delete-batch-count-display'),
    deleteBatchModalTitle: document.getElementById('delete-batch-modal-title'),
    btnConfirmDeleteBatch: document.getElementById('btn-confirm-delete-batch'),


    // User Tasks Management Modal
    userTasksModal: document.getElementById('user-tasks-modal'),
    userTasksModalTitle: document.getElementById('user-tasks-modal-title'),
    userTasksModalSubtitle: document.getElementById('user-tasks-modal-subtitle'),
    userTasksModalList: document.getElementById('user-tasks-modal-list'),
    btnUserTasksAssignNew: document.getElementById('btn-user-tasks-assign-new'),
    userTasksSelectAllCheckbox: document.getElementById('user-tasks-select-all-checkbox'),
    btnUserTasksBatchDelete: document.getElementById('btn-user-tasks-batch-delete'),
    userTasksSelectedCount: document.getElementById('user-tasks-selected-count'),

    // Log Work / Add Task Form
    logWorkForm: document.getElementById('log-work-form'),
    logTargetSelect: document.getElementById('log-target-select'),
    logTargetDeadlineBadge: document.getElementById('log-target-deadline-badge'),
    logWorkTitle: document.getElementById('log-work-title'),
    logWorkUrl: document.getElementById('log-work-url'),
    logWorkNotes: document.getElementById('log-work-notes'),
    btnMemberAddTask: document.getElementById('btn-member-add-task'),
    btnMemberLogExtraWork: document.getElementById('btn-member-log-extra-work'),
    btnModeAssigned: document.getElementById('btn-mode-assigned'),
    btnModeExtra: document.getElementById('btn-mode-extra'),
    logWorkMode: document.getElementById('log-work-mode'),
    logAssignedFields: document.getElementById('log-assigned-fields'),
    logExtraFields: document.getElementById('log-extra-fields'),
    logExtraBrand: document.getElementById('log-extra-brand'),
    logExtraCategory: document.getElementById('log-extra-category'),
    logExtraTitle: document.getElementById('log-extra-title'),
    logExtraProgram: document.getElementById('log-extra-program'),
    logExtraFormat: document.getElementById('log-extra-format'),
    logExtraDeadline: document.getElementById('log-extra-deadline'),
    logExtraDeadlinePresets: document.getElementById('log-extra-deadline-presets'),
    logExtraDeadlinePreview: document.getElementById('log-extra-deadline-preview'),
    logWorkModalHeading: document.getElementById('log-work-modal-heading'),
    btnSubmitDeliverable: document.getElementById('btn-submit-deliverable'),

    // Marketing Executive Workspace & Modals
    memberCreativeWorkspace: document.getElementById('member-creative-workspace'),
    memberMarketingWorkspace: document.getElementById('member-marketing-workspace'),
    routineNoteModal: document.getElementById('routine-note-modal'),
    routineNoteForm: document.getElementById('routine-note-form'),
    routineModalTitle: document.getElementById('routine-modal-title'),
    routineModalTaskId: document.getElementById('routine-modal-task-id'),
    routineModalType: document.getElementById('routine-modal-type'),
    routineModalTaskName: document.getElementById('routine-modal-task-name'),
    routineModalProofUrl: document.getElementById('routine-modal-proof-url'),
    routineModalNoteText: document.getElementById('routine-modal-note-text'),

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

  function formatDeadlineBadge(deadlineStr, isCompleted = false) {
    if (!deadlineStr) return '';
    try {
      const parts = deadlineStr.split('-');
      if (parts.length < 3) return `<span class="badge-deadline"><i data-lucide="calendar"></i> Due ${escapeHtml(deadlineStr)}</span>`;
      const dueYear = parseInt(parts[0], 10);
      const dueMonth = parseInt(parts[1], 10) - 1;
      const dueDay = parseInt(parts[2], 10);
      const dueDate = new Date(dueYear, dueMonth, dueDay, 23, 59, 59);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueStart = new Date(dueYear, dueMonth, dueDay);
      const diffMs = dueStart - todayStart;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (isCompleted) {
        return `<span class="badge-deadline completed" title="Due on ${formattedDate} (Task Completed)"><i data-lucide="calendar-check"></i> Due ${formattedDate}</span>`;
      }

      if (diffDays < 0) {
        return `<span class="badge-deadline overdue" title="Overdue by ${Math.abs(diffDays)} day(s)"><i data-lucide="alert-circle"></i> Overdue (${formattedDate})</span>`;
      } else if (diffDays === 0) {
        return `<span class="badge-deadline today" title="Due Today!"><i data-lucide="clock"></i> Due Today</span>`;
      } else if (diffDays === 1) {
        return `<span class="badge-deadline soon" title="Due Tomorrow"><i data-lucide="calendar"></i> Due Tomorrow</span>`;
      } else {
        return `<span class="badge-deadline" title="Due on ${formattedDate}"><i data-lucide="calendar"></i> Due ${formattedDate}</span>`;
      }
    } catch (e) {
      return `<span class="badge-deadline"><i data-lucide="calendar"></i> Due ${escapeHtml(deadlineStr)}</span>`;
    }
  }

  function renderTaskDeadlineStrip(deadlineStr, isCompleted = false) {
    if (!deadlineStr) return '';
    try {
      const parts = deadlineStr.split('-');
      if (parts.length < 3) {
        return `
          <div class="task-deadline-strip upcoming">
            <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${escapeHtml(deadlineStr)}</strong></span>
            <span class="deadline-tag">Scheduled</span>
          </div>`;
      }
      const dueYear = parseInt(parts[0], 10);
      const dueMonth = parseInt(parts[1], 10) - 1;
      const dueDay = parseInt(parts[2], 10);
      const dueDate = new Date(dueYear, dueMonth, dueDay, 23, 59, 59);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueStart = new Date(dueYear, dueMonth, dueDay);
      const diffMs = dueStart - todayStart;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (isCompleted) {
        return `
          <div class="task-deadline-strip completed" title="Task Completed">
            <span class="deadline-content"><i data-lucide="calendar-check"></i> Due: <strong>${formattedDate}</strong></span>
            <span class="deadline-tag">Completed</span>
          </div>`;
      }

      if (diffDays < 0) {
        const absDays = Math.abs(diffDays);
        return `
          <div class="task-deadline-strip overdue" title="Overdue by ${absDays} day(s)">
            <span class="deadline-content"><i data-lucide="alert-circle"></i> Due: <strong>${formattedDate}</strong></span>
            <span class="deadline-tag">⚠️ ${absDays}d Overdue</span>
          </div>`;
      } else if (diffDays === 0) {
        return `
          <div class="task-deadline-strip today" title="Due Today!">
            <span class="deadline-content"><i data-lucide="clock"></i> Due: <strong>${formattedDate}</strong></span>
            <span class="deadline-tag">⏰ Due Today</span>
          </div>`;
      } else if (diffDays === 1) {
        return `
          <div class="task-deadline-strip soon" title="Due Tomorrow">
            <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${formattedDate}</strong></span>
            <span class="deadline-tag">Due Tomorrow</span>
          </div>`;
      } else {
        return `
          <div class="task-deadline-strip upcoming" title="Due in ${diffDays} days">
            <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${formattedDate}</strong></span>
            <span class="deadline-tag">${diffDays} days left</span>
          </div>`;
      }
    } catch (e) {
      return `
        <div class="task-deadline-strip upcoming">
          <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${escapeHtml(deadlineStr)}</strong></span>
        </div>`;
    }
  }

  // Calculate Date String for Quick Preset Buttons
  function calculateDatePreset(preset) {
    const d = new Date();
    if (preset === 'today') {
      return (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(d) : d.toISOString().split('T')[0];
    }
    if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      return (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(d) : d.toISOString().split('T')[0];
    }
    if (preset === 'in3days') {
      d.setDate(d.getDate() + 3);
      return (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(d) : d.toISOString().split('T')[0];
    }
    if (preset === 'weekend') {
      const day = d.getDay(); // 0 is Sunday
      const diff = (7 - day) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(d) : d.toISOString().split('T')[0];
    }
    if (preset === 'nextweek') {
      const day = d.getDay();
      const diff = (8 - day) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(d) : d.toISOString().split('T')[0];
    }
    return (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(d) : d.toISOString().split('T')[0];
  }

  function updateDeadlineQuickPreview(inputEl, previewEl) {
    if (!previewEl) return;
    const val = inputEl ? inputEl.value : '';
    if (!val) {
      previewEl.innerHTML = '';
      return;
    }
    const today = new Date();
    const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(today) : today.toISOString().split('T')[0];

    if (val === todayStr) {
      previewEl.innerHTML = `<span style="color: #FDE68A;">⏰ Due Today!</span>`;
    } else if (val < todayStr) {
      previewEl.innerHTML = `<span style="color: #FDA4AF;">⚠️ Past Date</span>`;
    } else {
      const targetD = new Date(val);
      const diffTime = targetD.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        previewEl.innerHTML = `<span style="color: #FEF08A;">⚡ Due Tomorrow</span>`;
      } else {
        previewEl.innerHTML = `<span style="color: var(--teal-light);">📅 In ${diffDays} days</span>`;
      }
    }
  }

  function formatBrandName(brand) {
    if (!brand) return 'Techschool';
    const b = brand.toString().trim();
    if (b === 'Both' || b === 'Both Brands') return 'Both';
    if (b === 'IT' || b === 'Nexcrest IT' || b.toUpperCase() === 'IT') return 'IT';
    return 'Techschool';
  }

  // Hardened Safe URL sanitizer against XSS, data: URIs, javascript: and malicious protocols
  function safeUrl(url) {
    if (!url) return '#';
    try {
      let trimmed = url.toString().trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = 'https://' + trimmed;
      }
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.href;
      }
    } catch (e) {
      // Invalid URL format
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

    if (elements.reviewAlertBanner) {
      if (pendingCount > 0) {
        elements.reviewAlertBanner.classList.remove('hidden');
        if (elements.alertText) elements.alertText.textContent = `You have ${pendingCount} deliverable submission${pendingCount > 1 ? 's' : ''} awaiting your review and approval.`;
      } else {
        elements.reviewAlertBanner.classList.add('hidden');
      }
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
    const clampedPct = Math.min(100, Math.max(0, ov.pct));
    const offset = circumference - (circumference * (clampedPct / 100));
    if (elements.ovRingFill) {
      elements.ovRingFill.style.strokeDashoffset = offset;
      elements.ovRingFill.style.stroke = ov.pct >= 100 ? '#10B981' : '#0284C7';
    }
    animateCounter(elements.ovProgressPct, ov.pct, 750, '%');
    if (elements.ovProgressRatio) elements.ovProgressRatio.textContent = `${ov.totalPublished} / ${ov.totalTarget}`;
    if (ov.extraCompleted > 0 && elements.ovRemainingCount) {
      elements.ovRemainingCount.innerHTML = `0 <span style="font-size: 11px; color: var(--mint-accent, #10B981); font-weight: 700; margin-left: 2px;">(+${ov.extraCompleted} 🚀)</span>`;
    } else {
      animateCounter(elements.ovRemainingCount, ov.remaining);
    }

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

    const campus = ov.categories['Campus Events'] || ov.categories['Campus Happenings'];
    if (campus) {
      animateCounter(elements.catCampusPosts, campus.total, 750, ' Posts');
      animateCounter(elements.catCampusReels, campus.reelsTarget);
      animateCounter(elements.catCampusPosters, campus.postersTarget);
      const cPct = campus.total > 0 ? Math.min(100, Math.round((campus.published / campus.total) * 100)) : 0;
      if (elements.catCampusBar) elements.catCampusBar.style.width = `${cPct}%`;
    }

    const marketing = ov.categories['Marketing'] || ov.categories['Marketing Creatives'];
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

    // Responsive Detection for Compact 2x2 Mobile Presentation
    const isMobile = window.innerWidth <= 768;

    // Pure Light Theme Chart Styling
    const textColor = '#475569';
    const gridColor = 'rgba(0, 0, 0, 0.06)';

    // Chart 1: Category Target vs Achievement Bar Chart
    const ctxCat = document.getElementById('categoryComparisonChart');
    if (ctxCat) {
      if (state.charts.category) state.charts.category.destroy();

      const catLabels = isMobile
        ? ['Branding', 'Campus', 'Marketing', 'Moment']
        : ['Branding', 'Campus Events', 'Marketing', 'Moment Marketing'];
      const catKeys = ['Branding', 'Campus Events', 'Marketing', 'Moment Marketing'];
      const catTargets = catKeys.map(k => ov.categories[k] ? ov.categories[k].total : 0);
      const catAchieved = catKeys.map(k => ov.categories[k] ? ov.categories[k].published : 0);

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
              borderRadius: isMobile ? 4 : 6,
              barPercentage: isMobile ? 0.75 : 0.65
            },
            {
              label: 'Achieved / Published',
              data: catAchieved,
              backgroundColor: achievedColor,
              borderRadius: isMobile ? 4 : 6,
              barPercentage: isMobile ? 0.75 : 0.65
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
              padding: isMobile ? 8 : 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              ticks: {
                color: textColor,
                font: { family: 'Inter', size: isMobile ? 8 : 11, weight: '600' },
                maxRotation: 0,
                autoSkip: false
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor, stepSize: 5, font: { family: 'Inter', size: isMobile ? 8 : 10 } },
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
          label: isMobile ? (emp.name.split(' ')[0] || emp.name) : emp.name,
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
              borderRadius: isMobile ? 4 : 6,
              barPercentage: isMobile ? 0.75 : 0.65
            },
            {
              label: 'Completed / Approved',
              data: memberData.map(r => r.completed),
              backgroundColor: roleAchievedColor,
              borderRadius: isMobile ? 4 : 6,
              barPercentage: isMobile ? 0.75 : 0.65
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
              padding: isMobile ? 8 : 10,
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
              ticks: {
                color: textColor,
                font: { family: 'Inter', size: isMobile ? 8 : 11, weight: '600' },
                maxRotation: isMobile ? 45 : 0,
                autoSkip: false
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor, precision: 0, font: { family: 'Inter', size: isMobile ? 8 : 10 } },
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
          labels: isMobile ? ['Reels', 'Posters'] : ['Reels & Videos', 'Posters & Carousels'],
          datasets: [
            {
              data: [reelsVal, postersVal],
              backgroundColor: ['#EF2424', '#B11414'],
              borderWidth: 0,
              hoverOffset: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                font: { family: 'Inter', size: isMobile ? 8.5 : 12, weight: '600' },
                padding: isMobile ? 4 : 14,
                boxWidth: isMobile ? 8 : 12
              }
            },
            tooltip: {
              backgroundColor: '#0F172A',
              padding: isMobile ? 8 : 10,
              cornerRadius: 8
            }
          },
          cutout: isMobile ? '65%' : '72%'
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

      const pacingLabels = isMobile
        ? ['W1', 'W2', 'W3', 'W4']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4 (End)'];

      state.charts.pacing = new Chart(ctxPacing, {
        type: 'line',
        data: {
          labels: pacingLabels,
          datasets: [
            {
              label: isMobile ? 'Ideal' : 'Ideal Pace Target',
              data: idealCurve,
              borderColor: '#94A3B8',
              borderDash: [4, 4],
              tension: 0.3,
              pointRadius: isMobile ? 2 : 4,
              fill: false
            },
            {
              label: isMobile ? 'Actual' : 'Actual Achievements',
              data: actualCurve,
              borderColor: '#B11414',
              backgroundColor: 'rgba(239, 36, 36, 0.12)',
              tension: 0.3,
              pointRadius: isMobile ? 3 : 6,
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
              labels: {
                color: textColor,
                font: { family: 'Inter', size: isMobile ? 8 : 11, weight: '600' },
                boxWidth: isMobile ? 10 : 30,
                padding: isMobile ? 4 : 10
              }
            },
            tooltip: {
              backgroundColor: '#0F172A',
              padding: isMobile ? 8 : 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { family: 'Inter', size: isMobile ? 8 : 11 } },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor, font: { family: 'Inter', size: isMobile ? 8 : 10 } },
              grid: { color: gridColor }
            }
          }
        }
      });
    }
  }

  function getFilteredManagerTargets() {
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
        if (state.filters.status === 'completed' || state.filters.status === 'delivered') return prog.completed >= prog.target;
        if (state.filters.status === 'pending') return prog.completed < prog.target;
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

    return targets;
  }

  function updateTargetsBatchBar(currentTargets = null) {
    if (!currentTargets) {
      currentTargets = getFilteredManagerTargets();
    }
    const displayedCount = currentTargets.length;
    let selectedDisplayed = 0;
    currentTargets.forEach(t => {
      if (state.selectedTargetIds.has(String(t.id))) selectedDisplayed++;
    });

    // Update Header Checkbox
    if (elements.selectAllTargetsCheckbox) {
      if (displayedCount > 0 && selectedDisplayed === displayedCount) {
        elements.selectAllTargetsCheckbox.checked = true;
        elements.selectAllTargetsCheckbox.indeterminate = false;
      } else if (selectedDisplayed > 0) {
        elements.selectAllTargetsCheckbox.checked = false;
        elements.selectAllTargetsCheckbox.indeterminate = true;
      } else {
        elements.selectAllTargetsCheckbox.checked = false;
        elements.selectAllTargetsCheckbox.indeterminate = false;
      }
    }

    // Update Select All Button text
    if (elements.selectAllBtnText) {
      if (displayedCount > 0 && selectedDisplayed === displayedCount) {
        elements.selectAllBtnText.textContent = 'Deselect All';
      } else {
        elements.selectAllBtnText.textContent = `Select All (${displayedCount})`;
      }
    }

    // Update Batch Bar
    const totalSelected = state.selectedTargetIds.size;
    if (elements.targetsBatchActions) {
      if (totalSelected > 0) {
        elements.targetsBatchActions.style.display = 'inline-flex';
        if (elements.batchSelectedCountBadge) {
          elements.batchSelectedCountBadge.textContent = `${totalSelected} Selected`;
        }
        if (elements.btnBatchDeleteTargets) {
          elements.btnBatchDeleteTargets.innerHTML = `<i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete Selected (${totalSelected})`;
        }
      } else {
        elements.targetsBatchActions.style.display = 'none';
      }
    }

    refreshIcons();
  }

  function renderManagerTargetsTable() {
    const targets = getFilteredManagerTargets();

    // Update active sort indicator in table headers
    const sortCol = state.tableSort ? state.tableSort.col : 'program';
    const sortOrder = state.tableSort ? state.tableSort.order : 'asc';
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

    // Calculate live telemetry counts for Admin Status Filter Bar
    let baseTargets = window.dataStore.getTargets({
      assignee: state.filters.role,
      category: state.filters.category,
      brand: state.filters.brand
    });
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      baseTargets = baseTargets.filter(t => 
        (t.program && t.program.toLowerCase().includes(q)) ||
        (t.format && t.format.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.brand && t.brand.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    let allCount = baseTargets.length;
    let pendingCount = 0;
    let deliveredCount = 0;

    baseTargets.forEach(t => {
      const prog = window.dataStore.getTargetProgress(t.id);
      if (prog.completed >= prog.target) {
        deliveredCount++;
      } else {
        pendingCount++;
      }
    });

    const elCountAll = elements.adminCountStatusAll || document.getElementById('admin-count-status-all');
    const elCountPending = elements.adminCountStatusPending || document.getElementById('admin-count-status-pending');
    const elCountDelivered = elements.adminCountStatusDelivered || document.getElementById('admin-count-status-delivered');
    if (elCountAll) elCountAll.textContent = allCount;
    if (elCountPending) elCountPending.textContent = pendingCount;
    if (elCountDelivered) elCountDelivered.textContent = deliveredCount;

    // Sync active state on segmented status buttons
    const curStatus = state.filters.status || 'all';
    document.querySelectorAll('.admin-status-btn').forEach(btn => {
      const btnStatus = btn.dataset.adminStatus;
      const isActive = (btnStatus === curStatus) ||
                       (btnStatus === 'delivered' && curStatus === 'completed') ||
                       (btnStatus === 'all' && (curStatus === 'all' || !['pending', 'delivered', 'completed', 'in-progress', 'not-started'].includes(curStatus)));
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (targets.length === 0) {
      const allActiveTargets = window.dataStore.getTargets();
      const isFilterMismatch = allActiveTargets.length > 0;

      if (isFilterMismatch) {
        elements.managerTargetsTableBody.innerHTML = `
          <tr>
            <td colspan="12" class="text-center" style="padding: 36px; color: var(--text-muted);">
              <i data-lucide="search-x" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.6;"></i>
              <div>No deliverables match the filters.</div>
            </td>
          </tr>
        `;
      } else {
        const activeMonth = window.dataStore.getActiveMonth();
        elements.managerTargetsTableBody.innerHTML = `
          <tr>
            <td colspan="12">
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
      updateTargetsBatchBar([]);
      refreshIcons();
      return;
    }

    elements.managerTargetsTableBody.innerHTML = targets.map(target => {
      const prog = window.dataStore.getTargetProgress(target.id);
      const isDone = prog.completed >= prog.target;
      const isChecked = state.selectedTargetIds.has(String(target.id));
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
        <tr class="${isChecked ? 'row-selected' : ''}">
          <td style="text-align: center; width: 44px; padding: 10px 8px;">
            <input type="checkbox" class="target-row-checkbox task-checkbox" data-target-id="${target.id}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--teal-primary);" aria-label="Select target ${escapeHtml(target.program)}">
          </td>
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
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <strong>${escapeHtml(target.program)}</strong>
              ${target.isExtra ? `<span class="badge-extra-work" style="font-size: 10px; padding: 1px 6px;">⭐ Extra</span>` : ''}
              ${target.deadline ? formatDeadlineBadge(target.deadline, isDone) : ''}
            </div>
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
              <div class="progress-bar-fill" style="width: ${Math.min(100, prog.pct)}%"></div>
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

    updateTargetsBatchBar(targets);
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

    elements.reviewCardsList.innerHTML = pendingSubs.map(sub => {
      const isExtra = Boolean(sub.isExtra);
      return `
      <div class="submission-item-card ${isExtra ? 'extra-deliverable' : ''}" data-sub-id="${sub.id}">
        <div class="sub-info-group">
          <div class="sub-avatar" style="background: ${sub.assignee === 'designer' ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : sub.assignee === 'videographer' ? 'linear-gradient(135deg, #1D4ED8, #38BDF8)' : 'linear-gradient(135deg, #EF2424, #B11414)'}">
            ${escapeHtml((sub.authorName || sub.assignee || 'U').substring(0, 2).toUpperCase())}
          </div>
          <div class="sub-details">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h4 class="sub-title">${escapeHtml(sub.title)}</h4>
              ${isExtra ? `<span class="badge-extra-work"><i data-lucide="star" style="width: 12px; height: 12px;"></i> ⭐ Extra Work (Bonus)</span>` : ''}
            </div>
            <div class="sub-meta">
              <span><strong>${escapeHtml(sub.authorName || roleNameMap[sub.assignee] || sub.assignee)}</strong></span>
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
    `;
    }).join('');
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
            ${sub.isExtra ? `<span class="badge-extra-work" style="font-size: 10px; padding: 1px 6px; margin-left: 4px;">⭐ Extra</span>` : ''}
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
      const isMarketing = emp.role === 'marketing';
      const mktTodayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
      const mktWeekStr = (typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W44';
      const mktDailyStats = isMarketing ? window.dataStore.getMarketingDailyStats(mktTodayStr) : null;
      const mktWeeklyStats = isMarketing ? window.dataStore.getMarketingWeeklyStats(mktWeekStr) : null;
      const mktStreak = isMarketing ? window.dataStore.getMarketingDailyStreak() : 0;

      const statsStripHtml = isMarketing ? `
        <!-- Marketing Routines Strip -->
        <div class="employee-stats-strip">
          <div class="emp-stat-item completed">
            <span class="emp-stat-val">${mktDailyStats.completed}/${mktDailyStats.total}</span>
            <span class="emp-stat-lbl">Today</span>
          </div>
          <div class="emp-stat-item" style="color: #38BDF8;">
            <span class="emp-stat-val" style="color: #38BDF8;">${mktWeeklyStats.completed}/${mktWeeklyStats.total}</span>
            <span class="emp-stat-lbl">Weekly</span>
          </div>
          <div class="emp-stat-item" style="color: #FBBF24;">
            <span class="emp-stat-val" style="color: #FBBF24;">${mktStreak}d 🔥</span>
            <span class="emp-stat-lbl">Streak</span>
          </div>
          <div class="emp-stat-item">
            <span class="emp-stat-val" style="color: var(--teal-light);">${stats.targetsCount}</span>
            <span class="emp-stat-lbl">Instant</span>
          </div>
        </div>

        <div class="employee-pacing-section">
          <div class="emp-pacing-header">
            <span>Today's Execution (${mktDailyStats.completed}/${mktDailyStats.total} Routines)</span>
            <span>${mktDailyStats.pct}%</span>
          </div>
          <div class="progress-bar-container" style="margin: 0;">
            <div class="progress-bar-fill teal" style="width: ${mktDailyStats.pct}%;"></div>
          </div>
        </div>
      ` : `
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
            <span class="emp-stat-val" style="color: ${stats.extraCompleted > 0 ? 'var(--mint-accent, #10B981)' : isAhead ? 'var(--mint-success)' : 'var(--teal-primary)'};">${stats.pct}%</span>
            <span class="emp-stat-lbl">Pace</span>
          </div>
        </div>

        <div class="employee-pacing-section">
          <div class="emp-pacing-header">
            <span>Completion ${stats.extraCompleted > 0 ? `<span class="badge-exceeded" style="font-size: 10px; padding: 1px 6px;">+${stats.extraCompleted} Extra!</span>` : ''}</span>
            <span>${stats.totalCompleted} / ${stats.totalTarget}</span>
          </div>
          <div class="progress-bar-container" style="margin: 0;">
            <div class="progress-bar-fill ${stats.extraCompleted > 0 ? 'mint' : isAhead ? 'mint' : 'teal'}" style="width: ${Math.min(100, stats.pct)}%;"></div>
          </div>
        </div>
      `;

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

          ${statsStripHtml}

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

    const titleEl = document.querySelector('.member-workspace-title');
    const subtitleEl = document.querySelector('#member-view .section-header p');

    // Marketing Executive Dedicated Workspace (Daily & Weekly Routines + Instant Tasks with Deadlines)
    if (user.role === 'marketing') {
      if (titleEl) titleEl.textContent = 'Marketing Operations Center';
      if (subtitleEl) subtitleEl.textContent = 'Daily operational routines, weekly cadence, and manager-assigned instant deliverables.';
      if (elements.memberCreativeWorkspace) elements.memberCreativeWorkspace.classList.add('hidden');
      if (elements.memberMarketingWorkspace) elements.memberMarketingWorkspace.classList.remove('hidden');
      renderMarketingWorkspace(user);
      renderMemberSubmissionsTable();
      return;
    }

    if (titleEl) titleEl.textContent = 'Team Deliverables Workspace';
    if (subtitleEl) subtitleEl.textContent = 'Manage your monthly targets, submit deliverables, and track review approvals.';

    // Creative Roles (Graphic Designer / Videographer) - 100% Isolated Deliverables Grid
    if (elements.memberCreativeWorkspace) elements.memberCreativeWorkspace.classList.remove('hidden');
    if (elements.memberMarketingWorkspace) elements.memberMarketingWorkspace.classList.add('hidden');

    // Load Stats for this user (Kinetic Number Rollers)
    const stats = window.dataStore.getEmployeeStats(user);
    const remaining = Math.max(0, stats.totalTarget - stats.totalCompleted);

    animateCounter(elements.memberKpiTarget, stats.totalTarget);
    animateCounter(elements.memberKpiCompleted, stats.totalCompleted);
    animateCounter(elements.memberKpiReview, stats.totalPending);

    if (stats.extraCompleted > 0) {
      if (elements.memberKpiRemaining) {
        elements.memberKpiRemaining.innerHTML = `0 <span class="badge-exceeded"><i data-lucide="zap" style="width:11px;height:11px;"></i> +${stats.extraCompleted} Exceeded!</span>`;
      }
      if (elements.memberKpiPct) {
        elements.memberKpiPct.textContent = `${stats.pct}% 🚀`;
      }
      if (elements.memberKpiProgressBar) {
        elements.memberKpiProgressBar.style.width = '100%';
        elements.memberKpiProgressBar.style.boxShadow = '0 0 14px rgba(206, 243, 228, 0.6)';
      }
    } else {
      animateCounter(elements.memberKpiRemaining, remaining);
      animateCounter(elements.memberKpiPct, stats.pct, 750, '%');
      if (elements.memberKpiProgressBar) {
        elements.memberKpiProgressBar.style.width = `${Math.min(100, stats.pct)}%`;
        elements.memberKpiProgressBar.style.boxShadow = 'none';
      }
    }

    // Robust category normalizer for member category counts & filtering
    function normCat(cat) {
      if (!cat) return 'Branding';
      const c = cat.toLowerCase().trim();
      if (c.includes('campus') || c.includes('event') || c.includes('happening')) return 'Campus Events';
      if (c.includes('market') && !c.includes('moment')) return 'Marketing';
      if (c.includes('moment')) return 'Moment Marketing';
      return 'Branding';
    }

    // Category Task Counts
    const allUserTargets = window.dataStore.getTargetsForUser(user);
    const campusTargets = allUserTargets.filter(t => normCat(t.category) === 'Campus Events');
    const brandingTargets = allUserTargets.filter(t => normCat(t.category) === 'Branding');
    const marketingTargets = allUserTargets.filter(t => normCat(t.category) === 'Marketing');
    const momentTargets = allUserTargets.filter(t => normCat(t.category) === 'Moment Marketing');

    if (elements.countAllTasks) elements.countAllTasks.textContent = allUserTargets.length;
    if (elements.countCampusTasks) elements.countCampusTasks.textContent = campusTargets.length;
    if (elements.countBrandingTasks) elements.countBrandingTasks.textContent = brandingTargets.length;
    if (elements.countMarketingTasks) elements.countMarketingTasks.textContent = marketingTargets.length;
    if (elements.countMomentTasks) elements.countMomentTasks.textContent = momentTargets.length;

    // Filter targets by selected member category
    const filteredTargets = (!state.memberCategory || state.memberCategory === 'all')
      ? allUserTargets
      : allUserTargets.filter(t => normCat(t.category) === normCat(state.memberCategory));

    // Segregate targets into Pending / To Deliver vs Delivered & Completed
    const pendingTargets = [];
    const deliveredTargets = [];

    filteredTargets.forEach(target => {
      const prog = window.dataStore.getTargetProgress(target.id);
      const isDone = prog.completed >= (Number(target.targetQty) || 1);
      if (isDone) {
        deliveredTargets.push({ target, prog, isDone });
      } else {
        pendingTargets.push({ target, prog, isDone });
      }
    });

    // Update Status Filter Counters & Section Badges
    if (elements.countStatusPending) elements.countStatusPending.textContent = pendingTargets.length;
    if (elements.countStatusDelivered) elements.countStatusDelivered.textContent = deliveredTargets.length;
    if (elements.countStatusAll) elements.countStatusAll.textContent = filteredTargets.length;
    if (elements.badgePendingCount) elements.badgePendingCount.textContent = `${pendingTargets.length} To Deliver`;
    if (elements.badgeDeliveredCount) elements.badgeDeliveredCount.textContent = `${deliveredTargets.length} Quota Met`;

    // Ensure status filter button active states match state.memberStatusFilter (Option B: default to 'pending')
    const currentStatusFilter = state.memberStatusFilter || 'pending';
    document.querySelectorAll('.member-status-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.statusFilter === currentStatusFilter);
    });

    // Toggle Section Visibility based on active Status Filter
    if (elements.sectionPendingDeliverables && elements.sectionDeliveredDeliverables) {
      if (currentStatusFilter === 'pending') {
        elements.sectionPendingDeliverables.classList.remove('hidden');
        elements.sectionDeliveredDeliverables.classList.add('hidden');
        if (elements.statusHintText) elements.statusHintText.textContent = `Showing ${pendingTargets.length} pending deliverables to complete`;
      } else if (currentStatusFilter === 'delivered') {
        elements.sectionPendingDeliverables.classList.add('hidden');
        elements.sectionDeliveredDeliverables.classList.remove('hidden');
        if (elements.statusHintText) elements.statusHintText.textContent = `Showing ${deliveredTargets.length} delivered tasks completed`;
      } else { // 'all'
        elements.sectionPendingDeliverables.classList.remove('hidden');
        elements.sectionDeliveredDeliverables.classList.remove('hidden');
        if (elements.statusHintText) elements.statusHintText.textContent = `Showing all ${filteredTargets.length} tasks in ${state.memberCategory === 'all' ? 'all categories' : state.memberCategory}`;
      }
    }

    // Helper: Render Deliverable Card
    function renderDeliverableCard({ target, prog, isDone }) {
      const isDelivered = isDone;
      const statusPill = (prog.extra > 0)
        ? `<span class="status-pill completed" style="background: rgba(206, 243, 228, 0.15); color: #CEF3E4; border: 1px solid rgba(206, 243, 228, 0.3);"><i data-lucide="zap"></i> Quota Met (+${prog.extra} Extra!)</span>`
        : isDone
          ? `<span class="status-pill completed"><i data-lucide="check"></i> Quota Met</span>`
          : prog.completed > 0
            ? `<span class="status-pill in-progress"><i data-lucide="loader"></i> ${prog.completed}/${prog.target} Completed</span>`
            : `<span class="status-pill not-started">Pending</span>`;

      const ctaBtn = isDelivered
        ? `<button class="btn btn-outline-sm btn-block btn-open-log-modal" data-target-id="${target.id}" style="color: var(--mint-accent); border-color: rgba(206, 243, 228, 0.4); background: rgba(206, 243, 228, 0.08); font-size: 12px; padding: 7px 12px;">
             <i data-lucide="plus-circle"></i> + Log Extra Work
           </button>`
        : `<button class="btn btn-primary btn-sm btn-block btn-open-log-modal" data-target-id="${target.id}">
             <i data-lucide="upload-cloud"></i> + Submit Deliverable
           </button>`;

      return `
        <div class="deliverable-card spotlight-card tilt-card ${isDelivered ? 'delivered-card' : ''} ${target.category === 'Campus Happenings' ? 'priority-hologram' : ''}">
          <div>
            <div class="del-card-header">
              <div class="del-badges-row">
                <span class="badge-brand ${escapeHtml(target.brand)}">${formatBrandName(target.brand)}</span>
                <span class="badge-category">${escapeHtml(target.category)}</span>
                <span class="badge-format">${escapeHtml(target.format)}</span>
                ${target.deadline ? formatDeadlineBadge(target.deadline, isDone) : ''}
                ${target.isExtra ? '<span class="badge-extra-work" style="font-size: 10px; padding: 1px 6px;">⭐ Extra</span>' : ''}
              </div>
              ${statusPill}
            </div>

            <h3 class="del-card-title">${escapeHtml(target.program)}</h3>
            ${target.notes ? `<p class="del-card-desc">${escapeHtml(target.notes)}</p>` : ''}
            ${target.deadline ? renderTaskDeadlineStrip(target.deadline, isDone) : ''}
          </div>

          <div>
            <div class="del-progress-metric">
              <span>Target: <strong>${prog.target}</strong></span>
              <span>Approved: <strong style="color: ${isDelivered ? 'var(--mint-light)' : 'var(--teal-light)'};">${prog.completed}</strong> ${prog.extra > 0 ? `<span class="badge-exceeded" style="font-size: 10px; padding: 1px 5px;">+${prog.extra}</span>` : ''}</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill ${isDelivered ? 'teal' : ''}" style="width: ${Math.min(100, prog.pct)}%"></div>
            </div>
            ${prog.pending > 0 ? `<div style="font-size: 11px; color: var(--amber-light); margin-top: 4px;">⏳ ${prog.pending} in review</div>` : ''}

            <div class="del-card-actions">
              ${ctaBtn}
            </div>
          </div>
        </div>
      `;
    }

    // Render Pending Deliverables Grid
    if (elements.gridPendingDeliverables) {
      if (pendingTargets.length === 0) {
        elements.gridPendingDeliverables.innerHTML = `
          <div class="deliverables-section-empty celebration" style="grid-column: 1 / -1;">
            <div style="font-size: 32px; margin-bottom: 6px;">🎉</div>
            <h4>All Tasks in this Category Delivered!</h4>
            <p>You have met all deliverable quotas for this category. Switch to the Delivered tab to review completed work or submit extra work.</p>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
              <button type="button" class="btn btn-outline-sm btn-switch-to-delivered" style="color: var(--mint-accent); border-color: rgba(206, 243, 228, 0.4);">
                <i data-lucide="check-circle-2"></i> View Delivered (${deliveredTargets.length})
              </button>
              <button type="button" class="btn btn-primary btn-sm btn-log-extra-now">
                <i data-lucide="plus-circle"></i> + Log Extra Work
              </button>
            </div>
          </div>
        `;
      } else {
        elements.gridPendingDeliverables.innerHTML = pendingTargets.map(renderDeliverableCard).join('');
      }
    }

    // Render Delivered Deliverables Grid
    if (elements.gridDeliveredDeliverables) {
      if (deliveredTargets.length === 0) {
        elements.gridDeliveredDeliverables.innerHTML = `
          <div class="deliverables-section-empty" style="grid-column: 1 / -1;">
            <div style="font-size: 28px; margin-bottom: 6px;">⏳</div>
            <h4>No Delivered Tasks Yet</h4>
            <p>You have not met the quota on any tasks in this category yet. Submit your deliverables in the Pending section above to complete your tasks!</p>
            <button type="button" class="btn btn-primary btn-sm btn-switch-to-pending" style="margin-top: 10px;">
              <i data-lucide="clock"></i> View Pending Tasks (${pendingTargets.length})
            </button>
          </div>
        `;
      } else {
        elements.gridDeliveredDeliverables.innerHTML = deliveredTargets.map(renderDeliverableCard).join('');
      }
    }

    // Wire Status Filter Switch & Quick Action Delegation
    const deliverablesContainer = document.getElementById('member-deliverables-container');
    if (deliverablesContainer && !deliverablesContainer.dataset.wired) {
      deliverablesContainer.dataset.wired = 'true';
      deliverablesContainer.addEventListener('click', (e) => {
        const btnToDelivered = e.target.closest('.btn-switch-to-delivered');
        if (btnToDelivered) {
          state.memberStatusFilter = 'delivered';
          renderMemberView();
          return;
        }
        const btnToPending = e.target.closest('.btn-switch-to-pending');
        if (btnToPending) {
          state.memberStatusFilter = 'pending';
          renderMemberView();
          return;
        }
        const btnLogExtraNow = e.target.closest('.btn-log-extra-now');
        if (btnLogExtraNow) {
          openLogWorkModal(null, 'extra');
          return;
        }
      });
    }

    const statusFilterBar = document.getElementById('member-status-filter-bar');
    if (statusFilterBar && !statusFilterBar.dataset.wired) {
      statusFilterBar.dataset.wired = 'true';
      statusFilterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.member-status-btn');
        if (btn && btn.dataset.statusFilter) {
          state.memberStatusFilter = btn.dataset.statusFilter;
          renderMemberView();
        }
      });
    }

    // Render Member Submissions Table
    renderMemberSubmissionsTable();
    refreshFuturisticEffects();
  }

  // =========================================================================
  // SUBMISSIONS TABLE RENDERER
  // =========================================================================
  function renderMemberSubmissionsTable() {
    const user = state.user;
    if (!user || !elements.memberSubmissionsTableBody) return;
    const userSubs = window.dataStore.getSubmissions({ assignee: user.role });
    const btnClearSubs = document.getElementById('btn-clear-recent-subs');
    if (btnClearSubs) {
      btnClearSubs.style.display = userSubs.length > 0 ? 'inline-flex' : 'none';
      if (!btnClearSubs.dataset.wired) {
        btnClearSubs.dataset.wired = 'true';
        btnClearSubs.addEventListener('click', () => {
          if (confirm('Are you sure you want to remove all recent submissions for this month?')) {
            const count = window.dataStore.clearAllRecentSubmissions();
            showToast(`Removed all recent submissions (${count} cleared)`, 'success');
            renderApp();
          }
        });
      }
    }

    if (userSubs.length === 0) {
      elements.memberSubmissionsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 24px; color: var(--text-muted);">
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

        const linkedTarget = sub.targetId ? (window.dataStore.getTargets() || []).find(t => String(t.id) === String(sub.targetId)) : null;
        const subDeadlineBadge = linkedTarget && linkedTarget.deadline ? formatDeadlineBadge(linkedTarget.deadline, sub.status === 'approved') : '';

        return `
          <tr>
            <td>${formatDate(sub.submittedAt)}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <strong>${escapeHtml(sub.program)}</strong>
                ${sub.isExtra ? `<span class="badge-extra-work" style="font-size: 10px; padding: 1px 6px;">⭐ Extra</span>` : ''}
                ${subDeadlineBadge}
              </div>
              <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">${escapeHtml(sub.title)}</div>
            </td>
            <td><span class="badge-format">${escapeHtml(sub.format)}</span></td>
            <td>${renderProofChip(sub.url)}</td>
            <td>${sub.notes ? escapeHtml(sub.notes) : '-'}</td>
            <td>${statusBadge}</td>
            <td>${sub.feedback ? `<span class="feedback-table-text">${escapeHtml(sub.feedback)}</span>` : '<span style="color: var(--text-dim);">-</span>'}</td>
            <td style="text-align: center;">
              <button type="button" class="btn btn-icon btn-sm btn-delete-sub" data-sub-id="${escapeHtml(sub.id)}" title="Delete submission" style="color: var(--accent-red); background: transparent; border: none; cursor: pointer; padding: 4px;">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      elements.memberSubmissionsTableBody.querySelectorAll('.btn-delete-sub').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const subId = btn.dataset.subId;
          if (confirm('Delete this deliverable submission permanently?')) {
            window.dataStore.deleteSubmission(subId);
            showToast('Submission deleted successfully', 'success');
            renderApp();
          }
        });
      });
    }
  }

  // =========================================================================
  // MARKETING EXECUTIVE: DEDICATED WORKSPACE CONTROLLER
  // =========================================================================
  function renderMarketingWorkspace(user) {
    if (!elements.memberMarketingWorkspace) return;

    state.mktActiveTab = state.mktActiveTab || 'daily';

    const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
    const weekStr = (typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W44';

    const dailyTasks = window.dataStore.getMarketingDailyTasks(todayStr);
    const dailyStats = window.dataStore.getMarketingDailyStats(todayStr);
    const dailyStreak = window.dataStore.getMarketingDailyStreak();

    const weeklyTasks = window.dataStore.getMarketingWeeklyTasks(weekStr);
    const weeklyStats = window.dataStore.getMarketingWeeklyStats(weekStr);

    const instantTasks = window.dataStore.getMarketingInstantTasks(user);

    // Update Radar Cards
    const dailyRadarText = document.getElementById('mkt-radar-daily-text');
    const dailyRadarBar = document.getElementById('mkt-radar-daily-bar');
    if (dailyRadarText) dailyRadarText.textContent = `${dailyStats.completed} / ${dailyStats.total} Done`;
    if (dailyRadarBar) dailyRadarBar.style.width = `${dailyStats.pct}%`;

    const streakRadarText = document.getElementById('mkt-radar-streak-text');
    if (streakRadarText) streakRadarText.textContent = `${dailyStreak} Day${dailyStreak === 1 ? '' : 's'}`;

    const weeklyRadarText = document.getElementById('mkt-radar-weekly-text');
    if (weeklyRadarText) weeklyRadarText.textContent = `${weeklyStats.completed} / ${weeklyStats.total} Delivered`;

    const instantRadarText = document.getElementById('mkt-radar-instant-text');
    if (instantRadarText) instantRadarText.textContent = `${instantTasks.length} Active`;

    // Badges in Tabs
    const badgeDaily = document.getElementById('mkt-badge-daily');
    const badgeWeekly = document.getElementById('mkt-badge-weekly');
    const badgeInstant = document.getElementById('mkt-badge-instant');
    if (badgeDaily) badgeDaily.textContent = dailyTasks.length;
    if (badgeWeekly) badgeWeekly.textContent = weeklyTasks.length;
    if (badgeInstant) badgeInstant.textContent = instantTasks.length;

    // Active Tab Switching State
    const tabBtns = elements.memberMarketingWorkspace.querySelectorAll('.mkt-cadence-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mktTab === state.mktActiveTab);
    });

    const tabDaily = document.getElementById('mkt-tab-content-daily');
    const tabWeekly = document.getElementById('mkt-tab-content-weekly');
    const tabInstant = document.getElementById('mkt-tab-content-instant');
    if (tabDaily) tabDaily.classList.toggle('hidden', state.mktActiveTab !== 'daily');
    if (tabWeekly) tabWeekly.classList.toggle('hidden', state.mktActiveTab !== 'weekly');
    if (tabInstant) tabInstant.classList.toggle('hidden', state.mktActiveTab !== 'instant');

    // Date / Cadence Labels
    const dailyDateLabel = document.getElementById('mkt-daily-date-label');
    if (dailyDateLabel) {
      const todayFormatted = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
      dailyDateLabel.innerHTML = `Today: <strong>${todayFormatted}</strong>`;
    }

    const weeklyCadenceLabel = document.getElementById('mkt-weekly-cadence-label');
    if (weeklyCadenceLabel) {
      weeklyCadenceLabel.innerHTML = `Active Cadence: <strong>${weekStr}</strong>`;
    }

    // Render TAB 1: DAILY TASKS
    const dailyListEl = document.getElementById('mkt-daily-tasks-list');
    if (dailyListEl) {
      dailyListEl.innerHTML = dailyTasks.map(task => {
        const isDone = task.completed;
        const timeStr = task.completedAt ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(task.completedAt)) : '';
        const hasNote = Boolean(task.note || task.proofUrl);

        return `
          <div class="mkt-task-item ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="mkt-task-left">
              <div class="mkt-checkbox-wrap ${isDone ? 'checked' : ''}" data-action="toggle-daily" data-task-id="${task.id}" title="${isDone ? 'Click to mark pending' : 'Click to complete for today'}">
                <i data-lucide="check" style="width: 15px; height: 15px;"></i>
              </div>
              <div class="mkt-task-details">
                <div class="mkt-task-title">${escapeHtml(task.title)}</div>
                <div class="mkt-task-meta">
                  <span class="badge-category" style="font-size: 11px; padding: 2px 7px; background: #F1F5F9; border: 1px solid #E2E8F0; color: #475569; font-weight: 600; border-radius: 6px;">${escapeHtml(task.category)}</span>
                  <span class="badge-brand ${escapeHtml(task.brand)}">${formatBrandName(task.brand)}</span>
                  ${isDone
                    ? `<span style="color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-circle" style="width: 13px; height: 13px;"></i> Completed at ${timeStr}</span>`
                    : '<span style="color: #D97706; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width: 13px; height: 13px;"></i> Pending Today</span>'
                  }
                  ${hasNote ? '<span style="color: #008BA5; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="file-text" style="width: 12px; height: 12px;"></i> Has Note/Link</span>' : ''}
                </div>
              </div>
            </div>
            <div class="mkt-task-right">
              <button type="button" class="btn btn-outline-sm btn-open-routine-note" data-task-id="${task.id}" data-task-type="daily" data-task-title="${escapeHtml(task.title)}" style="font-size: 12px; padding: 6px 12px; gap: 5px; font-weight: 600; border-radius: 8px;">
                <i data-lucide="${hasNote ? 'file-text' : 'plus'}"></i> ${hasNote ? 'View Note' : '+ Note'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render TAB 2: WEEKLY TASKS
    const weeklyListEl = document.getElementById('mkt-weekly-tasks-list');
    if (weeklyListEl) {
      weeklyListEl.innerHTML = weeklyTasks.map(task => {
        const isDone = task.completed;
        const hasNote = Boolean(task.note || task.proofUrl);

        return `
          <div class="mkt-task-item ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="mkt-task-left">
              <div class="mkt-checkbox-wrap ${isDone ? 'checked' : ''}" data-action="toggle-weekly" data-task-id="${task.id}" title="${isDone ? 'Click to mark in-progress' : 'Click to mark delivered for this week'}">
                <i data-lucide="check" style="width: 15px; height: 15px;"></i>
              </div>
              <div class="mkt-task-details">
                <div class="mkt-task-title">${escapeHtml(task.title)}</div>
                <div class="mkt-task-meta">
                  <span class="badge-category" style="font-size: 11px; padding: 2px 7px; background: #F1F5F9; border: 1px solid #E2E8F0; color: #475569; font-weight: 600; border-radius: 6px;">${escapeHtml(task.category)}</span>
                  <span class="badge-format" style="font-size: 11px; padding: 2px 7px; color: #6D28D9; border: 1px solid #DDD6FE; background: #F5F3FF; border-radius: 6px; font-weight: 600;">${escapeHtml(task.dueDay || 'Weekly')}</span>
                  ${isDone
                    ? '<span style="color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-circle" style="width: 13px; height: 13px;"></i> Delivered for this week</span>'
                    : '<span style="color: #D97706; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width: 13px; height: 13px;"></i> In Progress</span>'
                  }
                  ${hasNote ? '<span style="color: #008BA5; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="link" style="width: 12px; height: 12px;"></i> Link Attached</span>' : ''}
                </div>
              </div>
            </div>
            <div class="mkt-task-right">
              <button type="button" class="btn btn-outline-sm btn-open-routine-note" data-task-id="${task.id}" data-task-type="weekly" data-task-title="${escapeHtml(task.title)}" style="font-size: 12px; padding: 6px 12px; gap: 5px; font-weight: 600; border-radius: 8px;">
                <i data-lucide="${hasNote ? 'link' : 'upload-cloud'}"></i> ${hasNote ? 'View Proof' : '+ Add Proof'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render TAB 3: INSTANT TASKS (WITH DEADLINE OPTION)
    const instantGridEl = document.getElementById('mkt-instant-tasks-grid');
    if (instantGridEl) {
      if (instantTasks.length === 0) {
        instantGridEl.innerHTML = `
          <div class="deliverables-section-empty" style="grid-column: 1 / -1; padding: 36px 20px; text-align: center; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 14px;">
            <i data-lucide="zap-off" style="width: 34px; height: 34px; color: #94A3B8; margin-bottom: 8px;"></i>
            <h4 style="font-family: var(--font-heading); color: #0F172A; font-size: 16px; margin-bottom: 4px; font-weight: 700;">No Instant Tasks Assigned</h4>
            <p style="font-size: 13px; color: #64748B; margin-bottom: 14px;">The manager has not assigned any ad-hoc instant tasks for marketing yet.</p>
            <button type="button" class="btn btn-primary btn-sm btn-open-log-modal" data-mode="extra" style="font-weight: 600;">
              <i data-lucide="plus-circle"></i> + Log Instant Work
            </button>
          </div>
        `;
      } else {
        instantGridEl.innerHTML = instantTasks.map(target => {
          const prog = window.dataStore.getTargetProgress(target.id);
          const isDone = prog.completed >= (Number(target.targetQty) || 1);

          let deadlineBanner = '';
          if (target.deadline) {
            const today = new Date();
            const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : today.toISOString().split('T')[0];
            if (isDone) {
              deadlineBanner = `<div class="mkt-instant-deadline-banner completed"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="check-circle" style="width:13px;height:13px;"></i> Completed</span><span>Delivered</span></div>`;
            } else if (target.deadline === todayStr) {
              deadlineBanner = `<div class="mkt-instant-deadline-banner due-today"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="clock" style="width:13px;height:13px;"></i> Due Today (by 6:00 PM)</span><span>Urgent</span></div>`;
            } else if (target.deadline < todayStr) {
              deadlineBanner = `<div class="mkt-instant-deadline-banner overdue"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="alert-circle" style="width:13px;height:13px;"></i> Overdue (${target.deadline})</span><span>Action Required</span></div>`;
            } else {
              const targetD = new Date(target.deadline);
              const diffTime = targetD.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
              if (diffDays === 1) {
                deadlineBanner = `<div class="mkt-instant-deadline-banner due-tomorrow"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i> Due Tomorrow</span><span>Priority</span></div>`;
              } else {
                deadlineBanner = `<div class="mkt-instant-deadline-banner upcoming"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i> Due in ${diffDays} days (${target.deadline})</span><span>Scheduled</span></div>`;
              }
            }
          }

          return `
            <div class="deliverable-card spotlight-card ${isDone ? 'delivered-card' : ''}">
              <div>
                <div class="del-card-header">
                  <div class="del-badges-row">
                    <span class="badge-brand ${escapeHtml(target.brand)}">${formatBrandName(target.brand)}</span>
                    <span class="badge-category">${escapeHtml(target.category)}</span>
                    <span class="badge-format">${escapeHtml(target.format)}</span>
                  </div>
                  <span class="status-pill ${isDone ? 'completed' : 'in-progress'}">${isDone ? 'Completed' : 'Pending'}</span>
                </div>
                <h3 class="del-card-title">${escapeHtml(target.program)}</h3>
                ${target.notes ? `<p class="del-card-desc">${escapeHtml(target.notes)}</p>` : ''}
                ${deadlineBanner}
              </div>

              <div style="margin-top: 12px;">
                <div class="del-card-actions">
                  ${isDone
                    ? `<button type="button" class="btn btn-outline-sm btn-block" style="color: #059669; border-color: #10B981; background: #DCFCE7; font-weight: 600;"><i data-lucide="check"></i> Delivered</button>`
                    : `<button type="button" class="btn btn-primary btn-sm btn-block btn-open-log-modal" data-target-id="${target.id}"><i data-lucide="upload-cloud"></i> + Submit Deliverable Proof</button>`
                  }
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    refreshIcons();
  }

  // Open Routine Note Modal
  function openRoutineNoteModal(taskId, taskType, taskTitle) {
    if (!elements.routineNoteModal) return;
    elements.routineNoteForm.reset();
    if (elements.routineModalTaskId) elements.routineModalTaskId.value = taskId;
    if (elements.routineModalType) elements.routineModalType.value = taskType;
    if (elements.routineModalTaskName) elements.routineModalTaskName.value = taskTitle;

    let existingNote = '';
    let existingProof = '';
    if (taskType === 'daily') {
      const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
      const tasks = window.dataStore.getMarketingDailyTasks(todayStr);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        existingNote = task.note || '';
        existingProof = task.proofUrl || '';
      }
      if (elements.routineModalTitle) {
        elements.routineModalTitle.innerHTML = `<i data-lucide="file-text"></i> Today's Daily Note & Proof`;
      }
    } else {
      const weekStr = (typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W44';
      const tasks = window.dataStore.getMarketingWeeklyTasks(weekStr);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        existingNote = task.note || '';
        existingProof = task.proofUrl || '';
      }
      if (elements.routineModalTitle) {
        elements.routineModalTitle.innerHTML = `<i data-lucide="upload-cloud"></i> Weekly Report / Proof Link`;
      }
    }

    if (elements.routineModalNoteText) elements.routineModalNoteText.value = existingNote;
    if (elements.routineModalProofUrl) elements.routineModalProofUrl.value = existingProof;

    elements.routineNoteModal.classList.remove('hidden');
    refreshIcons();
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
      if (isActive && isCurrent) {
        badgeHtml = `<span class="cal-month-badge badge-active">Current Cycle</span>`;
      } else if (isActive) {
        badgeHtml = `<span class="cal-month-badge badge-active">Active Cycle</span>`;
      } else if (isCurrent) {
        badgeHtml = `<span class="cal-month-badge badge-current">Current</span>`;
      } else if (hasData) {
        badgeHtml = `<span class="cal-month-badge badge-data">${totalTargets} ${totalTargets === 1 ? 'target' : 'targets'}</span>`;
      } else if (ym < curYm) {
        badgeHtml = `<span class="cal-month-badge badge-past">Past</span>`;
      } else {
        badgeHtml = `<span class="cal-month-badge badge-future">Upcoming</span>`;
      }

      return `
        <button type="button" class="cal-month-btn ${isActive ? 'active' : ''} ${isCurrent ? 'is-current' : ''} ${hasData ? 'has-data' : ''}" data-ym="${ym}">
          <span class="cal-month-name">${shortName}</span>
          <div class="cal-month-badge-wrap">
            ${badgeHtml}
          </div>
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
  if (elements.viewReviewsBtn) {
    elements.viewReviewsBtn.addEventListener('click', () => {
      elements.managerTabBtns.forEach(b => {
        if (b.dataset.managerTab === 'review-queue') b.classList.add('active');
        else b.classList.remove('active');
      });
      state.activeManagerTab = 'review-queue';
      renderManagerActiveTab();
    });
  }

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

  // Admin Targets Segmented Status Filter Bar Click Handler
  const adminTargetsStatusBar = document.getElementById('admin-targets-status-bar');
  if (adminTargetsStatusBar) {
    adminTargetsStatusBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-status-btn');
      if (btn && btn.dataset.adminStatus) {
        const newStatus = btn.dataset.adminStatus;
        state.filters.status = newStatus;
        if (elements.filterStatusSelect) {
          if (elements.filterStatusSelect.querySelector(`option[value="${newStatus}"]`)) {
            elements.filterStatusSelect.value = newStatus;
          } else if (newStatus === 'delivered' && elements.filterStatusSelect.querySelector('option[value="completed"]')) {
            elements.filterStatusSelect.value = 'completed';
          } else if (newStatus === 'all') {
            elements.filterStatusSelect.value = 'all';
          }
        }
        renderManagerTargetsTable();
        refreshIcons();
      }
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
    if (elements.targetDeadline) elements.targetDeadline.value = '';
    if (elements.targetDeadlineQuickPreview) elements.targetDeadlineQuickPreview.innerHTML = '';
    if (elements.targetDeadlinePresets) {
      elements.targetDeadlinePresets.querySelectorAll('.btn-preset-pill').forEach(b => b.classList.remove('active'));
    }
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
    const isManager = user.role === 'manager';
    if (elements.profileEditTitle) {
      elements.profileEditTitle.value = user.title || '';
      if (isManager) {
        elements.profileEditTitle.removeAttribute('readonly');
        elements.profileEditTitle.removeAttribute('disabled');
        elements.profileEditTitle.style.cursor = 'text';
        elements.profileEditTitle.style.opacity = '1';
      } else {
        elements.profileEditTitle.setAttribute('readonly', 'true');
        elements.profileEditTitle.setAttribute('disabled', 'true');
        elements.profileEditTitle.style.cursor = 'not-allowed';
        elements.profileEditTitle.style.opacity = '0.75';
      }
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

      const isManager = user.role === 'manager';
      const newName = elements.profileEditName.value.trim();
      // Team members cannot edit job title; only manager can
      const newTitle = (isManager && elements.profileEditTitle) ? elements.profileEditTitle.value.trim() : user.title;

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
      populateLoginProfileTabs();
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
      assignee: assigneeVal,
      assigneeName: userMatch ? userMatch.name : (assigneeVal.charAt(0).toUpperCase() + assigneeVal.slice(1)),
      assigneeRole: userMatch ? userMatch.role : assigneeVal,
      assigneeEmail: userMatch ? userMatch.email : '',
      brand: elements.targetBrand.value,
      category: elements.targetCategory.value,
      format: (elements.targetFormat && elements.targetFormat.value.trim()) || elements.targetBrand.value || 'Deliverable',
      program: elements.targetProgram.value.trim(),
      targetQty: parseInt(elements.targetQty.value, 10) || 1,
      deadline: (elements.targetDeadline && elements.targetDeadline.value) ? elements.targetDeadline.value.trim() : '',
      notes: elements.targetNotes.value.trim()
    };
    if (elements.editTargetId.value) {
      targetData.id = elements.editTargetId.value;
    }

    window.dataStore.saveOrUpdateTarget(targetData);
    elements.assignTargetModal.classList.add('hidden');
    showToast(`Successfully assigned target to ${targetData.assigneeName || targetData.assignee}!`, 'success');
    renderApp();
  });

  // Set Log Work Modal Mode (Add Task / Extra Work vs Assigned Quota)
  function setLogWorkMode(mode) {
    if (!elements.logWorkMode) return;
    elements.logWorkMode.value = mode;

    if (mode === 'extra') {
      if (elements.btnModeExtra) elements.btnModeExtra.classList.add('active');
      if (elements.btnModeAssigned) elements.btnModeAssigned.classList.remove('active');
      if (elements.logAssignedFields) elements.logAssignedFields.classList.add('hidden');
      if (elements.logExtraFields) elements.logExtraFields.classList.remove('hidden');
      if (elements.logTargetSelect) elements.logTargetSelect.removeAttribute('required');
      if (elements.logWorkTitle) elements.logWorkTitle.removeAttribute('required');
      if (elements.logExtraTitle) elements.logExtraTitle.setAttribute('required', 'required');
      if (elements.logWorkModalHeading) elements.logWorkModalHeading.textContent = 'Log Extra Work / Task';
      if (elements.btnSubmitDeliverable) {
        elements.btnSubmitDeliverable.innerHTML = `<i data-lucide="send"></i> Submit Extra Work`;
      }
    } else {
      if (elements.btnModeAssigned) elements.btnModeAssigned.classList.add('active');
      if (elements.btnModeExtra) elements.btnModeExtra.classList.remove('active');
      if (elements.logAssignedFields) elements.logAssignedFields.classList.remove('hidden');
      if (elements.logExtraFields) elements.logExtraFields.classList.add('hidden');
      if (elements.logTargetSelect) elements.logTargetSelect.setAttribute('required', 'required');
      if (elements.logWorkTitle) elements.logWorkTitle.setAttribute('required', 'required');
      if (elements.logExtraTitle) elements.logExtraTitle.removeAttribute('required');
      if (elements.logWorkModalHeading) elements.logWorkModalHeading.textContent = 'Submit Assigned Deliverable';
      if (elements.btnSubmitDeliverable) {
        elements.btnSubmitDeliverable.innerHTML = `<i data-lucide="send"></i> Submit Deliverable`;
      }
    }
    refreshIcons();
  }

  if (elements.btnModeAssigned) {
    elements.btnModeAssigned.addEventListener('click', () => setLogWorkMode('assigned'));
  }
  if (elements.btnModeExtra) {
    elements.btnModeExtra.addEventListener('click', () => setLogWorkMode('extra'));
  }

  // Open Log Work Modal (Global Button or Card Button)
  function openLogWorkModal(preselectedTargetId = null, initialMode = null) {
    let availableTargets = [];
    if (state.user && state.user.role === 'manager') {
      availableTargets = window.dataStore.getTargets();
    } else if (state.user) {
      availableTargets = window.dataStore.getTargetsForUser(state.user);
    } else {
      availableTargets = window.dataStore.getTargets();
    }

    if (elements.logTargetSelect) {
      if (availableTargets.length > 0) {
        elements.logTargetSelect.innerHTML = availableTargets.map(t => {
          const deadlineText = t.deadline ? ` [Due: ${t.deadline}]` : '';
          return `
            <option value="${t.id}" ${t.id === preselectedTargetId ? 'selected' : ''}>
              [${formatBrandName(t.brand)} - ${t.category}] ${t.program} (${t.format})${deadlineText}
            </option>
          `;
        }).join('');
      } else {
        elements.logTargetSelect.innerHTML = `<option value="">No assigned targets (use Log Extra Work tab)</option>`;
      }
    }

    elements.logWorkForm.reset();
    if (elements.logExtraDeadline) elements.logExtraDeadline.value = '';
    if (elements.logExtraDeadlinePreview) elements.logExtraDeadlinePreview.innerHTML = '';
    if (elements.logExtraDeadlinePresets) {
      elements.logExtraDeadlinePresets.querySelectorAll('.btn-preset-pill').forEach(b => b.classList.remove('active'));
    }
    if (preselectedTargetId && elements.logTargetSelect) {
      elements.logTargetSelect.value = preselectedTargetId;
    }
    updateLogTargetDeadlineDisplay();

    // Default to 'assigned' if assigned targets exist, or 'extra' if no assigned targets exist
    const mode = initialMode || (preselectedTargetId ? 'assigned' : (availableTargets.length > 0 ? 'assigned' : 'extra'));
    setLogWorkMode(mode);

    elements.logWorkModal.classList.remove('hidden');
    refreshIcons();
  }

  function updateLogTargetDeadlineDisplay() {
    if (!elements.logTargetDeadlineBadge || !elements.logTargetSelect) return;
    const selTargetId = elements.logTargetSelect.value;
    if (!selTargetId) {
      elements.logTargetDeadlineBadge.style.display = 'none';
      elements.logTargetDeadlineBadge.innerHTML = '';
      return;
    }
    const target = (window.dataStore.getTargets() || []).find(t => String(t.id) === String(selTargetId));
    if (target && target.deadline) {
      const prog = window.dataStore.getTargetProgress(target.id);
      const isDone = prog.completed >= (Number(target.targetQty) || 1);
      elements.logTargetDeadlineBadge.innerHTML = renderTaskDeadlineStrip(target.deadline, isDone);
      elements.logTargetDeadlineBadge.style.display = 'block';
      refreshIcons();
    } else {
      elements.logTargetDeadlineBadge.style.display = 'none';
      elements.logTargetDeadlineBadge.innerHTML = '';
    }
  }

  if (elements.logTargetSelect) {
    elements.logTargetSelect.addEventListener('change', updateLogTargetDeadlineDisplay);
  }

  if (elements.btnMemberAddTask) {
    elements.btnMemberAddTask.addEventListener('click', () => openLogWorkModal(null, 'extra'));
  }
  if (elements.btnMemberLogWork) {
    elements.btnMemberLogWork.addEventListener('click', () => openLogWorkModal(null, 'assigned'));
  }
  if (elements.btnMemberLogExtraWork) {
    elements.btnMemberLogExtraWork.addEventListener('click', () => openLogWorkModal(null, 'extra'));
  }

  // Submit Completed Work Form (Handles both Add Task / Extra Work and Assigned Targets)
  elements.logWorkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mode = elements.logWorkMode ? elements.logWorkMode.value : 'extra';

    let submissionData = null;

    if (mode === 'extra') {
      const brand = elements.logExtraBrand ? elements.logExtraBrand.value : 'Both';
      const category = elements.logExtraCategory ? elements.logExtraCategory.value : 'Branding';
      const title = (elements.logExtraTitle ? elements.logExtraTitle.value.trim() : '') ||
                    (elements.logWorkTitle ? elements.logWorkTitle.value.trim() : '');
      const format = elements.logExtraFormat ? elements.logExtraFormat.value : 'Poster';
      const url = elements.logWorkUrl ? elements.logWorkUrl.value.trim() : '';
      const notes = elements.logWorkNotes ? elements.logWorkNotes.value.trim() : '';

      if (!title) {
        showToast('Please enter a task title.', 'warning');
        if (elements.logExtraTitle) elements.logExtraTitle.focus();
        return;
      }

      if (!url) {
        showToast('Please provide a deliverable proof link.', 'warning');
        if (elements.logWorkUrl) elements.logWorkUrl.focus();
        return;
      }

      const extraDeadline = (elements.logExtraDeadline && elements.logExtraDeadline.value) ? elements.logExtraDeadline.value.trim() : '';

      submissionData = {
        isExtra: true,
        assignee: state.user ? state.user.role : 'designer',
        assigneeName: state.user ? state.user.name : '',
        authorName: state.user ? state.user.name : '',
        authorEmail: state.user ? state.user.email : '',
        brand,
        category,
        program: title,
        title,
        format,
        url,
        notes,
        deadline: extraDeadline,
        month: window.dataStore.getActiveMonth()
      };
    } else {
      const targetId = elements.logTargetSelect ? elements.logTargetSelect.value : null;
      const target = window.dataStore.getTargetById(targetId);
      if (!target) {
        showToast('Please select a deliverable task or switch to Add Task.', 'warning');
        return;
      }

      submissionData = {
        targetId: target.id,
        assignee: target.assignee,
        assigneeName: target.assigneeName || (state.user ? state.user.name : ''),
        authorName: state.user ? state.user.name : (target.assigneeName || target.assignee),
        authorEmail: state.user ? state.user.email : '',
        brand: target.brand,
        category: target.category,
        program: target.program,
        format: target.format,
        title: elements.logWorkTitle.value.trim(),
        url: elements.logWorkUrl.value.trim(),
        notes: elements.logWorkNotes.value.trim(),
        month: target.month || window.dataStore.getActiveMonth(),
        isExtra: false
      };
    }

    window.dataStore.addSubmission(submissionData);
    elements.logWorkModal.classList.add('hidden');
    const toastMsg = mode === 'extra'
      ? '⭐ Task submitted! Sent to Admin for review. Once approved, it will be counted.'
      : 'Deliverable submitted successfully! Sent to Admin for review.';
    showToast(toastMsg, 'success');
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
        if (elements.targetFormat) elements.targetFormat.value = target.format || '';
        elements.targetProgram.value = target.program;
        elements.targetQty.value = target.targetQty;
        if (elements.targetDeadline) elements.targetDeadline.value = target.deadline || '';
        elements.targetNotes.value = target.notes || '';
        elements.assignTargetModal.querySelector('h3').textContent = 'Edit Target Deliverable';
        if (elements.btnSubmitTargetText) elements.btnSubmitTargetText.textContent = 'Update Target';
        if (elements.btnModalDeleteTarget) elements.btnModalDeleteTarget.style.display = 'inline-flex';
        elements.assignTargetModal.classList.remove('hidden');
        refreshIcons();
      }
      return;
    }

    // Delete Target button (Admin / Marketing Manager Only)
    const deleteBtn = e.target.closest('.btn-action-delete');
    if (deleteBtn) {
      if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
        showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
        return;
      }
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
        const authorBase = `${roleLabels[sub.assignee] || sub.assignee} (${formatBrandName(sub.brand)})`;
        elements.reviewModalAuthor.textContent = sub.isExtra ? `⭐ [Extra Work] ${authorBase}` : authorBase;
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

    // =========================================================================
    // MARKETING EXECUTIVE WORKSPACE & DEADLINE PRESET DELEGATION
    // =========================================================================

    // Marketing Cadence Navigation Tabs
    const mktTabBtn = e.target.closest('.mkt-cadence-btn');
    if (mktTabBtn && mktTabBtn.dataset.mktTab) {
      state.mktActiveTab = mktTabBtn.dataset.mktTab;
      renderMarketingWorkspace(state.user);
      return;
    }

    // Marketing Daily Checkbox Toggle
    const dailyCheck = e.target.closest('.mkt-checkbox-wrap[data-action="toggle-daily"]');
    if (dailyCheck && dailyCheck.dataset.taskId) {
      const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
      const updated = window.dataStore.toggleMarketingDailyTask(dailyCheck.dataset.taskId, todayStr);
      if (updated && updated.history && updated.history[todayStr] && updated.history[todayStr].completed) {
        showToast(`✅ Completed "${updated.title}" for today!`, 'success');
      } else {
        showToast(`Marked "${updated ? updated.title : 'Task'}" pending for today.`, 'info');
      }
      renderMarketingWorkspace(state.user);
      return;
    }

    // Marketing Weekly Checkbox Toggle
    const weeklyCheck = e.target.closest('.mkt-checkbox-wrap[data-action="toggle-weekly"]');
    if (weeklyCheck && weeklyCheck.dataset.taskId) {
      const weekStr = (typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W44';
      const updated = window.dataStore.toggleMarketingWeeklyTask(weeklyCheck.dataset.taskId, weekStr);
      if (updated && updated.history && updated.history[weekStr] && updated.history[weekStr].completed) {
        showToast(`✅ Delivered "${updated.title}" for ${weekStr}!`, 'success');
      } else {
        showToast(`Marked "${updated ? updated.title : 'Task'}" in progress for ${weekStr}.`, 'info');
      }
      renderMarketingWorkspace(state.user);
      return;
    }

    // Routine Note Modal Open
    const openNoteBtn = e.target.closest('.btn-open-routine-note');
    if (openNoteBtn) {
      const taskId = openNoteBtn.dataset.taskId;
      const taskType = openNoteBtn.dataset.taskType || 'daily';
      const taskTitle = openNoteBtn.dataset.taskTitle || '';
      openRoutineNoteModal(taskId, taskType, taskTitle);
      return;
    }

    // Assign Target Deadline Presets
    const targetPresetBtn = e.target.closest('#target-deadline-presets .btn-preset-pill');
    if (targetPresetBtn && targetPresetBtn.dataset.preset) {
      const preset = targetPresetBtn.dataset.preset;
      const calcDate = calculateDatePreset(preset);
      if (elements.targetDeadline) {
        elements.targetDeadline.value = calcDate;
        updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview);
      }
      document.querySelectorAll('#target-deadline-presets .btn-preset-pill').forEach(b => b.classList.remove('active'));
      targetPresetBtn.classList.add('active');
      return;
    }

    // Log Extra Work Deadline Presets
    const extraPresetBtn = e.target.closest('#log-extra-deadline-presets .btn-preset-pill');
    if (extraPresetBtn && extraPresetBtn.dataset.extraPreset) {
      const preset = extraPresetBtn.dataset.extraPreset;
      const calcDate = calculateDatePreset(preset);
      if (elements.logExtraDeadline) {
        elements.logExtraDeadline.value = calcDate;
        updateDeadlineQuickPreview(elements.logExtraDeadline, elements.logExtraDeadlinePreview);
      }
      document.querySelectorAll('#log-extra-deadline-presets .btn-preset-pill').forEach(b => b.classList.remove('active'));
      extraPresetBtn.classList.add('active');
      return;
    }
  });

  // Real-Time Input Handlers for Deadline Inputs
  if (elements.targetDeadline) {
    elements.targetDeadline.addEventListener('input', () => {
      updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview);
      if (elements.targetDeadlinePresets) {
        elements.targetDeadlinePresets.querySelectorAll('.btn-preset-pill').forEach(b => b.classList.remove('active'));
      }
    });
  }

  if (elements.logExtraDeadline) {
    elements.logExtraDeadline.addEventListener('input', () => {
      updateDeadlineQuickPreview(elements.logExtraDeadline, elements.logExtraDeadlinePreview);
      if (elements.logExtraDeadlinePresets) {
        elements.logExtraDeadlinePresets.querySelectorAll('.btn-preset-pill').forEach(b => b.classList.remove('active'));
      }
    });
  }

  // Routine Note Form Submission Handler
  if (elements.routineNoteForm) {
    elements.routineNoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const taskId = elements.routineModalTaskId ? elements.routineModalTaskId.value : '';
      const taskType = elements.routineModalType ? elements.routineModalType.value : 'daily';
      const proofUrl = elements.routineModalProofUrl ? elements.routineModalProofUrl.value.trim() : '';
      const noteText = elements.routineModalNoteText ? elements.routineModalNoteText.value.trim() : '';

      if (taskType === 'daily') {
        const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
        window.dataStore.updateMarketingDailyTaskNote(taskId, todayStr, noteText, proofUrl);
        showToast('Saved note & link for today’s routine.', 'success');
      } else {
        const weekStr = (typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W44';
        window.dataStore.toggleMarketingWeeklyTask(taskId, weekStr, noteText, proofUrl);
        showToast(`Saved weekly report & proof for ${weekStr}.`, 'success');
      }

      if (elements.routineNoteModal) {
        elements.routineNoteModal.classList.add('hidden');
      }
      renderMarketingWorkspace(state.user);
    });
  }

  // Review Actions: Approve or Request Rework
  elements.btnApproveWork.addEventListener('click', () => {
    const subId = elements.reviewSubmissionId.value;
    const sub = window.dataStore.getSubmissions().find(s => s.id === subId);
    const isExtra = sub && sub.isExtra;
    const feedback = elements.reviewFeedbackInput.value.trim() || (isExtra ? '⭐ Extra work approved! Over-achievement bonus counted.' : 'Approved by Marketing Manager!');
    window.dataStore.updateSubmissionStatus(subId, 'approved', feedback);
    elements.reviewActionModal.classList.add('hidden');
    showToast(isExtra ? '⭐ Extra work deliverable approved! Over-achievement bonus counted.' : 'Deliverable approved! Target count updated.', 'success');
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

  // Open Delete Target Confirmation Modal (Admin / Marketing Manager Only)
  function openDeleteTargetModal(targetId) {
    if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
      showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
      return;
    }
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

  // Confirm Delete Target Action (Admin / Marketing Manager Only)
  if (elements.btnConfirmDeleteTarget) {
    elements.btnConfirmDeleteTarget.addEventListener('click', () => {
      if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
        showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
        if (elements.deleteTargetModal) elements.deleteTargetModal.classList.add('hidden');
        return;
      }
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

  // Delete button inside Assign/Edit Target Modal (Admin / Marketing Manager Only)
  if (elements.btnModalDeleteTarget) {
    elements.btnModalDeleteTarget.addEventListener('click', () => {
      if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
        showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
        return;
      }
      const targetId = elements.editTargetId ? elements.editTargetId.value : null;
      if (targetId) {
        openDeleteTargetModal(targetId);
      }
    });
  }

  // Open User Tasks Management Modal (Admin / Marketing Manager Only)
  function openUserTasksModal(userEmail, userName = null, userRole = null) {
    if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
      showToast('Permission denied: Only the Marketing Manager (Admin) can view assigned task management.', 'error');
      return;
    }
    state.activeTasksUserEmail = userEmail;
    renderUserTasksModal(userEmail, userName, userRole);
    if (elements.userTasksModal) {
      elements.userTasksModal.classList.remove('hidden');
      refreshIcons();
    }
  }

  function updateUserTasksBatchBar(targets = []) {
    if (!elements.btnUserTasksBatchDelete || !elements.userTasksSelectAllCheckbox) return;
    const displayedCount = targets.length;
    let selectedCount = 0;
    targets.forEach(t => {
      if (state.selectedUserModalTargetIds.has(String(t.id))) selectedCount++;
    });

    if (displayedCount > 0 && selectedCount === displayedCount) {
      elements.userTasksSelectAllCheckbox.checked = true;
      elements.userTasksSelectAllCheckbox.indeterminate = false;
    } else if (selectedCount > 0) {
      elements.userTasksSelectAllCheckbox.checked = false;
      elements.userTasksSelectAllCheckbox.indeterminate = true;
    } else {
      elements.userTasksSelectAllCheckbox.checked = false;
      elements.userTasksSelectAllCheckbox.indeterminate = false;
    }

    if (selectedCount > 0) {
      elements.btnUserTasksBatchDelete.style.display = 'inline-flex';
      if (elements.userTasksSelectedCount) {
        elements.userTasksSelectedCount.textContent = selectedCount;
      }
    } else {
      elements.btnUserTasksBatchDelete.style.display = 'none';
    }

    refreshIcons();
  }

  function renderUserTasksModal(userEmail, userName = null, userRole = null) {
    if (!elements.userTasksModalList) return;
    const userObj = window.authService.getUserByEmail(userEmail) || {
      email: userEmail,
      name: userName || userEmail,
      role: userRole || 'designer'
    };

    const targets = window.dataStore.getTargetsForUser(userObj);

    // Segregate targets for user tasks modal
    const pendingTargets = targets.filter(t => {
      const prog = window.dataStore.getTargetProgress(t.id);
      return prog.completed < (Number(t.targetQty) || 1);
    });
    const deliveredTargets = targets.filter(t => {
      const prog = window.dataStore.getTargetProgress(t.id);
      return prog.completed >= (Number(t.targetQty) || 1);
    });

    if (elements.modalCountPending) elements.modalCountPending.textContent = pendingTargets.length;
    if (elements.modalCountDelivered) elements.modalCountDelivered.textContent = deliveredTargets.length;
    if (elements.modalCountAll) elements.modalCountAll.textContent = targets.length;

    const modalFilter = state.modalTasksFilter || 'pending';
    document.querySelectorAll('.user-tasks-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.modalFilter === modalFilter);
    });

    const displayedTargets = (modalFilter === 'pending')
      ? pendingTargets
      : (modalFilter === 'delivered')
        ? deliveredTargets
        : targets;

    if (elements.userTasksModalTitle) {
      elements.userTasksModalTitle.textContent = `Assigned Tasks – ${userObj.name}`;
    }
    if (elements.userTasksModalSubtitle) {
      elements.userTasksModalSubtitle.textContent = `${targets.length} deliverable task${targets.length === 1 ? '' : 's'} assigned (${pendingTargets.length} pending, ${deliveredTargets.length} delivered)`;
    }

    if (displayedTargets.length === 0) {
      elements.userTasksModalList.innerHTML = `
        <div style="text-align: center; padding: 24px 16px; color: var(--text-dim); font-size: 13px;">
          No ${modalFilter === 'pending' ? 'pending' : modalFilter === 'delivered' ? 'delivered' : ''} tasks.
        </div>
      `;
    } else {
      elements.userTasksModalList.innerHTML = displayedTargets.map(t => {
        const prog = window.dataStore.getTargetProgress(t.id);
        const isChecked = state.selectedUserModalTargetIds.has(String(t.id));
        return `
          <div class="user-task-item ${isChecked ? 'item-selected' : ''}">
            <input type="checkbox" class="user-task-row-checkbox task-checkbox" data-target-id="${t.id}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--teal-primary); margin-right: 8px;" title="Select task">
            <div class="user-task-info">
              <div class="user-task-title" title="${escapeHtml(t.program)}">${escapeHtml(t.program)}</div>
              <div class="user-task-meta">
                <span class="badge-brand ${escapeHtml(t.brand)}">${formatBrandName(t.brand)}</span>
                <span class="badge-category">${escapeHtml(t.category)}</span>
                <span class="badge-format">${escapeHtml(t.format)}</span>
                ${t.deadline ? formatDeadlineBadge(t.deadline, prog.completed >= (Number(t.targetQty) || 1)) : ''}
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

    // Wire Modal Tab Buttons
    const modalTabs = document.getElementById('user-tasks-modal-tabs');
    if (modalTabs && !modalTabs.dataset.wired) {
      modalTabs.dataset.wired = 'true';
      modalTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.user-tasks-tab-btn');
        if (btn && btn.dataset.modalFilter) {
          state.modalTasksFilter = btn.dataset.modalFilter;
          renderUserTasksModal(userEmail, userName, userRole);
        }
      });
    }

    updateUserTasksBatchBar(displayedTargets);
    refreshIcons();
  }

  // Open Batch Delete Modal (Admin / Marketing Manager Only)
  function openBatchDeleteModal(count) {
    if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
      showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
      return;
    }
    if (elements.deleteBatchCountDisplay) {
      elements.deleteBatchCountDisplay.textContent = count;
    }
    if (elements.deleteBatchModalTitle) {
      elements.deleteBatchModalTitle.textContent = `Delete ${count} Selected Tasks`;
    }
    if (elements.deleteBatchTargetsModal) {
      elements.deleteBatchTargetsModal.classList.remove('hidden');
      refreshIcons();
    } else if (confirm(`Are you sure you want to delete ${count} assigned tasks?`)) {
      executeBatchDelete();
    }
  }

  // Execute Batch Delete (Admin / Marketing Manager Only)
  function executeBatchDelete() {
    if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
      showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
      if (elements.deleteBatchTargetsModal) elements.deleteBatchTargetsModal.classList.add('hidden');
      return;
    }
    const ids = state.pendingBatchDeleteIds;
    if (!ids || ids.length === 0) return;

    const count = window.dataStore.deleteMultipleTargets(ids);
    if (elements.deleteBatchTargetsModal) {
      elements.deleteBatchTargetsModal.classList.add('hidden');
    }

    if (state.pendingBatchDeleteSource === 'manager-table') {
      state.selectedTargetIds.clear();
      renderManagerTargetsTable();
    } else if (state.pendingBatchDeleteSource === 'user-modal') {
      state.selectedUserModalTargetIds.clear();
      if (state.activeTasksUserEmail) {
        renderUserTasksModal(state.activeTasksUserEmail);
      }
    }

    state.pendingBatchDeleteIds = [];
    state.pendingBatchDeleteSource = null;

    showToast(`Successfully deleted ${count} assigned tasks.`, 'success');
    renderApp();
  }

  if (elements.btnConfirmDeleteBatch) {
    elements.btnConfirmDeleteBatch.addEventListener('click', () => {
      executeBatchDelete();
    });
  }

  // Button: Select All Tasks in Manager Table
  if (elements.btnSelectAllTargetsToggle) {
    elements.btnSelectAllTargetsToggle.addEventListener('click', () => {
      const displayed = getFilteredManagerTargets();
      let allDisplayedSelected = displayed.length > 0;
      displayed.forEach(t => {
        if (!state.selectedTargetIds.has(String(t.id))) allDisplayedSelected = false;
      });

      if (allDisplayedSelected) {
        displayed.forEach(t => state.selectedTargetIds.delete(String(t.id)));
      } else {
        displayed.forEach(t => state.selectedTargetIds.add(String(t.id)));
      }
      renderManagerTargetsTable();
    });
  }

  // Button: Clear Selection in Manager Table
  if (elements.btnBatchClearSelection) {
    elements.btnBatchClearSelection.addEventListener('click', () => {
      state.selectedTargetIds.clear();
      renderManagerTargetsTable();
    });
  }

  // Button: Delete Selected in Manager Table (Admin Only)
  if (elements.btnBatchDeleteTargets) {
    elements.btnBatchDeleteTargets.addEventListener('click', () => {
      if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
        showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
        return;
      }
      if (state.selectedTargetIds.size === 0) {
        showToast('No tasks selected.', 'warning');
        return;
      }
      state.pendingBatchDeleteIds = Array.from(state.selectedTargetIds);
      state.pendingBatchDeleteSource = 'manager-table';
      openBatchDeleteModal(state.pendingBatchDeleteIds.length);
    });
  }

  // Button: Delete Selected in User Tasks Modal (Admin Only)
  if (elements.btnUserTasksBatchDelete) {
    elements.btnUserTasksBatchDelete.addEventListener('click', () => {
      if (!state.user || (state.user.role !== 'manager' && state.user.email !== 'manager@nexcrest.com')) {
        showToast('Permission denied: Only the Marketing Manager (Admin) can delete assigned tasks.', 'error');
        return;
      }
      if (state.selectedUserModalTargetIds.size === 0) {
        showToast('No tasks selected.', 'warning');
        return;
      }
      state.pendingBatchDeleteIds = Array.from(state.selectedUserModalTargetIds);
      state.pendingBatchDeleteSource = 'user-modal';
      openBatchDeleteModal(state.pendingBatchDeleteIds.length);
    });
  }

  // Global Checkbox Change Delegation
  document.addEventListener('change', (e) => {
    // 1. Manager Table Header Select All
    if (e.target && e.target.id === 'select-all-targets-checkbox') {
      const isChecked = e.target.checked;
      const displayed = getFilteredManagerTargets();
      displayed.forEach(t => {
        if (isChecked) {
          state.selectedTargetIds.add(String(t.id));
        } else {
          state.selectedTargetIds.delete(String(t.id));
        }
      });
      renderManagerTargetsTable();
      return;
    }

    // 2. Manager Table Row Checkbox
    if (e.target && e.target.classList.contains('target-row-checkbox')) {
      const targetId = e.target.dataset.targetId;
      if (targetId) {
        if (e.target.checked) {
          state.selectedTargetIds.add(String(targetId));
        } else {
          state.selectedTargetIds.delete(String(targetId));
        }
        updateTargetsBatchBar();
      }
      return;
    }


    // 5. User Tasks Modal Select All Checkbox
    if (e.target && e.target.id === 'user-tasks-select-all-checkbox') {
      const isChecked = e.target.checked;
      if (state.activeTasksUserEmail) {
        const userObj = window.authService.getUserByEmail(state.activeTasksUserEmail) || { email: state.activeTasksUserEmail };
        const targets = window.dataStore.getTargetsForUser(userObj);
        targets.forEach(t => {
          if (isChecked) {
            state.selectedUserModalTargetIds.add(String(t.id));
          } else {
            state.selectedUserModalTargetIds.delete(String(t.id));
          }
        });
        renderUserTasksModal(state.activeTasksUserEmail);
      }
      return;
    }

    // 6. User Tasks Modal Row Checkbox
    if (e.target && e.target.classList.contains('user-task-row-checkbox')) {
      const targetId = e.target.dataset.targetId;
      if (targetId) {
        if (e.target.checked) {
          state.selectedUserModalTargetIds.add(String(targetId));
        } else {
          state.selectedUserModalTargetIds.delete(String(targetId));
        }
        if (state.activeTasksUserEmail) {
          const userObj = window.authService.getUserByEmail(state.activeTasksUserEmail) || { email: state.activeTasksUserEmail };
          const targets = window.dataStore.getTargetsForUser(userObj);
          updateUserTasksBatchBar(targets);
        }
      }
      return;
    }
  });

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

    try {
      const res = window.authService.login(email, pass);
      if (res && res.success) {
        state.user = res.user;
        clearAuthError();
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        renderApp();
      } else {
        const errorMsg = (res && res.error) || 'Incorrect password. Please try again.';
        showAuthError(errorMsg);
        showToast(errorMsg, 'error');
        if (elements.loginPassword) {
          elements.loginPassword.focus();
          elements.loginPassword.select();
        }
      }
    } catch (err) {
      console.error('Login process error:', err);
      showAuthError('An unexpected authentication error occurred. Please try again.');
      showToast('Login error: ' + err.message, 'error');
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

  // Reactive DataStore Sync (Cloud Firestore real-time submissions & target updates)
  if (window.dataStore && typeof window.dataStore.onChange === 'function') {
    window.dataStore.onChange(() => {
      renderApp();
    });
  }

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
