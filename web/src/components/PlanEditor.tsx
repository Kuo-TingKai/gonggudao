import type {
  ExpenseCategory,
  ExpenseItem,
  PlanStop,
  TicketItem,
  TicketKind,
  TransportLeg,
  TravelPlanRow,
} from "@/types/plan";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const expenseLabels: Record<ExpenseCategory, string> = {
  flight: "機票",
  train: "鐵路",
  ferry: "渡輪",
  bus: "巴士",
  rental: "租車",
  ticket: "門票",
  activity: "活動／體驗",
  hotel: "住宿",
  food: "餐食",
  insurance: "保險",
  other: "其他",
};

const ticketLabels: Record<TicketKind, string> = {
  flight: "國際線機票",
  domestic_flight: "國內線機票",
  train: "鐵路票",
  ferry: "渡輪票",
  bus: "巴士票",
  attraction: "景點門票",
  activity: "活動／體驗",
  hotel: "住宿訂房",
  rental: "租車預約",
  other: "其他",
};

type Tab = "stops" | "expenses" | "transport" | "tickets";

function sumExpenses(items: ExpenseItem[]): number {
  return items.reduce((acc, e) => acc + (Number(e.amountTwd) || 0), 0);
}

export function PlanEditor({
  plan,
  onSave,
  onDelete,
}: {
  plan: TravelPlanRow;
  onSave: (row: TravelPlanRow) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>("stops");
  const [working, setWorking] = useState<TravelPlanRow>(plan);
  const workingRef = useRef(working);
  workingRef.current = working;
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setWorking(plan);
  }, [plan.id]);

  const scheduleSave = useCallback(
    (next: TravelPlanRow) => {
      setWorking(next);
      if (timer.current) clearTimeout(timer.current);
      setSaveState("saving");
      timer.current = setTimeout(async () => {
        await onSave(next);
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 1200);
      }, 650);
    },
    [onSave],
  );

  const saveFromRef = useCallback(
    (build: (prev: TravelPlanRow) => TravelPlanRow) => {
      const next = build(workingRef.current);
      scheduleSave(next);
    },
    [scheduleSave],
  );

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const totalTwd = useMemo(() => sumExpenses(working.data.expenses), [working.data.expenses]);

  const moveStop = (id: string, dir: -1 | 1) => {
    saveFromRef((prev) => {
      const stops = [...prev.data.stops].sort((a, b) => a.order - b.order);
      const idx = stops.findIndex((s) => s.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= stops.length) return prev;
      const o = stops[idx].order;
      stops[idx].order = stops[j].order;
      stops[j].order = o;
      return {
        ...prev,
        data: { ...prev.data, stops },
        updated_at: new Date().toISOString(),
      };
    });
  };

  const addStop = () => {
    saveFromRef((prev) => {
      const maxOrder = prev.data.stops.reduce((m, s) => Math.max(m, s.order), 0);
      const s: PlanStop = {
        id: crypto.randomUUID(),
        order: maxOrder + 1,
        name: "新景點",
        highlight: "",
        region: "",
      };
      return {
        ...prev,
        data: { ...prev.data, stops: [...prev.data.stops, s] },
        updated_at: new Date().toISOString(),
      };
    });
  };

  const patchStop = (id: string, patch: Partial<PlanStop>) => {
    saveFromRef((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        stops: prev.data.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      },
      updated_at: new Date().toISOString(),
    }));
  };

  const removeStop = (id: string) => {
    saveFromRef((prev) => ({
      ...prev,
      data: { ...prev.data, stops: prev.data.stops.filter((s) => s.id !== id) },
      updated_at: new Date().toISOString(),
    }));
  };

  const addExpense = () => {
    saveFromRef((prev) => {
      const e: ExpenseItem = {
        id: crypto.randomUUID(),
        category: "other",
        name: "項目",
        amountTwd: 0,
      };
      return {
        ...prev,
        data: { ...prev.data, expenses: [...prev.data.expenses, e] },
        updated_at: new Date().toISOString(),
      };
    });
  };

  const patchExpense = (id: string, patch: Partial<ExpenseItem>) => {
    saveFromRef((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        expenses: prev.data.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
      updated_at: new Date().toISOString(),
    }));
  };

  const removeExpense = (id: string) => {
    saveFromRef((prev) => ({
      ...prev,
      data: { ...prev.data, expenses: prev.data.expenses.filter((e) => e.id !== id) },
      updated_at: new Date().toISOString(),
    }));
  };

  const addTransport = () => {
    saveFromRef((prev) => {
      const maxOrder = prev.data.transports.reduce((m, t) => Math.max(m, t.order), 0);
      const t: TransportLeg = {
        id: crypto.randomUUID(),
        order: maxOrder + 1,
        from: "出發地",
        to: "目的地",
        mode: "交通工具",
        duration: "",
        notes: "",
      };
      return {
        ...prev,
        data: { ...prev.data, transports: [...prev.data.transports, t] },
        updated_at: new Date().toISOString(),
      };
    });
  };

  const moveTransport = (id: string, dir: -1 | 1) => {
    saveFromRef((prev) => {
      const legs = [...prev.data.transports].sort((a, b) => a.order - b.order);
      const idx = legs.findIndex((x) => x.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= legs.length) return prev;
      const o = legs[idx].order;
      legs[idx].order = legs[j].order;
      legs[j].order = o;
      return {
        ...prev,
        data: { ...prev.data, transports: legs },
        updated_at: new Date().toISOString(),
      };
    });
  };

  const patchTransport = (id: string, patch: Partial<TransportLeg>) => {
    saveFromRef((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        transports: prev.data.transports.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      },
      updated_at: new Date().toISOString(),
    }));
  };

  const removeTransport = (id: string) => {
    saveFromRef((prev) => ({
      ...prev,
      data: { ...prev.data, transports: prev.data.transports.filter((t) => t.id !== id) },
      updated_at: new Date().toISOString(),
    }));
  };

  const addTicket = () => {
    saveFromRef((prev) => {
      const t: TicketItem = {
        id: crypto.randomUUID(),
        kind: "other",
        name: "票務／預訂項目",
        notes: "",
        purchased: false,
      };
      return {
        ...prev,
        data: { ...prev.data, tickets: [...prev.data.tickets, t] },
        updated_at: new Date().toISOString(),
      };
    });
  };

  const patchTicket = (id: string, patch: Partial<TicketItem>) => {
    saveFromRef((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        tickets: prev.data.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      },
      updated_at: new Date().toISOString(),
    }));
  };

  const removeTicket = (id: string) => {
    saveFromRef((prev) => ({
      ...prev,
      data: { ...prev.data, tickets: prev.data.tickets.filter((t) => t.id !== id) },
      updated_at: new Date().toISOString(),
    }));
  };

  const stopsSorted = [...working.data.stops].sort((a, b) => a.order - b.order);
  const transportsSorted = [...working.data.transports].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white/95 p-6 shadow-lg shadow-sky-100/40">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="min-w-[200px] flex-1 space-y-2">
          <label className="block text-xs font-medium uppercase text-slate-500">行程名稱</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg font-semibold text-slate-900 outline-none ring-sky-400/30 focus:border-sky-400 focus:ring-4"
            value={working.title}
            onChange={(e) =>
              saveFromRef((prev) => ({
                ...prev,
                title: e.target.value,
                updated_at: new Date().toISOString(),
              }))
            }
          />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-slate-500">
            {saveState === "saving" && "儲存中…"}
            {saveState === "saved" && "已儲存"}
            {saveState === "idle" && " "}
          </span>
          <button
            type="button"
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
            onClick={() => {
              if (confirm("確定刪除此行程？")) void onDelete(plan.id);
            }}
          >
            刪除行程
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {(
          [
            ["stops", "景點與順序"],
            ["expenses", "費用預估"],
            ["transport", "交通與通勤"],
            ["tickets", "票務清單"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === k ? "bg-sky-600 text-white shadow" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-500">費用合計（可編輯項）</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-900">
            NT$ {totalTwd.toLocaleString("zh-TW")}
          </span>
        </div>
      </div>

      {tab === "stops" && (
        <section className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">
            拖曳順序可使用下方「上移／下移」。對應四天三夜懶人包時，可利用「建議日」備註於第幾天。
          </p>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={addStop}
          >
            新增景點列
          </button>
          <ul className="space-y-3">
            {stopsSorted.map((s, i) => (
              <li
                key={s.id}
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-sky-50/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">
                    #{i + 1}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => moveStop(s.id, -1)}
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                    onClick={() => moveStop(s.id, 1)}
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-rose-600 hover:underline"
                    onClick={() => removeStop(s.id)}
                  >
                    刪除
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block text-xs text-slate-500">
                    景點名稱
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={s.name}
                      onChange={(e) => patchStop(s.id, { name: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    區域
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={s.region ?? ""}
                      onChange={(e) => patchStop(s.id, { region: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500 md:col-span-2">
                    亮點／備註
                    <textarea
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      rows={2}
                      value={s.highlight ?? ""}
                      onChange={(e) => patchStop(s.id, { highlight: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    建議日（1–5）
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={s.dayHint ?? ""}
                      onChange={(e) =>
                        patchStop(s.id, {
                          dayHint: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "expenses" && (
        <section className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">
            金額為新台幣參考值，可依實際開票與預約調整；勾選「已訂」方便追蹤。
          </p>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={addExpense}
          >
            新增費用列
          </button>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2">類別</th>
                  <th className="py-2 pr-2">項目</th>
                  <th className="py-2 pr-2">金額 TWD</th>
                  <th className="py-2 pr-2">備註</th>
                  <th className="py-2 pr-2">已訂</th>
                  <th className="py-2 pr-2" />
                </tr>
              </thead>
              <tbody>
                {working.data.expenses.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2">
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                        value={e.category}
                        onChange={(ev) =>
                          patchExpense(e.id, { category: ev.target.value as ExpenseCategory })
                        }
                      >
                        {(Object.keys(expenseLabels) as ExpenseCategory[]).map((k) => (
                          <option key={k} value={k}>
                            {expenseLabels[k]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                        value={e.name}
                        onChange={(ev) => patchExpense(e.id, { name: ev.target.value })}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                        value={e.amountTwd ?? ""}
                        onChange={(ev) =>
                          patchExpense(e.id, {
                            amountTwd: ev.target.value === "" ? undefined : Number(ev.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <textarea
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                        rows={2}
                        value={e.notes ?? ""}
                        onChange={(ev) => patchExpense(e.id, { notes: ev.target.value })}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={Boolean(e.booked)}
                        onChange={(ev) => patchExpense(e.id, { booked: ev.target.checked })}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        className="text-xs text-rose-600 hover:underline"
                        onClick={() => removeExpense(e.id)}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "transport" && (
        <section className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">
            依旅程時間軸排列：國際線、島內租車動線、活動船班與返程。可對照攻略中的直飛／那霸轉機方案自行修改。
          </p>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={addTransport}
          >
            新增交通段
          </button>
          <ol className="space-y-4">
            {transportsSorted.map((t, i) => (
              <li
                key={t.id}
                className="relative rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 pl-10"
              >
                <span className="absolute left-3 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                    onClick={() => moveTransport(t.id, -1)}
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                    onClick={() => moveTransport(t.id, 1)}
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-rose-600 hover:underline"
                    onClick={() => removeTransport(t.id)}
                  >
                    刪除
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block text-xs text-slate-500">
                    起點
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.from}
                      onChange={(e) => patchTransport(t.id, { from: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    迄點
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.to}
                      onChange={(e) => patchTransport(t.id, { to: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    交通工具／方式
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.mode}
                      onChange={(e) => patchTransport(t.id, { mode: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    預估時間
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.duration ?? ""}
                      onChange={(e) => patchTransport(t.id, { duration: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500 md:col-span-2">
                    備註（證件、航空公司、預約編號等）
                    <textarea
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      rows={2}
                      value={t.notes ?? ""}
                      onChange={(e) => patchTransport(t.id, { notes: e.target.value })}
                    />
                  </label>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tab === "tickets" && (
        <section className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">
            機票、國內線、租車、活動與門票等「需要預訂／購票」的勾稽清單；勾選代表已處理。
          </p>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={addTicket}
          >
            新增票務項目
          </button>
          <ul className="space-y-3">
            {working.data.tickets.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 md:flex-row md:items-start"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(t.purchased)}
                    onChange={(e) => patchTicket(t.id, { purchased: e.target.checked })}
                  />
                  已完成
                </label>
                <div className="grid flex-1 gap-3 md:grid-cols-2">
                  <label className="block text-xs text-slate-500">
                    類型
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.kind}
                      onChange={(e) => patchTicket(t.id, { kind: e.target.value as TicketKind })}
                    >
                      {(Object.keys(ticketLabels) as TicketKind[]).map((k) => (
                        <option key={k} value={k}>
                          {ticketLabels[k]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-slate-500 md:col-span-2">
                    項目說明
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={t.name}
                      onChange={(e) => patchTicket(t.id, { name: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs text-slate-500 md:col-span-2">
                    備註（連結、訂位代號）
                    <textarea
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      rows={2}
                      value={t.notes ?? ""}
                      onChange={(e) => patchTicket(t.id, { notes: e.target.value })}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="text-xs text-rose-600 hover:underline md:ml-auto"
                  onClick={() => removeTicket(t.id)}
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
