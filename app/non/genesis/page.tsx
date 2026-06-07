"use client"

import {
  useEffect,
  useState
} from "react"

type BoardStatus = {
  success: boolean
  network: {
    name: string
    chainId: number
    rpc: string
  }
  identityToBoardLink: {
    connected: boolean
    mode: string
    source: string
  }
  board: {
    address: string
    activated: boolean
    emergencyState: boolean
  }
  activation: {
    address: string
    nftReady: boolean
    boardReady: boolean
    multisigReady: boolean
    treasuryReady: boolean
    liquidityReady: boolean
    emergencyReady: boolean
    activated: boolean
    institutionActivated: boolean
    activatedAt: string
  }
  modules: {
    constitutionalNFT: string
    signerManager: string
    multisig: string
    treasuryVault: string
    liquidityCustody: string
    emergencyConstitution: string
  }
}

function shortAddress(address: string) {
  if (!address) return "—"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function StatusCard({
  title,
  status,
  description
}: {
  title: string
  status: boolean
  description: string
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-black text-white">
          {title}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            status
              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          {status ? "Active" : "Missing"}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  )
}

function AddressCard({
  label,
  address
}: {
  label: string
  address: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-black text-cyan-200">
        {address || "—"}
      </p>

      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(address)
        }
        className="mt-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-200"
      >
        Copy {shortAddress(address)}
      </button>
    </div>
  )
}

export default function NONGenesisPage() {
  const [data, setData] =
    useState<BoardStatus | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  async function loadStatus() {
    try {
      setLoading(true)
      setError("")

      const response =
        await fetch(
          "/api/non/board/status",
          {
            cache: "no-store"
          }
        )

      const json =
        await response.json()

      if (!response.ok || !json.success) {
        throw new Error(
          json.error ||
          "BOARD_STATUS_FAILED"
        )
      }

      setData(json)
    } catch (err: any) {
      setError(
        err?.message ||
        "Could not load NON Genesis status."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-8 text-white sm:px-6 lg:px-10">
      <section className="mx-auto max-w-[1450px]">
        <div className="rounded-[42px] border border-cyan-400/20 bg-[#07111f] p-6 shadow-[0_0_140px_rgba(0,255,255,0.10)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                NEXUSNON.ID
              </p>

              <h1 className="mt-4 text-[42px] font-black leading-[0.95] tracking-tight sm:text-[72px]">
                NON Genesis Status
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                Live constitutional connection between Identity Layer and NON Board infrastructure.
              </p>
            </div>

            <button
              type="button"
              onClick={loadStatus}
              className="h-[54px] rounded-[18px] bg-cyan-400 px-6 font-black text-black"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="mt-8 rounded-[24px] border border-white/10 bg-black/25 p-6 text-zinc-400">
              Loading NON Genesis status...
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-red-300">
              {error}
            </div>
          )}

          {data && (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <StatusCard
                  title="Identity → Board"
                  status={data.identityToBoardLink.connected}
                  description="NexusNON.ID can read the deployed Constitutional Board."
                />

                <StatusCard
                  title="Board Activated"
                  status={data.board.activated}
                  description="The Constitutional Board contract reports active status."
                />

                <StatusCard
                  title="Emergency State"
                  status={!data.board.emergencyState}
                  description="Emergency mode is currently inactive."
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <StatusCard
                  title="Constitutional NFT"
                  status={data.activation.nftReady}
                  description="Genesis NFT / constitutional authority address is connected."
                />

                <StatusCard
                  title="Multisig"
                  status={data.activation.multisigReady}
                  description="Board multisig is connected to the activation module."
                />

                <StatusCard
                  title="Treasury"
                  status={data.activation.treasuryReady}
                  description="Treasury vault is connected to the constitutional stack."
                />

                <StatusCard
                  title="Liquidity"
                  status={data.activation.liquidityReady}
                  description="Liquidity custody is connected and recognized."
                />

                <StatusCard
                  title="Emergency Module"
                  status={data.activation.emergencyReady}
                  description="Emergency constitution module is connected."
                />

                <StatusCard
                  title="Institution Activation"
                  status={data.activation.institutionActivated}
                  description="The activation contract reports full institutional activation."
                />
              </div>

              <div className="mt-8 rounded-[32px] border border-white/10 bg-black/25 p-6">
                <h2 className="text-2xl font-black">
                  Deployment Addresses
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <AddressCard
                    label="Constitutional Board"
                    address={data.board.address}
                  />

                  <AddressCard
                    label="Activation Contract"
                    address={data.activation.address}
                  />

                  <AddressCard
                    label="Constitutional NFT"
                    address={data.modules.constitutionalNFT}
                  />

                  <AddressCard
                    label="Signer Manager"
                    address={data.modules.signerManager}
                  />

                  <AddressCard
                    label="Multisig"
                    address={data.modules.multisig}
                  />

                  <AddressCard
                    label="Treasury Vault"
                    address={data.modules.treasuryVault}
                  />

                  <AddressCard
                    label="Liquidity Custody"
                    address={data.modules.liquidityCustody}
                  />

                  <AddressCard
                    label="Emergency Constitution"
                    address={data.modules.emergencyConstitution}
                  />
                </div>
              </div>

              <div className="mt-8 rounded-[32px] border border-emerald-400/20 bg-emerald-400/[0.08] p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                  Current Phase
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Identity → Board Connected
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  The Identity Layer now reads the deployed Constitutional Board live from Arbitrum Sepolia.
                  Next phase is Board → Token connection.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}