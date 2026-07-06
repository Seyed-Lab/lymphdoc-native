import { useEffect, useCallback, useMemo } from "react";
import { usePersistedState, useSessionState } from "./storage";

export { usePersistedState, useSessionState };

export type Mood = "bad" | "low" | "okay" | "good" | "great" | null;
export type LymphDotMode = "standard" | "long" | "extraLong" | "maximum";
export type SymptomLevel = "none" | "mild" | "moderate" | "strong";
export type CompressionToday = "yes" | "partly" | "no";
export type BodyArea = "arm" | "leg" | "both";
export type BodySide = "left" | "right" | "both";
export type BodyRegion =
  | "leftArm" | "rightArm"
  | "leftLeg" | "rightLeg";

export interface MoodEntry { at: number; mood: Exclude<Mood, null>; }
export interface WaterEntry { at: number; ml: number; source?: "manual" | "watch" | "health"; }
export interface BreakEntry { at: number; durationSec: number; completed: boolean; }
export interface CompressionSession { startedAt: number; endedAt: number; minutes: number; }
export interface LymphDotSession { startedAt: number; endedAt: number; minutes: number; mode: LymphDotMode; }
export interface IPKSession { startedAt: number; endedAt: number; minutes: number; }
export interface MLDSession { at: number; minutes: 30 | 45 | 60; }
export interface CheckinEntry {
  at: number;
  mood: Exclude<Mood, null>;
  /** 0-10 numeric scale (newer entries). Older entries may still use SymptomLevel. */
  heaviness?: SymptomLevel | number;
  pain?: SymptomLevel | number;
  tension?: SymptomLevel | number;
  // Legacy fields — no longer collected.
  compression?: CompressionToday;
  movement?: boolean;
  therapy?: boolean;
}
export interface DailyCheckData {
  at: number;
  compression: boolean;
  exercises: boolean;
  pump: boolean;
  lymphDot: boolean;
}
export interface SymptomEntry {
  at: number;
  region: BodyRegion;
  heaviness?: SymptomLevel;
  pain?: SymptomLevel;
  note?: string;
}
export interface MeasurementEntry {
  at: number;
  region: BodyRegion;
  point: string;     // e.g. "wrist"
  cm: number;
}

export interface DayData {
  date: string;
  moodEntries: MoodEntry[];
  waterEntries: WaterEntry[];
  breaks: BreakEntry[];
  compressionSessions: CompressionSession[];
  lymphDotSessions: LymphDotSession[];
  ipkSessions: IPKSession[];
  mldSessions: MLDSession[];
  checkins: CheckinEntry[];
  symptomEntries: SymptomEntry[];
  measurementEntries: MeasurementEntry[];
  dailyCheck?: DailyCheckData;
  dropsEarned: number;
  dotsEarned: number;
}

export type GoalKey = "A" | "B" | "C" | "D" | "E" | "F";

export interface UserProfile {
  area: BodyArea;
  side: BodySide;
  uses: { compression: boolean; lymphDot: boolean; ipk: boolean; mld: boolean };
  remindersOptIn: boolean;
  onboarded: boolean;
  /** Why the user downloaded the app (multi-select). */
  goals?: GoalKey[];
  /** Primary (first picked) goal — drives the intro tour. */
  primaryGoal?: GoalKey;
  /** Lipedema stage (1–3), collected for goal C. */
  lipedemaStage?: 1 | 2 | 3;
  // Health/Body data (used for Body completion ring)
  age?: number;
  sex?: "female" | "male" | "diverse";
  heightCm?: number;
  weightKg?: number;
  diagnosis?: string;
  diagnosisYear?: number;
}

export interface DailyGoals {
  waterMl: number;
  breaks: number;
  compressionMin: number;        // default 480 (8h)
  pumpMin: number;
  lymphDotMin: number;
  /** @deprecated kept for compatibility — no longer surfaced in UI */
  careSessions: number;
  checkin: boolean;
}
export interface WeeklyGoals {
  activeDays: number;
  careSessions: number;
  checkins: number;
}
export interface MonthlyGoals {
  activeDays: number;
}
export interface Goals {
  daily: DailyGoals;
  weekly: WeeklyGoals;
  monthly: MonthlyGoals;
}

export interface AppSettings {
  waterGlassMl: number;
  waterGoalMl: number;
  breakDurationSeconds: number;
  lymphDotDefaultMode: LymphDotMode;
  lymphDotSelection: "all" | string[];
  reminders: {
    water: boolean;
    breaks: boolean;
    compression: boolean;
    lymphDot: boolean;
  };
  profile: UserProfile;
  goals: Goals;
}

const defaultProfile: UserProfile = {
  area: "arm",
  side: "right",
  uses: { compression: true, lymphDot: true, ipk: false, mld: false },
  remindersOptIn: true,
  onboarded: false,
};

const defaultGoals: Goals = {
  daily: { waterMl: 2000, breaks: 2, compressionMin: 480, pumpMin: 30, lymphDotMin: 20, careSessions: 1, checkin: true },
  weekly: { activeDays: 5, careSessions: 5, checkins: 5 },
  monthly: { activeDays: 20 },
};

const defaultSettings: AppSettings = {
  waterGlassMl: 250,
  waterGoalMl: 2000,
  breakDurationSeconds: 60,
  lymphDotDefaultMode: "standard",
  lymphDotSelection: "all",
  reminders: { water: true, breaks: true, compression: false, lymphDot: false },
  profile: defaultProfile,
  goals: defaultGoals,
};

export const LYMPHDOT_MODE_DURATION: Record<LymphDotMode, number> = {
  standard: 20, long: 30, extraLong: 45, maximum: 60,
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const emptyDay = (date: string): DayData => ({
  date,
  moodEntries: [],
  waterEntries: [],
  breaks: [],
  compressionSessions: [],
  lymphDotSessions: [],
  ipkSessions: [],
  mldSessions: [],
  checkins: [],
  symptomEntries: [],
  measurementEntries: [],
  dropsEarned: 0,
  dotsEarned: 0,
});

// Helpful defaults to merge over older stored days
const normalizeDay = (date: string, raw?: Partial<DayData>): DayData => ({
  ...emptyDay(date),
  ...(raw || {}),
  moodEntries: raw?.moodEntries ?? [],
  waterEntries: raw?.waterEntries ?? [],
  breaks: raw?.breaks ?? [],
  compressionSessions: raw?.compressionSessions ?? [],
  lymphDotSessions: raw?.lymphDotSessions ?? [],
  ipkSessions: raw?.ipkSessions ?? [],
  mldSessions: raw?.mldSessions ?? [],
  checkins: raw?.checkins ?? [],
  symptomEntries: raw?.symptomEntries ?? [],
  measurementEntries: raw?.measurementEntries ?? [],
  dropsEarned: raw?.dropsEarned ?? 0,
  dotsEarned: raw?.dotsEarned ?? 0,
});

// ============================================================
// Reward calculators
// ============================================================
export const COMPRESSION_DAILY_DROP_CAP = 150;
export const WATER_DAILY_REWARD_CAP_ML = 3000;
export const IPK_DAILY_DROP_CAP = 50;
export const MLD_DAILY_REWARD_LIMIT = 1;

function compressionBlockDrops(cumulativeMinutes: number): number {
  if (cumulativeMinutes <= 30) return 5;
  if (cumulativeMinutes <= 60) return 10;
  if (cumulativeMinutes <= 130) return 15;
  return 0;
}

export function compressionDropsForMinutes(totalMinutes: number): number {
  const blocks = Math.floor(totalMinutes / 10);
  let total = 0;
  for (let b = 1; b <= blocks; b++) {
    total += compressionBlockDrops(b * 10);
    if (total >= COMPRESSION_DAILY_DROP_CAP) return COMPRESSION_DAILY_DROP_CAP;
  }
  return Math.min(total, COMPRESSION_DAILY_DROP_CAP);
}

export function nextCompressionMilestone(totalMinutes: number): { minutesUntil: number; reward: number } | null {
  const earned = compressionDropsForMinutes(totalMinutes);
  if (earned >= COMPRESSION_DAILY_DROP_CAP) return null;
  const nextBlockEnd = (Math.floor(totalMinutes / 10) + 1) * 10;
  return { minutesUntil: nextBlockEnd - totalMinutes, reward: compressionBlockDrops(nextBlockEnd) };
}

export function lymphDotSessionDrops(minutes: number): number {
  return Math.max(0, Math.floor(minutes));
}

export const LYMPHDOT_DAILY_DOT_CAP = 3;
export const LYMPHDOT_MIN_MINUTES_FOR_DOT = 20;

export function lymphDotDotsForSession(minutes: number, dotsEarnedToday: number): number {
  if (minutes < LYMPHDOT_MIN_MINUTES_FOR_DOT) return 0;
  if (dotsEarnedToday >= LYMPHDOT_DAILY_DOT_CAP) return 0;
  return 1;
}
export function lymphDotSessionDots(n: number): number {
  return n <= LYMPHDOT_DAILY_DOT_CAP ? 1 : 0;
}

/** IPK: 1 Drop per 5 min, capped 50/day. */
export function ipkDropsForMinutes(totalMinutes: number): number {
  return Math.min(IPK_DAILY_DROP_CAP, Math.floor(totalMinutes / 5));
}

export function waterDrops(ml: number): number { return ml / 100; }

export function dropsRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  if (level <= 20) return 100 + (level - 2) * 5;
  return 100 + 18 * 5 + (level - 20) * 10;
}
export function levelFromTotalDrops(totalDrops: number): { level: number; intoLevel: number; needed: number } {
  let level = 1;
  let acc = 0;
  while (true) {
    const need = dropsRequiredForLevel(level + 1);
    if (acc + need > totalDrops) return { level, intoLevel: totalDrops - acc, needed: need };
    acc += need;
    level++;
    if (level > 999) return { level, intoLevel: 0, needed: dropsRequiredForLevel(level + 1) };
  }
}

// ============================================================
// Body measurement points per region
// ============================================================
export const MEASUREMENT_POINTS: Record<BodyRegion, string[]> = {
  leftArm:  ["wrist", "mid forearm", "upper arm"],
  rightArm: ["wrist", "mid forearm", "upper arm"],
  leftLeg:  ["ankle", "calf", "thigh"],
  rightLeg: ["ankle", "calf", "thigh"],
};

export const REGION_LABEL: Record<BodyRegion, string> = {
  leftArm: "Left arm", rightArm: "Right arm",
  leftLeg: "Left leg", rightLeg: "Right leg",
};

export function visibleRegions(profile: UserProfile): BodyRegion[] {
  const regions: BodyRegion[] = [];
  const wantsArm = profile.area === "arm" || profile.area === "both";
  const wantsLeg = profile.area === "leg" || profile.area === "both";
  const wantsLeft = profile.side === "left" || profile.side === "both";
  const wantsRight = profile.side === "right" || profile.side === "both";
  if (wantsArm && wantsLeft) regions.push("leftArm");
  if (wantsArm && wantsRight) regions.push("rightArm");
  if (wantsLeg && wantsLeft) regions.push("leftLeg");
  if (wantsLeg && wantsRight) regions.push("rightLeg");
  return regions;
}

// ============================================================
// Hook
// ============================================================
export function useDroppiStore() {
  const [days, setDays] = usePersistedState<Record<string, DayData>>("droppi-days-v3", {});
  const [totalDrops, setTotalDrops] = usePersistedState<number>("droppi-total-drops", 0);
  const [totalDots, setTotalDots] = usePersistedState<number>("droppi-total-dots", 0);
  const [settings, setSettings] = usePersistedState<AppSettings>("droppi-settings-v3", defaultSettings);
  const [lastWeeklyBonusISO, setLastWeeklyBonusISO] = usePersistedState<string | null>("droppi-last-weekly", null);

  const today = todayKey();
  const todayData: DayData = useMemo(() => normalizeDay(today, days[today]), [days, today]);

  // Derived
  const waterMl = todayData.waterEntries.reduce((s, e) => s + e.ml, 0);
  const breaksTaken = todayData.breaks.filter(b => b.completed).length;
  const compressionMinutes = todayData.compressionSessions.reduce((s, c) => s + c.minutes, 0);
  const lymphDotMinutes = todayData.lymphDotSessions.reduce((s, c) => s + c.minutes, 0);
  const ipkMinutes = todayData.ipkSessions.reduce((s, c) => s + c.minutes, 0);
  const mldMinutes = todayData.mldSessions.reduce((s, c) => s + c.minutes, 0);
  const lastMood: Mood = todayData.moodEntries.length
    ? todayData.moodEntries[todayData.moodEntries.length - 1].mood
    : null;
  const lastMoodAt: number | null = todayData.moodEntries.length
    ? todayData.moodEntries[todayData.moodEntries.length - 1].at
    : null;
  const checkinDoneToday = todayData.checkins.length > 0;

  const updateDay = useCallback((dateKey: string, updater: (d: DayData) => DayData) => {
    setDays(prev => ({ ...prev, [dateKey]: updater(normalizeDay(dateKey, prev[dateKey])) }));
  }, [setDays]);

  type Action =
    | { type: "mood"; mood: Exclude<Mood, null> }
    | { type: "checkin"; data: Omit<CheckinEntry, "at"> }
    | { type: "dailyCheck"; data: Omit<DailyCheckData, "at"> }
    | { type: "water"; ml: number; source?: WaterEntry["source"] }
    | { type: "break"; durationSec: number; completed: boolean }
    | { type: "compressionSession"; minutes: number }
    | { type: "lymphDotSession"; minutes: number; mode: LymphDotMode }
    | { type: "ipkSession"; minutes: number }
    | { type: "mldSession"; minutes: 30 | 45 | 60 }
    | { type: "symptom"; data: Omit<SymptomEntry, "at"> }
    | { type: "measurement"; data: Omit<MeasurementEntry, "at"> };

  const applyAction = useCallback((action: Action): { drops: number; dots: number; meaningful: boolean } => {
    let drops = 0;
    let dots = 0;
    let meaningful = false;
    const now = Date.now();

    updateDay(today, (d) => {
      const next = { ...d };

      if (action.type === "mood") {
        if (next.moodEntries.length >= 4) return next;
        next.moodEntries = [...next.moodEntries, { at: now, mood: action.mood }];
        // No drops for bare mood — checkin gives the reward
        meaningful = true;
      }

      if (action.type === "checkin") {
        next.checkins = [...next.checkins, { at: now, ...action.data }];
        next.moodEntries = [...next.moodEntries, { at: now, mood: action.data.mood }];
        if (d.checkins.length === 0) drops = 5;
        meaningful = true;
      }

      if (action.type === "dailyCheck") {
        next.dailyCheck = { at: now, ...action.data };
        if (!d.dailyCheck) drops = 5;
        meaningful = true;
      }

      if (action.type === "water") {
        next.waterEntries = [...next.waterEntries, { at: now, ml: action.ml, source: action.source ?? "manual" }];
        const totalBefore = d.waterEntries.reduce((s, e) => s + e.ml, 0);
        const cappedBefore = Math.min(totalBefore, WATER_DAILY_REWARD_CAP_ML);
        const cappedAfter = Math.min(totalBefore + action.ml, WATER_DAILY_REWARD_CAP_ML);
        drops = waterDrops(cappedAfter - cappedBefore);
        meaningful = true;
      }

      if (action.type === "break") {
        next.breaks = [...next.breaks, { at: now, durationSec: action.durationSec, completed: action.completed }];
        if (action.completed) { drops = 5; meaningful = true; }
      }

      if (action.type === "compressionSession") {
        const before = d.compressionSessions.reduce((s, c) => s + c.minutes, 0);
        next.compressionSessions = [
          ...next.compressionSessions,
          { startedAt: now - action.minutes * 60_000, endedAt: now, minutes: action.minutes },
        ];
        drops = compressionDropsForMinutes(before + action.minutes) - compressionDropsForMinutes(before);
        meaningful = action.minutes > 0;
      }

      if (action.type === "lymphDotSession") {
        next.lymphDotSessions = [
          ...next.lymphDotSessions,
          { startedAt: now - action.minutes * 60_000, endedAt: now, minutes: action.minutes, mode: action.mode },
        ];
        drops = lymphDotSessionDrops(action.minutes);
        const dotsAlready = d.lymphDotSessions.reduce(
          (s, sess) => s + (sess.minutes >= LYMPHDOT_MIN_MINUTES_FOR_DOT ? 1 : 0),
          0,
        );
        dots = lymphDotDotsForSession(action.minutes, dotsAlready);
        meaningful = action.minutes > 0;
      }

      if (action.type === "ipkSession") {
        const before = d.ipkSessions.reduce((s, c) => s + c.minutes, 0);
        next.ipkSessions = [
          ...next.ipkSessions,
          { startedAt: now - action.minutes * 60_000, endedAt: now, minutes: action.minutes },
        ];
        drops = ipkDropsForMinutes(before + action.minutes) - ipkDropsForMinutes(before);
        meaningful = action.minutes > 0;
      }

      if (action.type === "mldSession") {
        next.mldSessions = [...next.mldSessions, { at: now, minutes: action.minutes }];
        if (d.mldSessions.length < MLD_DAILY_REWARD_LIMIT) drops = 10;
        meaningful = true;
      }

      if (action.type === "symptom") {
        next.symptomEntries = [...next.symptomEntries, { at: now, ...action.data }];
        meaningful = true;
      }

      if (action.type === "measurement") {
        next.measurementEntries = [...next.measurementEntries, { at: now, ...action.data }];
        meaningful = true;
      }

      next.dropsEarned = (next.dropsEarned || 0) + drops;
      next.dotsEarned = (next.dotsEarned || 0) + dots;
      return next;
    });

    if (drops) setTotalDrops(p => p + drops);
    if (dots) setTotalDots(p => p + dots);
    return { drops, dots, meaningful };
  }, [today, updateDay, setTotalDrops, setTotalDots]);

  // Public action helpers
  const setMood = useCallback((mood: Mood) => {
    if (!mood) return;
    applyAction({ type: "mood", mood });
  }, [applyAction]);

  const addCheckin = useCallback((data: Omit<CheckinEntry, "at">) => applyAction({ type: "checkin", data }), [applyAction]);
  const addDailyCheck = useCallback((data: Omit<DailyCheckData, "at">) => applyAction({ type: "dailyCheck", data }), [applyAction]);
  const addWater = useCallback((ml?: number) => applyAction({ type: "water", ml: ml ?? settings.waterGlassMl }), [applyAction, settings.waterGlassMl]);
  const addBreak = useCallback((durationSec?: number) => applyAction({ type: "break", durationSec: durationSec ?? settings.breakDurationSeconds, completed: true }), [applyAction, settings.breakDurationSeconds]);
  const cancelBreak = useCallback((elapsedSec: number) => applyAction({ type: "break", durationSec: elapsedSec, completed: false }), [applyAction]);
  const addCompressionMinutes = useCallback((minutes: number) => { if (minutes > 0) applyAction({ type: "compressionSession", minutes }); }, [applyAction]);
  const addLymphDotMinutes = useCallback((minutes: number, mode?: LymphDotMode) => { if (minutes > 0) applyAction({ type: "lymphDotSession", minutes, mode: mode ?? settings.lymphDotDefaultMode }); }, [applyAction, settings.lymphDotDefaultMode]);
  const addIPKMinutes = useCallback((minutes: number) => { if (minutes > 0) applyAction({ type: "ipkSession", minutes }); }, [applyAction]);
  const addMLDSession = useCallback((minutes: 30 | 45 | 60) => applyAction({ type: "mldSession", minutes }), [applyAction]);
  const addSymptom = useCallback((data: Omit<SymptomEntry, "at">) => applyAction({ type: "symptom", data }), [applyAction]);
  const addMeasurement = useCallback((data: Omit<MeasurementEntry, "at">) => applyAction({ type: "measurement", data }), [applyAction]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...updates })), [setSettings]);
  const updateProfile = useCallback((updates: Partial<UserProfile>) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, ...updates } })), [setSettings]);
  const updateReminders = useCallback((updates: Partial<AppSettings["reminders"]>) => setSettings(prev => ({ ...prev, reminders: { ...prev.reminders, ...updates } })), [setSettings]);
  const updateGoals = useCallback((updates: Partial<Goals>) => setSettings(prev => ({ ...prev, goals: { ...prev.goals, ...updates } })), [setSettings]);
  const updateDailyGoals = useCallback((updates: Partial<DailyGoals>) => setSettings(prev => ({ ...prev, goals: { ...prev.goals, daily: { ...prev.goals.daily, ...updates } } })), [setSettings]);

  const updateToday = useCallback((updates: Partial<DayData>) => updateDay(today, (d) => ({ ...d, ...updates })), [today, updateDay]);
  const addDrops = useCallback((amount: number) => { setTotalDrops(p => p + amount); updateDay(today, (d) => ({ ...d, dropsEarned: (d.dropsEarned || 0) + amount })); }, [setTotalDrops, today, updateDay]);
  const addDots = useCallback((amount: number) => { setTotalDots(p => p + amount); updateDay(today, (d) => ({ ...d, dotsEarned: (d.dotsEarned || 0) + amount })); }, [setTotalDots, today, updateDay]);

  // Streaks
  const isMeaningful = (d: DayData | undefined) => {
    if (!d) return false;
    return (
      (d.moodEntries?.length ?? 0) > 0 ||
      (d.waterEntries?.length ?? 0) > 0 ||
      (d.breaks?.some(b => b.completed) ?? false) ||
      (d.compressionSessions?.length ?? 0) > 0 ||
      (d.lymphDotSessions?.length ?? 0) > 0 ||
      (d.ipkSessions?.length ?? 0) > 0 ||
      (d.mldSessions?.length ?? 0) > 0 ||
      (d.checkins?.length ?? 0) > 0
    );
  };

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    if (isMeaningful(days[todayKey()])) count++;
    for (let i = 1; i <= 365; i++) {
      d.setDate(d.getDate() - 1);
      const key = d.toISOString().slice(0, 10);
      if (isMeaningful(days[key])) count++;
      else break;
    }
    return count;
  }, [days]);

  const isoWeekKey = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const weeklyStreakComplete = useMemo(() => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    for (let i = 0; i <= day; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - (day - i));
      const key = d.toISOString().slice(0, 10);
      if (!isMeaningful(days[key])) return false;
    }
    return day === 6;
  }, [days]);

  useEffect(() => {
    const wk = isoWeekKey(new Date());
    if (weeklyStreakComplete && lastWeeklyBonusISO !== wk) {
      setTotalDots(p => p + 1);
      setTotalDrops(p => p + 25);
      updateDay(today, (d) => ({ ...d, dropsEarned: (d.dropsEarned || 0) + 25, dotsEarned: (d.dotsEarned || 0) + 1 }));
      setLastWeeklyBonusISO(wk);
    }
  }, [weeklyStreakComplete, lastWeeklyBonusISO, setTotalDots, setTotalDrops, today, updateDay, setLastWeeklyBonusISO]);

  const streakSave = useCallback((dateKey: string, payment: "dot" | "drops"): boolean => {
    if (payment === "dot") { if (totalDots < 1) return false; setTotalDots(p => p - 1); }
    else { if (totalDrops < 100) return false; setTotalDrops(p => p - 100); }
    updateDay(dateKey, (d) => ({ ...d, breaks: [...d.breaks, { at: Date.now(), durationSec: 0, completed: true }] }));
    return true;
  }, [totalDots, totalDrops, setTotalDots, setTotalDrops, updateDay]);

  // Levels
  const { level, intoLevel, needed } = levelFromTotalDrops(totalDrops);
  const levelProgress = needed > 0 ? (intoLevel / needed) * 100 : 0;
  const dropsToNextLevel = Math.max(0, needed - intoLevel);
  const waterProgress = Math.min((waterMl / settings.waterGoalMl) * 100, 100);

  // Daily goal progress
  const goals = settings.goals;
  const careSessionsToday =
    todayData.lymphDotSessions.length +
    todayData.compressionSessions.length +
    todayData.ipkSessions.length +
    todayData.mldSessions.length;
  const dailyGoalProgress = {
    water: Math.min(100, (waterMl / Math.max(1, goals.daily.waterMl)) * 100),
    breaks: Math.min(100, (breaksTaken / Math.max(1, goals.daily.breaks)) * 100),
    compression: Math.min(100, (compressionMinutes / Math.max(1, goals.daily.compressionMin)) * 100),
    care: Math.min(100, (careSessionsToday / Math.max(1, goals.daily.careSessions)) * 100),
    checkin: checkinDoneToday ? 100 : 0,
  };

  // Range queries for Progress screen
  const getDays = useCallback((n: number): DayData[] => {
    const out: DayData[] = [];
    const d = new Date();
    for (let i = 0; i < n; i++) {
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i).toISOString().slice(0, 10);
      out.push(normalizeDay(key, days[key]));
    }
    return out.reverse();
  }, [days]);

  const compatTodayData = {
    ...todayData,
    mood: lastMood,
    waterMl,
    breaksTaken,
    compressionMinutes,
    lymphDotMinutes,
    ipkMinutes,
    mldMinutes,
  };

  // Body / health data completion (0–100)
  const bodyCompletion = useMemo(() => {
    const p = settings.profile;
    const fields: (keyof UserProfile)[] = [
      "area", "side", "age", "sex", "heightCm", "weightKg", "diagnosis", "diagnosisYear",
    ];
    const filled = fields.filter((k) => {
      const v = p[k];
      return v !== undefined && v !== null && v !== "" && !(typeof v === "number" && isNaN(v));
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [settings.profile]);

  const missingBodyFields = useMemo(() => {
    const p = settings.profile;
    const list: string[] = [];
    if (!p.age) list.push("age");
    if (!p.sex) list.push("sex");
    if (!p.heightCm) list.push("height");
    if (!p.weightKg) list.push("weight");
    if (!p.diagnosis) list.push("diagnosis");
    if (!p.diagnosisYear) list.push("diagnosis year");
    return list;
  }, [settings.profile]);

  const dailyCheckDoneToday = !!todayData.dailyCheck;

  // A day counts as "completed" for calendar (green check) when either the
  // explicit daily-check was done, or any care category has ≥15 min of activity.
  const isDayCompleted = useCallback((d: DayData | undefined): boolean => {
    if (!d) return false;
    if (d.dailyCheck) return true;
    const comp = d.compressionSessions.reduce((s, x) => s + x.minutes, 0);
    const lymph = d.lymphDotSessions.reduce((s, x) => s + x.minutes, 0);
    const pump = d.ipkSessions.reduce((s, x) => s + x.minutes, 0);
    const mld = d.mldSessions.reduce((s, x) => s + x.minutes, 0);
    return comp >= 15 || lymph >= 15 || pump >= 15 || mld >= 15;
  }, []);

  // Auto-enable a therapy flag once the user has logged ≥5 minutes for that
  // category today, even if it wasn't selected during onboarding.
  useEffect(() => {
    const uses = settings.profile.uses;
    const next = { ...uses };
    let changed = false;
    if (!uses.compression && compressionMinutes >= 5) { next.compression = true; changed = true; }
    if (!uses.lymphDot && lymphDotMinutes >= 5) { next.lymphDot = true; changed = true; }
    if (!uses.ipk && ipkMinutes >= 5) { next.ipk = true; changed = true; }
    if (!uses.mld && mldMinutes >= 5) { next.mld = true; changed = true; }
    if (changed) setSettings(prev => ({ ...prev, profile: { ...prev.profile, uses: next } }));
  }, [compressionMinutes, lymphDotMinutes, ipkMinutes, mldMinutes, settings.profile.uses, setSettings]);

  const canShowMood = useMemo(() => {
    if (todayData.moodEntries.length >= 4) return false;
    if (!lastMoodAt) return true;
    return Date.now() - lastMoodAt >= 4 * 60 * 60 * 1000;
  }, [todayData.moodEntries.length, lastMoodAt]);

  // ---- Demo seeding (for prototype previews) ----
  const seedDemoData = useCallback(() => {
    const rand = (lo: number, hi: number) => Math.floor(lo + Math.random() * (hi - lo + 1));
    const next: Record<string, DayData> = { ...days };
    for (let i = 13; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      const base = normalizeDay(key, next[key]);
      // ~85% of days are active
      if (Math.random() < 0.85) {
        const waterMl = rand(900, 2400);
        const glasses = Math.max(3, Math.round(waterMl / 250));
        base.waterEntries = Array.from({ length: glasses }, (_, j) => ({ at: d.getTime() + j * 36e5, ml: 250 }));
        const breakCount = rand(1, 4);
        base.breaks = Array.from({ length: breakCount }, (_, j) => ({ at: d.getTime() + j * 72e5, completed: true, durationSec: 60 }));
        const compMin = rand(0, 180);
        if (compMin > 0) base.compressionSessions = [{ startedAt: d.getTime(), endedAt: d.getTime() + compMin * 60000, minutes: compMin }];
        if (Math.random() < 0.55) { const m = rand(15, 45); base.lymphDotSessions = [{ startedAt: d.getTime(), endedAt: d.getTime() + m * 60000, minutes: m, mode: "standard" }]; }
        if (Math.random() < 0.4)  { const m = rand(20, 60); base.ipkSessions = [{ startedAt: d.getTime(), endedAt: d.getTime() + m * 60000, minutes: m }]; }
        if (Math.random() < 0.2)  base.mldSessions = [{ at: d.getTime(), minutes: 45 }];
        base.checkins = [{
          at: d.getTime() + 9 * 36e5,
          mood: (["okay", "good", "great", "low"] as const)[rand(0, 3)],
          heaviness: rand(1, 7), pain: rand(0, 6), tension: rand(1, 6),
        }];
        base.dropsEarned = rand(15, 60);
      }
      next[key] = base;
    }
    setDays(next);
    setTotalDrops(prev => prev + 420);
  }, [days, setDays, setTotalDrops]);

  const clearDemoData = useCallback(() => {
    const t = todayKey();
    setDays(prev => {
      const kept: Record<string, DayData> = {};
      if (prev[t]) kept[t] = prev[t];
      return kept;
    });
  }, [setDays]);

  return {
    // state
    todayData: compatTodayData,
    days,
    totalDrops,
    totalDots,
    level,
    levelProgress,
    dropsToNextLevel,
    streak,
    weeklyStreakComplete,
    waterProgress,
    settings,
    canShowMood,
    lastMoodAt,
    checkinDoneToday,
    dailyCheckDoneToday,
    bodyCompletion,
    missingBodyFields,
    dailyGoalProgress,
    careSessionsToday,
    // actions
    applyAction,
    setMood,
    addCheckin,
    addDailyCheck,
    addWater,
    addBreak,
    cancelBreak,
    addCompressionMinutes,
    addLymphDotMinutes,
    addIPKMinutes,
    addMLDSession,
    addSymptom,
    addMeasurement,
    updateToday,
    addDrops,
    addDots,
    streakSave,
    updateSettings,
    updateProfile,
    updateReminders,
    updateGoals,
    updateDailyGoals,
    // helpers
    nextCompressionMilestone: () => nextCompressionMilestone(compressionMinutes),
    compressionDropsToday: compressionDropsForMinutes(compressionMinutes),
    getDays,
    isDayCompleted,
    seedDemoData,
    clearDemoData,
  };
}
