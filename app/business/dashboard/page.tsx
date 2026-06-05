"use client"

import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  useRouter,
  useSearchParams
} from "next/navigation"

type BusinessCapsule = {
  id: string
  requestId: string
  name: string
  symbol: string
  description: string
  creatorCapsuleId: string
  creatorWallet: string
  businessWallet: string
  status: "active"
  createdAt: number
}

function shortAddress(address: string) {
  if (!address) return "—"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(value: number) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function InfoRow({
  label,
  value,
  accent = false
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 break-all text-sm font-black ${accent ? "text-cyan-300" : "text-white"}`}>
        {value || "—"}
      </p>
    </div>
  )
}

export default function BusinessDashboardPage() {
  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const creatorCapsuleId =
    searchParams.get("creatorCapsuleId") ||
    searchParams.get("capsuleId") ||
    ""

  const wallet =
    String(
      searchParams.get("wallet") ||
      ""
    ).toLowerCase()

  const [capsules, setCapsules] =
    useState<BusinessCapsule[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [selectedId, setSelectedId] =
    useState("")

  async function loadCapsules() {
    try {
      setLoading(true)
      setError("")

      const response =
        await fetch(
          "/api/business/capsule/list",
          {
            cache: "no-store"
          }
        )

      const data =
        await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
          "BUSINESS_CAPSULE_LIST_FAILED"
        )
      }

      setCapsules(
        data.capsules || []
      )
    } catch (err: any) {
      setError(
        err?.message ||
        "Could not load Business Capsules."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCapsules()
  }, [])

  const visibleCapsules =
    useMemo(() => {
      return capsules.filter((capsule) => {
        const matchesCapsule =
          creatorCapsuleId
            ? capsule.creatorCapsuleId === creatorCapsuleId
            : true

        const matchesWallet =
          wallet
            ? capsule.creatorWallet.toLowerCase() === wallet ||
              capsule.businessWallet.toLowerCase() === wallet
            : true

        return matchesCapsule && matchesWallet
      })
    }, [capsules, creatorCapsuleId, wallet])

  const selected =
    visibleCapsules.find(
      (item) => item.id === selectedId
    ) ||
    visibleCapsules[0] ||
    null

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={loadCapsules}
            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 hover:bg-cyan-400/20"
          >
            Refresh Business Registry
          </button>
        </div>

        <section className="overflow-hidden rounded-[38px] border border-white/10 bg-[#07111f] shadow-[0_0_120px_rgba(0,255,255,0.08)]">
          <div className="border-b border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
              NEXUSNON.ID
            </p>

            <h1 className="mt-4 text-[34px] font-black tracking-tight sm:text-[54px]">
              Business Capsule Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              Sovereign organization layer connected to Identity Capsule, PUP approval,
              signer consensus and Business Capsule Registry.
            </p>
          </div>

          {error && (
            <div className="m-6 rounded-[22px] border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-zinc-400">
              Loading Business Capsules...
            </div>
          ) : visibleCapsules.length === 0 ? (
            <div className="p-8">
              <div className="rounded-[30px] border border-white/10 bg-black/25 p-6">
                <h2 className="text-2xl font-black">
                  No active Business Capsule found
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Create and approve a Business Capsule request first, then activate it.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/business/apply?capsuleId=${creatorCapsuleId}&capsuleWallet=${wallet}`
                    )
                  }
                  className="mt-5 h-[54px] rounded-[18px] bg-cyan-400 px-6 font-black text-black"
                >
                  Create Business Capsule
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[360px_1fr]">
              <aside className="space-y-4">
                <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                    Active Capsules
                  </p>

                  <p className="mt-3 text-4xl font-black">
                    {visibleCapsules.length}
                  </p>
                </div>

                {visibleCapsules.map((capsule) => (
                  <button
                    key={capsule.id}
                    type="button"
                    onClick={() => setSelectedId(capsule.id)}
                    className={`w-full rounded-[24px] border p-5 text-left transition ${
                      selected?.id === capsule.id
                        ? "border-cyan-400/40 bg-cyan-400/10"
                        : "border-white/10 bg-black/25 hover:bg-white/[0.05]"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                      {capsule.symbol}
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      {capsule.name}
                    </h3>

                    <p className="mt-2 break-all text-xs text-zinc-500">
                      {capsule.id}
                    </p>

                    <span className="mt-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase text-emerald-300">
                      {capsule.status}
                    </span>
                  </button>
                ))}
              </aside>

              {selected && (
                <section className="space-y-6">
                  <div className="rounded-[34px] border border-white/10 bg-black/25 p-6">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                      Business Capsule
                    </p>

                    <h2 className="mt-4 text-5xl font-black">
                      {selected.name}
                    </h2>

                    <p className="mt-3 text-xl font-black text-cyan-300">
                      {selected.symbol}
                    </p>

                    <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400">
                      {selected.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoRow
                      label="Business Capsule ID"
                      value={selected.id}
                      accent
                    />

                    <InfoRow
                      label="Status"
                      value={selected.status}
                      accent
                    />

                    <InfoRow
                      label="Creator Capsule"
                      value={`#${selected.creatorCapsuleId}`}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow
                      label="Business Wallet"
                      value={selected.businessWallet}
                      accent
                    />

                    <InfoRow
                      label="Creator Wallet"
                      value={selected.creatorWallet}
                    />

                    <InfoRow
                      label="Request ID"
                      value={selected.requestId}
                    />

                    <InfoRow
                      label="Created"
                      value={formatDate(selected.createdAt)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
                        Members
                      </p>
                      <p className="mt-3 text-3xl font-black">
                        1
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Creator signer active
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
                        Governance
                      </p>
                      <p className="mt-3 text-3xl font-black">
                        Ready
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Critical actions require signer approval
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
                        Layer
                      </p>
                      <p className="mt-3 text-3xl font-black">
                        Registry
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Business Capsule Registry active
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
                    <h3 className="text-2xl font-black">
                      Constitutional Business Rules
                    </h3>

                    <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
                      <li>• Business Capsule is a sovereign organization identity.</li>
                      <li>• Creator Capsule is executor, not absolute owner.</li>
                      <li>• PUP authorization is required before approval.</li>
                      <li>• Signer consensus controls critical actions.</li>
                      <li>• Business Registry is persistent and audit-ready.</li>
                    </ul>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          selected.businessWallet
                        )
                      }
                      className="h-[56px] rounded-[20px] bg-cyan-400 font-black text-black"
                    >
                      Copy Business Wallet
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `/api/business/capsule/list`,
                          "_blank"
                        )
                      }
                      className="h-[56px] rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 font-black text-cyan-200"
                    >
                      Open Registry API
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}