"use client"

import {
  useEffect,
  useRef,
  useState
} from "react"

import {
  useRouter
} from "next/navigation"

import {
  PhoneInput
} from "react-international-phone"

import "react-international-phone/style.css"

import {
  LanguageSelector,
  useLanguage
} from "@/components/LanguageSystem"

import {
  createViewSession
} from "@/lib/viewSession"

const emailProviders = [
  "@gmail.com",
  "@hotmail.com",
  "@outlook.com",
  "@icloud.com",
  "@proton.me",
  "@yahoo.com",
  "@live.com",
  "@aol.com",
  "@mail.com"
]

export default function NexusIdentityGateway() {

  const router =
    useRouter()

  const {
    t
  } =
    useLanguage()

  const [open, setOpen] =
    useState(true)

  const [phone, setPhone] =
    useState("")

  const [emailValue, setEmailValue] =
    useState("")

  const [lockedFromConnect, setLockedFromConnect] =
    useState(false)

  const [nameValue, setNameValue] =
    useState("")

  const [viewPin, setViewPin] =
    useState("")

  const [capsuleType, setCapsuleType] =
    useState<0 | 1 | 2>(0)

  const [showEmailProviders, setShowEmailProviders] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [otpSent, setOtpSent] =
    useState(false)

  const [otpLoading, setOtpLoading] =
    useState(false)

  const [otpError, setOtpError] =
    useState("")

  const [mintError, setMintError] =
    useState("")

  const [createdCapsuleId, setCreatedCapsuleId] =
    useState("")

  const [createdWallet, setCreatedWallet] =
    useState("")

  const [txHash, setTxHash] =
    useState("")

  const phoneOtpRefs =
    useRef<(HTMLInputElement | null)[]>([])

  const phoneRef =
    useRef<HTMLInputElement | null>(null)

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      )

    const emailParam =
      params.get("email")

    const phoneParam =
      params.get("phone")

    if (
      emailParam ||
      phoneParam
    ) {

      setLockedFromConnect(true)

      if (emailParam) {
        setEmailValue(
          emailParam.trim().toLowerCase()
        )
      }

      if (phoneParam) {
        setPhone(
          phoneParam.trim()
        )
      }
    }

  }, [])

  useEffect(() => {

    const closeDropdowns = () => {
      setShowEmailProviders(false)
    }

    window.addEventListener(
      "click",
      closeDropdowns
    )

    return () =>
      window.removeEventListener(
        "click",
        closeDropdowns
      )

  }, [])

  if (!open) return null

  function getOtpValue(
    refs: React.MutableRefObject<
      (HTMLInputElement | null)[]
    >
  ) {

    return refs.current
      .map((input) =>
        input?.value || ""
      )
      .join("")
  }

  function handleOtpChange(
    refs: React.MutableRefObject<
      (HTMLInputElement | null)[]
    >,
    value: string,
    index: number
  ) {

    const digit =
      value.replace(/\D/g, "")[0] || ""

    if (!digit) {

      if (refs.current[index]) {
        refs.current[index]!.value = ""
      }

      return
    }

    refs.current[index]!.value =
      digit

    if (index < 5) {
      refs.current[
        index + 1
      ]?.focus()
    }
  }

  function handleOtpKeyDown(
    refs: React.MutableRefObject<
      (HTMLInputElement | null)[]
    >,
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {

    if (
      e.key === "Backspace" &&
      !refs.current[index]?.value &&
      index > 0
    ) {
      refs.current[
        index - 1
      ]?.focus()
    }
  }

  function handleOtpPaste(
    refs: React.MutableRefObject<
      (HTMLInputElement | null)[]
    >,
    e: React.ClipboardEvent<HTMLInputElement>
  ) {

    e.preventDefault()

    const pasted =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6)

    pasted
      .split("")
      .forEach((char, index) => {

        if (refs.current[index]) {
          refs.current[index]!.value =
            char
        }
      })

    refs.current[
      Math.max(pasted.length - 1, 0)
    ]?.focus()
  }

  async function handleSendOtp() {

    if (
      !phone ||
      !emailValue.trim()
    ) {

      setOtpError(
        "Phone and email are required"
      )

      return
    }

    try {

      setOtpLoading(true)
      setOtpError("")

      const response =
        await fetch(
          "/api/send-otp",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              phone,
              email:
                emailValue.trim()
            })
          }
        )

      const data =
        await response.json()

      if (!data.success) {

        setOtpError(
          data.message ||
          "OTP send failed"
        )

        return
      }

      setOtpSent(true)

    } catch {

      setOtpError(
        "OTP send failed"
      )

    } finally {

      setOtpLoading(false)
    }
  }

  async function createCapsuleWithRelayer() {

    if (!emailValue.trim()) {
      throw new Error(
        "Email is required"
      )
    }

    if (!phone.trim()) {
      throw new Error(
        "Phone is required"
      )
    }

    if (!nameValue.trim()) {
      throw new Error(
        "Name or username is required"
      )
    }

    if (
      viewPin.trim().length < 4
    ) {
      throw new Error(
        "Anti-Phishing Code must contain at least 4 characters"
      )
    }

    const response =
      await fetch(
        "/api/genesis/create-capsule",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            email:
              emailValue.trim(),

            phone:
              phone.trim(),

            name:
              nameValue.trim(),

            capsuleType,

            antiPhishing:
              viewPin.trim()
          })
        }
      )

    const data =
      await response.json()

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Capsule creation failed"
      )
    }

    setCreatedCapsuleId(
      data.capsuleId
    )

    setCreatedWallet(
      data.capsuleWallet
    )

    setTxHash(
      data.txHash || ""
    )

    return data
  }

  async function handleContinueSession() {

    try {

      setLoading(true)
      setMintError("")

      if (!emailValue.trim()) {
        setMintError(
          "Enter your email first"
        )

        return
      }

      const response =
        await fetch(
          "/api/genesis/findCapsule",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              email:
                emailValue.trim(),
              phone:
                phone.trim()
            })
          }
        )

      const data =
        await response.json()

      if (!response.ok || !data.success) {
        setMintError(
          data.message ||
          "No Capsule found for this email"
        )

        return
      }

      setCreatedCapsuleId(
        data.capsuleId
      )

      setCreatedWallet(
        data.capsuleWallet
      )

      router.push(
  `/dashboard?capsule=${encodeURIComponent(
    createdCapsuleId
  )}&wallet=${encodeURIComponent(
    createdWallet
  )}`
)

    } catch (error: any) {

      console.error(error)

      setMintError(
        error?.message ||
        "Session failed"
      )

    } finally {

      setLoading(false)
    }
  }

  async function handleActivate() {

    try {

      setLoading(true)
      setMintError("")

      const phoneOtp =
        getOtpValue(phoneOtpRefs)

      if (
        phoneOtp.length !== 6
      ) {
        setMintError(
          "Please enter phone OTP"
        )

        return
      }

      const response =
        await fetch(
          "/api/verify-otp",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              phone,
              email:
                emailValue.trim(),
              phoneOtp
            })
          }
        )

      const data =
        await response.json()

      if (!data.success) {

        setMintError(
          data.message ||
          "Invalid OTP"
        )

        return
      }

     const created =
  await createCapsuleWithRelayer()

createViewSession(
  String(created.capsuleId),
  String(created.capsuleWallet)
)

setSuccess(true)

setTimeout(() => {
  router.push(
    `/dashboard?capsule=${encodeURIComponent(
      String(created.capsuleId)
    )}&wallet=${encodeURIComponent(
      String(created.capsuleWallet)
    )}`
  )
}, 2500)
    } catch (error: any) {

      console.error(error)

      if (
        String(error?.message || "")
          .includes("EMAIL_ALREADY_USED")
      ) {
        setMintError(
          "This email already has a Capsule."
        )
      } else if (
        String(error?.message || "")
          .includes("ONLY_OPERATOR")
      ) {
        setMintError(
          "Operator is not authorized on Genesis contract."
        )
      } else {
        setMintError(
          error?.message ||
          "Activation failed"
        )
      }

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-xl sm:p-5">

      <div className="relative w-full max-w-[760px] overflow-visible rounded-[30px] border border-white/10 bg-[#050816] shadow-[0_0_120px_rgba(0,255,255,0.08)]">

        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
          <div className="absolute -left-[120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-[120px]" />
          <div className="absolute -bottom-[120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="relative z-20 max-h-[95vh] overflow-y-auto p-4 sm:p-6 md:p-8">

          <div className="relative flex items-center justify-center">

            <div className="absolute left-0 top-0 z-50">
              <LanguageSelector />
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="absolute right-0 top-0 flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition active:scale-[0.96] hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>

            <div className="flex flex-col items-center">
              <img
                src="/logopopup.png"
                alt="NexusNON.ID"
                className="origin-center scale-[1.3] object-contain w-[150px] sm:w-[230px] md:w-[320px]"
              />
            </div>

          </div>

          {success ? (

            <div className="py-10 text-center">

              <div className="mx-auto flex h-[86px] w-[86px] items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-[32px] text-white">
                ✓
              </div>

              <h2 className="mt-5 text-[26px] font-black tracking-tight text-white">
                Capsule Created
              </h2>

              <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-zinc-300 antialiased">
                Your NexusNON.ID Capsule was created by the NexusNON relayer.
              </p>

              <div className="mt-5 rounded-[18px] border border-white/10 bg-black/30 p-4 text-left text-xs text-zinc-300">
                <p>
                  Capsule ID:{" "}
                  <span className="text-cyan-300">
                    {createdCapsuleId}
                  </span>
                </p>

                <p className="mt-2 break-all">
                  Capsule Wallet:{" "}
                  <span className="text-cyan-300">
                    {createdWallet}
                  </span>
                </p>

                {txHash && (
                  <p className="mt-2 break-all">
                    TX:{" "}
                    <span className="text-cyan-300">
                      {txHash}
                    </span>
                  </p>
                )}
              </div>

              <button
  type="button"
  onClick={() =>
    router.push(
      `/dashboard?capsule=${encodeURIComponent(
        String(createdCapsuleId)
      )}&wallet=${encodeURIComponent(
        String(createdWallet)
      )}`
    )
  }
                className="mt-7 h-[56px] w-full rounded-[22px] bg-cyan-400 text-[15px] font-black tracking-[0.08em] text-black transition hover:scale-[1.01]"
              >
                Continue to Dashboard
              </button>

            </div>

          ) : (

            <>

              {lockedFromConnect && (

                <div className="mt-5 rounded-[22px] border border-cyan-400/10 bg-cyan-400/[0.04] p-4">

                  <h3 className="text-[15px] font-semibold tracking-[0.03em] text-white">
                    Pending Registration Data
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-zinc-400">
                    Email and phone came from /connect and are locked for this Capsule creation flow.
                  </p>

                </div>
              )}

              <div className="mt-6 space-y-5">

                <div>

                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.22em] text-zinc-300">
                    Email
                  </label>

                  <div
                    className="relative"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <input
                      value={emailValue}
                      readOnly={lockedFromConnect}
                      onChange={(e) => {

                        if (lockedFromConnect) {
                          return
                        }

                        setEmailValue(
                          e.target.value
                        )

                        if (
                          e.target.value.includes(
                            "@"
                          )
                        ) {
                          setShowEmailProviders(
                            true
                          )
                        } else {
                          setShowEmailProviders(
                            false
                          )
                        }
                      }}
                      onKeyDown={(e) => {

                        if (
                          e.key === "Enter"
                        ) {
                          phoneRef.current?.focus()
                        }
                      }}
                      placeholder="your@email.com"
                      autoComplete="email"
                      className={
                        lockedFromConnect
                          ? "h-[56px] w-full cursor-not-allowed rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.04] px-5 text-[15px] font-medium tracking-wide text-cyan-200 placeholder:text-zinc-500 outline-none"
                          : "h-[56px] w-full rounded-[20px] border border-white/10 bg-black/30 px-5 text-[15px] font-medium tracking-wide text-white placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/50"
                      }
                    />

                    {!lockedFromConnect && showEmailProviders && (

                      <div className="absolute left-0 top-[66px] z-[999999] w-full overflow-hidden rounded-[20px] border border-white/10 bg-[#0B1120] shadow-2xl backdrop-blur-xl">

                        {emailProviders.map(
                          (provider) => (

                            <button
                              key={provider}
                              type="button"
                              onClick={() => {

                                const base =
                                  emailValue.split(
                                    "@"
                                  )[0]

                                setEmailValue(
                                  `${base}${provider}`
                                )

                                setShowEmailProviders(
                                  false
                                )

                                phoneRef.current?.focus()
                              }}
                              className="flex h-[54px] w-full items-center border-b border-white/5 px-5 text-left text-sm font-medium tracking-wide text-white transition hover:bg-white/[0.05]"
                            >
                              {provider}
                            </button>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.22em] text-zinc-300">
                    Name / Username
                  </label>

                  <input
                    value={nameValue}
                    onChange={(e) =>
                      setNameValue(
                        e.target.value
                      )
                    }
                    placeholder="Nexus Citizen"
                    autoComplete="name"
                    className="h-[56px] w-full rounded-[20px] border border-white/10 bg-black/30 px-5 text-[15px] font-medium tracking-wide text-white placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.22em] text-zinc-300">
                    Capsule Type
                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    {[
                      [
                        "Individual",
                        0
                      ],
                      [
                        "Developer",
                        1
                      ],
                      [
                        "Business",
                        2
                      ]
                    ].map(
                      ([label, value]) => (

                        <button
                          key={String(value)}
                          type="button"
                          onClick={() =>
                            setCapsuleType(
                              value as 0 | 1 | 2
                            )
                          }
                          className={
                            capsuleType === value
                              ? "h-[48px] rounded-[16px] bg-cyan-400 text-xs font-black uppercase tracking-[0.08em] text-black"
                              : "h-[48px] rounded-[16px] border border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-[0.08em] text-white"
                          }
                        >
                          {label}
                        </button>
                      )
                    )}

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.22em] text-zinc-300">
                    Phone
                  </label>

                  <div className={
                    lockedFromConnect
                      ? "overflow-visible rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.04] px-2"
                      : "overflow-visible rounded-[20px] border border-white/10 bg-black/30 px-2"
                  }>

                    <PhoneInput
                      defaultCountry="se"
                      value={phone}
                      onChange={(phone) => {

                        if (lockedFromConnect) {
                          return
                        }

                        setPhone(phone)
                      }}
                      disabled={lockedFromConnect}
                      forceDialCode
                      preferredCountries={[
                        "se",
                        "xk",
                        "al",
                        "de",
                        "ch",
                        "gb",
                        "us"
                      ]}
                      countrySelectorStyleProps={{
                        buttonClassName:
                          lockedFromConnect
                            ? "!border-0 !bg-transparent !cursor-not-allowed"
                            : "!border-0 !bg-transparent hover:!bg-white/5",

                        dropdownStyleProps: {
                          className:
                            "!bg-[#0B1120] !border !border-white/10 !text-white !rounded-[24px] !shadow-2xl",

                          listItemClassName:
                            "!text-white hover:!bg-white/5",

                          style: {
                            maxHeight: "420px",
                            overflowY: "auto",
                            width: "340px"
                          }
                        }
                      }}
                      inputClassName="
                        !h-[56px]
                        !w-full
                        !border-0
                        !bg-transparent
                        !text-[15px]
                        !font-medium
                        !tracking-wide
                        !text-white
                        placeholder:!text-zinc-500
                        focus:!ring-0
                      "
                    />

                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="mt-3 h-[50px] w-full rounded-[16px] border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300 transition active:scale-[0.98] hover:bg-cyan-400/20 disabled:opacity-50"
                  >
                    {otpLoading
                      ? "Sending..."
                      : otpSent
                      ? "OTP Sent"
                      : "Send OTP"}
                  </button>

                  {otpError && (

                    <p className="mt-2 text-sm text-red-400">
                      {otpError}
                    </p>

                  )}

                </div>

                <div>

                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.22em] text-zinc-300">
                    Phone OTP
                  </label>

                  <div className="grid grid-cols-6 gap-2">

                    {Array.from({
                      length: 6
                    }).map((_, index) => (

                      <input
                        key={index}
                        ref={(el) => {
                          phoneOtpRefs.current[index] =
                            el
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={1}
                        onPaste={(e) =>
                          handleOtpPaste(
                            phoneOtpRefs,
                            e
                          )
                        }
                        onChange={(e) =>
                          handleOtpChange(
                            phoneOtpRefs,
                            e.target.value,
                            index
                          )
                        }
                        onKeyDown={(e) =>
                          handleOtpKeyDown(
                            phoneOtpRefs,
                            e,
                            index
                          )
                        }
                        className="h-[52px] rounded-[16px] border border-white/10 bg-black/30 text-center text-[20px] font-black tracking-[0.18em] text-white outline-none transition focus:border-cyan-400/50"
                      />
                    ))}

                  </div>

                </div>

              </div>

              <div className="mt-5 rounded-[22px] border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

                <div className="flex items-start gap-3">

                  <div className="mt-1 text-cyan-300">
                    ⚡
                  </div>

                  <div>

                    <h3 className="text-[15px] font-semibold tracking-[0.03em] text-white">
                      NexusNON.ID Genesis
                    </h3>

                    <p className="mt-2 text-[14px] font-medium leading-[1.7] tracking-[0.02em] text-zinc-300 antialiased">
                      Capsule = Identity. Capsule Wallet is created automatically. NFT is minted inside the Capsule Wallet. No MetaMask is required.
                    </p>

                  </div>

                </div>

              </div>

              {mintError && (

                <p className="mt-4 rounded-[16px] border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                  {mintError}
                </p>

              )}

              <div className="mt-5 flex flex-col gap-3">

                <div className="mt-5 rounded-[22px] border border-amber-400/10 bg-amber-400/[0.03] p-4">

                  <h3 className="text-[15px] font-semibold tracking-[0.03em] text-white">
                    Anti-Phishing Code
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-zinc-400">
                    Create your personal Anti-Phishing Code. This code provides read-only
                    access to your Capsule Wallet, balance, funding status and activation
                    progress before NexusNoN.ID activation.
                  </p>

                  <p className="mt-2 text-[13px] leading-6 text-zinc-500">
                    This code cannot approve transactions, cannot sign requests and cannot
                    modify your Capsule. It is used only for secure visibility and identity
                    verification.
                  </p>

                  <input
                    value={viewPin}
                    onChange={(e) =>
                      setViewPin(
                        e.target.value
                      )
                    }
                    type="password"
                    placeholder="Create Anti-Phishing Code"
                    className="mt-4 h-[56px] w-full rounded-[20px] border border-white/10 bg-black/20 px-4 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/50"
                  />

                  <p className="mt-3 text-xs leading-5 text-cyan-300">
                    Required. Capsule creation cannot continue without an Anti-Phishing Code.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={loading}
                  className="flex h-[56px] w-full items-center justify-center rounded-[22px] bg-cyan-400 text-[14px] font-black tracking-[0.08em] text-black transition active:scale-[0.98] hover:scale-[1.01] disabled:opacity-50"
                >

                  {loading ? (

                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />

                  ) : (

                    "Create Genesis Capsule"
                  )}

                </button>

              </div>

              <div className="mt-5 flex flex-col gap-1 border-t border-white/5 pt-4 text-center sm:flex-row sm:items-center sm:justify-between">

                <span className="text-[11px] font-medium tracking-[0.08em] text-zinc-300">
                  NexusNON Genesis
                </span>

                <span className="text-[11px] font-medium tracking-[0.08em] text-zinc-300">
                Powered by SkodriNON
                </span>

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  )
}