import type { PlanData } from "@/types/plan";

/** Default itinerary derived from gonggudao.md — Miyakojima (宮古島) */
export function createDefaultPlanData(): PlanData {
  const stops = [
    {
      id: crypto.randomUUID(),
      order: 1,
      name: "下地島機場 (SHI)",
      highlight: "星宇航空等直飛入境，租車取車起點",
      region: "下地島",
      dayHint: 1,
    },
    {
      id: crypto.randomUUID(),
      order: 2,
      name: "伊良部大橋",
      highlight: "日本最長免費跨海大橋（約 3,540m），宮古藍絕景",
      region: "宮古島–伊良部島",
      dayHint: 1,
    },
    {
      id: crypto.randomUUID(),
      order: 3,
      name: "17END",
      highlight: "跑道端近距離拍飛機掠過海面",
      region: "下地島",
      dayHint: 1,
    },
    {
      id: crypto.randomUUID(),
      order: 4,
      name: "八重干瀨 (Yabiji)",
      highlight: "日本最大珊瑚礁群，浮潛／潛水終極點（須搭船）",
      region: "海域",
      dayHint: 2,
    },
    {
      id: crypto.randomUUID(),
      order: 5,
      name: "池間大橋",
      highlight: "宮古藍透明度極高",
      region: "池間島",
      dayHint: 2,
    },
    {
      id: crypto.randomUUID(),
      order: 6,
      name: "雪鹽製鹽所",
      highlight: "雪鹽霜淇淋與伴手禮",
      region: "宮古島",
      dayHint: 2,
    },
    {
      id: crypto.randomUUID(),
      order: 7,
      name: "與那霸前濱海灘",
      highlight: "東洋第一美白沙灘，水上活動",
      region: "宮古島",
      dayHint: 3,
    },
    {
      id: crypto.randomUUID(),
      order: 8,
      name: "來間大橋 · 龍宮城展望台",
      highlight: "離島海景與展望",
      region: "來間島",
      dayHint: 3,
    },
    {
      id: crypto.randomUUID(),
      order: 9,
      name: "東平安名崎",
      highlight: "島最東端，360° 海景與巨岩",
      region: "宮古島",
      dayHint: 4,
    },
    {
      id: crypto.randomUUID(),
      order: 10,
      name: "平良市區（伴手禮）",
      highlight: "雪鹽菓子、紅芋甜點、Monte Doll 香蕉蛋糕等",
      region: "平良",
      dayHint: 4,
    },
  ];

  const expenses = [
    {
      id: crypto.randomUUID(),
      category: "flight" as const,
      name: "台北桃園 ⇄ 下地島 來回機票（星宇直飛，參考）",
      amountTwd: 9500,
      notes: "文獻參考約 NT$8,994～10,074 起（含稅），依開票日為準",
    },
    {
      id: crypto.randomUUID(),
      category: "rental" as const,
      name: "租車（4 天，參考）",
      amountTwd: 12000,
      notes: "Tabirai／ToCoo! 比價；8 月旺季請盡早預約",
    },
    {
      id: crypto.randomUUID(),
      category: "hotel" as const,
      name: "住宿（3 晚，參考）",
      amountTwd: 24000,
      notes: "依區域：平良市區／前濱／SHIGIRA 價差大",
    },
    {
      id: crypto.randomUUID(),
      category: "activity" as const,
      name: "八重干瀼浮潛／船資＋方案（參考）",
      amountTwd: 3500,
      notes: "旺季／中文教練方案請提早 1～2 個月預約",
    },
    {
      id: crypto.randomUUID(),
      category: "food" as const,
      name: "餐食與零星（參考）",
      amountTwd: 6000,
      notes: "Doug's Burger、宮古牛燒肉、古謝蕎麥麵等",
    },
    {
      id: crypto.randomUUID(),
      category: "insurance" as const,
      name: "旅遊不便險（建議）",
      amountTwd: 800,
      notes: "颱風季節特別建議投保",
    },
    {
      id: crypto.randomUUID(),
      category: "ticket" as const,
      name: "景點／設施門票（若有）",
      amountTwd: 1500,
      notes: "依實際購買項目調整",
    },
  ];

  const transports = [
    {
      id: crypto.randomUUID(),
      order: 1,
      from: "台北桃園機場 (TPE)",
      to: "下地島機場 (SHI)",
      mode: "國際線班機（例：星宇航空）",
      duration: "約 1.5 小時",
      notes: "免轉機行李直掛（依航空公司規定）",
    },
    {
      id: crypto.randomUUID(),
      order: 2,
      from: "下地島機場",
      to: "租車公司取車點",
      mode: "步行／接駁至租車櫃檯（ORIX、Times 等）",
      duration: "約 15–30 分鐘內完成取車",
      notes: "證件：台灣駕照正本＋日文譯本",
    },
    {
      id: crypto.randomUUID(),
      order: 3,
      from: "島內各地",
      to: "各景點",
      mode: "自駕租車（強烈建議）",
      duration: "最東至最西約 45 分鐘車程",
      notes: "大眾運輸不便，計程車貴且難叫",
    },
    {
      id: crypto.randomUUID(),
      order: 4,
      from: "宮古島港口或指定集合點",
      to: "八重干瀨海域",
      mode: "活動船班（浮潛／潛水）",
      duration: "半日行程為主",
      notes: "請依預約店家集合時間",
    },
    {
      id: crypto.randomUUID(),
      order: 5,
      from: "下地島機場",
      to: "台北桃園機場",
      mode: "國際線返程班機",
      duration: "約 1.5 小時",
      notes: "還車後搭機離境",
    },
  ];

  const tickets = [
    {
      id: crypto.randomUUID(),
      kind: "flight" as const,
      name: "星宇航空 TPE ⇄ SHI 來回機票",
      notes: "或改選那霸轉機 OKA → MMY（國內線）",
    },
    {
      id: crypto.randomUUID(),
      kind: "rental" as const,
      name: "租車預約（Tabirai／ToCoo!／店家官網）",
      notes: "與機票同步搶訂",
    },
    {
      id: crypto.randomUUID(),
      kind: "activity" as const,
      name: "八重干瀨浮潛／船位",
      notes: "旺季提早預約",
    },
    {
      id: crypto.randomUUID(),
      kind: "hotel" as const,
      name: "飯店（平良／前濱／SHIGIRA）",
      notes: "依預算與是否下海玩沙選區",
    },
    {
      id: crypto.randomUUID(),
      kind: "attraction" as const,
      name: "海中公園等門票（若行程納入）",
      notes: "依景點現場或線上購票",
    },
  ];

  return { stops, expenses, transports, tickets };
}

/** Fix UUID stability: used when importing default without regenerating ids */
export function renumberStops(data: PlanData): PlanData {
  return {
    ...data,
    stops: data.stops
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i + 1 })),
    transports: data.transports
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((t, i) => ({ ...t, order: i + 1 })),
  };
}
