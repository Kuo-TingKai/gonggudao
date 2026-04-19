import { PlanEditor } from "@/components/PlanEditor";
import { useTravelPlans } from "@/hooks/useTravelPlans";
import { useEffect, useState } from "react";

export default function App() {
  const hook = useTravelPlans();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!hook.loading && hook.plans.length && selectedId === null) {
      setSelectedId(hook.plans[0].id);
    }
  }, [hook.loading, hook.plans, selectedId]);

  useEffect(() => {
    if (selectedId && !hook.plans.some((p) => p.id === selectedId)) {
      setSelectedId(hook.plans[0]?.id ?? null);
    }
  }, [hook.plans, selectedId]);

  const selected = hook.plans.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="min-h-screen text-slate-800">
      <header className="border-b border-sky-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-sky-900">宮古島 · 旅遊計畫</h1>
            <p className="text-sm text-slate-500">
              編輯景點與順序、費用、交通通勤與票務 — 資料來源整理自宮古島攻略筆記
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {hook.mode === "cloud" ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
                Supabase 雲端
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-900">
                本機儲存（未設定環境變數）
              </span>
            )}
            {hook.error ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">{hook.error}</span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm shadow-sky-100/50">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-800/80">
              我的行程
            </h2>
            {hook.loading ? (
              <p className="text-sm text-slate-500">載入中…</p>
            ) : (
              <ul className="space-y-2">
                {hook.plans.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        p.id === selectedId
                          ? "border-sky-400 bg-sky-50 text-sky-950"
                          : "border-transparent bg-slate-50 hover:border-sky-200"
                      }`}
                    >
                      <span className="line-clamp-2 font-medium">{p.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        更新 {new Date(p.updated_at).toLocaleString("zh-TW")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-sky-700"
                onClick={async () => {
                  const row = await hook.createPlanFromDefault();
                  setSelectedId(row.id);
                  hook.setError(null);
                }}
              >
                載入預設行程（四天三夜）
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:border-sky-300"
                onClick={async () => {
                  const row = await hook.createEmptyPlan();
                  setSelectedId(row.id);
                  hook.setError(null);
                }}
              >
                新增空白行程
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-emerald-950">
            <p className="font-semibold text-emerald-900">GitHub Pages</p>
            <p className="mt-2 leading-relaxed">
              建置後網址為{" "}
              <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
                https://&lt;帳號&gt;.github.io/gonggudao/
              </code>
              ，請在 Supabase 專案設定允許此來源（Authentication → URL
              configuration）。
            </p>
          </div>
        </aside>

        <main>
          {!hook.authReady || hook.loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center text-slate-500">
              正在準備編輯器…
            </div>
          ) : selected ? (
            <PlanEditor
              key={selected.id}
              plan={selected}
              onSave={hook.savePlan}
              onDelete={async (id) => {
                await hook.removePlan(id);
                hook.setError(null);
              }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center text-slate-500">
              請左側建立或選擇一個行程。
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-center text-xs text-slate-500">
        島上建議租車自駕；證件與預約資訊請依官方與店家最新公告為準。
      </footer>
    </div>
  );
}
