import type { PlanData, TravelPlanRow } from "@/types/plan";

const STORAGE_KEY = "gonggudao-plans-v1";

interface LocalBucket {
  plans: TravelPlanRow[];
}

function loadBucket(): LocalBucket {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { plans: [] };
    const parsed = JSON.parse(raw) as LocalBucket;
    if (!parsed?.plans || !Array.isArray(parsed.plans)) return { plans: [] };
    return parsed;
  } catch {
    return { plans: [] };
  }
}

function saveBucket(b: LocalBucket) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

export function listLocalPlans(): TravelPlanRow[] {
  return loadBucket().plans
    .map((p) => ({
      ...p,
      data: normalizePlanData(p.data),
    }))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function upsertLocalPlan(row: TravelPlanRow) {
  const b = loadBucket();
  const i = b.plans.findIndex((p) => p.id === row.id);
  if (i >= 0) b.plans[i] = row;
  else b.plans.unshift(row);
  saveBucket(b);
}

export function deleteLocalPlan(id: string) {
  const b = loadBucket();
  b.plans = b.plans.filter((p) => p.id !== id);
  saveBucket(b);
}

export function emptyLocalData() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Ensure PlanData shape when reading from storage */
export function normalizePlanData(raw: unknown): PlanData {
  const d = raw as Partial<PlanData>;
  return {
    stops: Array.isArray(d.stops) ? d.stops : [],
    expenses: Array.isArray(d.expenses) ? d.expenses : [],
    transports: Array.isArray(d.transports) ? d.transports : [],
    tickets: Array.isArray(d.tickets) ? d.tickets : [],
  };
}
