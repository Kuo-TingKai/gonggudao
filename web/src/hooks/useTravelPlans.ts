import { createDefaultPlanData, renumberStops } from "@/data/defaultMiyakoPlan";
import {
  deleteLocalPlan,
  listLocalPlans,
  normalizePlanData,
  upsertLocalPlan,
} from "@/lib/localPlans";
import { getSupabase } from "@/lib/supabase";
import type { PlanData, TravelPlanRow } from "@/types/plan";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

type Mode = "cloud" | "local";

function rowFromDb(r: {
  id: string;
  title: string;
  data: unknown;
  created_at: string;
  updated_at: string;
}): TravelPlanRow {
  return {
    id: r.id,
    title: r.title,
    data: renumberStops(normalizePlanData(r.data)),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export function useTravelPlans() {
  const supabase = useMemo(() => getSupabase(), []);
  const mode: Mode = supabase ? "cloud" : "local";

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [plans, setPlans] = useState<TravelPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocal = useCallback(() => {
    setPlans(listLocalPlans());
  }, []);

  const refreshCloud = useCallback(async () => {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    let u = sessionData.session?.user ?? null;
    if (!u) {
      const { data, error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) {
        setError(anonErr.message);
        setAuthReady(true);
        setLoading(false);
        return;
      }
      u = data.user;
    }
    setUser(u);
    const { data, error: qErr } = await supabase
      .from("plans")
      .select("id,title,data,created_at,updated_at")
      .order("updated_at", { ascending: false });
    if (qErr) {
      setError(qErr.message);
    } else {
      setPlans((data ?? []).map(rowFromDb));
    }
    setAuthReady(true);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      refreshLocal();
      setLoading(false);
      setAuthReady(true);
      return;
    }
    void refreshCloud();
  }, [supabase, refreshCloud, refreshLocal]);

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshCloud();
    });
    return () => subscription.unsubscribe();
  }, [supabase, refreshCloud]);

  const savePlan = useCallback(
    async (row: TravelPlanRow) => {
      const normalized: TravelPlanRow = {
        ...row,
        data: renumberStops(normalizePlanData(row.data)),
        updated_at: new Date().toISOString(),
      };
      if (!supabase) {
        upsertLocalPlan(normalized);
        refreshLocal();
        return;
      }
      if (!user) {
        setError("雲端同步尚未就緒，請稍候再儲存。");
        return;
      }
      const payload = {
        id: normalized.id,
        user_id: user.id,
        title: normalized.title,
        data: normalized.data,
      };
      const { error: upErr } = await supabase.from("plans").upsert(payload, { onConflict: "id" });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      await refreshCloud();
    },
    [supabase, user, refreshCloud, refreshLocal],
  );

  const removePlan = useCallback(
    async (id: string) => {
      if (!supabase) {
        deleteLocalPlan(id);
        refreshLocal();
        return;
      }
      if (!user) {
        setError("雲端尚未就緒，無法刪除行程。");
        return;
      }
      const { error: delErr } = await supabase.from("plans").delete().eq("id", id);
      if (delErr) {
        setError(delErr.message);
        return;
      }
      await refreshCloud();
    },
    [supabase, user, refreshCloud, refreshLocal],
  );

  const createPlanFromDefault = useCallback(async () => {
    const data = createDefaultPlanData();
    const row: TravelPlanRow = {
      id: crypto.randomUUID(),
      title: "宮古島 · 四天三夜（預設）",
      data: renumberStops(normalizePlanData(data)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await savePlan(row);
    return row;
  }, [savePlan]);

  const createEmptyPlan = useCallback(async () => {
    const empty: PlanData = {
      stops: [],
      expenses: [],
      transports: [],
      tickets: [],
    };
    const row: TravelPlanRow = {
      id: crypto.randomUUID(),
      title: "新行程",
      data: renumberStops(normalizePlanData(empty)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await savePlan(row);
    return row;
  }, [savePlan]);

  return {
    mode,
    supabaseConfigured: Boolean(supabase),
    authReady,
    loading,
    error,
    setError,
    user,
    plans,
    refresh: supabase ? refreshCloud : refreshLocal,
    savePlan,
    removePlan,
    createPlanFromDefault,
    createEmptyPlan,
  };
}
