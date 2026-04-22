export type PeriodEntry = {
  id: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  flow: "ringan" | "sedang" | "berat";
  symptoms: string[];
  mood: string;
  notes?: string;
};

export const SYMPTOM_OPTIONS = [
  "Kram perut",
  "Sakit kepala",
  "Nyeri punggung",
  "Mual",
  "Lelah",
  "Kembung",
  "Jerawat",
  "Sensitif payudara",
];

export const MOOD_OPTIONS = [
  { value: "bahagia", label: "Bahagia", emoji: "😊" },
  { value: "tenang", label: "Tenang", emoji: "😌" },
  { value: "lelah", label: "Lelah", emoji: "😴" },
  { value: "sedih", label: "Sedih", emoji: "😢" },
  { value: "marah", label: "Marah", emoji: "😠" },
  { value: "cemas", label: "Cemas", emoji: "😟" },
];

export function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export type Stats = {
  avgCycleLength: number;
  avgPeriodDuration: number;
  shortestCycle: number;
  longestCycle: number;
  totalCycles: number;
  nextPredictedStart: Date | null;
  nextPredictedEnd: Date | null;
  daysUntilNext: number | null;
  currentPhase: string;
};

export function computeStats(entries: PeriodEntry[]): Stats {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const durations = sorted.map((e) =>
    daysBetween(new Date(e.startDate), new Date(e.endDate)) + 1
  );
  const avgPeriodDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const cycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    cycleLengths.push(
      daysBetween(new Date(sorted[i - 1].startDate), new Date(sorted[i].startDate))
    );
  }
  const avgCycleLength = cycleLengths.length
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  const shortestCycle = cycleLengths.length ? Math.min(...cycleLengths) : 0;
  const longestCycle = cycleLengths.length ? Math.max(...cycleLengths) : 0;

  let nextPredictedStart: Date | null = null;
  let nextPredictedEnd: Date | null = null;
  let daysUntilNext: number | null = null;
  let currentPhase = "Tidak diketahui";

  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    nextPredictedStart = addDays(new Date(last.startDate), avgCycleLength);
    nextPredictedEnd = addDays(nextPredictedStart, avgPeriodDuration - 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysUntilNext = daysBetween(today, nextPredictedStart);

    const lastEnd = new Date(last.endDate);
    const dayInCycle = daysBetween(new Date(last.startDate), today) + 1;
    if (today >= new Date(last.startDate) && today <= lastEnd) {
      currentPhase = "Menstruasi";
    } else if (dayInCycle >= avgCycleLength - 16 && dayInCycle <= avgCycleLength - 12) {
      currentPhase = "Ovulasi";
    } else if (dayInCycle < avgCycleLength - 16) {
      currentPhase = "Folikuler";
    } else {
      currentPhase = "Luteal";
    }
  }

  return {
    avgCycleLength,
    avgPeriodDuration,
    shortestCycle,
    longestCycle,
    totalCycles: sorted.length,
    nextPredictedStart,
    nextPredictedEnd,
    daysUntilNext,
    currentPhase,
  };
}

export function isInPeriod(date: Date, entries: PeriodEntry[]) {
  return entries.some((e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  });
}

export function isInPredicted(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);
  return date >= s && date <= e;
}

const STORAGE_KEY = "lunaflow-entries-v1";

export function loadEntries(): PeriodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEntries();
    return JSON.parse(raw);
  } catch {
    return seedEntries();
  }
}

export function saveEntries(entries: PeriodEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function seedEntries(): PeriodEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const seed: PeriodEntry[] = [];
  for (let i = 3; i >= 1; i--) {
    const start = addDays(today, -28 * i);
    const end = addDays(start, 4);
    seed.push({
      id: `seed-${i}`,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      flow: i === 1 ? "sedang" : "ringan",
      symptoms: ["Kram perut", "Lelah"],
      mood: "tenang",
    });
  }
  saveEntries(seed);
  return seed;
}
