import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createId,
  getTodaysMiniGoals,
  loadGoals,
  rollUncompletedGoals,
  saveGoals,
  type GoalStore,
  type LongGoal,
  type MediumGoal,
  type MicroGoal,
  type MiniMicroGoal,
} from "./goalEngine";

/**
 * useGoals — React hook wrapping the goal-fracturing engine.
 * Loads on mount, applies the overnight roll, and persists on every change.
 */
export function useGoals() {
  const [store, setStore] = useState<GoalStore>(() => ({
    longGoal: null,
    lastUpdated: new Date().toISOString(),
  }));
  const hydrated = useRef(false);

  // Load + overnight roll on mount
  useEffect(() => {
    const loaded = loadGoals();
    const rolled = rollUncompletedGoals(loaded);
    setStore(rolled);
    if (rolled !== loaded) saveGoals(rolled);
    hydrated.current = true;
  }, []);

  // Persist on change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    saveGoals(store);
  }, [store]);

  const setLongGoal = useCallback((text: string) => {
    setStore((prev) => {
      const nextLong: LongGoal = prev.longGoal
        ? { ...prev.longGoal, text }
        : {
            id: createId(),
            text,
            status: "active",
            createdAt: new Date().toISOString(),
            mediumGoals: [],
          };
      return { ...prev, longGoal: nextLong };
    });
  }, []);

  const completeMiniGoal = useCallback((id: string) => {
    setStore((prev) => {
      if (!prev.longGoal) return prev;
      const now = new Date().toISOString();
      const nextLong: LongGoal = {
        ...prev.longGoal,
        mediumGoals: prev.longGoal.mediumGoals.map<MediumGoal>((med) => ({
          ...med,
          microGoals: med.microGoals.map<MicroGoal>((micro) => ({
            ...micro,
            miniGoals: micro.miniGoals.map<MiniMicroGoal>((mini) =>
              mini.id === id
                ? { ...mini, status: "completed", completedAt: now }
                : mini,
            ),
          })),
        })),
      };
      return { ...prev, longGoal: nextLong };
    });
  }, []);

  /**
   * Adds a mini-micro goal. If no long/medium/micro exists yet, creates
   * lightweight containers so the mini has a home. Callers with richer
   * structure can extend later.
   */
  const addMiniGoal = useCallback((text: string, scheduledDate: string) => {
    setStore((prev) => {
      const now = new Date().toISOString();
      const mini: MiniMicroGoal = {
        id: createId(),
        text,
        status: "active",
        scheduledDate,
      };

      const long: LongGoal = prev.longGoal ?? {
        id: createId(),
        text: "",
        status: "active",
        createdAt: now,
        mediumGoals: [],
      };

      const mediumGoals = long.mediumGoals.length
        ? long.mediumGoals
        : ([
            {
              id: createId(),
              text: "",
              status: "active" as const,
              microGoals: [],
            },
          ] as MediumGoal[]);

      const firstMed = mediumGoals[0];
      const microGoals = firstMed.microGoals.length
        ? firstMed.microGoals
        : ([
            {
              id: createId(),
              text: "",
              status: "active" as const,
              miniGoals: [],
            },
          ] as MicroGoal[]);

      const firstMicro = microGoals[0];
      const nextMicro: MicroGoal = {
        ...firstMicro,
        miniGoals: [...firstMicro.miniGoals, mini],
      };
      const nextMed: MediumGoal = {
        ...firstMed,
        microGoals: [nextMicro, ...microGoals.slice(1)],
      };
      const nextLong: LongGoal = {
        ...long,
        mediumGoals: [nextMed, ...mediumGoals.slice(1)],
      };

      return { ...prev, longGoal: nextLong };
    });
  }, []);

  const todaysMiniGoals = useMemo(() => getTodaysMiniGoals(store), [store]);

  return {
    longGoal: store.longGoal,
    todaysMiniGoals,
    setLongGoal,
    completeMiniGoal,
    addMiniGoal,
  };
}
