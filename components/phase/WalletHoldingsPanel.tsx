"use client"

import { useEffect, useState } from "react"

type Holding = {
  type: "native" | "erc20" | "nft"
  standard?: string
  name: string
  symbol: string
  contractAddress: string | null
  decimals?: number
  rawBalance?: string
  balance: string
  tokenId?: string | null
  image?: string | null
  collectionName?: string | null
}

export default function WalletHoldingsPanel({
  address,
}: {
  address?: string | null
}) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadHoldings() {
    if (!address) {
      setError("Missing wallet address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(
        `/api/wallet/holdings?address=${encodeURIComponent(address)}`,
        { cache: "no-store" }
      )

      const text = await res.text()
      const data = JSON.parse(text)

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not load holdings")
      }

      setHoldings(Array.isArray(data.holdings) ? data.holdings : [])
    } catch (err) {
      setHoldings([])
      setError(err instanceof Error ? err.message : "Could not load holdings")
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
            Native + ERC20 + NFT Assets
          </h2>
        </div>

        <button
          type="button"
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
          holdings.map((item, index) => (
            <div
              key={`${item.type}-${item.contractAddress || "native"}-${item.tokenId || index}`}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">
                    {item.symbol}
                  </p>

                  <p className="text-sm text-white/50">
                    {item.name}
                  </p>

                  {item.type === "nft" && item.tokenId && (
                    <p className="mt-1 text-xs text-cyan-200/60">
                      NFT #{item.tokenId}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-cyan-100">
                    {item.type === "nft"
                      ? item.balance
                      : Number(item.balance).toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}
                  </p>

                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {item.type}
                  </p>
                </div>
              </div>

              {item.contractAddress && item.contractAddress !== "native" && (
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