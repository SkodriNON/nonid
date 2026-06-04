"use client"

import { useEffect, useMemo, useState } from "react"

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

function shortAddress(address?: string | null) {
  if (!address || address === "native") return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatAmount(value: string) {
  const n = Number(value)

  if (Number.isNaN(n)) {
    return value
  }

  return n.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })
}

function assetIcon(type: Holding["type"]) {
  if (type === "native") return "Ξ"
  if (type === "erc20") return "₮"
  return "◆"
}

function assetLabel(type: Holding["type"], standard?: string) {
  if (type === "native") return "Native"
  if (type === "erc20") return "Token"
  return standard || "NFT"
}

export default function WalletHoldingsPanel({
  address,
}: {
  address?: string | null
}) {
  const [holdings, setHoldings] =
    useState<Holding[]>([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const nativeAssets =
    useMemo(
      () => holdings.filter((item) => item.type === "native"),
      [holdings]
    )

  const tokenAssets =
    useMemo(
      () => holdings.filter((item) => item.type === "erc20"),
      [holdings]
    )

  const nftAssets =
    useMemo(
      () => holdings.filter((item) => item.type === "nft"),
      [holdings]
    )

  const totalAssets =
    holdings.length

  async function loadHoldings() {
    if (!address) {
      setError("Missing wallet address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res =
        await fetch(
          `/api/wallet/holdings?address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        )

      const text =
        await res.text()

      let data: any = null

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text || "Invalid holdings response")
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not load holdings")
      }

      setHoldings(
        Array.isArray(data.holdings)
          ? data.holdings
          : []
      )
    } catch (err) {
      setHoldings([])
      setError(
        err instanceof Error
          ? err.message
          : "Could not load holdings"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHoldings()
  }, [address])

  if (!address) return null

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0f19] shadow-[0_22px_90px_rgba(0,0,0,0.42)]">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(240,185,11,0.13),rgba(0,229,255,0.08),rgba(255,255,255,0.03))] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#f0b90b]">
              Nexusnon.id Treasury
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Capsule Assets
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Exchange-grade view of native gas, ERC20 balances and identity NFTs owned by this Capsule Wallet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(address)
              }}
              className="h-10 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black text-zinc-200 transition hover:bg-white/[0.08]"
            >
              Copy Address
            </button>

            <a
              href={`https://sepolia.arbiscan.io/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black text-zinc-200 transition hover:bg-white/[0.08]"
            >
              Explorer
            </a>

            <button
              type="button"
              onClick={loadHoldings}
              disabled={loading}
              className="h-10 rounded-xl bg-[#f0b90b] px-4 text-xs font-black text-black transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
              Total Assets
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {totalAssets}
            </p>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
              Native
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {nativeAssets.length}
            </p>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
              Tokens
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {tokenAssets.length}
            </p>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
              NFTs
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {nftAssets.length}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25 px-4 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-zinc-500">
              Capsule Wallet
            </p>

            <p className="break-all text-xs font-black text-zinc-200">
              {shortAddress(address)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-5 rounded-[18px] border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {error}
        </div>
      )}

      <div className="p-5">
        {holdings.length === 0 && !loading ? (
          <div className="rounded-[22px] border border-white/10 bg-black/25 p-5 text-sm text-zinc-500">
            No holdings detected yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-zinc-300">
                  Assets
                </h3>

                <p className="text-xs font-bold text-zinc-500">
                  Native + ERC20
                </p>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                {[...nativeAssets, ...tokenAssets].map((item, index) => (
                  <div
                    key={`${item.type}-${item.contractAddress || "native"}-${index}`}
                    className="group rounded-[22px] border border-white/10 bg-[#111827] p-4 transition hover:border-[#f0b90b]/40 hover:bg-[#151f2f]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lg font-black text-[#f0b90b]">
                          {assetIcon(item.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-black text-white">
                              {item.symbol}
                            </p>

                            <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                              {assetLabel(item.type, item.standard)}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs font-bold text-zinc-500">
                            {item.name}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xl font-black text-white">
                          {formatAmount(item.balance)}
                        </p>

                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                          Balance
                        </p>
                      </div>
                    </div>

                    {item.contractAddress && item.contractAddress !== "native" && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                        <p className="text-xs font-bold text-zinc-500">
                          Contract{" "}
                          <span className="text-zinc-300">
                            {shortAddress(item.contractAddress)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {nftAssets.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-zinc-300">
                    Identity NFTs
                  </h3>

                  <p className="text-xs font-bold text-zinc-500">
                    ERC721 / ERC1155
                  </p>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {nftAssets.map((item, index) => (
                    <div
                      key={`${item.contractAddress}-${item.tokenId || index}`}
                      className="rounded-[22px] border border-[#f0b90b]/20 bg-[linear-gradient(135deg,rgba(240,185,11,0.12),rgba(17,24,39,1))] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f0b90b]/20 bg-[#f0b90b]/10 text-lg font-black text-[#f0b90b]">
                            ◆
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-black text-white">
                                {item.symbol}
                              </p>

                              <span className="rounded-full bg-[#f0b90b] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black">
                                Primary Identity
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs font-bold text-zinc-400">
                              {item.name}
                            </p>

                            {item.tokenId && (
                              <p className="mt-1 text-xs font-black text-[#f0b90b]">
                                Capsule NFT #{item.tokenId}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xl font-black text-white">
                            {item.balance}
                          </p>

                          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                            NFT
                          </p>
                        </div>
                      </div>

                      {item.contractAddress && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                          <p className="text-xs font-bold text-zinc-500">
                            Contract{" "}
                            <span className="text-zinc-300">
                              {shortAddress(item.contractAddress)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}