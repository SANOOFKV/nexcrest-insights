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
    pacingMode: 'working', // 'working' (Mon-Sat) | 'calendar'
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
    pendingBatchDeleteSource: null,
    activeAdminMemberEmail: 'marketing@nexcrest.com',
    adminMarketingSelectedDate: (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0],
    adminMarketingSelectedWeek: (typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W45',
    adminMarketingSelectedMonth: (typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11',
    memberReportSelectedMonth: (typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11',
    memberReportActiveUser: null
  };

  // DOM Element Selectors
  const elements = {
    // Top Bar
    monthSelector: document.getElementById('month-selector'),
    btnCalendarPicker: document.getElementById('btn-calendar-picker'),
    cloudSyncStatusIndicator: document.getElementById('cloud-sync-status-indicator'),
    cloudSyncLabel: document.getElementById('cloud-sync-label'),
    btnOpenCommandPalette: document.getElementById('btn-open-command-palette'),
    commandPaletteModal: document.getElementById('command-palette-modal'),
    commandPaletteInput: document.getElementById('command-palette-input'),
    commandPaletteResults: document.getElementById('command-palette-results'),
    monthDisplay: document.getElementById('current-month-display'),
    headerUserProfileMenu: document.getElementById('header-user-profile-menu'),
    btnOpenUserProfile: document.getElementById('btn-open-user-profile'),
    headerUserAvatar: document.getElementById('header-user-avatar'),
    headerUserName: document.getElementById('header-user-name'),
    headerRoleBadge: document.getElementById('header-role-badge'),
    logoutBtn: document.getElementById('logout-btn'),
    btnMemberOpenProfile: document.getElementById('btn-member-open-profile'),

    memberCycleBadge: document.getElementById('member-cycle-badge'),
    memberCycleText: document.getElementById('member-cycle-text'),

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
    tabMemberHub: document.getElementById('tab-member-hub'),
    tabBtnMemberHub: document.getElementById('tab-btn-member-hub'),
    memberHubCount: document.getElementById('member-hub-count'),
    adminMemberSwitcherGrid: document.getElementById('admin-member-switcher-grid'),
    adminMemberPersonalizedPane: document.getElementById('admin-member-personalized-pane'),
    adminRoutineProofModal: document.getElementById('admin-routine-proof-modal'),
    adminProofModalTitle: document.getElementById('admin-proof-modal-title'),
    adminProofModalNote: document.getElementById('admin-proof-modal-note'),
    adminProofModalLinkGroup: document.getElementById('admin-proof-modal-link-group'),
    adminProofModalLink: document.getElementById('admin-proof-modal-link'),
    adminProofModalUrlText: document.getElementById('admin-proof-modal-url-text'),
    btnAdminVerifyTask: document.getElementById('btn-admin-verify-task'),
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
    btnMemberReport: document.getElementById('btn-member-report'),
    btnMktOpenReport: document.getElementById('btn-mkt-open-report'),
    memberMonthlyReportModal: document.getElementById('member-monthly-report-modal'),
    reportCycleQuickBtns: document.getElementById('report-cycle-quick-btns'),
    reportMonthSelect: document.getElementById('report-month-select'),
    printableReportDoc: document.getElementById('printable-report-doc'),
    docMonthBadge: document.getElementById('doc-month-badge'),
    docGeneratedTime: document.getElementById('doc-generated-time'),
    docMemberName: document.getElementById('doc-member-name'),
    docMemberRole: document.getElementById('doc-member-role'),
    docMemberBrand: document.getElementById('doc-member-brand'),
    docMemberPeriod: document.getElementById('doc-member-period'),
    reportKpiContainer: document.getElementById('report-kpi-container'),
    reportTableBody: document.getElementById('report-table-body'),
    reportHighlightsText: document.getElementById('report-highlights-text'),
    btnReportAutoHighlights: document.getElementById('btn-report-auto-highlights'),
    btnReportCopyBriefing: document.getElementById('btn-report-copy-briefing'),
    btnReportExportCsv: document.getElementById('btn-report-export-csv'),
    btnReportPrint: document.getElementById('btn-report-print'),
    btnReportSave: document.getElementById('btn-report-save'),
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
    targetDeadlineTimeGroup: document.getElementById('target-deadline-time-group'),
    targetDeadlineTime: document.getElementById('target-deadline-time'),
    targetDeadlineTimePresets: document.getElementById('target-deadline-time-presets'),
    btnClearTargetTime: document.getElementById('btn-clear-target-time'),
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
    logExtraDeadlineTimeGroup: document.getElementById('log-extra-deadline-time-group'),
    logExtraDeadlineTime: document.getElementById('log-extra-deadline-time'),
    logExtraDeadlineTimePresets: document.getElementById('log-extra-deadline-time-presets'),
    btnClearExtraTime: document.getElementById('btn-clear-extra-time'),
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

  function parseDeadline(deadlineStr) {
    if (!deadlineStr || typeof deadlineStr !== 'string') return null;
    const str = deadlineStr.trim();
    if (!str) return null;

    let datePart = str;
    let timePart = '';

    if (str.includes('T')) {
      const split = str.split('T');
      datePart = split[0];
      timePart = split[1] || '';
    } else if (str.includes(' ')) {
      const split = str.split(' ');
      datePart = split[0];
      timePart = split[1] || '';
    }

    const dParts = datePart.split('-');
    if (dParts.length < 3) return null;

    const year = parseInt(dParts[0], 10);
    const month = parseInt(dParts[1], 10) - 1;
    const day = parseInt(dParts[2], 10);

    let hours = 23;
    let minutes = 59;
    let hasTime = false;

    if (timePart) {
      const tParts = timePart.split(':');
      if (tParts.length >= 2) {
        hours = parseInt(tParts[0], 10) || 0;
        minutes = parseInt(tParts[1], 10) || 0;
        hasTime = true;
      }
    }

    const dueDate = new Date(year, month, day, hours, minutes, 0);
    return {
      dateObj: dueDate,
      datePart,
      timePart,
      hasTime,
      year,
      month,
      day,
      hours,
      minutes
    };
  }

  function formatTime12h(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const mStr = String(minutes).padStart(2, '0');
    return `${h12}:${mStr} ${period}`;
  }

  function formatDeadlineBadge(deadlineStr, isCompleted = false) {
    if (!deadlineStr) return '';
    try {
      const parsed = parseDeadline(deadlineStr);
      if (!parsed) return `<span class="badge-deadline"><i data-lucide="calendar"></i> Due ${escapeHtml(deadlineStr)}</span>`;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueStart = new Date(parsed.year, parsed.month, parsed.day);
      const diffMs = dueStart - todayStart;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const formattedDate = parsed.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = parsed.hasTime ? ` at ${formatTime12h(parsed.hours, parsed.minutes)}` : '';

      if (isCompleted) {
        return `<span class="badge-deadline completed" title="Due on ${formattedDate}${timeStr} (Task Completed)"><i data-lucide="calendar-check"></i> Due ${formattedDate}${timeStr}</span>`;
      }

      if (diffDays < 0) {
        return `<span class="badge-deadline overdue" title="Overdue by ${Math.abs(diffDays)} day(s)"><i data-lucide="alert-circle"></i> Overdue (${formattedDate}${timeStr})</span>`;
      } else if (diffDays === 0) {
        // If due today and specific time has passed
        const isTimeOverdue = parsed.hasTime && now > parsed.dateObj;
        if (isTimeOverdue) {
          return `<span class="badge-deadline overdue" title="Overdue! Deadline was today at ${formatTime12h(parsed.hours, parsed.minutes)}"><i data-lucide="alert-circle"></i> Overdue (${formatTime12h(parsed.hours, parsed.minutes)})</span>`;
        }
        return `<span class="badge-deadline today" title="Due Today!"><i data-lucide="clock"></i> Due Today${timeStr}</span>`;
      } else if (diffDays === 1) {
        return `<span class="badge-deadline soon" title="Due Tomorrow"><i data-lucide="calendar"></i> Due Tomorrow${timeStr}</span>`;
      } else {
        return `<span class="badge-deadline" title="Due on ${formattedDate}${timeStr}"><i data-lucide="calendar"></i> Due ${formattedDate}${timeStr}</span>`;
      }
    } catch (e) {
      return `<span class="badge-deadline"><i data-lucide="calendar"></i> Due ${escapeHtml(deadlineStr)}</span>`;
    }
  }

  function renderTaskDeadlineStrip(deadlineStr, isCompleted = false) {
    if (!deadlineStr) return '';
    try {
      const parsed = parseDeadline(deadlineStr);
      if (!parsed) {
        return `
          <div class="task-deadline-strip upcoming">
            <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${escapeHtml(deadlineStr)}</strong></span>
            <span class="deadline-tag">Scheduled</span>
          </div>`;
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueStart = new Date(parsed.year, parsed.month, parsed.day);
      const diffMs = dueStart - todayStart;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const formattedDate = parsed.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = parsed.hasTime ? ` at ${formatTime12h(parsed.hours, parsed.minutes)}` : '';

      if (isCompleted) {
        return `
          <div class="task-deadline-strip completed" title="Task Completed">
            <span class="deadline-content"><i data-lucide="calendar-check"></i> Due: <strong>${formattedDate}${timeStr}</strong></span>
            <span class="deadline-tag">Completed</span>
          </div>`;
      }

      if (diffDays < 0) {
        const absDays = Math.abs(diffDays);
        return `
          <div class="task-deadline-strip overdue" title="Overdue by ${absDays} day(s)">
            <span class="deadline-content"><i data-lucide="alert-circle"></i> Due: <strong>${formattedDate}${timeStr}</strong></span>
            <span class="deadline-tag">⚠️ ${absDays}d Overdue</span>
          </div>`;
      } else if (diffDays === 0) {
        const isTimeOverdue = parsed.hasTime && now > parsed.dateObj;
        if (isTimeOverdue) {
          return `
            <div class="task-deadline-strip overdue" title="Overdue today!">
              <span class="deadline-content"><i data-lucide="alert-circle"></i> Due Today: <strong>${formattedDate}${timeStr}</strong></span>
              <span class="deadline-tag">⚠️ Overdue Today</span>
            </div>`;
        }
        return `
          <div class="task-deadline-strip today" title="Due Today!">
            <span class="deadline-content"><i data-lucide="clock"></i> Due: <strong>${formattedDate}${timeStr}</strong></span>
            <span class="deadline-tag">⏰ Due Today</span>
          </div>`;
      } else if (diffDays === 1) {
        return `
          <div class="task-deadline-strip soon" title="Due Tomorrow">
            <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${formattedDate}${timeStr}</strong></span>
            <span class="deadline-tag">Due Tomorrow</span>
          </div>`;
      } else {
        return `
          <div class="task-deadline-strip upcoming" title="Due in ${diffDays} days">
            <span class="deadline-content"><i data-lucide="calendar"></i> Due: <strong>${formattedDate}${timeStr}</strong></span>
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

  function updateDeadlineQuickPreview(dateInputEl, previewEl, timeInputEl = null) {
    if (!previewEl) return;
    const dateVal = dateInputEl ? dateInputEl.value : '';
    if (!dateVal) {
      previewEl.innerHTML = '';
      return;
    }

    const timeVal = (timeInputEl && timeInputEl.value) ? timeInputEl.value : '';
    const timeDisplay = timeVal ? ` at ${formatTime12h(parseInt(timeVal.split(':')[0], 10), parseInt(timeVal.split(':')[1] || 0, 10))}` : '';

    const today = new Date();
    const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr(today) : today.toISOString().split('T')[0];

    if (dateVal === todayStr) {
      previewEl.innerHTML = `<span style="color: #FDE68A;">⏰ Due Today${timeDisplay}!</span>`;
    } else if (dateVal < todayStr) {
      previewEl.innerHTML = `<span style="color: #FDA4AF;">⚠️ Past Date (${dateVal}${timeDisplay})</span>`;
    } else {
      const parts = dateVal.split('-').map(Number);
      const targetD = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffTime = targetD.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        previewEl.innerHTML = `<span style="color: #FEF08A;">⚡ Due Tomorrow${timeDisplay}</span>`;
      } else {
        previewEl.innerHTML = `<span style="color: var(--teal-light);">📅 In ${diffDays} days${timeDisplay}</span>`;
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

  function resolveTargetFormat(target) {
    if (!target) return '';
    let fmt = (target.format || '').trim();
    const brand = (target.brand || '').toLowerCase().trim();
    const prog = (target.program || '').toLowerCase();

    // If format was accidentally saved as the brand name ("Techschool", "IT", "Both") or is empty
    if (!fmt || fmt.toLowerCase() === brand || ['techschool', 'it', 'both', 'nexcrest'].includes(fmt.toLowerCase())) {
      if (prog.includes('reel') || prog.includes('short') || prog.includes('clip')) return 'Reel';
      if (prog.includes('carousel') || prog.includes('carousal')) return 'Carousel';
      if (prog.includes('video') || prog.includes('aftermovie') || prog.includes('podcast')) return 'Video';
      if (prog.includes('poster') || prog.includes('flyer') || prog.includes('banner')) return 'Poster';
      if (prog.includes('story')) return 'Story';
      return ''; // Never return duplicate brand name as format!
    }
    return fmt;
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
      if (elements.cloudSyncStatusIndicator) elements.cloudSyncStatusIndicator.style.display = 'none';
      if (elements.btnOpenCommandPalette) elements.btnOpenCommandPalette.style.display = 'none';
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
    if (elements.cloudSyncStatusIndicator) elements.cloudSyncStatusIndicator.style.display = 'inline-flex';
    if (elements.btnOpenCommandPalette) elements.btnOpenCommandPalette.style.display = 'inline-flex';

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
      { key: 'member-hub', el: elements.tabMemberHub },
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
    } else if (state.activeManagerTab === 'member-hub') {
      renderAdminMemberHub();
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
      ovDaysLeftLabel.textContent = isWorkingDays ? 'WORK DAYS (MON-SAT)' : 'DAYS LEFT';
    }
    if (btnToggleWorkdays) {
      if (isWorkingDays) {
        btnToggleWorkdays.classList.add('active');
        if (workdaysToggleText) workdaysToggleText.textContent = 'Mon-Sat Active';
      } else {
        btnToggleWorkdays.classList.remove('active');
        if (workdaysToggleText) workdaysToggleText.textContent = 'Calendar Days';
      }
    }

    animateCounter(elements.ovDaysLeft, effectiveDays);
    if (elements.ovCatTotalPosts) elements.ovCatTotalPosts.textContent = `${ov.totalTarget} Posts`;

    if (elements.ovPacingText) {
      if (ov.pct >= 100) {
        elements.ovPacingText.textContent = '100% Monthly Target Achieved!';
      } else {
        const pacePerDay = effectiveDays > 0 ? (ov.remaining / effectiveDays).toFixed(1) : ov.remaining;
        elements.ovPacingText.textContent = `${ov.remaining} posts remaining (${pacePerDay}/day needed across ${effectiveDays} ${isWorkingDays ? 'workdays (Mon-Sat)' : 'calendar days'})`;
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
          <td><span class="badge-format">${escapeHtml(resolveTargetFormat(target) || 'Deliverable')}</span></td>
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
      const mktActiveMonth = isMarketing ? (window.dataStore.getActiveMonth() || '2026-10') : '2026-10';
      const mktMonthlyStats = isMarketing ? window.dataStore.getMarketingMonthlyStats(mktActiveMonth) : null;

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
          <div class="emp-stat-item" style="color: #10B981;">
            <span class="emp-stat-val" style="color: #10B981;">${mktMonthlyStats.completed}/${mktMonthlyStats.total}</span>
            <span class="emp-stat-lbl">Monthly</span>
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
              <button type="button" class="btn-emp-assign btn-card-inspect-hub" data-emp-email="${escapeHtml(emp.email)}" title="Open in Member Hub">
                <i data-lucide="user-check" style="width: 14px; height: 14px;"></i> Hub
              </button>
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
  // ADMIN PERSONALIZED MEMBER OPERATIONS HUB & MARKETING LIVE TRACKER
  // =========================================================================

  function adminMktShiftDate(days) {
    const current = state.adminMarketingSelectedDate || ((typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0]);
    const [y, m, d] = current.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const yStr = dateObj.getFullYear();
    const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dateObj.getDate()).padStart(2, '0');
    state.adminMarketingSelectedDate = `${yStr}-${mStr}-${dStr}`;
    renderAdminMemberHub();
  }

  function adminMktJumpToday() {
    state.adminMarketingSelectedDate = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
    renderAdminMemberHub();
  }

  function adminMktShiftMonth(delta) {
    const current = state.adminMarketingSelectedMonth || ((window.dataStore && typeof window.dataStore.getActiveMonth === 'function') ? window.dataStore.getActiveMonth() : ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11'));
    const [yStr, mStr] = current.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + delta;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    state.adminMarketingSelectedMonth = `${y}-${String(m).padStart(2, '0')}`;
    renderAdminMemberHub();
  }

  function openAdminRoutineProofModal(title, note, proofUrl) {
    if (!elements.adminRoutineProofModal) return;
    if (elements.adminProofModalTitle) {
      elements.adminProofModalTitle.innerHTML = `<i data-lucide="file-text" style="color: var(--teal-primary);"></i> ${escapeHtml(title)}`;
    }
    if (elements.adminProofModalNote) {
      elements.adminProofModalNote.textContent = note ? note : 'No notes submitted for this task execution.';
    }
    if (elements.adminProofModalLinkGroup) {
      if (proofUrl && proofUrl.trim()) {
        elements.adminProofModalLinkGroup.style.display = 'block';
        if (elements.adminProofModalLink) {
          elements.adminProofModalLink.href = safeUrl(proofUrl);
        }
        if (elements.adminProofModalUrlText) {
          elements.adminProofModalUrlText.textContent = proofUrl;
        }
      } else {
        elements.adminProofModalLinkGroup.style.display = 'none';
      }
    }
    elements.adminRoutineProofModal.classList.remove('hidden');
    refreshIcons();
  }

  function renderAdminMemberHub() {
    if (!elements.adminMemberSwitcherGrid || !elements.adminMemberPersonalizedPane) return;

    const employees = window.authService.getEmployees();
    if (!employees || employees.length === 0) {
      elements.adminMemberPersonalizedPane.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <i data-lucide="user-x" style="width: 40px; height: 40px; margin-bottom: 12px; color: var(--text-dim); opacity: 0.6;"></i>
          <h4 style="font-family: var(--font-heading); margin-bottom: 6px;">No Team Members Found</h4>
          <p style="font-size: 13px; color: var(--text-muted);">Please add employees in the Team Roster tab to view their personalized operational hub.</p>
        </div>
      `;
      refreshIcons();
      return;
    }

    if (elements.memberHubCount) {
      elements.memberHubCount.textContent = employees.length;
    }

    // Ensure active member exists
    let activeEmp = employees.find(e => e.email === state.activeAdminMemberEmail);
    if (!activeEmp) {
      activeEmp = employees.find(e => e.role === 'marketing') || employees[0];
      state.activeAdminMemberEmail = activeEmp.email;
    }

    const todayStr = (typeof window.getTodayDateStr === 'function') ? window.getTodayDateStr() : new Date().toISOString().split('T')[0];
    const selectedDateStr = state.adminMarketingSelectedDate || todayStr;
    const selectedWeekStr = state.adminMarketingSelectedWeek || ((typeof window.getCurrentWeekStr === 'function') ? window.getCurrentWeekStr() : '2026-W45');
    const defaultMonth = (window.dataStore && typeof window.dataStore.getActiveMonth === 'function') ? window.dataStore.getActiveMonth() : ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const selectedMonthStr = state.adminMarketingSelectedMonth || defaultMonth;

    // 1. Render Member Switcher Cards Grid
    elements.adminMemberSwitcherGrid.innerHTML = employees.map(emp => {
      const isSelected = emp.email === state.activeAdminMemberEmail;
      const isMkt = emp.role === 'marketing';

      let chipHtml = '';
      if (isMkt) {
        const mktDailyStats = window.dataStore.getMarketingDailyStats(selectedDateStr);
        const mktMonthlyStats = window.dataStore.getMarketingMonthlyStats(selectedMonthStr);
        const allDone = mktDailyStats.total > 0 && mktDailyStats.completed === mktDailyStats.total;
        chipHtml = `
          <div class="member-status-chip ${allDone ? 'green' : mktDailyStats.completed > 0 ? 'green' : 'amber'}">
            <i data-lucide="${allDone ? 'check-check' : mktDailyStats.completed > 0 ? 'check-circle' : 'clock'}" style="width: 12px; height: 12px;"></i>
            Daily: ${mktDailyStats.completed}/${mktDailyStats.total} • Monthly: ${mktMonthlyStats.completed}/${mktMonthlyStats.total}
          </div>
        `;
      } else {
        const stats = window.dataStore.getEmployeeStats(emp);
        chipHtml = `
          <div class="member-status-chip neutral">
            <i data-lucide="target" style="width: 12px; height: 12px;"></i>
            ${stats.totalCompleted} / ${stats.totalTarget} Target (${stats.pct}%)
          </div>
        `;
      }

      return `
        <div class="member-tab-card ${isSelected ? 'active' : ''}" data-hub-emp-email="${escapeHtml(emp.email)}">
          <div class="member-avatar ${escapeHtml(emp.role)}">${escapeHtml(emp.avatar || emp.name.charAt(0))}</div>
          <div class="member-details">
            <div class="member-name" title="${escapeHtml(emp.name)}">${escapeHtml(emp.name)}</div>
            <div class="member-role-title" title="${escapeHtml(emp.title || emp.role)}">${escapeHtml(emp.title || emp.role)}</div>
            ${chipHtml}
          </div>
        </div>
      `;
    }).join('');

    // Switcher card click event handlers
    elements.adminMemberSwitcherGrid.querySelectorAll('.member-tab-card').forEach(card => {
      card.addEventListener('click', () => {
        const email = card.dataset.hubEmpEmail;
        if (email && email !== state.activeAdminMemberEmail) {
          state.activeAdminMemberEmail = email;
          renderAdminMemberHub();
        }
      });
    });

    // 2. Render Active Member Personalized Workspace Pane
    if (activeEmp.role === 'marketing') {
      renderAdminMarketingExecutiveSection(activeEmp, selectedDateStr, selectedWeekStr, selectedMonthStr, todayStr);
    } else {
      renderAdminCreativeMemberSection(activeEmp);
    }

    refreshIcons();
  }

  function renderAdminMarketingExecutiveSection(activeEmp, selectedDateStr, selectedWeekStr, selectedMonthStr, todayStr) {
    const dailyTasks = window.dataStore.getMarketingDailyTasks(selectedDateStr).filter(t => t.active !== false);
    const dailyStats = window.dataStore.getMarketingDailyStats(selectedDateStr);
    const weeklyTasks = window.dataStore.getMarketingWeeklyTasks(selectedWeekStr).filter(t => t.active !== false);
    const weeklyStats = window.dataStore.getMarketingWeeklyStats(selectedWeekStr);
    const monthlyTasks = window.dataStore.getMarketingMonthlyTasks(selectedMonthStr).filter(t => t.active !== false);
    const monthlyStats = window.dataStore.getMarketingMonthlyStats(selectedMonthStr);
    const instantTasks = window.dataStore.getMarketingInstantTasks();

    // Date formatting
    const isToday = selectedDateStr === todayStr;
    const parts = selectedDateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const displayDateHeader = (isToday ? 'Today: ' : '') + formattedDate;

    elements.adminMemberPersonalizedPane.innerHTML = `
      <!-- Hero Profile & Date Navigator -->
      <div class="member-personalized-hero">
        <div class="hero-top-row">
          <div class="hero-profile">
            <div class="hero-profile-avatar marketing">${escapeHtml(activeEmp.avatar || 'ME')}</div>
            <div class="hero-profile-info">
              <h2>${escapeHtml(activeEmp.name)} — Marketing Operations Center</h2>
              <p>Tracking daily recurring routines, weekly campaigns, and manager-assigned instant deliverables.</p>
            </div>
          </div>

          <!-- Interactive Date Navigator -->
          <div class="date-navigator">
            <button type="button" class="date-nav-btn" id="btn-admin-mkt-prev" title="Previous Day">
              <i data-lucide="chevron-left"></i>
            </button>
            <div class="date-display-badge">
              <i data-lucide="calendar" style="color: var(--teal-primary);"></i>
              <span id="admin-display-date-text">${escapeHtml(displayDateHeader)}</span>
            </div>
            <button type="button" class="date-nav-btn" id="btn-admin-mkt-next" title="Next Day">
              <i data-lucide="chevron-right"></i>
            </button>
            ${!isToday ? `
              <button type="button" class="btn btn-secondary" id="btn-admin-mkt-today" style="padding: 4px 9px; font-size: 11px; height: 28px; margin-left: 2px;">
                <i data-lucide="rotate-ccw" style="width: 11px; height: 11px;"></i> Today
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 4-Card Telemetry Grid -->
        <div class="hub-telemetry-grid">
          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(0, 139, 165, 0.12); color: var(--teal-primary);">
              <i data-lucide="check-circle-2"></i>
            </div>
            <div>
              <div class="hub-tel-val">${dailyStats.completed} / ${dailyStats.total} Done</div>
              <div class="hub-tel-lbl">Daily Routines (${dailyStats.pct}%)</div>
            </div>
          </div>

          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(16, 185, 129, 0.12); color: #10B981;">
              <i data-lucide="file-check"></i>
            </div>
            <div>
              <div class="hub-tel-val">${monthlyStats.completed} / ${monthlyStats.total} Delivered</div>
              <div class="hub-tel-lbl">Monthly Deliverables (${monthlyStats.pct}%)</div>
            </div>
          </div>

          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(56, 189, 248, 0.12); color: #0284C7;">
              <i data-lucide="calendar"></i>
            </div>
            <div>
              <div class="hub-tel-val">${weeklyStats.completed} / ${weeklyStats.total} Delivered</div>
              <div class="hub-tel-lbl">Weekly Deliverables</div>
            </div>
          </div>

          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(124, 58, 237, 0.12); color: #7C3AED;">
              <i data-lucide="zap"></i>
            </div>
            <div>
              <div class="hub-tel-val">${instantTasks.length} Active</div>
              <div class="hub-tel-lbl">Instant Deliverables</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Operational Sections Grid -->
      <div class="hub-operations-grid">

        <!-- 1. DAILY REPETITIVE ROUTINES LIVE TRACKER -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="check-circle-2" style="color: var(--teal-primary);"></i>
              Daily Repetitive Tasks Live Tracker
            </h3>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="badge-tag" style="background: #ECFDF5; color: #065F46; border-color: #A7F3D0; font-size: 11px;">
                <i data-lucide="rotate-ccw" style="width: 11px; height: 11px;"></i> Resets Every Midnight
              </span>
              <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">For ${escapeHtml(formattedDate)}</span>
            </div>
          </div>

          <div class="admin-task-list">
            ${dailyTasks.map(task => {
              const isDone = Boolean(task.completed);
              const hasProof = Boolean(task.proofUrl && task.proofUrl.trim());
              const hasNote = Boolean(task.note && task.note.trim());

              return `
                <div class="admin-task-item ${isDone ? 'completed' : ''}">
                  <div class="admin-task-left">
                    <div class="admin-check-pill ${isDone ? 'done' : 'pending'}">
                      ${isDone ? '✓' : '⏳'}
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(task.title)}</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">${escapeHtml(task.category || 'Routine')}</span>
                        <span class="badge-tag">${formatBrandName(task.brand || 'Both')}</span>
                        ${isDone ? `
                          <span style="color: var(--mint-success); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <i data-lucide="clock" style="width: 12px; height: 12px;"></i> Done at ${escapeHtml(task.completedAt || 'Today')}
                          </span>
                        ` : `
                          <span style="color: var(--amber-warning); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <i data-lucide="alert-circle" style="width: 12px; height: 12px;"></i> Pending Today
                          </span>
                        `}
                        ${hasNote ? `
                          <span style="color: var(--teal-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                            <i data-lucide="file-text" style="width: 11px; height: 11px;"></i> Note Added
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    ${(hasProof || hasNote) ? `
                      <button type="button" class="btn btn-admin-view-proof" data-proof-title="${escapeHtml(task.title)}" data-proof-note="${escapeHtml(task.note || '')}" data-proof-url="${escapeHtml(task.proofUrl || '')}">
                        <i data-lucide="${hasProof ? 'external-link' : 'file-text'}"></i> ${hasProof ? 'View Proof' : 'View Note'}
                      </button>
                    ` : isDone ? `
                      <span style="font-size: 12px; color: var(--mint-success); font-weight: 600;">Completed</span>
                    ` : `
                      <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Awaiting Submission</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. WEEKLY DELIVERABLES TRACKER -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="calendar" style="color: #0284C7;"></i>
              Weekly Campaign Deliverables (Active: ${escapeHtml(selectedWeekStr)})
            </h3>
            <span class="badge-tag" style="background: #F0F9FF; color: #0369A1; border-color: #BAE6FD; font-size: 11px;">
              Resets Mondays
            </span>
          </div>

          <div class="admin-task-list">
            ${weeklyTasks.map(task => {
              const isDone = Boolean(task.completed);
              const hasProof = Boolean(task.proofUrl && task.proofUrl.trim());
              const hasNote = Boolean(task.note && task.note.trim());

              return `
                <div class="admin-task-item ${isDone ? 'completed' : ''}">
                  <div class="admin-task-left">
                    <div class="admin-check-pill ${isDone ? 'done' : 'pending'}">
                      ${isDone ? '✓' : '⏳'}
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(task.title)}</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">${escapeHtml(task.category || 'Campaign')}</span>
                        <span class="badge-tag">${escapeHtml(task.dueDay || 'Weekly')}</span>
                        ${isDone ? `
                          <span style="color: var(--mint-success); font-weight: 600;">Delivered</span>
                        ` : `
                          <span style="color: var(--amber-warning); font-weight: 600;">In Progress</span>
                        `}
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    ${(hasProof || hasNote) ? `
                      <button type="button" class="btn btn-admin-view-proof" data-proof-title="${escapeHtml(task.title)}" data-proof-note="${escapeHtml(task.note || '')}" data-proof-url="${escapeHtml(task.proofUrl || '')}">
                        <i data-lucide="${hasProof ? 'external-link' : 'file-text'}"></i> ${hasProof ? 'View Report' : 'View Note'}
                      </button>
                    ` : isDone ? `
                      <span style="font-size: 12px; color: var(--mint-success); font-weight: 600;">Delivered</span>
                    ` : `
                      <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">${escapeHtml(task.dueDay || 'In Progress')}</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. MONTHLY DELIVERABLES LIVE TRACKER -->
        <div class="hub-section-card" style="border-color: rgba(16, 185, 129, 0.4);">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="file-check" style="color: var(--mint-success);"></i>
              Monthly Deliverables Live Tracker (${monthlyStats.completed} / ${monthlyStats.total} Delivered)
            </h3>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="badge-tag" style="background: rgba(16, 185, 129, 0.12); color: var(--mint-success); border-color: rgba(16, 185, 129, 0.3); font-size: 11px;">
                Due End of Month
              </span>
              <div class="date-navigator" style="margin: 0;">
                <button type="button" class="date-nav-btn" id="btn-admin-mkt-prev-month" title="Previous Month">
                  <i data-lucide="chevron-left"></i>
                </button>
                <div class="date-display-badge" style="padding: 3px 8px;">
                  <i data-lucide="calendar" style="color: var(--mint-success);"></i>
                  <span id="admin-display-month-text">${escapeHtml(getMonthFullName(selectedMonthStr))}</span>
                </div>
                <button type="button" class="date-nav-btn" id="btn-admin-mkt-next-month" title="Next Month">
                  <i data-lucide="chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="admin-task-list">
            ${monthlyTasks.map(task => {
              const isDone = Boolean(task.completed);
              const hasProof = Boolean(task.proofUrl && task.proofUrl.trim());
              const hasNote = Boolean(task.note && task.note.trim());

              return `
                <div class="admin-task-item ${isDone ? 'completed' : ''}">
                  <div class="admin-task-left">
                    <div class="admin-check-pill ${isDone ? 'done' : 'pending'}">
                      ${isDone ? '✓' : '⏳'}
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(task.title)}</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">${escapeHtml(task.category || 'Monthly')}</span>
                        <span class="badge-tag">${formatBrandName(task.brand || 'Both')}</span>
                        <span class="badge-tag" style="background: rgba(16, 185, 129, 0.12); color: var(--mint-success); border-color: rgba(16, 185, 129, 0.25);">Monthly Routine</span>
                        ${isDone ? `
                          <span style="color: var(--mint-success); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Delivered for ${escapeHtml(getMonthFullName(selectedMonthStr))}
                          </span>
                        ` : `
                          <span style="color: var(--amber-warning); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <i data-lucide="clock" style="width: 12px; height: 12px;"></i> Due End of Month
                          </span>
                        `}
                        ${hasNote ? `
                          <span style="color: var(--teal-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                            <i data-lucide="file-text" style="width: 11px; height: 11px;"></i> Note Added
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    ${(hasProof || hasNote) ? `
                      <button type="button" class="btn btn-admin-view-proof" data-proof-title="${escapeHtml(task.title)}" data-proof-note="${escapeHtml(task.note || '')}" data-proof-url="${escapeHtml(task.proofUrl || '')}">
                        <i data-lucide="${hasProof ? 'external-link' : 'file-text'}"></i> ${hasProof ? 'View Report & Proof' : 'View Note'}
                      </button>
                    ` : isDone ? `
                      <span style="font-size: 12px; color: var(--mint-success); font-weight: 600;">Delivered</span>
                    ` : `
                      <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Awaiting Submission</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- MONTHLY PERFORMANCE REPORTS ARCHIVE -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="file-bar-chart" style="color: var(--teal-primary);"></i>
              Monthly Performance Reports for ${escapeHtml(activeEmp.name)}
            </h3>
            <button type="button" class="btn btn-secondary btn-admin-open-member-report" data-emp-email="${escapeHtml(activeEmp.email)}">
              <i data-lucide="eye"></i> Inspect Monthly Report
            </button>
          </div>
          <div class="admin-task-list">
            ${(() => {
              const savedReps = window.dataStore.getMemberReports(activeEmp.email);
              if (savedReps.length === 0) {
                return `<div style="text-align: center; padding: 18px; color: var(--text-muted); font-size: 13px;">No archived monthly reports yet for ${escapeHtml(activeEmp.name)}. Click "Inspect Monthly Report" to view live performance for any cycle.</div>`;
              }
              return savedReps.map(rep => `
                <div class="admin-task-item">
                  <div class="admin-task-left">
                    <div class="hub-tel-icon" style="background: rgba(0, 139, 165, 0.1); color: var(--teal-primary); width: 34px; height: 34px;">
                      <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(getMonthFullName(rep.month))} Performance Report</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">Archived ${formatDate(rep.generatedAt)}</span>
                        ${rep.summary ? `<span style="font-weight: 600; color: var(--text-main);">Execution: ${rep.summary.pct}%</span>` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    <button type="button" class="btn btn-secondary btn-admin-view-saved-report" data-report-month="${escapeHtml(rep.month)}" data-emp-email="${escapeHtml(activeEmp.email)}">
                      <i data-lucide="external-link"></i> View Brief
                    </button>
                  </div>
                </div>
              `).join('');
            })()}
          </div>
        </div>

        <!-- 3. INSTANT DELIVERABLES ASSIGNED BY ADMIN -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="zap" style="color: #7C3AED;"></i>
              Manager-Assigned Instant Tasks (${instantTasks.length})
            </h3>
            <button type="button" class="btn btn-primary" id="btn-admin-assign-instant-mkt">
              <i data-lucide="plus-circle"></i> + Assign Instant Task
            </button>
          </div>

          <div class="admin-task-list">
            ${instantTasks.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">
                No instant tasks assigned yet. Click "+ Assign Instant Task" to assign urgent or one-off tasks with custom deadlines.
              </div>
            ` : instantTasks.map(t => {
              const prog = window.dataStore.getTargetProgress(t.id);
              const isDone = prog.completed >= (Number(t.targetQty) || 1);
              return `
                <div class="admin-task-item" style="border-left: 4px solid ${isDone ? 'var(--mint-success)' : 'var(--amber-warning)'};">
                  <div class="admin-task-left">
                    <div class="hub-tel-icon" style="background: rgba(124, 58, 237, 0.1); color: #7C3AED; width: 34px; height: 34px;">
                      <i data-lucide="${isDone ? 'check-circle' : 'clock'}" style="width: 16px; height: 16px;"></i>
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(t.program)}</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">${formatBrandName(t.brand)}</span>
                        <span class="badge-tag">${escapeHtml(t.category || 'General')}</span>
                        <span class="badge-tag">${escapeHtml(t.format || 'Deliverable')}</span>
                        ${t.deadline ? formatDeadlineBadge(t.deadline, isDone) : ''}
                        <span style="font-weight: 600; color: var(--text-main);">Progress: ${prog.completed} / ${t.targetQty}</span>
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    <button type="button" class="btn btn-card-view-tasks" data-emp-email="marketing@nexcrest.com" data-emp-name="${escapeHtml(activeEmp.name)}" data-emp-role="marketing">
                      <i data-lucide="list-checks"></i> Manage
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  function renderAdminCreativeMemberSection(activeEmp) {
    const stats = window.dataStore.getEmployeeStats(activeEmp);
    const userTargets = (window.dataStore.getTargets() || []).filter(t => t.assignee === activeEmp.role || t.assigneeEmail === activeEmp.email);
    const userPendingSubmissions = (window.dataStore.getSubmissions({ status: 'pending' }) || []).filter(s => s.assignee === activeEmp.role || s.authorEmail === activeEmp.email);

    elements.adminMemberPersonalizedPane.innerHTML = `
      <!-- Hero Profile & Target Actions -->
      <div class="member-personalized-hero">
        <div class="hero-top-row">
          <div class="hero-profile">
            <div class="hero-profile-avatar ${escapeHtml(activeEmp.role)}">${escapeHtml(activeEmp.avatar || activeEmp.name.charAt(0))}</div>
            <div class="hero-profile-info">
              <h2>${escapeHtml(activeEmp.name)} — ${escapeHtml(activeEmp.title || 'Creative Operations')}</h2>
              <p>Monthly target quota tracking, direct review queue approvals, and individual deliverables.</p>
            </div>
          </div>

          <button type="button" class="btn btn-primary btn-admin-assign-creative" data-emp-email="${escapeHtml(activeEmp.email)}">
            <i data-lucide="plus-circle"></i> + Assign Target to ${escapeHtml(activeEmp.name)}
          </button>
        </div>

        <!-- 4-Card Telemetry Grid -->
        <div class="hub-telemetry-grid">
          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(124, 58, 237, 0.12); color: #7C3AED;">
              <i data-lucide="target"></i>
            </div>
            <div>
              <div class="hub-tel-val">${stats.totalTarget} Items</div>
              <div class="hub-tel-lbl">Monthly Target</div>
            </div>
          </div>

          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(16, 185, 129, 0.12); color: var(--mint-success);">
              <i data-lucide="check-circle"></i>
            </div>
            <div>
              <div class="hub-tel-val">${stats.totalCompleted} Approved</div>
              <div class="hub-tel-lbl">Completed (${stats.pct}%)</div>
            </div>
          </div>

          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(245, 158, 11, 0.12); color: var(--amber-warning);">
              <i data-lucide="inbox"></i>
            </div>
            <div>
              <div class="hub-tel-val">${stats.totalPending} In Review</div>
              <div class="hub-tel-lbl">Awaiting Approval</div>
            </div>
          </div>

          <div class="hub-telemetry-card">
            <div class="hub-tel-icon" style="background: rgba(0, 139, 165, 0.12); color: var(--teal-primary);">
              <i data-lucide="trending-up"></i>
            </div>
            <div>
              <div class="hub-tel-val">${stats.extraCompleted > 0 ? '+' + stats.extraCompleted + ' Extra ⚡' : stats.remainingTarget + ' Remaining'}</div>
              <div class="hub-tel-lbl">${stats.extraCompleted > 0 ? 'Over-achievement' : 'Target Remaining'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Operational Sections Grid -->
      <div class="hub-operations-grid">

        <!-- 1. PENDING REVIEWS FOR THIS MEMBER -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="inbox" style="color: var(--amber-warning);"></i>
              Pending Review Queue for ${escapeHtml(activeEmp.name)} (${userPendingSubmissions.length})
            </h3>
            <span style="font-size: 12px; color: var(--text-muted);">Inspect, approve, or request rework directly</span>
          </div>

          <div class="admin-task-list">
            ${userPendingSubmissions.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">
                No submissions currently awaiting review for ${escapeHtml(activeEmp.name)}. All submitted work is up to date.
              </div>
            ` : userPendingSubmissions.map(sub => `
              <div class="admin-task-item" style="border-left: 4px solid var(--amber-warning);">
                <div class="admin-task-left">
                  <div>
                    <div class="admin-task-title">${escapeHtml(sub.program)} - ${escapeHtml(sub.title)}</div>
                    <div class="admin-task-meta">
                      <span class="badge-tag">${formatBrandName(sub.brand)}</span>
                      <span class="badge-tag">${escapeHtml(sub.format)}</span>
                      <span style="color: var(--amber-warning); font-weight: 600;">Submitted: ${formatDate(sub.submittedAt)}</span>
                      ${sub.isExtra ? '<span class="badge-extra-work" style="font-size: 10px; padding: 1px 6px;">⭐ Extra Work</span>' : ''}
                    </div>
                  </div>
                </div>
                <div class="admin-task-actions">
                  ${sub.url ? `
                    <a href="${safeUrl(sub.url)}" target="_blank" rel="noopener noreferrer" class="btn" style="padding: 6px 10px;">
                      <i data-lucide="external-link"></i> Link
                    </a>
                  ` : ''}
                  <button type="button" class="btn btn-primary btn-open-review-modal" data-sub-id="${escapeHtml(sub.id)}">
                    <i data-lucide="check-circle-2"></i> Review & Approve
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- MONTHLY PERFORMANCE REPORTS ARCHIVE -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="file-bar-chart" style="color: var(--teal-primary);"></i>
              Monthly Performance Reports for ${escapeHtml(activeEmp.name)}
            </h3>
            <button type="button" class="btn btn-secondary btn-admin-open-member-report" data-emp-email="${escapeHtml(activeEmp.email)}">
              <i data-lucide="eye"></i> Inspect Monthly Report
            </button>
          </div>
          <div class="admin-task-list">
            ${(() => {
              const savedReps = window.dataStore.getMemberReports(activeEmp.email);
              if (savedReps.length === 0) {
                return `<div style="text-align: center; padding: 18px; color: var(--text-muted); font-size: 13px;">No archived monthly reports yet for ${escapeHtml(activeEmp.name)}. Click "Inspect Monthly Report" to view live performance for any cycle.</div>`;
              }
              return savedReps.map(rep => `
                <div class="admin-task-item">
                  <div class="admin-task-left">
                    <div class="hub-tel-icon" style="background: rgba(0, 139, 165, 0.1); color: var(--teal-primary); width: 34px; height: 34px;">
                      <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(getMonthFullName(rep.month))} Performance Report</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">Archived ${formatDate(rep.generatedAt)}</span>
                        ${rep.summary ? `<span style="font-weight: 600; color: var(--text-main);">Quota Pace: ${rep.summary.pct}%</span>` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    <button type="button" class="btn btn-secondary btn-admin-view-saved-report" data-report-month="${escapeHtml(rep.month)}" data-emp-email="${escapeHtml(activeEmp.email)}">
                      <i data-lucide="external-link"></i> View Brief
                    </button>
                  </div>
                </div>
              `).join('');
            })()}
          </div>
        </div>

        <!-- 2. ASSIGNED TARGETS -->
        <div class="hub-section-card">
          <div class="hub-section-card-header">
            <h3>
              <i data-lucide="layers" style="color: var(--teal-primary);"></i>
              Assigned Monthly Targets (${userTargets.length})
            </h3>
            <button type="button" class="btn btn-secondary btn-card-view-tasks" data-emp-email="${escapeHtml(activeEmp.email)}" data-emp-name="${escapeHtml(activeEmp.name)}" data-emp-role="${escapeHtml(activeEmp.role)}">
              <i data-lucide="list-checks"></i> Manage All Targets
            </button>
          </div>

          <div class="admin-task-list">
            ${userTargets.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">
                No targets currently assigned for this member. Click "+ Assign Target" above to assign monthly deliverables.
              </div>
            ` : userTargets.map(t => {
              const prog = window.dataStore.getTargetProgress(t.id);
              const isDone = prog.completed >= (Number(t.targetQty) || 1);

              return `
                <div class="admin-task-item ${isDone ? 'completed' : ''}">
                  <div class="admin-task-left">
                    <div class="admin-check-pill ${isDone ? 'done' : 'pending'}">
                      ${isDone ? '✓' : '🎯'}
                    </div>
                    <div>
                      <div class="admin-task-title">${escapeHtml(t.program)}</div>
                      <div class="admin-task-meta">
                        <span class="badge-tag">${formatBrandName(t.brand)}</span>
                        <span class="badge-tag">${escapeHtml(t.category)}</span>
                        <span class="badge-tag">${escapeHtml(t.format)}</span>
                        ${t.deadline ? formatDeadlineBadge(t.deadline, isDone) : ''}
                        <span style="font-weight: 600; color: var(--text-main);">Progress: ${prog.completed} / ${t.targetQty} (${prog.pct}%)</span>
                      </div>
                    </div>
                  </div>
                  <div class="admin-task-actions">
                    <button type="button" class="btn btn-action-edit" data-id="${escapeHtml(t.id)}" title="Edit Target">
                      <i data-lucide="edit-3"></i> Edit
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // MEMBER MONTHLY PERFORMANCE REPORT & ARCHIVE CONTROLLERS
  // =========================================================================
  function getMonthFullName(ym) {
    const monthFull = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (!ym) return 'Current Month';
    const parts = ym.split('-');
    if (parts.length < 2) return ym;
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${monthFull[mIdx] || parts[1]} ${parts[0]}`;
  }

  function openMemberReportModal(preselectedMonth = null, targetUser = null) {
    state.memberReportActiveUser = targetUser || state.user;
    if (!state.memberReportActiveUser) return;

    const defaultMonth = window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    state.memberReportSelectedMonth = preselectedMonth || state.memberReportSelectedMonth || defaultMonth;

    renderMemberReportModal();

    if (elements.memberMonthlyReportModal) {
      elements.memberMonthlyReportModal.classList.remove('hidden');
    }
    refreshIcons();
  }

  function closeMemberReportModal() {
    if (elements.memberMonthlyReportModal) {
      elements.memberMonthlyReportModal.classList.add('hidden');
    }
  }

  function renderMemberReportModal() {
    const user = state.memberReportActiveUser || state.user;
    if (!user) return;

    const selectedMonth = state.memberReportSelectedMonth || window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const monthName = getMonthFullName(selectedMonth);

    // Update Quick Buttons and Select
    if (elements.reportCycleQuickBtns) {
      elements.reportCycleQuickBtns.querySelectorAll('.cycle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.reportMonth === selectedMonth);
      });
    }
    if (elements.reportMonthSelect) {
      elements.reportMonthSelect.value = selectedMonth;
    }

    // Populate Document Header & Meta
    if (elements.docMonthBadge) {
      elements.docMonthBadge.textContent = `${monthName} Cycle`;
    }
    if (elements.docGeneratedTime) {
      const now = new Date();
      elements.docGeneratedTime.textContent = `Generated ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (elements.docMemberName) {
      elements.docMemberName.textContent = user.name || 'Team Member';
    }
    if (elements.docMemberRole) {
      elements.docMemberRole.textContent = user.title || (user.role ? user.role.toUpperCase() : 'Team Member');
    }
    if (elements.docMemberBrand) {
      elements.docMemberBrand.textContent = formatBrandName(user.brand || 'Both');
    }
    if (elements.docMemberPeriod) {
      elements.docMemberPeriod.textContent = monthName;
    }

    // Fetch month's aggregated data
    const data = window.dataStore.getMemberMonthlyData(user, selectedMonth);
    if (!data) return;

    // Render Role-Adaptive KPI Cards
    if (elements.reportKpiContainer) {
      if (data.isMarketing) {
        elements.reportKpiContainer.innerHTML = `
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(0, 139, 165, 0.12); color: var(--teal-primary);">
              <i data-lucide="check-circle-2"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.dailyCompleted} / ${data.dailyTotal}</div>
              <div class="report-kpi-lbl">Daily Routines (${data.pct}%)</div>
            </div>
          </div>
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(56, 189, 248, 0.12); color: #0284C7;">
              <i data-lucide="calendar"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.weeklyCompleted} Delivered</div>
              <div class="report-kpi-lbl">Weekly Campaigns</div>
            </div>
          </div>
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(124, 58, 237, 0.12); color: #7C3AED;">
              <i data-lucide="zap"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.targets.length} Assigned</div>
              <div class="report-kpi-lbl">Instant Deliverables</div>
            </div>
          </div>
        `;
      } else {
        elements.reportKpiContainer.innerHTML = `
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(124, 58, 237, 0.12); color: #7C3AED;">
              <i data-lucide="target"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.totalTarget} Items</div>
              <div class="report-kpi-lbl">Monthly Quota</div>
            </div>
          </div>
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(16, 185, 129, 0.12); color: var(--mint-success);">
              <i data-lucide="check-circle"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.totalCompleted} Approved</div>
              <div class="report-kpi-lbl">Completed (${data.pct}%)</div>
            </div>
          </div>
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(245, 158, 11, 0.12); color: var(--amber-warning);">
              <i data-lucide="inbox"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.totalPending} Pending</div>
              <div class="report-kpi-lbl">In Review</div>
            </div>
          </div>
          <div class="report-kpi-card">
            <div class="report-kpi-icon" style="background: rgba(0, 139, 165, 0.12); color: var(--teal-primary);">
              <i data-lucide="trending-up"></i>
            </div>
            <div>
              <div class="report-kpi-val">${data.extraCompleted > 0 ? '+' + data.extraCompleted + ' Extra ⚡' : '0 Extra'}</div>
              <div class="report-kpi-lbl">Over-achievement</div>
            </div>
          </div>
        `;
      }
    }

    // Render Deliverables Table
    if (elements.reportTableBody) {
      if (data.isMarketing) {
        const instantRows = data.targets.map(t => {
          const prog = window.dataStore.getTargetProgress(t.id);
          const isDone = prog.completed >= (Number(t.targetQty) || 1);
          return `
            <tr>
              <td><strong>${escapeHtml(t.program)}</strong> ${t.isExtra ? '<span class="badge-extra-work" style="font-size: 10px; padding: 1px 5px;">⭐ Extra</span>' : ''}</td>
              <td><span style="font-size: 11px; padding: 2px 6px; background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: 4px;">${escapeHtml(t.format || 'Deliverable')}</span></td>
              <td>${formatBrandName(t.brand)}</td>
              <td>${t.targetQty}</td>
              <td><strong style="color: var(--mint-success);">${prog.completed}</strong></td>
              <td>
                <span class="badge-status ${isDone ? 'approved' : 'pending'}">
                  <i data-lucide="${isDone ? 'check' : 'clock'}" style="width: 11px; height: 11px;"></i>
                  ${isDone ? 'Delivered' : 'Pending'}
                </span>
              </td>
              <td>-</td>
            </tr>
          `;
        });

        const dailySummaryRow = `
          <tr>
            <td><strong>Daily Repetitive Routines</strong> (IT & Techschool, Lead Ops, Reviews, Learning)</td>
            <td><span style="font-size: 11px; padding: 2px 6px; background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: 4px;">Daily Cadence</span></td>
            <td>Both</td>
            <td>${data.dailyTotal}</td>
            <td><strong style="color: var(--mint-success);">${data.dailyCompleted}</strong></td>
            <td>
              <span class="badge-status ${data.dailyCompleted > 0 ? 'approved' : 'pending'}">
                <i data-lucide="${data.dailyCompleted > 0 ? 'check' : 'clock'}" style="width: 11px; height: 11px;"></i>
                ${data.dailyCompleted > 0 ? 'Active' : 'Pending'}
              </span>
            </td>
            <td><span style="font-size: 11px; color: var(--text-dim);">Daily Log</span></td>
          </tr>
        `;

        const weeklySummaryRow = `
          <tr>
            <td><strong>Weekly Campaign Reports & Life at Nexcrest Reels</strong></td>
            <td><span style="font-size: 11px; padding: 2px 6px; background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: 4px;">Weekly Cadence</span></td>
            <td>Both</td>
            <td>${data.weeklyTotal}</td>
            <td><strong style="color: var(--mint-success);">${data.weeklyCompleted}</strong></td>
            <td>
              <span class="badge-status ${data.weeklyCompleted > 0 ? 'approved' : 'pending'}">
                <i data-lucide="${data.weeklyCompleted > 0 ? 'check' : 'clock'}" style="width: 11px; height: 11px;"></i>
                ${data.weeklyCompleted > 0 ? 'Active' : 'Pending'}
              </span>
            </td>
            <td><span style="font-size: 11px; color: var(--text-dim);">Weekly Archive</span></td>
          </tr>
        `;

        elements.reportTableBody.innerHTML = [dailySummaryRow, weeklySummaryRow, ...instantRows].join('');
      } else {
        if (data.targets.length === 0 && data.submissions.length === 0) {
          elements.reportTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 18px;">No deliverables recorded for ${escapeHtml(monthName)}.</td></tr>`;
        } else {
          const targetRows = data.targets.map(t => {
            const prog = window.dataStore.getTargetProgress(t.id);
            const isDone = prog.completed >= (Number(t.targetQty) || 1);
            const subMatch = data.submissions.find(s => String(s.targetId) === String(t.id));

            return `
              <tr>
                <td><strong>${escapeHtml(t.program)}</strong> ${t.isExtra ? '<span class="badge-extra-work" style="font-size: 10px; padding: 1px 5px;">⭐ Extra</span>' : ''}</td>
                <td><span style="font-size: 11px; padding: 2px 6px; background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: 4px;">${escapeHtml(t.format)}</span></td>
                <td>${formatBrandName(t.brand)}</td>
                <td>${t.targetQty}</td>
                <td><strong style="color: var(--mint-success);">${prog.completed}</strong></td>
                <td>
                  <span class="badge-status ${isDone ? 'approved' : prog.pending > 0 ? 'pending' : 'pending'}">
                    <i data-lucide="${isDone ? 'check' : 'clock'}" style="width: 11px; height: 11px;"></i>
                    ${isDone ? 'Approved' : prog.pending > 0 ? 'In Review' : 'Pending'}
                  </span>
                </td>
                <td>
                  ${subMatch && subMatch.url ? `<a href="${safeUrl(subMatch.url)}" target="_blank" rel="noopener noreferrer" style="color: var(--teal-primary); text-decoration: none; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="external-link" style="width: 12px; height: 12px;"></i> View Asset</a>` : '-'}
                </td>
              </tr>
            `;
          });

          const standaloneExtraRows = data.submissions.filter(s => s.isExtra && (!s.targetId || s.targetId === 'unassigned')).map(s => `
            <tr>
              <td><strong>${escapeHtml(s.program || s.title)}</strong> <span class="badge-extra-work" style="font-size: 10px; padding: 1px 5px;">⭐ Extra Work</span></td>
              <td><span style="font-size: 11px; padding: 2px 6px; background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: 4px;">${escapeHtml(s.format || 'Deliverable')}</span></td>
              <td>${formatBrandName(s.brand)}</td>
              <td>0</td>
              <td><strong style="color: var(--mint-success);">1</strong></td>
              <td>
                <span class="badge-status ${s.status === 'approved' ? 'approved' : 'pending'}">
                  <i data-lucide="${s.status === 'approved' ? 'check' : 'clock'}" style="width: 11px; height: 11px;"></i>
                  ${s.status === 'approved' ? 'Approved' : 'In Review'}
                </span>
              </td>
              <td>
                ${s.url ? `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer" style="color: var(--teal-primary); text-decoration: none; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="external-link" style="width: 12px; height: 12px;"></i> View Asset</a>` : '-'}
              </td>
            </tr>
          `);

          elements.reportTableBody.innerHTML = [...targetRows, ...standaloneExtraRows].join('');
        }
      }
    }

    // Check for saved highlights
    const savedReports = window.dataStore.getMemberReports(user.email, selectedMonth);
    if (savedReports.length > 0 && savedReports[0].highlights) {
      if (elements.reportHighlightsText) {
        elements.reportHighlightsText.value = savedReports[0].highlights;
      }
    } else {
      autoGenerateReportHighlights(false);
    }

    refreshIcons();
  }

  function autoGenerateReportHighlights(showToastNotice = true) {
    const user = state.memberReportActiveUser || state.user;
    if (!user) return;
    const selectedMonth = state.memberReportSelectedMonth || window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const monthName = getMonthFullName(selectedMonth);
    const data = window.dataStore.getMemberMonthlyData(user, selectedMonth);
    if (!data) return;

    let text = '';
    if (data.isMarketing) {
      text = `• Successfully executed daily repetitive routines with ${data.pct}% on-time consistency for ${monthName}.\n• Completed all monthly and weekly institutional reviews with zero lead assignment backlog.\n• Completed all weekly management reviews and brand reputation milestones for IT & Techschool.`;
    } else {
      text = `• Successfully completed ${data.totalCompleted} deliverables out of ${data.totalTarget} monthly quota for ${monthName} (${data.pct}% pacing).\n• ${data.extraCompleted > 0 ? `Over-achieved department target with +${data.extraCompleted} extra self-initiated deliverables.` : `Delivered all marketing and brand launch collaterals within schedule.`}\n• Maintained 100% brand consistency across Techschool and IT programs.`;
    }

    if (elements.reportHighlightsText) {
      elements.reportHighlightsText.value = text;
    }
    if (showToastNotice) {
      showToast('✨ Auto-generated summary based on monthly metrics!', 'info');
    }
  }

  function copyReportBriefing() {
    const user = state.memberReportActiveUser || state.user;
    if (!user) return;
    const selectedMonth = state.memberReportSelectedMonth || window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const monthName = getMonthFullName(selectedMonth);
    const data = window.dataStore.getMemberMonthlyData(user, selectedMonth);
    const highlights = elements.reportHighlightsText ? elements.reportHighlightsText.value.trim() : '';

    let text = '';
    if (data && data.isMarketing) {
      text = `📊 *Nexcrest Insights - Monthly Performance Brief*\n👤 *Member:* ${user.name} (${user.title || user.role})\n📅 *Period:* ${monthName}\n⚡ *Daily Routines:* ${data.dailyCompleted} / ${data.dailyTotal} (${data.pct}%)\n\n*Key Highlights:*\n${highlights}`;
    } else if (data) {
      text = `📊 *Nexcrest Insights - Monthly Performance Brief*\n👤 *Member:* ${user.name} (${user.title || user.role})\n📅 *Period:* ${monthName}\n🎯 *Target:* ${data.totalTarget} | *Approved:* ${data.totalCompleted} (${data.pct}%)\n⭐ *Extra Work:* ${data.extraCompleted > 0 ? '+' + data.extraCompleted : '0'}\n\n*Key Highlights:*\n${highlights}`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Executive briefing copied to clipboard!', 'success');
    }).catch(() => {
      showToast('📋 Briefing ready to copy.', 'info');
    });
  }

  function exportMemberReportCSV() {
    const user = state.memberReportActiveUser || state.user;
    if (!user) return;
    const selectedMonth = state.memberReportSelectedMonth || window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const data = window.dataStore.getMemberMonthlyData(user, selectedMonth);
    if (!data) return;

    const headers = ["Month", "Member Name", "Role", "Program / Task", "Format", "Brand", "Target", "Completed", "Status", "Proof URL"];
    const rows = (data.targets || []).map(t => {
      const prog = window.dataStore.getTargetProgress(t.id);
      const isDone = prog.completed >= (Number(t.targetQty) || 1);
      const sub = (data.submissions || []).find(s => String(s.targetId) === String(t.id));
      return [
        selectedMonth,
        user.name,
        user.title || user.role,
        t.program,
        t.format,
        formatBrandName(t.brand),
        t.targetQty,
        prog.completed,
        isDone ? 'Approved' : 'Pending',
        sub ? sub.url : ''
      ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
    });

    const csv = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexcrest_Report_${user.name.replace(/\s+/g, '_')}_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`📊 Downloaded CSV Report for ${selectedMonth}!`, 'success');
  }

  function saveMemberReport() {
    const user = state.memberReportActiveUser || state.user;
    if (!user) return;
    const selectedMonth = state.memberReportSelectedMonth || window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const data = window.dataStore.getMemberMonthlyData(user, selectedMonth);
    const highlights = elements.reportHighlightsText ? elements.reportHighlightsText.value.trim() : '';

    const reportObj = {
      id: `report-${user.role || 'member'}-${selectedMonth}`,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      userTitle: user.title,
      brand: user.brand || 'Both',
      month: selectedMonth,
      generatedAt: new Date().toISOString(),
      highlights,
      summary: data
    };

    window.dataStore.saveMemberReport(reportObj);
    showToast(`💾 Saved official performance report for ${getMonthFullName(selectedMonth)} to company archives!`, 'success');
    if (state.activeManagerTab === 'member-hub') {
      renderAdminMemberHub();
    }
    setTimeout(closeMemberReportModal, 900);
  }

  function printMemberReport() {
    window.print();
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
      if (titleEl) titleEl.textContent = 'Marketing Workspace';
      if (subtitleEl) subtitleEl.textContent = 'Daily routines, weekly targets, and instant tasks.';
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

    const activeMonth = (window.dataStore && typeof window.dataStore.getActiveMonth === 'function') ? window.dataStore.getActiveMonth() : ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const curMonth = (typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11';
    const isCur = activeMonth === curMonth;
    const memberCycleText = document.getElementById('member-cycle-text');
    if (memberCycleText) {
      memberCycleText.textContent = `${getMonthFullName(activeMonth)} Cycle${isCur ? ' (Current)' : ''}`;
    }

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
                ${resolveTargetFormat(target) ? `<span class="badge-format">${escapeHtml(resolveTargetFormat(target))}</span>` : ''}
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

    const weeklyTasks = window.dataStore.getMarketingWeeklyTasks(weekStr);
    const weeklyStats = window.dataStore.getMarketingWeeklyStats(weekStr);

    const activeMonth = (window.dataStore && typeof window.dataStore.getActiveMonth === 'function') ? window.dataStore.getActiveMonth() : ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
    const monthlyTasks = window.dataStore.getMarketingMonthlyTasks(activeMonth);
    const monthlyStats = window.dataStore.getMarketingMonthlyStats(activeMonth);

    const instantTasks = window.dataStore.getMarketingInstantTasks(user);

    // Update Radar Cards
    const dailyRadarText = document.getElementById('mkt-radar-daily-text');
    const dailyRadarBar = document.getElementById('mkt-radar-daily-bar');
    if (dailyRadarText) dailyRadarText.textContent = `${dailyStats.completed} / ${dailyStats.total} Done`;
    if (dailyRadarBar) dailyRadarBar.style.width = `${dailyStats.pct}%`;

    const weeklyRadarText = document.getElementById('mkt-radar-weekly-text');
    if (weeklyRadarText) weeklyRadarText.textContent = `${weeklyStats.completed} / ${weeklyStats.total} Delivered`;

    const monthlyRadarText = document.getElementById('mkt-radar-monthly-text');
    const monthlyRadarBar = document.getElementById('mkt-radar-monthly-bar');
    if (monthlyRadarText) monthlyRadarText.textContent = `${monthlyStats.completed} / ${monthlyStats.total} Done`;
    if (monthlyRadarBar) monthlyRadarBar.style.width = `${monthlyStats.pct}%`;

    const instantRadarText = document.getElementById('mkt-radar-instant-text');
    if (instantRadarText) instantRadarText.textContent = `${instantTasks.length} Active`;

    // Badges in Tabs
    const badgeDaily = document.getElementById('mkt-badge-daily');
    const badgeWeekly = document.getElementById('mkt-badge-weekly');
    const badgeMonthly = document.getElementById('mkt-badge-monthly');
    const badgeInstant = document.getElementById('mkt-badge-instant');
    if (badgeDaily) badgeDaily.textContent = dailyTasks.length;
    if (badgeWeekly) badgeWeekly.textContent = weeklyTasks.length;
    if (badgeMonthly) badgeMonthly.textContent = monthlyTasks.length;
    if (badgeInstant) badgeInstant.textContent = instantTasks.length;

    // Active Tab Switching State
    const tabBtns = elements.memberMarketingWorkspace.querySelectorAll('.mkt-cadence-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mktTab === state.mktActiveTab);
    });

    const tabDaily = document.getElementById('mkt-tab-content-daily');
    const tabWeekly = document.getElementById('mkt-tab-content-weekly');
    const tabMonthly = document.getElementById('mkt-tab-content-monthly');
    const tabInstant = document.getElementById('mkt-tab-content-instant');
    if (tabDaily) tabDaily.classList.toggle('hidden', state.mktActiveTab !== 'daily');
    if (tabWeekly) tabWeekly.classList.toggle('hidden', state.mktActiveTab !== 'weekly');
    if (tabMonthly) tabMonthly.classList.toggle('hidden', state.mktActiveTab !== 'monthly');
    if (tabInstant) tabInstant.classList.toggle('hidden', state.mktActiveTab !== 'instant');

    // Date / Cadence Labels
    const dailyDateLabel = document.getElementById('mkt-daily-date-label');
    if (dailyDateLabel) {
      const todayFormatted = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
      dailyDateLabel.innerHTML = `Today: <strong>${todayFormatted}</strong>`;
    }

    const weeklyCadenceLabel = document.getElementById('mkt-weekly-cadence-label');
    if (weeklyCadenceLabel) {
      weeklyCadenceLabel.innerHTML = `Week: <strong>${weekStr}</strong>`;
    }

    const monthlyCadenceLabel = document.getElementById('mkt-monthly-cadence-label');
    if (monthlyCadenceLabel) {
      monthlyCadenceLabel.innerHTML = `Month: <strong>${escapeHtml(getMonthFullName(activeMonth))}</strong>`;
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
              <div class="mkt-checkbox-wrap ${isDone ? 'checked' : ''}" data-action="toggle-daily" data-task-id="${task.id}" title="${isDone ? 'Mark pending' : 'Mark done'}">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i>
              </div>
              <div class="mkt-task-details">
                <div class="mkt-task-title">${escapeHtml(task.title)}</div>
                <div class="mkt-task-meta">
                  <span class="badge-category">${escapeHtml(task.category)}</span>
                  <span class="badge-brand ${escapeHtml(task.brand)}">${formatBrandName(task.brand)}</span>
                  ${isDone
                    ? `<span style="color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Done ${timeStr}</span>`
                    : '<span style="color: #D97706; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> Pending</span>'
                  }
                  ${hasNote ? '<span style="color: #008BA5; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="file-text" style="width: 11px; height: 11px;"></i> Note</span>' : ''}
                </div>
              </div>
            </div>
            <div class="mkt-task-right">
              <button type="button" class="btn btn-outline-sm btn-open-routine-note" data-task-id="${task.id}" data-task-type="daily" data-task-title="${escapeHtml(task.title)}" style="font-size: 11.5px; padding: 5px 10px; gap: 4px; font-weight: 600; border-radius: 7px;">
                <i data-lucide="${hasNote ? 'file-text' : 'plus'}"></i> ${hasNote ? 'Note' : '+ Note'}
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
              <div class="mkt-checkbox-wrap ${isDone ? 'checked' : ''}" data-action="toggle-weekly" data-task-id="${task.id}" title="${isDone ? 'Mark in-progress' : 'Mark delivered'}">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i>
              </div>
              <div class="mkt-task-details">
                <div class="mkt-task-title">${escapeHtml(task.title)}</div>
                <div class="mkt-task-meta">
                  <span class="badge-category">${escapeHtml(task.category)}</span>
                  <span class="badge-format" style="color: #6D28D9; border-color: #DDD6FE; background: #F5F3FF;">${escapeHtml(task.dueDay || 'Weekly')}</span>
                  ${isDone
                    ? '<span style="color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Delivered</span>'
                    : '<span style="color: #D97706; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> In Progress</span>'
                  }
                  ${hasNote ? '<span style="color: #008BA5; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="link" style="width: 11px; height: 11px;"></i> Proof</span>' : ''}
                </div>
              </div>
            </div>
            <div class="mkt-task-right">
              <button type="button" class="btn btn-outline-sm btn-open-routine-note" data-task-id="${task.id}" data-task-type="weekly" data-task-title="${escapeHtml(task.title)}" style="font-size: 11.5px; padding: 5px 10px; gap: 4px; font-weight: 600; border-radius: 7px;">
                <i data-lucide="${hasNote ? 'link' : 'upload-cloud'}"></i> ${hasNote ? 'Proof' : '+ Proof'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render TAB 3: MONTHLY TASKS
    const monthlyListEl = document.getElementById('mkt-monthly-tasks-list');
    if (monthlyListEl) {
      monthlyListEl.innerHTML = monthlyTasks.map(task => {
        const isDone = task.completed;
        const timeStr = task.completedAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(task.completedAt)) : '';
        const hasNote = Boolean(task.note || task.proofUrl);

        return `
          <div class="mkt-task-item ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="mkt-task-left">
              <div class="mkt-checkbox-wrap ${isDone ? 'checked' : ''}" data-action="toggle-monthly" data-task-id="${task.id}" title="${isDone ? 'Mark in-progress' : 'Mark delivered'}">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i>
              </div>
              <div class="mkt-task-details">
                <div class="mkt-task-title">${escapeHtml(task.title)}</div>
                <div class="mkt-task-meta">
                  <span class="badge-category">${escapeHtml(task.category)}</span>
                  <span class="badge-brand ${escapeHtml(task.brand)}">${formatBrandName(task.brand)}</span>
                  <span class="badge-format" style="color: #065F46; border-color: #A7F3D0; background: #ECFDF5;">Monthly Routine</span>
                  ${isDone
                    ? `<span style="color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Delivered ${timeStr ? '(' + timeStr + ')' : ''}</span>`
                    : '<span style="color: #D97706; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> Due End of Month</span>'
                  }
                  ${hasNote ? '<span style="color: #008BA5; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="link" style="width: 11px; height: 11px;"></i> Proof / Note</span>' : ''}
                </div>
              </div>
            </div>
            <div class="mkt-task-right">
              <button type="button" class="btn btn-outline-sm btn-open-routine-note" data-task-id="${task.id}" data-task-type="monthly" data-task-title="${escapeHtml(task.title)}" style="font-size: 11.5px; padding: 5px 10px; gap: 4px; font-weight: 600; border-radius: 7px;">
                <i data-lucide="${hasNote ? 'file-text' : 'plus'}"></i> ${hasNote ? 'Report & Proof' : '+ Report & Proof'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render TAB 4: INSTANT TASKS (WITH DEADLINE OPTION)
    const instantGridEl = document.getElementById('mkt-instant-tasks-grid');
    if (instantGridEl) {
      if (instantTasks.length === 0) {
        instantGridEl.innerHTML = `
          <div class="deliverables-section-empty" style="grid-column: 1 / -1; padding: 32px 18px; text-align: center; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 14px;">
            <i data-lucide="zap-off" style="width: 32px; height: 32px; color: #94A3B8; margin-bottom: 8px;"></i>
            <h4 style="font-family: var(--font-heading); color: #0F172A; font-size: 15px; margin-bottom: 4px; font-weight: 700;">No Instant Tasks</h4>
            <p style="font-size: 13px; color: #64748B; margin-bottom: 12px;">No manager-assigned instant deliverables right now.</p>
            <button type="button" class="btn btn-primary btn-sm btn-open-log-modal" data-mode="extra" style="font-weight: 600;">
              <i data-lucide="plus-circle"></i> + Log Work
            </button>
          </div>
        `;
      } else {
        instantGridEl.innerHTML = instantTasks.map(target => {
          const prog = window.dataStore.getTargetProgress(target.id);
          const isDone = prog.completed >= (Number(target.targetQty) || 1);

          let deadlineBanner = '';
          if (target.deadline) {
            const parsed = parseDeadline(target.deadline);
            if (parsed) {
              const now = new Date();
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const dueStart = new Date(parsed.year, parsed.month, parsed.day);
              const diffMs = dueStart - todayStart;
              const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
              const timeStr = parsed.hasTime ? ` at ${formatTime12h(parsed.hours, parsed.minutes)}` : '';
              const timeShort = parsed.hasTime ? ` (${formatTime12h(parsed.hours, parsed.minutes)})` : '';

              if (isDone) {
                deadlineBanner = `<div class="mkt-instant-deadline-banner completed"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="check-circle" style="width:13px;height:13px;"></i> Delivered</span></div>`;
              } else if (diffDays < 0 || (diffDays === 0 && parsed.hasTime && now > parsed.dateObj)) {
                deadlineBanner = `<div class="mkt-instant-deadline-banner overdue"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="alert-circle" style="width:13px;height:13px;"></i> Overdue${timeShort}</span><span>Action Required</span></div>`;
              } else if (diffDays === 0) {
                deadlineBanner = `<div class="mkt-instant-deadline-banner due-today"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="clock" style="width:13px;height:13px;"></i> Due Today${timeStr}</span><span>Urgent</span></div>`;
              } else if (diffDays === 1) {
                deadlineBanner = `<div class="mkt-instant-deadline-banner due-tomorrow"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i> Due Tomorrow${timeStr}</span><span>Priority</span></div>`;
              } else {
                deadlineBanner = `<div class="mkt-instant-deadline-banner upcoming"><span style="display:flex;align-items:center;gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i> Due in ${diffDays}d${timeStr}</span><span>Scheduled</span></div>`;
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
                    ${resolveTargetFormat(target) ? `<span class="badge-format">${escapeHtml(resolveTargetFormat(target))}</span>` : ''}
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
                    : `<button type="button" class="btn btn-primary btn-sm btn-block btn-open-log-modal" data-target-id="${target.id}"><i data-lucide="upload-cloud"></i> Submit Deliverable</button>`
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
    } else if (taskType === 'monthly') {
      const activeMonth = (window.dataStore && typeof window.dataStore.getActiveMonth === 'function') ? window.dataStore.getActiveMonth() : ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
      const tasks = window.dataStore.getMarketingMonthlyTasks(activeMonth);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        existingNote = task.note || '';
        existingProof = task.proofUrl || '';
      }
      if (elements.routineModalTitle) {
        elements.routineModalTitle.innerHTML = `<i data-lucide="file-check"></i> Monthly Report & Proof`;
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
        elements.routineModalTitle.innerHTML = `<i data-lucide="upload-cloud"></i> Weekly Report & Proof`;
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
    const activeMonth = window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
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
  const memberCycleBadge = document.getElementById('member-cycle-badge');
  if (memberCycleBadge) {
    memberCycleBadge.addEventListener('click', openHistoricalCalendarModal);
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

  // Monthly Report Cycle Select Dropdown
  if (elements.reportMonthSelect) {
    elements.reportMonthSelect.addEventListener('change', (e) => {
      state.memberReportSelectedMonth = e.target.value;
      renderMemberReportModal();
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
    if (elements.targetDeadlineTime) elements.targetDeadlineTime.value = '';
    if (elements.targetDeadlineTimeGroup) elements.targetDeadlineTimeGroup.classList.add('hidden');
    if (elements.targetDeadlineTimePresets) {
      elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(b => b.classList.remove('active'));
    }
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
      format: (() => {
        if (elements.targetFormat && elements.targetFormat.value.trim()) {
          const val = elements.targetFormat.value.trim();
          if (!['techschool', 'it', 'both'].includes(val.toLowerCase())) {
            return val;
          }
        }
        const prog = elements.targetProgram.value.trim().toLowerCase();
        if (prog.includes('reel') || prog.includes('short') || prog.includes('clip')) return 'Reel';
        if (prog.includes('carousel') || prog.includes('carousal')) return 'Carousel';
        if (prog.includes('video') || prog.includes('aftermovie') || prog.includes('podcast')) return 'Video';
        if (prog.includes('poster') || prog.includes('banner') || prog.includes('flyer')) return 'Poster';
        if (prog.includes('story')) return 'Story';
        return 'Reel';
      })(),
      program: elements.targetProgram.value.trim(),
      targetQty: parseInt(elements.targetQty.value, 10) || 1,
      deadline: (() => {
        if (!elements.targetDeadline || !elements.targetDeadline.value) return '';
        const d = elements.targetDeadline.value.trim();
        const t = (elements.targetDeadlineTime && elements.targetDeadlineTime.value) ? elements.targetDeadlineTime.value.trim() : '';
        return t ? `${d}T${t}` : d;
      })(),
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
        deadline: (() => {
          if (!extraDeadline) return '';
          const t = (elements.logExtraDeadlineTime && elements.logExtraDeadlineTime.value) ? elements.logExtraDeadlineTime.value.trim() : '';
          return t ? `${extraDeadline}T${t}` : extraDeadline;
        })(),
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

    // Toggle Business Days (Mon-Sat) vs Calendar Days
    const toggleWorkdaysBtn = e.target.closest('#btn-toggle-workdays-mode');
    if (toggleWorkdaysBtn) {
      state.pacingMode = state.pacingMode === 'working' ? 'calendar' : 'working';
      renderOverviewDashboard();
      showToast(state.pacingMode === 'working' ? '💼 Mon-Sat Working Days Pacing activated' : '📅 Calendar Days Pacing activated', 'info');
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

    // Inspect Member in Hub (from Roster or anywhere)
    const inspectHubBtn = e.target.closest('.btn-card-inspect-hub');
    if (inspectHubBtn) {
      const email = inspectHubBtn.dataset.empEmail;
      if (email) state.activeAdminMemberEmail = email;
      state.activeManagerTab = 'member-hub';
      elements.managerTabBtns.forEach(b => {
        if (b.dataset.managerTab === 'member-hub') b.classList.add('active');
        else b.classList.remove('active');
      });
      renderManagerActiveTab();
      return;
    }

    // Admin Marketing Hub Date Navigator
    const prevDateBtn = e.target.closest('#btn-admin-mkt-prev');
    if (prevDateBtn) {
      adminMktShiftDate(-1);
      return;
    }
    const nextDateBtn = e.target.closest('#btn-admin-mkt-next');
    if (nextDateBtn) {
      adminMktShiftDate(1);
      return;
    }
    const jumpTodayBtn = e.target.closest('#btn-admin-mkt-today');
    if (jumpTodayBtn) {
      adminMktJumpToday();
      return;
    }

    // Admin Marketing Hub Month Navigator
    const prevMonthBtn = e.target.closest('#btn-admin-mkt-prev-month');
    if (prevMonthBtn) {
      adminMktShiftMonth(-1);
      return;
    }
    const nextMonthBtn = e.target.closest('#btn-admin-mkt-next-month');
    if (nextMonthBtn) {
      adminMktShiftMonth(1);
      return;
    }

    // Admin Routine Proof & Note View
    const viewProofBtn = e.target.closest('.btn-admin-view-proof');
    if (viewProofBtn) {
      const title = viewProofBtn.dataset.proofTitle || 'Task Proof';
      const note = viewProofBtn.dataset.proofNote || '';
      const url = viewProofBtn.dataset.proofUrl || '';
      openAdminRoutineProofModal(title, note, url);
      return;
    }

    // Admin Hub Assign Instant Task (Marketing)
    const assignInstantMktBtn = e.target.closest('#btn-admin-assign-instant-mkt');
    if (assignInstantMktBtn) {
      openAssignTargetModal('marketing@nexcrest.com');
      return;
    }

    // Admin Hub Assign Creative Target
    const assignCreativeBtn = e.target.closest('.btn-admin-assign-creative');
    if (assignCreativeBtn) {
      const email = assignCreativeBtn.dataset.empEmail;
      openAssignTargetModal(email);
      return;
    }

    // Open Member Monthly Report Modal
    if (e.target.closest('#btn-member-report') || e.target.closest('#btn-mkt-open-report')) {
      openMemberReportModal();
      return;
    }

    // Admin Inspect Member Report from Hub
    const adminInspectReportBtn = e.target.closest('.btn-admin-open-member-report');
    if (adminInspectReportBtn) {
      const email = adminInspectReportBtn.dataset.empEmail;
      const targetUser = window.authService.getUserByEmail(email);
      openMemberReportModal(null, targetUser);
      return;
    }

    // Admin View Saved Archived Report from Hub
    const adminViewSavedBtn = e.target.closest('.btn-admin-view-saved-report');
    if (adminViewSavedBtn) {
      const email = adminViewSavedBtn.dataset.empEmail;
      const month = adminViewSavedBtn.dataset.reportMonth;
      const targetUser = window.authService.getUserByEmail(email);
      openMemberReportModal(month, targetUser);
      return;
    }

    // Cycle quick buttons in Report modal
    const cycleBtn = e.target.closest('.cycle-btn[data-report-month]');
    if (cycleBtn) {
      const m = cycleBtn.dataset.reportMonth;
      state.memberReportSelectedMonth = m;
      renderMemberReportModal();
      return;
    }

    // Report Modal Actions
    if (e.target.closest('#btn-report-auto-highlights')) {
      autoGenerateReportHighlights(true);
      return;
    }
    if (e.target.closest('#btn-report-copy-briefing')) {
      copyReportBriefing();
      return;
    }
    if (e.target.closest('#btn-report-export-csv')) {
      exportMemberReportCSV();
      return;
    }
    if (e.target.closest('#btn-report-print')) {
      printMemberReport();
      return;
    }
    if (e.target.closest('#btn-report-save')) {
      saveMemberReport();
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
        if (elements.targetFormat) elements.targetFormat.value = resolveTargetFormat(target) || 'Reel';
        elements.targetProgram.value = target.program;
        elements.targetQty.value = target.targetQty;
        if (elements.targetDeadline) {
          if (target.deadline && target.deadline.includes('T')) {
            const [dPart, tPart] = target.deadline.split('T');
            elements.targetDeadline.value = dPart;
            if (elements.targetDeadlineTime) elements.targetDeadlineTime.value = tPart.slice(0, 5);
            if (elements.targetDeadlineTimeGroup) elements.targetDeadlineTimeGroup.classList.remove('hidden');
          } else if (target.deadline) {
            elements.targetDeadline.value = target.deadline;
            if (elements.targetDeadlineTime) elements.targetDeadlineTime.value = '';
            if (elements.targetDeadlineTimeGroup) elements.targetDeadlineTimeGroup.classList.remove('hidden');
          } else {
            elements.targetDeadline.value = '';
            if (elements.targetDeadlineTime) elements.targetDeadlineTime.value = '';
            if (elements.targetDeadlineTimeGroup) elements.targetDeadlineTimeGroup.classList.add('hidden');
          }
          updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview, elements.targetDeadlineTime);
        }
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

    // Marketing Monthly Checkbox Toggle
    const monthlyCheck = e.target.closest('.mkt-checkbox-wrap[data-action="toggle-monthly"]');
    if (monthlyCheck && monthlyCheck.dataset.taskId) {
      const activeMonth = window.dataStore.getActiveMonth() || ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
      const updated = window.dataStore.toggleMarketingMonthlyTask(monthlyCheck.dataset.taskId, activeMonth);
      if (updated && updated.history && updated.history[activeMonth] && updated.history[activeMonth].completed) {
        showToast(`✅ Delivered "${updated.title}" for ${getMonthFullName(activeMonth)}!`, 'success');
      } else {
        showToast(`Marked "${updated ? updated.title : 'Task'}" in progress for ${getMonthFullName(activeMonth)}.`, 'info');
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

  // Real-Time Input Handlers for Deadline Date & Time Progressive Disclosure
  if (elements.targetDeadline) {
    const handleTargetDateChange = () => {
      const hasDate = Boolean(elements.targetDeadline.value);
      if (hasDate) {
        if (elements.targetDeadlineTimeGroup) elements.targetDeadlineTimeGroup.classList.remove('hidden');
        if (elements.targetDeadlineTime && !elements.targetDeadlineTime.value) {
          elements.targetDeadlineTime.value = '18:00';
          if (elements.targetDeadlineTimePresets) {
            elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => {
              p.classList.toggle('active', p.dataset.timePreset === '18:00');
            });
          }
        }
      } else {
        if (elements.targetDeadlineTimeGroup) elements.targetDeadlineTimeGroup.classList.add('hidden');
        if (elements.targetDeadlineTime) elements.targetDeadlineTime.value = '';
        if (elements.targetDeadlineTimePresets) {
          elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => p.classList.remove('active'));
        }
      }
      updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview, elements.targetDeadlineTime);
    };

    elements.targetDeadline.addEventListener('input', handleTargetDateChange);
    elements.targetDeadline.addEventListener('change', handleTargetDateChange);
  }

  if (elements.targetDeadlineTime) {
    elements.targetDeadlineTime.addEventListener('input', () => {
      if (elements.targetDeadlineTimePresets) {
        const val = elements.targetDeadlineTime.value;
        elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => {
          p.classList.toggle('active', p.dataset.timePreset === val);
        });
      }
      updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview, elements.targetDeadlineTime);
    });
  }

  if (elements.targetDeadlineTimePresets) {
    elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const preset = pill.dataset.timePreset;
        if (elements.targetDeadlineTime) {
          elements.targetDeadlineTime.value = preset;
        }
        elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview, elements.targetDeadlineTime);
      });
    });
  }

  if (elements.btnClearTargetTime) {
    elements.btnClearTargetTime.addEventListener('click', () => {
      if (elements.targetDeadlineTime) elements.targetDeadlineTime.value = '';
      if (elements.targetDeadlineTimePresets) {
        elements.targetDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => p.classList.remove('active'));
      }
      updateDeadlineQuickPreview(elements.targetDeadline, elements.targetDeadlineQuickPreview, elements.targetDeadlineTime);
    });
  }

  // Extra Deadline in Log Work Modal
  if (elements.logExtraDeadline) {
    const handleExtraDateChange = () => {
      const hasDate = Boolean(elements.logExtraDeadline.value);
      if (hasDate) {
        if (elements.logExtraDeadlineTimeGroup) elements.logExtraDeadlineTimeGroup.classList.remove('hidden');
        if (elements.logExtraDeadlineTime && !elements.logExtraDeadlineTime.value) {
          elements.logExtraDeadlineTime.value = '18:00';
          if (elements.logExtraDeadlineTimePresets) {
            elements.logExtraDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => {
              p.classList.toggle('active', p.dataset.extraTimePreset === '18:00');
            });
          }
        }
      } else {
        if (elements.logExtraDeadlineTimeGroup) elements.logExtraDeadlineTimeGroup.classList.add('hidden');
        if (elements.logExtraDeadlineTime) elements.logExtraDeadlineTime.value = '';
        if (elements.logExtraDeadlineTimePresets) {
          elements.logExtraDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => p.classList.remove('active'));
        }
      }
      updateDeadlineQuickPreview(elements.logExtraDeadline, elements.logExtraDeadlinePreview, elements.logExtraDeadlineTime);
    };

    elements.logExtraDeadline.addEventListener('input', handleExtraDateChange);
    elements.logExtraDeadline.addEventListener('change', handleExtraDateChange);
  }

  if (elements.logExtraDeadlineTime) {
    elements.logExtraDeadlineTime.addEventListener('input', () => {
      if (elements.logExtraDeadlineTimePresets) {
        const val = elements.logExtraDeadlineTime.value;
        elements.logExtraDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => {
          p.classList.toggle('active', p.dataset.extraTimePreset === val);
        });
      }
      updateDeadlineQuickPreview(elements.logExtraDeadline, elements.logExtraDeadlinePreview, elements.logExtraDeadlineTime);
    });
  }

  if (elements.logExtraDeadlineTimePresets) {
    elements.logExtraDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const preset = pill.dataset.extraTimePreset;
        if (elements.logExtraDeadlineTime) {
          elements.logExtraDeadlineTime.value = preset;
        }
        elements.logExtraDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        updateDeadlineQuickPreview(elements.logExtraDeadline, elements.logExtraDeadlinePreview, elements.logExtraDeadlineTime);
      });
    });
  }

  if (elements.btnClearExtraTime) {
    elements.btnClearExtraTime.addEventListener('click', () => {
      if (elements.logExtraDeadlineTime) elements.logExtraDeadlineTime.value = '';
      if (elements.logExtraDeadlineTimePresets) {
        elements.logExtraDeadlineTimePresets.querySelectorAll('.btn-preset-pill').forEach(p => p.classList.remove('active'));
      }
      updateDeadlineQuickPreview(elements.logExtraDeadline, elements.logExtraDeadlinePreview, elements.logExtraDeadlineTime);
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
      } else if (taskType === 'monthly') {
        const activeMonth = (window.dataStore && typeof window.dataStore.getActiveMonth === 'function') ? window.dataStore.getActiveMonth() : ((typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11');
        window.dataStore.updateMarketingMonthlyTaskNote(taskId, activeMonth, noteText, proofUrl);
        showToast(`Saved monthly report & proof for ${getMonthFullName(activeMonth)}.`, 'success');
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

  // Admin Routine Proof Acknowledge Handler
  if (elements.btnAdminVerifyTask) {
    elements.btnAdminVerifyTask.addEventListener('click', () => {
      if (elements.adminRoutineProofModal) {
        elements.adminRoutineProofModal.classList.add('hidden');
      }
      showToast('Task execution acknowledged by Admin.', 'success');
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
                ${resolveTargetFormat(t) ? `<span class="badge-format">${escapeHtml(resolveTargetFormat(t))}</span>` : ''}
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
        const curMonth = (typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11';
        window.dataStore.setActiveMonth(curMonth);
        state.adminMarketingSelectedMonth = curMonth;
        state.memberReportSelectedMonth = curMonth;
        if (res.user.role === 'marketing') {
          state.mktActiveTab = 'monthly';
        }
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


  // =========================================================================
  // GLOBAL COMMAND PALETTE CONTROLLER (Ctrl+K / Cmd+K) & ACCESSIBILITY
  // Linear / Raycast style command search, quick actions & modal escape handling
  // =========================================================================
  let commandPaletteSelectedIndex = 0;
  let commandPaletteItems = [];

  function openCommandPalette() {
    if (!state.user || !elements.commandPaletteModal) return;
    elements.commandPaletteModal.style.display = 'flex';
    if (elements.commandPaletteInput) {
      elements.commandPaletteInput.value = '';
      setTimeout(() => elements.commandPaletteInput.focus(), 60);
    }
    renderCommandPaletteResults('');
  }

  function closeCommandPalette() {
    if (elements.commandPaletteModal) {
      elements.commandPaletteModal.style.display = 'none';
    }
  }

  function switchManagerTabDirect(tabKey) {
    if (elements.managerTabBtns) {
      elements.managerTabBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.managerTab === tabKey);
      });
      state.activeManagerTab = tabKey;
      renderManagerActiveTab();
    }
  }

  function getAvailableCommands() {
    const isMgr = state.user && state.user.role === 'manager';
    const activeMonth = window.dataStore ? window.dataStore.getActiveMonth() : '2026-11';
    const commands = [];

    // Navigation Commands
    if (isMgr) {
      commands.push({
        id: 'nav-overview',
        group: 'Navigation',
        title: 'Go to Overview Dashboard',
        icon: 'layout-dashboard',
        badge: 'Manager',
        action: () => switchManagerTabDirect('overview')
      });
      commands.push({
        id: 'nav-deliverables',
        group: 'Navigation',
        title: 'Go to Deliverables & Quotas',
        icon: 'table',
        badge: 'Manager',
        action: () => switchManagerTabDirect('deliverables')
      });
      commands.push({
        id: 'nav-reviews',
        group: 'Navigation',
        title: 'Go to Review Queue',
        icon: 'check-square',
        badge: 'Manager',
        action: () => switchManagerTabDirect('reviews')
      });
      commands.push({
        id: 'nav-member-hub',
        group: 'Navigation',
        title: 'Go to Member Hub',
        icon: 'users',
        badge: 'Manager',
        action: () => switchManagerTabDirect('member-hub')
      });
      commands.push({
        id: 'nav-marketing-hub',
        group: 'Navigation',
        title: 'Go to Marketing Routines Hub',
        icon: 'trending-up',
        badge: 'Manager',
        action: () => switchManagerTabDirect('marketing-tracker')
      });
      commands.push({
        id: 'nav-team-roster',
        group: 'Navigation',
        title: 'Go to Team Roster',
        icon: 'user-check',
        badge: 'Manager',
        action: () => switchManagerTabDirect('team-roster')
      });
    } else {
      commands.push({
        id: 'nav-my-space',
        group: 'Navigation',
        title: 'Go to My Deliverables & Tasks',
        icon: 'check-circle-2',
        badge: 'Workspace',
        action: () => {
          if (state.user && state.user.role === 'marketing') {
            state.mktActiveTab = 'monthly';
            renderMarketingWorkspace(state.user);
          }
        }
      });
      if (state.user && state.user.role === 'marketing') {
        commands.push({
          id: 'nav-mkt-daily',
          group: 'Navigation',
          title: 'Go to Marketing Daily Checklist',
          icon: 'calendar',
          badge: 'Daily',
          action: () => {
            state.mktActiveTab = 'daily';
            renderMarketingWorkspace(state.user);
          }
        });
        commands.push({
          id: 'nav-mkt-weekly',
          group: 'Navigation',
          title: 'Go to Marketing Weekly Routines',
          icon: 'clock',
          badge: 'Weekly',
          action: () => {
            state.mktActiveTab = 'weekly';
            renderMarketingWorkspace(state.user);
          }
        });
      }
      commands.push({
        id: 'nav-member-report',
        group: 'Navigation',
        title: 'View Monthly Performance Report',
        icon: 'bar-chart-2',
        badge: 'Analytics',
        action: () => openMemberReportModal()
      });
    }

    // Quick Actions
    if (isMgr) {
      commands.push({
        id: 'act-new-target',
        group: 'Actions',
        title: 'Assign New Deliverable Target',
        icon: 'plus-circle',
        badge: 'Task',
        action: () => openAssignTargetModal()
      });
      commands.push({
        id: 'act-new-emp',
        group: 'Actions',
        title: 'Onboard New Team Member',
        icon: 'user-plus',
        badge: 'Roster',
        action: () => openAddEmployeeModal()
      });
    } else {
      commands.push({
        id: 'act-submit-work',
        group: 'Actions',
        title: 'Submit Deliverable Work / Proof Link',
        icon: 'cloud-upload',
        badge: 'Submit',
        action: () => openLogWorkModal()
      });
    }

    // Cycle Months
    const availableMonths = ['2026-11', '2026-10', '2026-09'];
    availableMonths.forEach(m => {
      const monthLabel = (typeof formatReportMonthTitle === 'function') ? formatReportMonthTitle(m) : m;
      commands.push({
        id: 'cycle-' + m,
        group: 'Cycle Months',
        title: `Switch Cycle to ${monthLabel}`,
        icon: 'calendar',
        badge: m === activeMonth ? 'Active' : 'Switch',
        action: () => {
          window.dataStore.setActiveMonth(m);
          state.adminMarketingSelectedMonth = m;
          state.memberReportSelectedMonth = m;
          renderApp();
          showToast(`Switched active cycle to ${monthLabel}`, 'info');
        }
      });
    });

    // System Commands
    commands.push({
      id: 'sys-profile',
      group: 'System',
      title: 'Profile Settings & Password',
      icon: 'settings',
      badge: 'Profile',
      action: () => openProfileModal('details')
    });
    commands.push({
      id: 'sys-cloud-sync',
      group: 'System',
      title: 'Force Cloud Firestore Resync',
      icon: 'refresh-cw',
      badge: 'Cloud',
      action: () => {
        showToast('Refreshing real-time Cloud sync...', 'info');
        if (window.dataStore && typeof window.dataStore.syncAllFromCloud === 'function') {
          window.dataStore.syncAllFromCloud();
        }
      }
    });
    commands.push({
      id: 'sys-logout',
      group: 'System',
      title: 'Sign Out / Switch Account',
      icon: 'log-out',
      badge: 'Auth',
      action: () => {
        window.authService.logout();
        state.user = null;
        clearAuthError();
        showToast('Signed out successfully.', 'info');
        populateLoginProfileTabs('manager@nexcrest.com');
        renderApp();
      }
    });

    return commands;
  }

  function renderCommandPaletteResults(query) {
    if (!elements.commandPaletteResults) return;
    const cleanQuery = (query || '').toLowerCase().trim();
    const allCommands = getAvailableCommands();

    const filtered = cleanQuery
      ? allCommands.filter(c =>
          c.title.toLowerCase().includes(cleanQuery) ||
          c.group.toLowerCase().includes(cleanQuery) ||
          (c.badge && c.badge.toLowerCase().includes(cleanQuery))
        )
      : allCommands;

    commandPaletteItems = filtered;
    commandPaletteSelectedIndex = 0;

    if (filtered.length === 0) {
      elements.commandPaletteResults.innerHTML = `
        <div class="command-palette-empty">
          <i data-lucide="search-x" style="width: 24px; height: 24px; margin-bottom: 6px; opacity: 0.5;"></i>
          <div>No matching commands found for "${escapeHtml(query)}"</div>
        </div>
      `;
      refreshIcons();
      return;
    }

    const groups = {};
    filtered.forEach((item, idx) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push({ item, globalIndex: idx });
    });

    let html = '';
    Object.keys(groups).forEach(grp => {
      html += `<div class="command-group-title">${escapeHtml(grp)}</div>`;
      groups[grp].forEach(({ item, globalIndex }) => {
        const isSelected = globalIndex === commandPaletteSelectedIndex;
        html += `
          <div class="command-palette-item ${isSelected ? 'selected' : ''}" data-cmd-idx="${globalIndex}">
            <div class="command-item-left">
              <i data-lucide="${item.icon}" class="command-item-icon"></i>
              <span class="command-item-title">${escapeHtml(item.title)}</span>
            </div>
            ${item.badge ? `<span class="command-item-badge">${escapeHtml(item.badge)}</span>` : ''}
          </div>
        `;
      });
    });

    elements.commandPaletteResults.innerHTML = html;
    refreshIcons();

    elements.commandPaletteResults.querySelectorAll('.command-palette-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.cmdIdx, 10);
        executeCommandAtIndex(idx);
      });
    });
  }

  function executeCommandAtIndex(index) {
    if (commandPaletteItems && commandPaletteItems[index]) {
      const cmd = commandPaletteItems[index];
      closeCommandPalette();
      if (typeof cmd.action === 'function') {
        cmd.action();
      }
    }
  }

  function updateCommandPaletteSelection() {
    if (!elements.commandPaletteResults) return;
    const items = elements.commandPaletteResults.querySelectorAll('.command-palette-item');
    items.forEach((el, idx) => {
      if (idx === commandPaletteSelectedIndex) {
        el.classList.add('selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('selected');
      }
    });
  }

  // Wire Command Palette Event Listeners
  if (elements.btnOpenCommandPalette) {
    elements.btnOpenCommandPalette.addEventListener('click', openCommandPalette);
  }
  if (elements.commandPaletteModal) {
    elements.commandPaletteModal.addEventListener('click', (e) => {
      if (e.target === elements.commandPaletteModal) {
        closeCommandPalette();
      }
    });
  }
  if (elements.commandPaletteInput) {
    elements.commandPaletteInput.addEventListener('input', (e) => {
      renderCommandPaletteResults(e.target.value);
    });
  }

  // Universal Keyboard Shortcuts (Ctrl+K, Cmd+K, Universal Escape, Arrow navigation)
  window.addEventListener('keydown', (e) => {
    // 1. Ctrl+K or Cmd+K: Open / Toggle Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (elements.commandPaletteModal && elements.commandPaletteModal.style.display === 'flex') {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
      return;
    }

    // 2. Escape: Universally close whichever modal is currently open
    if (e.key === 'Escape') {
      if (elements.commandPaletteModal && elements.commandPaletteModal.style.display === 'flex') {
        e.preventDefault();
        closeCommandPalette();
        return;
      }
      const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
      openModals.forEach(m => {
        if (m.id === 'auth-modal' && !state.user) return; // Don't close auth modal when logged out
        m.classList.add('hidden');
        if (m.style.display === 'flex') m.style.display = 'none';
      });
      return;
    }

    // 3. Arrow & Enter Navigation inside Command Palette
    if (elements.commandPaletteModal && elements.commandPaletteModal.style.display === 'flex') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandPaletteItems.length > 0) {
          commandPaletteSelectedIndex = (commandPaletteSelectedIndex + 1) % commandPaletteItems.length;
          updateCommandPaletteSelection();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandPaletteItems.length > 0) {
          commandPaletteSelectedIndex = (commandPaletteSelectedIndex - 1 + commandPaletteItems.length) % commandPaletteItems.length;
          updateCommandPaletteSelection();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommandAtIndex(commandPaletteSelectedIndex);
      }
    }
  });

  // Wire Real-Time Cloud Sync Indicator
  if (window.firebaseSync && typeof window.firebaseSync.onSyncStatusChange === 'function') {
    window.firebaseSync.onSyncStatusChange((status, label) => {
      if (elements.cloudSyncStatusIndicator) {
        elements.cloudSyncStatusIndicator.className = `sync-status-pill ${status}`;
        if (elements.cloudSyncLabel) {
          elements.cloudSyncLabel.textContent = label;
        }
      }
    });
  }

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
    if (user) {
      const curMonth = (typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11';
      window.dataStore.setActiveMonth(curMonth);
      state.adminMarketingSelectedMonth = curMonth;
      state.memberReportSelectedMonth = curMonth;
      if (user.role === 'marketing') {
        state.mktActiveTab = 'monthly';
      }
    }
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

  const curBootMonth = (typeof window.getCurrentMonthStr === 'function') ? window.getCurrentMonthStr() : '2026-11';
  window.dataStore.setActiveMonth(curBootMonth);
  state.adminMarketingSelectedMonth = curBootMonth;
  state.memberReportSelectedMonth = curBootMonth;
  if (state.user && state.user.role === 'marketing') {
    state.mktActiveTab = 'monthly';
  }
  initTheme();
  renderApp();
  refreshFuturisticEffects();
});
