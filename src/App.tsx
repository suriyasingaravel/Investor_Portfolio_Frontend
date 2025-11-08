import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { useUploadPortfolio, usePrices, useFundamentals } from "./lib/hooks";
import type { HoldingInput } from "./lib/types";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <PortfolioApp />
    </QueryClientProvider>
  );
}

function formatINR(n?: number | null) {
  if (n == null) return "—";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function PortfolioApp() {
  const [file, setFile] = useState<File | null>(null);
  const upload = useUploadPortfolio(file);
  const [portfolio, setPortfolio] = useState<null | {
    totalInvestment: number;
    holdings: HoldingInput[];
    sectors: {
      sector: string;
      totalInvestment: number;
      holdings: HoldingInput[];
    }[];
  }>(null);

  const items = useMemo(
    () =>
      portfolio?.holdings.map((h) => ({
        symbol: h.symbol,
        exchange: h.exchange,
      })) ?? [],
    [portfolio]
  );

  const pricesQ = usePrices(items, !!portfolio);
  const fundaQ = useFundamentals(items, !!portfolio);

  const pricesMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const r of pricesQ.data ?? []) {
      m.set((r.symbol || "").toUpperCase(), r);
    }
    return m;
  }, [pricesQ.data]);

  const fundamentalsMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const f of fundaQ.data ?? []) {
      const key = `${f.symbol.toUpperCase()}:${f.exchange}`;
      m.set(key, f);
      if (f.exchange === "BOM") {
        m.set(`${f.symbol.toUpperCase()}:BSE`, f);
      }
    }
    return m;
  }, [fundaQ.data]);

  console.log(fundaQ.data);

  function findPrice(h: HoldingInput) {
    const guesses = [
      `${h.symbol}.NS`,
      `${h.symbol}.BO`,
      `${h.symbol}:BOM`,
      h.symbol,
      h.symbol.toUpperCase(),
    ];
    for (const k of guesses) {
      const row = pricesMap.get(k.toUpperCase());
      if (row) return row;
    }
    return null;
  }

  const fundaKey = (s: string, e: string) =>
    `${s.toUpperCase()}:${e === "BSE" ? "BOM" : e}`;

  async function handleUpload() {
    const data = await upload();
    setPortfolio(data);
  }

  // console.log(portfolio);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-20 bg-bg/70 backdrop-blur border-b border-border p-3!">
        <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-green-500">
            Investor Portfolio
          </h1>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:bg-card file:border file:border-border file:text-text"
            />
            <button
              onClick={handleUpload}
              disabled={!file}
              className="btn btn-primary disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-6 py-8 space-y-8">
        {(pricesQ.isFetching || fundaQ.isFetching) && (
          <div className="text-sm text-muted-foreground">
            ⟳ Updating live data…
          </div>
        )}

        {portfolio ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Investment"
                value={formatINR(portfolio.totalInvestment)}
              />
              <StatCard
                label="Present Value"
                value={formatINR(
                  portfolio.holdings.reduce((acc, h) => {
                    const row = findPrice(h);
                    const cmp = row?.price ?? 0;
                    return acc + cmp * h.qty;
                  }, 0)
                )}
              />
              <StatCard
                label="Net Gain/Loss"
                value={formatINR(
                  portfolio.holdings.reduce((acc, h) => {
                    const row = findPrice(h);
                    const cmp = row?.price ?? 0;
                    return acc + (cmp * h.qty - h.investment);
                  }, 0)
                )}
              />
              <StatCard
                label="Gain/Loss %"
                value={(function () {
                  const inv = portfolio.totalInvestment || 0;
                  if (!inv) return "—";
                  const pv = portfolio.holdings.reduce((acc, h) => {
                    const row = findPrice(h);
                    const cmp = row?.price ?? 0;
                    return acc + cmp * h.qty;
                  }, 0);
                  const pct = ((pv - inv) / inv) * 100;
                  return `${pct.toFixed(2)}%`;
                })()}
              />
            </section>

            {portfolio.sectors.map((sec) => (
              <section key={sec.sector} className="space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold pl-2!">
                  {sec.sector} — Invested {formatINR(sec.totalInvestment)}
                </h2>

                <div className="overflow-auto rounded-xl border border-border bg-card">
                  <table className="min-w-[960px] w-full text-sm">
                    <thead className="bg-subtle sticky top-0 z-10">
                      <tr className="text-muted-foreground">
                        {[
                          "Particulars",
                          "Purchase Price",
                          "Qty",
                          "Investment",
                          "Portfolio (%)",
                          "Exch",
                          "CMP",
                          "Present Value",
                          "Gain/Loss",
                          "P/E",
                          "Latest EPS",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.holdings.map((h) => {
                        const priceRow = findPrice(h);
                        const cmp: number | null = priceRow?.price ?? null;
                        const presentValue = cmp != null ? cmp * h.qty : null;
                        const gainLoss =
                          presentValue != null
                            ? presentValue - h?.investment
                            : null;
                        const f = fundamentalsMap.get(
                          fundaKey(h.symbol, h.exchange)
                        );

                        return (
                          <tr
                            key={`${h.symbol}-${h.exchange}`}
                            className="border-t border-border hover:bg-subtle transition"
                          >
                            <td className="px-3 py-3">{h.particulars}</td>
                            <td className="px-3 py-3">
                              {formatINR(h.purchasePrice)}
                            </td>
                            <td className="px-3 py-3">{h.qty}</td>
                            <td className="px-3 py-3">
                              {formatINR(h?.investment)}
                            </td>
                            <td className="px-3 py-3">
                              {h?.portfolioPct.toFixed(2)}%
                            </td>
                            <td className="px-3 py-3">{h.exchange}</td>

                            <td className="px-3 py-3 font-semibold">
                              {cmp != null ? (
                                formatINR(cmp)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>

                            <td className="px-3 py-3">
                              {presentValue != null ? (
                                formatINR(presentValue)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>

                            <td
                              className={`px-3 py-3 font-semibold ${
                                gainLoss == null
                                  ? "text-muted-foreground"
                                  : gainLoss >= 0
                                  ? "text-positive"
                                  : "text-negative"
                              }`}
                            >
                              {gainLoss != null ? formatINR(gainLoss) : "—"}
                            </td>

                            <td className="px-3 py-3">{f?.pe ?? "—"}</td>
                            <td className="px-3 py-3">
                              {f?.latestEarnings ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-100">
            {" "}
            Please upload your portfolio Excel file to view real-time data.
          </div>
        )}

        {pricesQ.error && (
          <div className="text-negative text-sm">{String(pricesQ.error)}</div>
        )}
        {fundaQ.error && (
          <div className="text-negative text-sm">{String(fundaQ.error)}</div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
