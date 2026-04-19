# 宮古島 · 旅遊計畫網站（gonggudao）

依 `gonggudao.md` 整理的宮古島自由行內容，做成可編輯的網頁：**景點與順序**、**費用預估**、**交通與通勤時間軸**、**機票／車船票／門票勾選清單**。預設載入「四天三夜」懶人包草稿，可自行增刪調整。

後端使用 [Supabase](https://supabase.com/)（PostgreSQL + Anonymous 登入）。若未設定環境變數，會自動改為 **瀏覽器本機儲存**。

## 本機開發

1. 安裝 Node.js 20+。
2. 複製環境變數：

   ```bash
   cd web
   copy .env.example .env.local
   ```

   編輯 `.env.local`，填入 Supabase 專案的 `Project URL` 與 `anon` `public` API Key。

3. 安裝與啟動：

   ```bash
   npm install
   npm run dev
   ```

## Supabase 設定

1. 新建 Supabase 專案（免費方案即可）。
2. **Authentication → Providers**：啟用 **Anonymous sign-ins**（匿名登入）。
3. **Authentication → URL configuration**：在 **Site URL** 與 **Redirect URLs** 加入你的 GitHub Pages 網址，例如  
   `https://<你的帳號>.github.io/gonggudao/`
4. 在 **SQL Editor** 執行 `web/supabase/migrations/001_plans.sql`，建立 `plans` 資料表與 RLS（僅允許本人 `auth.uid()` 存取）。

若執行 SQL 時觸發器語法報錯，可將 `EXECUTE FUNCTION` 改成 `EXECUTE PROCEDURE`（依 PostgreSQL 版本而定）。

## GitHub 與 GitHub Pages

1. 在本目錄初始化並推送（替換成你的帳號／token 流程）：

   ```bash
   git init
   git add .
   git commit -m "Initial travel planner"
   gh repo create gonggudao --public --source=. --remote=origin --push
   ```

   若尚未安裝 [GitHub CLI](https://cli.github.com/)，也可在網頁建立同名 repository `gonggudao`，再手動 `git remote add` 與 `git push`。

2. 在 GitHub repository → **Settings → Pages**：**Build and deployment** 來源選 **GitHub Actions**。
3. 在 **Settings → Secrets and variables → Actions** 新增 Repository secrets：

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. 將預設分支設為 `main` 並推送；Workflow `.github/workflows/deploy-pages.yml` 會建置 `web` 並部署到 GitHub Pages。

靜態站路徑為專案網站：`https://<帳號>.github.io/gonggudao/`。`vite.config.ts` 已將 production `base` 設為 `/gonggudao/`。

## 手動部署（選用）

```bash
cd web
npm install
npm run deploy
```

需已設定 `gh-pages` 分支或工具鏈；建議優先使用上面的 GitHub Actions。

## 專案結構

- `web/`：Vite + React + TypeScript 前端。
- `web/supabase/migrations/`：資料庫 migration SQL。
- `.github/workflows/deploy-pages.yml`：GitHub Pages 自動部署。

## 授權與免責

行程與金額為參考用，請以航空公司、租車、店家與官方最新公告為準。
