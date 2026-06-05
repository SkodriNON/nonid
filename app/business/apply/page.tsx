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

type SignerInput = {
  wallet: string
  capsuleId: string
  weight: string
}

type BusinessRequest = {
  id: string
  name: string
  symbol: string
  description: string
  creatorCapsuleId: string
  creatorWallet: string
  status: "pending" | "approved" | "denied"
  totalWeight: number
  approvedWeight: number
  requiredWeight: number
  signers: {
    wallet: string
    capsuleId?: string
    weight: number
    vote: "pending" | "approved" | "denied"
    votedAt?: number
  }[]
  createdAt: number
  updatedAt: number
}

function isWallet(
  value: string
) {
  return /^0x[a-fA-F0-9]{40}$/.test(
    String(value || "").trim()
  )
}

export default function BusinessCapsuleApplyPage() {
  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const [creatorCapsuleId, setCreatorCapsuleId] =
    useState("")

  const [creatorWallet, setCreatorWallet] =
    useState("")

  const [name, setName] =
    useState("")

  const [symbol, setSymbol] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [signers, setSigners] =
    useState<SignerInput[]>([
      {
        wallet: "",
        capsuleId: "",
        weight: "100"
      }
    ])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [created, setCreated] =
    useState<BusinessRequest | null>(null)

  useEffect(() => {
    const capsule =
      searchParams.get("capsule") ||
      searchParams.get("capsuleId") ||
      ""

    const wallet =
      searchParams.get("wallet") ||
      ""

    if (capsule) {
      setCreatorCapsuleId(
        capsule
      )
    }

    if (wallet) {
      setCreatorWallet(
        wallet
      )
    }
  }, [searchParams])

  const totalWeight =
    useMemo(() => {
      return signers.reduce(
        (sum, signer) =>
          sum +
          Number(
            signer.weight || 0
          ),
        0
      )
    }, [signers])

  const requiredWeight =
    useMemo(() => {
      return Math.floor(
        (totalWeight * 2) / 3
      ) + 1
    }, [totalWeight])

  function updateSigner(
    index: number,
    key: keyof SignerInput,
    value: string
  ) {
    setSigners(
      (items) =>
        items.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [key]:
                    value
                }
              : item
        )
    )
  }

  function addSigner() {
    setSigners(
      (items) => [
        ...items,
        {
          wallet: "",
          capsuleId: "",
          weight: "0"
        }
      ]
    )
  }

  function removeSigner(
    index: number
  ) {
    setSigners(
      (items) =>
        items.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    )
  }
  function validate() {
    if (!creatorCapsuleId.trim()) {
      return "Creator Capsule ID is required."
    }

    if (
      !creatorWallet.trim() ||
      !isWallet(creatorWallet)
    ) {
      return "Creator wallet is required."
    }

    if (!name.trim()) {
      return "Business / Organization name is required."
    }

    if (!symbol.trim()) {
      return "Symbol is required."
    }

    if (signers.length < 1) {
      return "At least one signer is required."
    }

    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i]

      if (
        !signer.wallet.trim() ||
        !isWallet(signer.wallet)
      ) {
        return `Signer ${i + 1} wallet is invalid.`
      }

      if (Number(signer.weight) <= 0) {
        return `Signer ${i + 1} voting weight must be greater than 0.`
      }
    }

    if (totalWeight <= 0) {
      return "Total voting weight must be greater than 0."
    }

    return ""
  }

  async function submit() {
    try {
      setLoading(true)
      setError("")
      setCreated(null)

      console.log(
  "creatorCapsuleId =",
  creatorCapsuleId
)

console.log(
  "creatorWallet =",
  creatorWallet
)

const validationError =
  validate()

if (validationError) {
  console.log(
    "VALIDATION ERROR =",
    validationError
  )

  setError(validationError)
  return
}



      const response =
        await fetch(
          "/api/business/request/create",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              name:
                name.trim(),
              symbol:
                symbol.trim(),
              description:
                description.trim(),
              creatorCapsuleId:
                creatorCapsuleId.trim(),
              creatorWallet:
                creatorWallet.trim(),
              signers:
                signers.map(
                  (signer) => ({
                    wallet:
                      signer.wallet.trim(),
                    capsuleId:
                      signer.capsuleId.trim(),
                    weight:
                      Number(
                        signer.weight
                      )
                  })
                )
            })
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
          "BUSINESS_REQUEST_FAILED"
        )
      }

      setCreated(
        data.request
      )

    } catch (err: any) {
      setError(
        err?.message ||
        "Business Capsule request failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-8 text-white sm:px-6 lg:px-10">

      <div className="mx-auto max-w-[1100px]">

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="mb-6 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          ← Back
        </button>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#07111f] shadow-[0_0_120px_rgba(0,255,255,0.08)]">

          <div className="border-b border-white/10 bg-white/[0.03] p-6 sm:p-8">

            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
              NexusNON.ID
            </p>

            <h1 className="mt-3 text-[32px] font-black tracking-tight text-white sm:text-[46px]">
              Create Business Capsule
            </h1>

            <p className="mt-4 max-w-[780px] text-sm leading-7 text-zinc-300 sm:text-base">
              Create an organization request. Founder / signer wallets will receive
              approval rights through the NexusNON authorization flow. The organization
              becomes valid only after signer consensus reaches two-thirds.
            </p>

          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_360px]">

            <div className="space-y-5">

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">

                <h2 className="text-lg font-black text-white">
                  Creator
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  The creator must be an existing Individual Capsule. This does not create
                  a new individual identity.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Creator Capsule ID
                    </label>

                    <input
                      value={creatorCapsuleId}
                      onChange={(e) =>
                        setCreatorCapsuleId(
                          e.target.value
                        )
                      }
                      placeholder="1"
                      className="h-[54px] w-full rounded-[18px] border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Creator Wallet
                    </label>

                    <input
                      value={creatorWallet}
                      onChange={(e) =>
                        setCreatorWallet(
                          e.target.value
                        )
                      }
                      placeholder="0x..."
                      className="h-[54px] w-full rounded-[18px] border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                </div>

              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">

                <h2 className="text-lg font-black text-white">
                  Organization Identity
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Business / Organization Name
                    </label>

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      placeholder="SkodriNON Association"
                      className="h-[54px] w-full rounded-[18px] border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Symbol
                    </label>

                    <input
                      value={symbol}
                      onChange={(e) =>
                        setSymbol(
                          e.target.value
                        )
                      }
                      placeholder="SKN"
                      className="h-[54px] w-full rounded-[18px] border border-white/10 bg-black/30 px-4 text-sm font-semibold uppercase text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Digital sovereign organization inside NexusNON.ID"
                    rows={4}
                    className="w-full resize-none rounded-[18px] border border-white/10 bg-black/30 p-4 text-sm font-medium leading-6 text-white outline-none focus:border-cyan-400/50"
                  />
                </div>

              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-black text-white">
                      Initial Signers
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Signers are the first constitutional owners of the Business Capsule.
                      A request passes when approved weight reaches two-thirds.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addSigner}
                    className="shrink-0 rounded-[16px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-cyan-300 hover:bg-cyan-400/20"
                  >
                    Add
                  </button>

                </div>

                <div className="mt-5 space-y-4">

                  {signers.map(
                    (signer, index) => (

                      <div
                        key={index}
                        className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                      >

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-sm font-black text-white">
                            Signer {index + 1}
                          </p>

                          {signers.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeSigner(
                                  index
                                )
                              }
                              className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300"
                            >
                              Remove
                            </button>
                          )}

                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_130px_100px]">

                          <input
                            value={signer.wallet}
                            onChange={(e) =>
                              updateSigner(
                                index,
                                "wallet",
                                e.target.value
                              )
                            }
                            placeholder="Signer wallet 0x..."
                            className="h-[50px] rounded-[16px] border border-white/10 bg-black/30 px-4 text-xs font-semibold text-white outline-none focus:border-cyan-400/50"
                          />

                          <input
                            value={signer.capsuleId}
                            onChange={(e) =>
                              updateSigner(
                                index,
                                "capsuleId",
                                e.target.value
                              )
                            }
                            placeholder="Capsule ID"
                            className="h-[50px] rounded-[16px] border border-white/10 bg-black/30 px-4 text-xs font-semibold text-white outline-none focus:border-cyan-400/50"
                          />

                          <input
                            value={signer.weight}
                            onChange={(e) =>
                              updateSigner(
                                index,
                                "weight",
                                e.target.value.replace(
                                  /[^\d]/g,
                                  ""
                                )
                              )
                            }
                            placeholder="Weight"
                            inputMode="numeric"
                            className="h-[50px] rounded-[16px] border border-white/10 bg-black/30 px-4 text-xs font-semibold text-white outline-none focus:border-cyan-400/50"
                          />

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {error && (
                <p className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-300">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={submit}
                className="h-[58px] w-full rounded-[22px] bg-cyan-400 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-[1.01] disabled:opacity-50"
              >
                {loading
                  ? "Creating request..."
                  : "Create Business Capsule Request"}
              </button>

            </div>

            <aside className="space-y-5">

              <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/[0.06] p-5">

                <h3 className="text-lg font-black text-white">
                  Consensus Rule
                </h3>

                <div className="mt-4 space-y-3 text-sm text-zinc-300">

                  <p>
                    Total Weight:{" "}
                    <span className="font-black text-cyan-300">
                      {totalWeight}
                    </span>
                  </p>

                  <p>
                    Required 2/3:{" "}
                    <span className="font-black text-cyan-300">
                      {requiredWeight}
                    </span>
                  </p>

                  <p className="leading-6 text-zinc-400">
                    The Business Capsule request becomes approved only when signer approval
                    weight reaches the required threshold.
                  </p>

                </div>

              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">

                <h3 className="text-lg font-black text-white">
                  Constitution v1
                </h3>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                  <li>• Business Capsule has zero Nexus governance votes.</li>
                  <li>• Only Individual Capsules can be signers.</li>
                  <li>• Creator is executor, not absolute owner.</li>
                  <li>• Critical actions require signer approval.</li>
                  <li>• All approved actions are audit-ready.</li>
                </ul>

              </div>

              {created && (
                <div className="rounded-[26px] border border-emerald-400/20 bg-emerald-400/[0.08] p-5">

                  <h3 className="text-lg font-black text-white">
                    Request Created
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-zinc-300">

                    <p>
                      ID:{" "}
                      <span className="break-all text-emerald-300">
                        {created.id}
                      </span>
                    </p>

                    <p>
                      Status:{" "}
                      <span className="text-emerald-300">
                        {created.status}
                      </span>
                    </p>

                    <p>
                      Required Weight:{" "}
                      <span className="text-emerald-300">
                        {created.requiredWeight}
                      </span>
                    </p>

                  </div>
 <button
  type="button"
  onClick={() =>
    router.push(
      `/pup?mode=business-approve&requestId=${created.id}&capsuleId=${creatorCapsuleId}&wallet=${creatorWallet}`
    )
  }
  className="mt-5 h-[54px] w-full rounded-[18px] bg-cyan-400 font-black text-black"
>
  Approve With PUP
</button>
                </div>
              )}

            </aside>

          </div>

        </section>

      </div>

    </main>
     )
  }