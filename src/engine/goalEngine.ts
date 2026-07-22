/**
 * AEZUIR Goal Fracturing Engine — logic + persistence only.
 *
 * Hierarchy: LongGoal → MediumGoal[] → MicroGoal[] → MiniMicroGoal[]
 * Storage:   localStorage key "sai_goals"
 *
 * Positive-reinforcement rule: uncompleted mini-micro goals from yesterday
 * are rescheduled to today with status "rolled". No failure marker, no
 * penalty — the user simply gets another chance.
 */

export type GoalStatus = "active" | "completed" | "rolled";

export interface MiniMicroGoal {
  id: string;
  text: string;
  status: GoalStatus;
  scheduledDate: string; // ISO date string YYYY-MM-DD
  completedAt?: string;
}

export interface MicroGoal {
  id: string;
  text: string;
  status: GoalStatus;
  miniGoals: MiniMicroGoal[];
}

export interface MediumGoal {
  id: string;
  text: string;
  status: GoalStatus;
  microGoals: MicroGoal[];
}

export interface LongGoal {
  id: string;
  text: string;
  status: GoalStatus;
  createdAt: string;
  mediumGoals: MediumGoal[];
}

export interface GoalStore {
  longGoal: LongGoal | null;
  lastUpdated: string;
}

export const GOAL_STORAGE_KEY = "sai_goals";

const emptyStore = (): GoalStore => ({
  longGoal: null,
  lastUpdated: new Date().toISOString(),
});

const todayISO = (): string => new Date().toISOString().slice(0, 10);

const yesterdayISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadGoals(): GoalStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(GOAL_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as GoalStore;
    if (!parsed || typeof parsed !== "object") return emptyStore();
    return {
      longGoal: parsed.longGoal ?? null,
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    };
  } catch {
    return emptyStore();
  }
}

export function saveGoals(store: GoalStore): void {
  if (typeof window === "undefined") return;
  try {
    const next: GoalStore = { ...store, lastUpdated: new Date().toISOString() };
    window.localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / access errors
  }
}

function forEachMini(
  store: GoalStore,
  fn: (mini: MiniMicroGoal) => void,
): void {
  const long = store.longGoal;
  if (!long) return;
  for (const med of long.mediumGoals) {
    for (const micro of med.microGoals) {
      for (const mini of micro.miniGoals) fn(mini);
    }
  }
}

export function getTodaysMiniGoals(store: GoalStore): MiniMicroGoal[] {
  const today = todayISO();
  const out: MiniMicroGoal[] = [];
  forEachMini(store, (m) => {
    if (m.scheduledDate === today) out.push(m);
  });
  return out;
}

/**
 * Reschedules any mini-micro goals from yesterday that are still "active"
 * to today, marking them "rolled". No failure penalty applied.
 */
export function rollUncompletedGoals(store: GoalStore): GoalStore {
  if (!store.longGoal) return store;
  const yesterday = yesterdayISO();
  const today = todayISO();
  let changed = false;

  const nextLong: LongGoal = {
    ...store.longGoal,
    mediumGoals: store.longGoal.mediumGoals.map((med) => ({
      ...med,
      microGoals: med.microGoals.map((micro) => ({
        ...micro,
        miniGoals: micro.miniGoals.map((mini) => {
          if (mini.status === "active" && mini.scheduledDate === yesterday) {
            changed = true;
            return { ...mini, status: "rolled", scheduledDate: today };
          }
          return mini;
        }),
      })),
    })),
  };

  if (!changed) return store;
  return { ...store, longGoal: nextLong, lastUpdated: new Date().toISOString() };
}
