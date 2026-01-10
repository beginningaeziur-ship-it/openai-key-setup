/**
 * AEZUIR Persistent Memory System
 * 
 * Non-negotiable: The app must remember users across sessions.
 * No re-onboarding loops. No lost progress.
 */

// Storage keys
const KEYS = {
  // Onboarding state
  HAS_COMPLETED_ONBOARDING: 'aezuir_has_completed_onboarding',
  ONBOARDING_SKIPPED: 'aezuir_onboarding_skipped',
  ONBOARDING_CHECKPOINT: 'aezuir_onboarding_checkpoint',
  ONBOARDING_PROFILE_SIGNALS: 'aezuir_onboarding_profile_signals',
  
  // Progression flags
  HAS_COMPLETED_PLAYROOM: 'aezuir_has_completed_playroom',
  HAS_SET_PIN: 'aezuir_has_set_pin',
  PIN_HASH: 'aezuir_pin_hash',
  IS_SAFE_HOUSE_UNLOCKED: 'aezuir_safe_house_unlocked',
  
  // Safety and goals
  SAFETY_PLAN_COMPLETED: 'aezuir_safety_plan_completed',
  SAFETY_PLAN_DATA: 'aezuir_safety_plan_data',
  GOALS_GENERATED: 'aezuir_goals_generated',
  GOALS_DATA: 'aezuir_goals_data',
  
  // Scheduling
  WEEKLY_PLAN_WEEK_ID: 'aezuir_weekly_plan_week_id',
  LAST_CHECK_IN_DATE: 'aezuir_last_check_in_date',
  LAST_VISITED_ROOM: 'aezuir_last_visited_room',
  
  // User preferences
  USER_PREFERENCES: 'aezuir_user_preferences',
  WATCHER_LINK_STATUS: 'aezuir_watcher_link_status',
  
  // Skip reminder
  SKIP_REMINDER_DISMISSED_AT: 'aezuir_skip_reminder_dismissed_at',
  
  // Life Anchor (identity/purpose)
  LIFE_ANCHOR_PROFILE: 'aezuir_life_anchor_profile',
  
  // Active Plan (OUTPUT ONLY - no raw onboarding answers)
  ACTIVE_PLAN: 'aezuir_active_plan',
  
  // Progress State
  PROGRESS_STATE: 'aezuir_progress_state',
  
  // Memos and local data (NOT synced)
  LOCAL_MEMOS: 'aezuir_local_memos',
  LOCAL_PREP_LISTS: 'aezuir_local_prep_lists',
  SAVED_RESOURCES: 'aezuir_saved_resources',
} as const;

// Type-safe getters and setters
export const persistence = {
  // ============ ONBOARDING ============
  
  getHasCompletedOnboarding(): boolean {
    return localStorage.getItem(KEYS.HAS_COMPLETED_ONBOARDING) === 'true';
  },
  
  setHasCompletedOnboarding(value: boolean): void {
    localStorage.setItem(KEYS.HAS_COMPLETED_ONBOARDING, String(value));
  },
  
  getOnboardingSkipped(): boolean {
    return localStorage.getItem(KEYS.ONBOARDING_SKIPPED) === 'true';
  },
  
  setOnboardingSkipped(value: boolean): void {
    localStorage.setItem(KEYS.ONBOARDING_SKIPPED, String(value));
  },
  
  getOnboardingCheckpoint(): string | null {
    return localStorage.getItem(KEYS.ONBOARDING_CHECKPOINT);
  },
  
  setOnboardingCheckpoint(screenId: string): void {
    localStorage.setItem(KEYS.ONBOARDING_CHECKPOINT, screenId);
  },
  
  getOnboardingProfileSignals(): string[] {
    const data = localStorage.getItem(KEYS.ONBOARDING_PROFILE_SIGNALS);
    return data ? JSON.parse(data) : [];
  },
  
  setOnboardingProfileSignals(signals: string[]): void {
    localStorage.setItem(KEYS.ONBOARDING_PROFILE_SIGNALS, JSON.stringify(signals));
  },
  
  // ============ PROGRESSION ============
  
  getHasCompletedPlayroom(): boolean {
    return localStorage.getItem(KEYS.HAS_COMPLETED_PLAYROOM) === 'true';
  },
  
  setHasCompletedPlayroom(value: boolean): void {
    localStorage.setItem(KEYS.HAS_COMPLETED_PLAYROOM, String(value));
  },
  
  getHasSetPIN(): boolean {
    return localStorage.getItem(KEYS.HAS_SET_PIN) === 'true';
  },
  
  setHasSetPIN(value: boolean): void {
    localStorage.setItem(KEYS.HAS_SET_PIN, String(value));
  },
  
  // PIN stored as hash - never plain text
  getPINHash(): string | null {
    return localStorage.getItem(KEYS.PIN_HASH);
  },
  
  async setPIN(pin: string): Promise<void> {
    // Simple hash for demo - in production use proper crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'aezuir_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(KEYS.PIN_HASH, hashHex);
    localStorage.setItem(KEYS.HAS_SET_PIN, 'true');
  },
  
  async verifyPIN(pin: string): Promise<boolean> {
    const stored = localStorage.getItem(KEYS.PIN_HASH);
    if (!stored) return false;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'aezuir_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === stored;
  },
  
  getIsSafeHouseUnlocked(): boolean {
    return localStorage.getItem(KEYS.IS_SAFE_HOUSE_UNLOCKED) === 'true';
  },
  
  setIsSafeHouseUnlocked(value: boolean): void {
    localStorage.setItem(KEYS.IS_SAFE_HOUSE_UNLOCKED, String(value));
  },
  
  // ============ SAFETY & GOALS ============
  
  getSafetyPlanCompleted(): boolean {
    return localStorage.getItem(KEYS.SAFETY_PLAN_COMPLETED) === 'true';
  },
  
  setSafetyPlanCompleted(value: boolean): void {
    localStorage.setItem(KEYS.SAFETY_PLAN_COMPLETED, String(value));
  },
  
  getSafetyPlanData(): Record<string, unknown> | null {
    const data = localStorage.getItem(KEYS.SAFETY_PLAN_DATA);
    return data ? JSON.parse(data) : null;
  },
  
  setSafetyPlanData(data: Record<string, unknown>): void {
    localStorage.setItem(KEYS.SAFETY_PLAN_DATA, JSON.stringify(data));
  },
  
  getGoalsGenerated(): boolean {
    return localStorage.getItem(KEYS.GOALS_GENERATED) === 'true';
  },
  
  setGoalsGenerated(value: boolean): void {
    localStorage.setItem(KEYS.GOALS_GENERATED, String(value));
  },
  
  getGoalsData(): Record<string, unknown> | null {
    const data = localStorage.getItem(KEYS.GOALS_DATA);
    return data ? JSON.parse(data) : null;
  },
  
  setGoalsData(data: Record<string, unknown>): void {
    localStorage.setItem(KEYS.GOALS_DATA, JSON.stringify(data));
  },
  
  // ============ SCHEDULING ============
  
  getWeeklyPlanWeekId(): string | null {
    return localStorage.getItem(KEYS.WEEKLY_PLAN_WEEK_ID);
  },
  
  setWeeklyPlanWeekId(weekId: string): void {
    localStorage.setItem(KEYS.WEEKLY_PLAN_WEEK_ID, weekId);
  },
  
  getLastCheckInDate(): string | null {
    return localStorage.getItem(KEYS.LAST_CHECK_IN_DATE);
  },
  
  setLastCheckInDate(date: string): void {
    localStorage.setItem(KEYS.LAST_CHECK_IN_DATE, date);
  },
  
  getLastVisitedRoom(): string {
    return localStorage.getItem(KEYS.LAST_VISITED_ROOM) || 'bedroom';
  },
  
  setLastVisitedRoom(room: string): void {
    localStorage.setItem(KEYS.LAST_VISITED_ROOM, room);
  },
  
  // ============ PREFERENCES ============
  
  getUserPreferences(): {
    tone: string;
    accessibility: Record<string, boolean>;
    notifications: boolean;
  } {
    const data = localStorage.getItem(KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : {
      tone: 'calm',
      accessibility: {},
      notifications: false,
    };
  },
  
  setUserPreferences(prefs: {
    tone?: string;
    accessibility?: Record<string, boolean>;
    notifications?: boolean;
  }): void {
    const current = persistence.getUserPreferences();
    localStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify({
      ...current,
      ...prefs,
    }));
  },
  
  // ============ SKIP REMINDER ============
  
  getSkipReminderDismissedAt(): number | null {
    const data = localStorage.getItem(KEYS.SKIP_REMINDER_DISMISSED_AT);
    return data ? parseInt(data, 10) : null;
  },
  
  setSkipReminderDismissedAt(): void {
    localStorage.setItem(KEYS.SKIP_REMINDER_DISMISSED_AT, String(Date.now()));
  },
  
  shouldShowSkipReminder(): boolean {
    const dismissed = persistence.getSkipReminderDismissedAt();
    if (!dismissed) return true;
    
    // 24 hour snooze
    const hoursSince = (Date.now() - dismissed) / (1000 * 60 * 60);
    return hoursSince >= 24;
  },
  
  // ============ LOCAL DATA ============
  
  getLocalMemos(): Array<{ id: string; text: string; createdAt: string }> {
    const data = localStorage.getItem(KEYS.LOCAL_MEMOS);
    return data ? JSON.parse(data) : [];
  },
  
  addLocalMemo(text: string): void {
    const memos = persistence.getLocalMemos();
    memos.unshift({
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(KEYS.LOCAL_MEMOS, JSON.stringify(memos));
  },
  
  deleteLocalMemo(id: string): void {
    const memos = persistence.getLocalMemos().filter(m => m.id !== id);
    localStorage.setItem(KEYS.LOCAL_MEMOS, JSON.stringify(memos));
  },
  
  getSavedResources(): Array<{ id: string; name: string; phone?: string; url?: string }> {
    const data = localStorage.getItem(KEYS.SAVED_RESOURCES);
    return data ? JSON.parse(data) : [];
  },
  
  addSavedResource(resource: { name: string; phone?: string; url?: string }): void {
    const resources = persistence.getSavedResources();
    resources.push({
      id: crypto.randomUUID(),
      ...resource,
    });
    localStorage.setItem(KEYS.SAVED_RESOURCES, JSON.stringify(resources));
  },
  
  // ============ LIFE ANCHOR (Identity/Purpose) ============
  
  getLifeAnchorProfile(): {
    situation?: string;
    interests: string[];
    skills: string[];
    incomeSource?: string;
    purposeAnchor?: string;
  } | null {
    const data = localStorage.getItem(KEYS.LIFE_ANCHOR_PROFILE);
    return data ? JSON.parse(data) : null;
  },
  
  setLifeAnchorProfile(profile: {
    situation?: string;
    interests: string[];
    skills: string[];
    incomeSource?: string;
    purposeAnchor?: string;
  }): void {
    localStorage.setItem(KEYS.LIFE_ANCHOR_PROFILE, JSON.stringify(profile));
  },
  
  updateLifeAnchor(updates: Partial<{
    situation?: string;
    interests: string[];
    skills: string[];
    incomeSource?: string;
    purposeAnchor?: string;
  }>): void {
    const current = persistence.getLifeAnchorProfile() || {
      interests: [],
      skills: [],
    };
    localStorage.setItem(KEYS.LIFE_ANCHOR_PROFILE, JSON.stringify({
      ...current,
      ...updates,
    }));
  },
  
  // ============ ACTIVE PLAN (Safe Memory - OUTPUT ONLY) ============
  
  getActivePlan(): {
    coreGoal?: { id: string; title: string };
    midGoals?: Array<{ id: string; title: string }>;
    miniGoals?: Array<{ id: string; title: string }>;
    weeklySchedule?: Record<string, string>;
  } | null {
    const data = localStorage.getItem(KEYS.ACTIVE_PLAN);
    return data ? JSON.parse(data) : null;
  },
  
  setActivePlan(plan: {
    coreGoal?: { id: string; title: string };
    midGoals?: Array<{ id: string; title: string }>;
    miniGoals?: Array<{ id: string; title: string }>;
    weeklySchedule?: Record<string, string>;
  }): void {
    localStorage.setItem(KEYS.ACTIVE_PLAN, JSON.stringify(plan));
  },
  
  // ============ PROGRESS STATE ============
  
  getProgressState(): {
    completedTasks: string[];
    lastCheckInDate?: string;
    isPaused: boolean;
    isOverwhelmed: boolean;
  } {
    const data = localStorage.getItem(KEYS.PROGRESS_STATE);
    return data ? JSON.parse(data) : {
      completedTasks: [],
      isPaused: false,
      isOverwhelmed: false,
    };
  },
  
  setProgressState(state: {
    completedTasks?: string[];
    lastCheckInDate?: string;
    isPaused?: boolean;
    isOverwhelmed?: boolean;
  }): void {
    const current = persistence.getProgressState();
    localStorage.setItem(KEYS.PROGRESS_STATE, JSON.stringify({
      ...current,
      ...state,
    }));
  },
  
  markTaskComplete(taskId: string): void {
    const state = persistence.getProgressState();
    if (!state.completedTasks.includes(taskId)) {
      state.completedTasks.push(taskId);
      localStorage.setItem(KEYS.PROGRESS_STATE, JSON.stringify(state));
    }
  },
  
  // ============ RESET ============
  
  resetAll(): void {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

// ============ APP LAUNCH ROUTING LOGIC ============

export function getAppLaunchRoute(): string {
  // 1. If onboarding incomplete and not skipped → resume onboarding
  if (!persistence.getHasCompletedOnboarding() && !persistence.getOnboardingSkipped()) {
    const checkpoint = persistence.getOnboardingCheckpoint();
    if (checkpoint) {
      return `/onboarding/${checkpoint}`;
    }
    return '/onboarding/waiting-room';
  }
  
  // 2. If playroom incomplete → playroom
  if (!persistence.getHasCompletedPlayroom()) {
    return '/onboarding/play-room';
  }
  
  // 3. If PIN not set → House (PIN setup)
  if (!persistence.getHasSetPIN()) {
    return '/onboarding/home-entrance';
  }
  
  // 4. If Safe House locked → PIN unlock (same page handles unlock)
  if (!persistence.getIsSafeHouseUnlocked()) {
    return '/onboarding/home-entrance';
  }
  
  // 5. Otherwise → Safe House, last visited room
  const lastRoom = persistence.getLastVisitedRoom();
  const roomRoutes: Record<string, string> = {
    bedroom: '/sai-home',
    ocean: '/beach',
    forest: '/forest',
    cabin: '/settings',
    beach: '/beach', // legacy support
    settings: '/settings', // legacy support
  };
  
  return roomRoutes[lastRoom] || '/sai-home';
}

export default persistence;
