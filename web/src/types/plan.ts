export type ExpenseCategory =
  | "flight"
  | "train"
  | "ferry"
  | "bus"
  | "rental"
  | "ticket"
  | "activity"
  | "hotel"
  | "food"
  | "insurance"
  | "other";

export type TicketKind =
  | "flight"
  | "domestic_flight"
  | "train"
  | "ferry"
  | "bus"
  | "attraction"
  | "activity"
  | "hotel"
  | "rental"
  | "other";

export interface PlanStop {
  id: string;
  order: number;
  name: string;
  highlight?: string;
  region?: string;
  /** Suggested day index (1-based) for the 4D3N template */
  dayHint?: number;
}

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  name: string;
  /** Estimated or actual amount in TWD */
  amountTwd?: number;
  notes?: string;
  booked?: boolean;
}

export interface TransportLeg {
  id: string;
  order: number;
  from: string;
  to: string;
  mode: string;
  duration?: string;
  notes?: string;
}

export interface TicketItem {
  id: string;
  kind: TicketKind;
  name: string;
  notes?: string;
  purchased?: boolean;
}

export interface PlanData {
  stops: PlanStop[];
  expenses: ExpenseItem[];
  transports: TransportLeg[];
  tickets: TicketItem[];
}

export interface TravelPlanRow {
  id: string;
  title: string;
  data: PlanData;
  created_at: string;
  updated_at: string;
}
