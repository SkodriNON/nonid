"use client"

import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  useSearchParams,
  useRouter
} from "next/navigation"

import {
  getPupSession
} from "@/lib/pupSession"

import {
  ethers
} from "ethers"

type Capsule = {
  capsuleId: string
  label: string
  createdAt: number
  active: boolean
  nonce: number
  balance: number
  privateIdentity: boolean
  communication: boolean
  notifications: boolean
  marketing: boolean
  sessionActive: boolean
}

function StatCard({
  label,
  value,
  tone = "white"
}: {
  label: string
  value: string
  tone?: "white" | "cyan" | "yellow" | "red"
}) {

  const color =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "yellow"
      ? "text-yellow-300"
      : tone === "red"
      ? "text-red-300"
      : "text-white"

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>

      <p className={`mt-3 break-words text-xl font-black ${color}`}>
        {value}
      </p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight = false
}: {
  label: string
  value: string
  highlight?: boolean
}) {

  return (
    <div className="flex justify-between gap-4 rounded-[18px] border border-white/5 bg-black/20 p-4 text-sm">
      <span className="text-zinc-500">
        {label}
      </span>

      <strong className={`break-all text-right ${highlight ? "text-cyan-300" : "text-white"}`}>
        {value}
      </strong>
    </div>
  )
}

const RPC_URL =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ||
  "https://sepolia-rollup.arbitrum.io/rpc"

async function getNativeBalance(
  address: string
) {

  const provider =
    new ethers.providers.JsonRpcProvider(
      RPC_URL
    )

  const balance =
    await provider.getBalance(
      address
    )

  return ethers.utils.formatEther(
    balance
  )
}

export default function IdentityPage() {

  const searchParams =
    useSearchParams()

  const router =
    useRouter()

  const capsuleId =
    searchParams.get("capsuleId") ||
    searchParams.get("capsule") ||
    ""

  const wallet =
    searchParams.get("wallet") ||
    ""

  const [capsule, setCapsule] =
    useState<Capsule | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [walletBalance, setWalletBalance] =
  useState("0.000000")

  const formattedBalance =
  useMemo(() => {

    const value =
      Number(walletBalance || 0)

    if (Number.isNaN(value)) {
      return "0.000000"
    }

    return value.toFixed(6)

  }, [walletBalance])

  const createdAtLabel =
    useMemo(() => {

      if (
        !capsule ||
        !capsule.createdAt
      ) {
        return "—"
      }

      return new Date(
        capsule.createdAt * 1000
      ).toLocaleString()

    }, [capsule])

  const privacyLabel =
    capsule?.privateIdentity
      ? "Private"
      : "Public"

  const statusLabel =
    capsule?.active
      ? "Active"
      : "Inactive"

  const sessionLabel =
    capsule?.sessionActive
      ? "Active"
      : "Inactive"

  async function loadIdentity() {

    try {

      setLoading(true)
      setError("")

      if (
        !capsuleId ||
        Number(capsuleId) <= 0
      ) {

        setError(
          "Missing or invalid Capsule ID. Return to Dashboard and open identity again."
        )

        setLoading(false)

        return
      }

      const pupSession =
        getPupSession()

      if (
        !pupSession ||
        !pupSession.active ||
        pupSession.capsuleId !== capsuleId
      ) {

        setError(
          "Local PUP session required before opening Identity."
        )

        setLoading(false)

        return
      }

      const response =
        await fetch(
          `/api/extension/capsule?capsuleId=${capsuleId}`
        )

      const data =
        await response.json()

      if (!data.success) {
        throw new Error(
          data.error ||
          "Identity load failed"
        )
      }

      setCapsule(
  data.capsule
)

if (wallet) {

  const realBalance =
    await getNativeBalance(
      wallet
    )

  setWalletBalance(
    realBalance
  )
}

    } catch (err: any) {

      setError(
        err?.message ||
        "Failed to load identity"
      )

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {

    loadIdentity()

  }, [capsuleId])

  return (
    <main className="min-h-screen overflow-hidden bg-black px-4 py-6 text-white sm:px-6 lg:px-8">

      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-20%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <section className="relative mx-auto max-w-[1180px]">

        <div className="mb-5 rounded-[30px] border border-white/10 bg-white/[0.025] p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-black tracking-[0.35em] text-cyan-300">
                NEXUSNON.ID
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Sovereign Capsule Identity
              </h1>

              <p className="mt-2 max-w-[760px] text-sm leading-6 text-zinc-400">
                Capsule = Identity · PUP = Session · Contract = Source of Truth.
              </p>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <button
                type="button"
                onClick={loadIdentity}
                className="h-[48px] rounded-[16px] bg-cyan-400 px-5 font-black text-black transition hover:scale-[1.01]"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard?capsule=${encodeURIComponent(capsuleId)}&wallet=${encodeURIComponent(wallet)}`
                  )
                }
                className="h-[48px] rounded-[16px] border border-white/10 bg-white/[0.04] px-5 font-bold text-zinc-300 transition hover:bg-white/[0.08]"
              >
                Dashboard
              </button>

            </div>

          </div>

        </div>

        {loading && (

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 text-zinc-400">
            Loading identity from contract...
          </div>

        )}

        {error && (

          <div className="rounded-[30px] border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>

        )}

        {capsule && (

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">

            <section className="space-y-5">

              <div className="rounded-[34px] border border-cyan-400/10 bg-[#050816]/90 p-5 shadow-[0_0_100px_rgba(0,255,255,0.08)] backdrop-blur">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                      IDENTITY CAPSULE
                    </p>

                    <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                      {capsule.label}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                      Capsule #{capsule.capsuleId}
                    </p>

                  </div>

                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-300">
                    {statusLabel}
                  </div>

                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                  <StatCard
                    label="Capsule"
                    value={statusLabel}
                    tone="cyan"
                  />

                  <StatCard
                    label="Privacy"
                    value={privacyLabel}
                  />

                  <StatCard
                    label="Balance"
                    value={`${formattedBalance} ETH`}
                    tone={capsule.balance > 0 ? "cyan" : "yellow"}
                  />

                  <StatCard
                    label="PUP Session"
                    value={sessionLabel}
                    tone={capsule.sessionActive ? "cyan" : "yellow"}
                  />

                </div>

              </div>

              <div className="rounded-[30px] border border-cyan-400/10 bg-cyan-400/[0.035] p-5">

                <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                  SOURCE OF TRUTH
                </p>

                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  The Capsule NFT is the sovereign identity source inside NexusNON.ID.
                  Identity is verified through the Genesis smart contract. Browser storage and databases are not identity authorities.
                </p>

              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5">

                <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                  PRIVACY SYNC
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                  <StatCard
                    label="Communication"
                    value={capsule.communication ? "Enabled" : "Disabled"}
                  />

                  <StatCard
                    label="Notifications"
                    value={capsule.notifications ? "Enabled" : "Disabled"}
                  />

                  <StatCard
                    label="Marketing"
                    value={capsule.marketing ? "Enabled" : "Disabled"}
                  />

                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(wallet)
                  }
                  disabled={!wallet}
                  className="h-[54px] rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 font-black text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
                >
                  Copy Wallet
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard?capsule=${encodeURIComponent(capsuleId)}&wallet=${encodeURIComponent(wallet)}`
                    )
                  }
                  className="h-[54px] rounded-[18px] bg-cyan-400 font-black text-black transition hover:scale-[1.01]"
                >
                  Back to Dashboard
                </button>

              </div>

            </section>

            <aside className="space-y-5">

              <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5">

                <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                  CAPSULE WALLET
                </p>

                <p className="mt-4 break-all rounded-[18px] border border-white/5 bg-black/20 p-4 text-sm font-bold text-zinc-200">
                  {wallet || "Unavailable"}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(wallet)
                    }
                    disabled={!wallet}
                    className="h-[48px] rounded-[16px] border border-cyan-400/20 bg-cyan-400/10 font-black text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
                  >
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={loadIdentity}
                    className="h-[48px] rounded-[16px] bg-cyan-400 font-black text-black transition hover:scale-[1.01]"
                  >
                    Refresh
                  </button>

                </div>

              </div>

              <div className="rounded-[30px] border border-cyan-400/20 bg-cyan-400/[0.04] p-5">

                <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                  PUP PASSPORT
                </p>

                <p className="mt-4 text-3xl font-black text-cyan-300">
                  PUP-NON-{capsule.capsuleId}
                </p>

                <div className="mt-4 grid gap-3">

                  <InfoRow
                    label="Passport Layer"
                    value="Active"
                    highlight
                  />

                  <InfoRow
                    label="Capsule"
                    value={`#${capsule.capsuleId}`}
                  />

                  <InfoRow
                    label="Session"
                    value={sessionLabel}
                    highlight
                  />

                  <InfoRow
                    label="Role"
                    value="Sovereign Citizen"
                  />

                </div>

              </div>

              <div className="rounded-[30px] border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

                <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                  IDENTITY SECURITY
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <InfoRow
                    label="Anti-Phishing"
                    value="Configured"
                    highlight
                  />

                  <InfoRow
                    label="PIN"
                    value="Active"
                    highlight
                  />

                  <InfoRow
                    label="PUK"
                    value="Configured"
                    highlight
                  />

                  <InfoRow
                    label="Session Lock"
                    value="Protected"
                    highlight
                  />

                </div>

              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5">

                <p className="text-xs font-black tracking-[0.28em] text-cyan-300">
                  TECHNICAL DETAILS
                </p>

                <div className="mt-4 grid gap-3">

                  <InfoRow
                    label="Network"
                    value="Arbitrum Sepolia"
                  />

                  <InfoRow
                    label="Capsule ID"
                    value={`#${capsule.capsuleId}`}
                  />

                  <InfoRow
                    label="Created"
                    value={createdAtLabel}
                  />

                  <InfoRow
                    label="Nonce"
                    value={String(capsule.nonce)}
                  />

                  <InfoRow
                    label="Source"
                    value="Genesis Contract"
                    highlight
                  />

                </div>

              </div>

            </aside>

          </div>

        )}

      </section>

    </main>
  )
}