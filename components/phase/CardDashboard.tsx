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

import {
  ethers
} from "ethers"

import {
  generatePupPassport
} from "@/lib/pup"

import {
  getPupSession,
  clearPupSession
} from "@/lib/pupSession"

import {
  getViewSession,
  clearViewSession
} from "@/lib/viewSession"

import WalletHoldingsPanel
from "@/components/phase/WalletHoldingsPanel"

type Tab =
  | "overview"
  | "identity"
  | "wallet"
  | "pup"
  | "privacy"
  | "services"
  | "integrity"
  | "details"

const GENESIS_CONTRACT =
  process.env.NEXT_PUBLIC_GENESIS_CONTRACT ||
  process.env.NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS ||
  ""

const RPC_URL =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC ||
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ||
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ||
  ""

const USDT_TOKEN =
  process.env.NEXT_PUBLIC_MOCK_USDT ||
  process.env.NEXT_PUBLIC_USDT_TOKEN ||
  process.env.NEXT_PUBLIC_USDT_ADDRESS ||
  process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS ||
  ""

const USDT_DECIMALS =
  Number(
    process.env.NEXT_PUBLIC_USDT_DECIMALS ||
    "6"
  )

const NETWORK_NAME =
  process.env.NEXT_PUBLIC_NETWORK_NAME ||
  "Arbitrum Sepolia"

const CHAIN_ID =
  process.env.NEXT_PUBLIC_CHAIN_ID ||
  "421614"

const BLOCK_EXPLORER =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER ||
  "https://sepolia.arbiscan.io"

const ABI = [
  "function getCapsulePublic(uint256 capsuleId) view returns (uint256,uint8,uint8,address,uint256,uint256,uint256,uint256)",
  "function getCapsuleWallet(uint256 capsuleId) view returns(address)",
  "function ownerOf(uint256 tokenId) view returns(address)",
  "function balanceOf(address account) view returns(uint256)"
]

const iface =
  new ethers.utils.Interface(
    ABI
  )

const STATUS_LABELS: Record<number, string> = {
  0: "None",
  1: "Pending",
  2: "Active",
  3: "Locked"
}

const TYPE_LABELS: Record<number, string> = {
  0: "Individual",
  1: "Developer",
  2: "Business"
}

async function rpc(
  method: string,
  params: any[]
) {
  if (!RPC_URL) {
    throw new Error(
      "RPC URL missing in .env"
    )
  }

  const response =
    await fetch(
      RPC_URL,
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify({
            jsonrpc:
              "2.0",
            id:
              Date.now(),
            method,
            params
          })
      }
    )

  const data =
    await response.json()

  if (data.error) {
    throw new Error(
      data.error.message ||
      "RPC_ERROR"
    )
  }

  return data.result
}

async function callContract(
  contract: string,
  functionName: string,
  args: any[]
) {
  if (!contract) {
    throw new Error(
      `${functionName}: contract address missing`
    )
  }

  const data =
    iface.encodeFunctionData(
      functionName,
      args
    )

  const result =
    await rpc(
      "eth_call",
      [
        {
          to:
            contract,
          data
        },
        "latest"
      ]
    )

  return iface.decodeFunctionResult(
    functionName,
    result
  )
}

async function getUsdtBalance(
  wallet: string
) {
  if (!USDT_TOKEN) {
    return "0"
  }

  const result =
    await callContract(
      USDT_TOKEN,
      "balanceOf",
      [
        wallet
      ]
    )

  return ethers.utils.formatUnits(
    result[0],
    USDT_DECIMALS
  )
}

function shortAddress(
  address: string
) {
  if (!address) {
    return "—"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <strong className={`break-all text-right text-sm ${accent ? "text-cyan-300" : "text-white"}`}>
        {value || "—"}
      </strong>
    </div>
  )
}

function StatBox({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </p>

      <p className="mt-3 break-words text-2xl font-black text-white">
        {value}
      </p>
    </div>
  )
}

export default function CardDashboard() {
  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const [tab, setTab] =
    useState<Tab>("overview")

  const [wallet, setWallet] =
    useState("")

  const [capsuleId, setCapsuleId] =
    useState("0")

  const [capsuleType, setCapsuleType] =
    useState("Individual")

  const [capsuleStatus, setCapsuleStatus] =
    useState("Pending")

  const [statusNumber, setStatusNumber] =
    useState(0)

  const [createdAt, setCreatedAt] =
    useState("")

  const [activatedAt, setActivatedAt] =
    useState("")

  const [nonce, setNonce] =
    useState("0")

  const [balance, setBalance] =
    useState("0")

  const [nftOwner, setNftOwner] =
    useState("")

  const [communication, setCommunication] =
    useState(false)

  const [notifications, setNotifications] =
    useState(false)

  const [marketing, setMarketing] =
    useState(false)

  const [pupPassport, setPupPassport] =
    useState<any>(null)

  const [pupSessionActive, setPupSessionActive] =
    useState(false)

  const [viewMode, setViewMode] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const formattedBalance =
    useMemo(() => {
      const value =
        Number(balance)

      if (Number.isNaN(value)) {
        return `${balance} USDT`
      }

      return `${value.toFixed(6)} USDT`
    }, [balance])

  const isActive =
    statusNumber === 2

  const capsuleName =
    `Nexus Capsule #${capsuleId}`

  function resetDashboard() {
    setWallet("")
    setCapsuleId("0")
    setCapsuleType("Individual")
    setCapsuleStatus("Pending")
    setStatusNumber(0)
    setCreatedAt("")
    setActivatedAt("")
    setNonce("0")
    setBalance("0")
    setNftOwner("")
    setPupPassport(null)
    setPupSessionActive(false)
    setViewMode(false)
  }

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")

      if (!GENESIS_CONTRACT) {
        throw new Error(
          "Genesis contract missing in .env"
        )
      }

      const capsuleFromUrl =
        searchParams.get("capsule") ||
        searchParams.get("capsuleId") ||
        ""

      const walletFromUrl =
        searchParams.get("wallet") ||
        ""

      if (
        !capsuleFromUrl ||
        !walletFromUrl
      ) {
        resetDashboard()
        router.push("/connect")
        return
      }

      const savedPupSession =
        getPupSession()

      const savedViewSession =
        getViewSession()

      const hasPupSession =
        Boolean(
          savedPupSession &&
          savedPupSession.active &&
          savedPupSession.capsuleId === capsuleFromUrl
        )

      const hasViewSession =
        Boolean(
          savedViewSession &&
          savedViewSession.active &&
          savedViewSession.capsuleId === capsuleFromUrl
        )

      if (
        !hasPupSession &&
        !hasViewSession
      ) {
        resetDashboard()
        router.push("/connect")
        return
      }

      const id =
        ethers.BigNumber.from(
          capsuleFromUrl
        )

      const capsulePublicResult =
        await callContract(
          GENESIS_CONTRACT,
          "getCapsulePublic",
          [
            id
          ]
        )

      const walletResult =
        await callContract(
          GENESIS_CONTRACT,
          "getCapsuleWallet",
          [
            id
          ]
        )

      const ownerResult =
        await callContract(
          GENESIS_CONTRACT,
          "ownerOf",
          [
            id
          ]
        )

      const realWallet =
        ethers.utils.getAddress(
          walletResult[0]
        )

      const owner =
        ethers.utils.getAddress(
          ownerResult[0]
        )

      const loadedCapsuleId =
        capsulePublicResult[0].toString()

      const typeNumber =
        Number(
          capsulePublicResult[1]
        )

      const loadedStatus =
        Number(
          capsulePublicResult[2]
        )

      const createdAtRaw =
        Number(
          capsulePublicResult[4]
        )

      const activatedAtRaw =
        Number(
          capsulePublicResult[5]
        )

      const nonceRaw =
        capsulePublicResult[7]?.toString?.() ||
        "0"

      let usdtBalance =
        "0"

      try {
        usdtBalance =
          await getUsdtBalance(
            realWallet
          )
      } catch (balanceError) {
        console.error(
          "BALANCE_READ_FAILED:",
          balanceError
        )

        usdtBalance =
          "0"
      }

      setViewMode(
        !hasPupSession &&
        hasViewSession
      )

      setPupSessionActive(
        hasPupSession
      )

      setCapsuleId(
        loadedCapsuleId
      )

      setWallet(
        realWallet ||
        walletFromUrl
      )

      setNftOwner(
        owner
      )

      setCapsuleType(
        TYPE_LABELS[typeNumber] ||
        "Individual"
      )

      setCapsuleStatus(
        STATUS_LABELS[loadedStatus] ||
        "Unknown"
      )

      setStatusNumber(
        loadedStatus
      )

      setCreatedAt(
        createdAtRaw > 0
          ? new Date(
              createdAtRaw * 1000
            ).toLocaleString()
          : "—"
      )

      setActivatedAt(
        activatedAtRaw > 0
          ? new Date(
              activatedAtRaw * 1000
            ).toLocaleString()
          : "—"
      )

      setNonce(
        nonceRaw
      )

      setBalance(
        usdtBalance
      )

      setPupPassport(
        generatePupPassport(
          loadedCapsuleId,
          realWallet
        )
      )
    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
        "Failed to load dashboard."
      )
    } finally {
      setLoading(false)
    }
  }

  function lockSession() {
    clearPupSession()
    clearViewSession()
    resetDashboard()
    router.push("/connect")
  }

  function openExplorer(
    address: string
  ) {
    if (
      BLOCK_EXPLORER &&
      address
    ) {
      window.open(
        `${BLOCK_EXPLORER}/address/${address}`,
        "_blank"
      )
    }
  }

  function savePrivacy() {
    alert(
      "Privacy preferences saved locally for Phase 1."
    )
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const menu: {
    id: Tab
    title: string
    sub: string
  }[] = [
    {
      id: "overview",
      title: "Overview",
      sub: "Main capsule status"
    },
    {
      id: "identity",
      title: "Identity",
      sub: "Capsule profile"
    },
    {
      id: "wallet",
      title: "Wallet",
      sub: "Funds and owner"
    },
    {
      id: "pup",
      title: "PUP",
      sub: "Passport layer"
    },
    {
      id: "privacy",
      title: "Privacy",
      sub: "Preferences"
    },
    {
      id: "services",
      title: "Services",
      sub: "Future modules"
    },
    {
      id: "integrity",
      title: "Integrity",
      sub: "Architecture"
    },
    {
      id: "details",
      title: "Details",
      sub: "Contract data"
    }
  ]

  return (
    <main className="min-h-screen bg-[#03040A] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[20%] top-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[560px] w-[560px] rounded-full bg-violet-600/10 blur-[170px]" />
      </div>

      <section className="relative mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[310px_1fr]">
        <aside className="rounded-[34px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
              NEXUSNON.ID
            </p>

            <h1 className="mt-4 text-3xl font-black leading-tight">
              Sovereign Identity
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Capsule #{capsuleId} · {capsuleType}
            </p>

            <div className="mt-4 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-center text-sm font-black text-emerald-300">
              {capsuleStatus}
            </div>
          </div>

          <nav className="mt-4 grid gap-2">
            {menu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setTab(item.id)
                }
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  tab === item.id
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-black/20 text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="font-black">
                  {item.title}
                </div>

                <div className="mt-1 text-xs text-zinc-500">
                  {item.sub}
                </div>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={lockSession}
            className="mt-4 h-[52px] w-full rounded-[20px] border border-red-400/20 bg-red-400/10 font-black text-red-200"
          >
            Lock / Exit
          </button>
        </aside>

        <section className="min-h-[calc(100vh-48px)] rounded-[38px] border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl sm:p-7">
          {error && (
            <div className="mb-5 rounded-[24px] border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-[30px] border border-white/10 bg-black/25 p-8 text-zinc-400">
              Loading Capsule from Genesis Contract...
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="grid gap-6">
                  <div className="rounded-[34px] border border-cyan-400/10 bg-[#070B18] p-6">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                      Overview
                    </p>

                    <h2 className="mt-4 text-5xl font-black">
                      {capsuleName}
                    </h2>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                      Capsule is the identity. PUP is the passport approval layer.
                      Genesis Contract is the source of truth.
                    </p>

                    <div className="mt-7 grid gap-4 md:grid-cols-3">
                      <StatBox
                        label="Capsule"
                        value={`#${capsuleId}`}
                      />

                      <StatBox
                        label="Balance"
                        value={formattedBalance}
                      />

                      <StatBox
                        label="PUP Session"
                        value={pupSessionActive ? "Active" : "Locked"}
                      />
                    </div>

                    <div className="mt-6">
  <button
    type="button"
    onClick={loadDashboard}
    className="h-[54px] w-full rounded-[18px] border border-white/10 bg-white/[0.04] font-bold"
  >
    Refresh Overview
  </button>
</div>
                  </div>
                </div>
              )}

              {tab === "identity" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="Identity Capsule"
                    desc="Sovereign Capsule profile verified from the Genesis Contract."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Capsule ID" value={`#${capsuleId}`} accent />
                    <InfoRow label="Type" value={capsuleType} />
                    <InfoRow label="Status" value={capsuleStatus} accent={isActive} />
                    <InfoRow label="Privacy" value="Private" />
                    <InfoRow label="Created" value={createdAt} />
                    <InfoRow label="Activated" value={activatedAt} />
                  </div>

                </div>
              )}

              {tab === "wallet" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="Capsule Wallet"
                    desc="Funds and ownership connected to the Capsule identity."
                  />

                  <div className="rounded-[30px] border border-white/10 bg-black/25 p-5">
                    <p className="break-all text-lg font-black text-white">
                      {wallet}
                    </p>
                  </div>

                 <WalletHoldingsPanel address={wallet} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Balance" value={formattedBalance} accent />
                    <InfoRow label="Owner" value={shortAddress(nftOwner)} />
                    <InfoRow label="Network" value={NETWORK_NAME} />
                    <InfoRow label="Chain ID" value={CHAIN_ID} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          wallet
                        )
                      }
                      className="h-[54px] rounded-[18px] bg-cyan-300 font-black text-black"
                    >
                      Copy
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openExplorer(wallet)
                      }
                      className="h-[54px] rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 font-black text-cyan-200"
                    >
                      Explorer
                    </button>

                    <button
                      type="button"
                      onClick={loadDashboard}
                      className="h-[54px] rounded-[18px] border border-white/10 bg-white/[0.04] font-bold"
                    >
                      Refresh Balance
                    </button>
                  </div>
                </div>
              )}

              {tab === "pup" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="PUP Passport"
                    desc="PUP is the approval and session layer. It is not the identity."
                  />

                  <div className="rounded-[34px] border border-violet-400/20 bg-violet-400/[0.06] p-6">
                    <p className="text-5xl font-black text-violet-200">
                      {pupPassport?.pupId || `PUP-NON-${capsuleId}`}
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <InfoRow label="Session" value={pupSessionActive ? "Active" : "Locked"} accent={pupSessionActive} />
                      <InfoRow label="Layer" value="Passport / Approval" />
                      <InfoRow label="Role" value={pupPassport?.role || "Sovereign Citizen"} />
                      <InfoRow label="Capsule" value={`#${capsuleId}`} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/pup")
                      }
                      className="h-[54px] rounded-[18px] bg-violet-300 font-black text-black"
                    >
                      Open PUP
                    </button>

                    <button
                      type="button"
                      onClick={lockSession}
                      className="h-[54px] rounded-[18px] border border-red-400/20 bg-red-400/10 font-black text-red-200"
                    >
                      Lock Session
                    </button>
                  </div>
                </div>
              )}

              {tab === "privacy" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="Privacy Control"
                    desc="Phase 1 UI-level privacy preferences. Contract identity remains private by design."
                  />

                  {[
                    ["Communication", communication, setCommunication],
                    ["Notifications", notifications, setNotifications],
                    ["Marketing", marketing, setMarketing]
                  ].map(([label, checked, setter]: any) => (
                    <label
                      key={label}
                      className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/25 p-5"
                    >
                      <span className="text-lg font-black">
                        {label}
                      </span>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setter(e.target.checked)
                        }
                        className="h-5 w-5"
                      />
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={savePrivacy}
                    className="h-[56px] rounded-[20px] bg-cyan-300 font-black text-black"
                  >
                    Save Privacy
                  </button>
                </div>
              )}

              {tab === "services" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="Capsule Services"
                    desc="Reserved service modules for future ecosystem expansion."
                  />

                  {[
                    "Identity Requests",
                    "Attestations",
                    "Governance",
                    "Business Registry",
                    "Developer Registry",
                    "NON Services"
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[24px] border border-white/10 bg-black/25 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <strong>
                          {item}
                        </strong>

                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                          Coming Online
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "integrity" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="Constitutional Integrity"
                    desc="Core architectural truth of NexusNON.ID."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Capsule" value="Identity" accent />
                    <InfoRow label="PUP" value="Passport Layer" accent />
                    <InfoRow label="Genesis" value="Source of Truth" accent />
                    <InfoRow label="Browser Storage" value="Not Identity Source" />
                    <InfoRow label="Database Identity" value="Disabled" />
                    <InfoRow label="Wallet Dependency" value="Removed From UX" />
                  </div>
                </div>
              )}

              {tab === "details" && (
                <div className="grid gap-6">
                  <PanelTitle
                    title="Capsule Details"
                    desc="Raw operational metadata from the contract."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Capsule ID" value={capsuleId} />
                    <InfoRow label="Nonce" value={nonce} />
                    <InfoRow label="Created" value={createdAt} />
                    <InfoRow label="Activated" value={activatedAt} />
                    <InfoRow label="Capsule Wallet" value={shortAddress(wallet)} />
                    <InfoRow label="NFT Owner" value={shortAddress(nftOwner)} />
                    <InfoRow label="Network" value={NETWORK_NAME} />
                    <InfoRow label="Source" value="Genesis Contract" accent />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  )
}

function PanelTitle({
  title,
  desc
}: {
  title: string
  desc: string
}) {
  return (
    <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
        NEXUSNON.ID
      </p>

      <h2 className="mt-4 text-4xl font-black">
        {title}
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
        {desc}
      </p>
    </div>
  )
}