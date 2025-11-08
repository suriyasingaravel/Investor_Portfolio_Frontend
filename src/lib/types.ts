export type HoldingInput = {
  particulars: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  purchasePrice: number;
  qty: number;
  sector: string;
};

export type PriceRow = {
  ok: boolean;
  symbol: string;
  price: number | null;
  currency: string | null;
  source: "yahoo" | "google";
  ts?: number;
};

export type FundamentalsRow = {
  ok: boolean;
  symbol: string;
  exchange: "NSE" | "BSE";
  pe: string | null;
  latestEarnings: string | null;
  ts?: number;
};
