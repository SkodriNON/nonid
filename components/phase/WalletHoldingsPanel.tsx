"use client"

import { useEffect, useState } from "react"

type Holding = {
  type: "native" | "erc20"
  chainId: string
  name: string
  symbol: string
  decimals: number
  contractAddress: string | null
  rawBalance: string
  balance: string
}

export default function WalletHoldingsPanel({
  address,
}: {
  address?: string | null
}) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadHoldings() {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/wallet/holdings?address=${address}`, {
        cache: "no-store",
      })

      const data = await res.json()

      if (!data.ok) {
        throw new Error(data.error || "Could not load holdings")
      }

      setHoldings(data.holdings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHoldings()
  }, [address])

  if (!address) return null

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,255,255,0.08)] backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            Universal Wallet Holdings
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Native + ERC20 Assets
          </h2>
        </div>

        <button
          onClick={loadHoldings}
          disabled={loading}
          className="rounded-2xl border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {holdings.length === 0 && !loading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
            No holdings detected yet.
          </div>
        ) : (
          holdings.map((item) => (
            <div
              key={`${item.type}-${item.contractAddress || "native"}`}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">
                    {item.symbol}
                  </p>
                  <p className="text-sm text-white/50">{item.name}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-cyan-100">
                    {Number(item.balance).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {item.type}
                  </p>
                </div>
              </div>

              {item.contractAddress && (
                <p className="mt-3 break-all text-xs text-white/35">
                  {item.contractAddress}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}