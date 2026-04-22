import { MOOD_OPTIONS } from "./cycle";

export type WellnessLog = {
  date: string; // YYYY-MM-DD
  water: number; // glasses (0-12)
  sleep: number; // hours (0-12)
  exercise: number; // minutes
  mood: string; // mood value
  energy: number; // 1-5
  notes?: string;
};

const STORAGE_KEY = "lunaflow-wellness-v1";

export function todayKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function loadWellness(): Record<string, WellnessLog> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedWellness();
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveWellness(data: Record<string, WellnessLog>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function seedWellness(): Record<string, WellnessLog> {
  const data: Record<string, WellnessLog> = {};
  const moods = ["bahagia", "tenang", "lelah", "tenang", "bahagia", "cemas", "tenang"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    data[key] = {
      date: key,
      water: 4 + Math.floor(Math.random() * 5),
      sleep: 6 + Math.random() * 2,
      exercise: Math.floor(Math.random() * 45),
      mood: moods[6 - i],
      energy: 2 + Math.floor(Math.random() * 4),
    };
  }
  saveWellness(data);
  return data;
}

export type WellnessStats = {
  avgWater: number;
  avgSleep: number;
  avgExercise: number;
  topMood: { value: string; emoji: string; label: string; count: number } | null;
  streak: number; // consecutive days with any log
  last7: WellnessLog[];
};

export function computeWellnessStats(data: Record<string, WellnessLog>): WellnessStats {
  const last7: WellnessLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    last7.push(
      data[key] ?? {
        date: key,
        water: 0,
        sleep: 0,
        exercise: 0,
        mood: "",
        energy: 0,
      }
    );
  }

  const filled = last7.filter((l) => l.water || l.sleep || l.exercise || l.mood);
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const moodCount: Record<string, number> = {};
  filled.forEach((l) => {
    if (l.mood) moodCount[l.mood] = (moodCount[l.mood] || 0) + 1;
  });
  let topMood: WellnessStats["topMood"] = null;
  const topEntry = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
  if (topEntry) {
    const opt = MOOD_OPTIONS.find((m) => m.value === topEntry[0]);
    if (opt) topMood = { value: opt.value, emoji: opt.emoji, label: opt.label, count: topEntry[1] };
  }

  // streak from today backwards
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    if (data[key]) streak++;
    else break;
  }

  return {
    avgWater: Math.round(avg(filled.map((l) => l.water)) * 10) / 10,
    avgSleep: Math.round(avg(filled.map((l) => l.sleep)) * 10) / 10,
    avgExercise: Math.round(avg(filled.map((l) => l.exercise))),
    topMood,
    streak,
    last7,
  };
}
