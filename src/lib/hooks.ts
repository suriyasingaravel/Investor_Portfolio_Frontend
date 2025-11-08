import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { FundamentalsRow, HoldingInput, PriceRow } from "./types";

export function useUploadPortfolio(file: File | null) {
  async function upload() {
    if (!file) throw new Error("No file selected");
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/portfolio/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(data);
    return data as {
      totalInvestment: number;
      holdings: HoldingInput[];
      sectors: {
        sector: string;
        totalInvestment: number;
        holdings: HoldingInput[];
      }[];
      ts: number;
    };
  }
  return upload;
}

export function usePrices(
  items: { symbol: string; exchange: "NSE" | "BSE" }[],
  enabled = true
) {
  return useQuery({
    queryKey: ["prices", items],
    queryFn: async () => {
      const { data } = await api.post<PriceRow[]>("/prices", { items });
      return data;
    },
    enabled: enabled && items.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 2,
  });
}

export function useFundamentals(
  items: { symbol: string; exchange: "NSE" | "BSE" }[],
  enabled = true
) {
  return useQuery({
    queryKey: ["fundamentals", items],
    queryFn: async () => {
      const { data } = await api.post<FundamentalsRow[]>("/fundamentals", {
        items,
      });
      return data;
    },
    enabled: enabled && items.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 2,
  });
}
