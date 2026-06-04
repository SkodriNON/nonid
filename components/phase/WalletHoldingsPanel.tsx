"use client"

import {
  useEffect,
  useState
} from "react"

type Holding = {
  type: "native" | "erc20"
  name: string
  symbol: string
  contractAddress: string
  decimals: number
  rawBalance: string
  balance: string
}

function shortAddress(
  address: string
) {
  if (
    !address ||
    address === "native"
  ) {
    return address
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatBalance(
  value: string
) {
  const num =
    Number(value)

  if (!Number.isFinite(num)) {
    return value
  }

  if (num === 0) {
    return "0"
  }

  if (num < 0.000001) {
    return "<0.000001"
  }

  return num.toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        6
    }
  )
}

export default function WalletHoldingsPanel({
  wallet
}: {
  wallet: string
}) {
  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [holdings, setHoldings] =
    useState<Holding[]>([])

  async function loadHoldings() {
    try {
      setLoading(true)
      setError("")

      if (
        !wallet ||
        !/^0x[a-fA-F0-9]{40}$/.test(wallet)
      ) {
        setHoldings([])
        setError(
          "Capsule Wallet missing."
        )
        return
      }

      const response =
        await fetch(
          `/api/wallet/holdings?wallet=${encodeURIComponent(
            wallet
          )}`,
          {
            cache:
              "no-store"
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        data.success !== true
      ) {
        throw new Error(
          data.error ||
          "Could not load wallet holdings."
        )
      }

      setHoldings(
        data.holdings || []
      )

    } catch (err: any) {
      setError(
        err?.message ||
        "Wallet holdings failed."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHoldings()
  }, [wallet])

  return (
    <div className="
      mt-6
      rounded-[28px]
      border
      border-white/10
      bg-white/[0.035]
      p-5
    ">
      <div className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">
        <div>
          <p className="
            text-xs
            font-black
            uppercase
            tracking-[0.25em]
            text-cyan-300
          ">
            Universal Wallet Holdings
          </p>

          <p className="
            mt-2
            text-xs
            text-zinc-500
          ">
            Reads native gas balance and every ERC20 token discovered through Arbiscan transfer history.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHoldings}
          disabled={loading}
          className="
            h-11
            rounded-xl
            border
            border-cyan-400/20
            bg-cyan-400/10
            px-4
            text-xs
            font-black
            text-cyan-200
            disabled:opacity-50
          "
        >
          {loading
            ? "Refreshing..."
            : "Refresh Holdings"}
        </button>
      </div>

      {error && (
        <div className="
          mt-4
          rounded-2xl
          border
          border-red-400/20
          bg-red-400/10
          px-4
          py-3
          text-sm
          text-red-200
        ">
          {error}
        </div>
      )}

      <div className="
        mt-5
        grid
        gap-3
      ">
        {holdings.length === 0 && !loading ? (
          <div className="
            rounded-2xl
            border
            border-white/10
            bg-black/20
            px-4
            py-5
            text-sm
            text-zinc-500
          ">
            No wallet holdings found yet.
          </div>
        ) : (
          holdings.map((item) => (
            <div
              key={`${item.type}-${item.contractAddress}`}
              className="
                rounded-2xl
                border
                border-white/10
                bg-black/25
                p-4
              "
            >
              <div className="
                flex
                items-start
                justify-between
                gap-4
              ">
                <div>
                  <p className="
                    text-sm
                    font-black
                    text-white
                  ">
                    {item.symbol}
                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-zinc-500
                  ">
                    {item.name}
                  </p>

                  <p className="
                    mt-2
                    text-[11px]
                    text-zinc-600
                  ">
                    {item.type === "native"
                      ? "Native Gas Asset"
                      : shortAddress(
                          item.contractAddress
                        )}
                  </p>
                </div>

                <div className="
                  text-right
                ">
                  <p className="
                    text-lg
                    font-black
                    text-cyan-100
                  ">
                    {formatBalance(
                      item.balance
                    )}
                  </p>

                  <p className="
                    mt-1
                    text-[11px]
                    uppercase
                    tracking-[0.16em]
                    text-zinc-500
                  ">
                    {item.type}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}