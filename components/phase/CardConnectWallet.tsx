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
  LanguageSelector
} from "@/components/LanguageSystem"

import {
  createPupSession
} from "@/lib/pupSession"

type FlowStatus =
  | "idle"
  | "checking_capsule"
  | "capsule_missing"
  | "capsule_found"
  | "pup_request_sent"
  | "pup_request_approved"
  | "pup_request_denied"
  | "pup_request_expired"
  | "capsule_locked"
  | "conflict"
  | "failed"

type FlowStep =
  | "form"
  | "waiting_pup"

const ACTIVE_REQUEST_KEY =
  "NEXUSNON_ACTIVE_PUP_REQUEST"

const APPROVED_KEY =
  "NEXUSNON_PUP_APPROVED"

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

export default function CardConnectWallet() {
  const router =
    useRouter()

  const watcherRef =
    useRef<ReturnType<typeof setInterval> | null>(null)

  const phoneRef =
    useRef<HTMLInputElement | null>(null)

  const [email, setEmail] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [showEmailProviders, setShowEmailProviders] =
    useState(false)

  const [showNonIdLogin, setShowNonIdLogin] =
  useState(false)

  const [showNonIdQr, setShowNonIdQr] =
  useState(false)

  const [nonIdQrSessionId, setNonIdQrSessionId] =
  useState("")

const [nonIdQrLoading, setNonIdQrLoading] =
  useState(false)

  const [showThisDeviceFallback, setShowThisDeviceFallback] =
  useState(false)

const [thisDeviceSessionId, setThisDeviceSessionId] =
  useState("")

  const [loading, setLoading] =
    useState(false)

  const [capsuleId, setCapsuleId] =
    useState("")

  const [capsuleWallet, setCapsuleWallet] =
    useState("")

  const [pupRequestId, setPupRequestId] =
    useState("")

  const [flowStep, setFlowStep] =
    useState<FlowStep>("form")

  const [status, setStatus] =
    useState<FlowStatus>("idle")

  const [error, setError] =
    useState("")

  const [fundingWallet, setFundingWallet] =
    useState("")

  const [copiedWallet, setCopiedWallet] =
    useState(false)

  const fundingNetwork =
    "Arbitrum"

  const fundingShareText =
    fundingWallet
      ? `Deposit minimum 1 USDT on ${fundingNetwork} to this NexusNON.ID Capsule Wallet:\n\n${fundingWallet}`
      : ""

  useEffect(() => {
    function onStorage(
      event: StorageEvent
    ) {
      if (
        event.key !== APPROVED_KEY ||
        !event.newValue
      ) {
        return
      }

      try {
        const data =
          JSON.parse(event.newValue)

        if (
          data?.capsuleId &&
          data?.wallet
        ) {
          createPupSession(
            String(data.capsuleId),
            String(data.wallet)
          )

          localStorage.removeItem(
            ACTIVE_REQUEST_KEY
          )

          window.location.href =
            `/dashboard?capsuleId=${encodeURIComponent(
              String(data.capsuleId)
            )}&wallet=${encodeURIComponent(
              String(data.wallet)
            )}`
        }
      } catch {}
    }

    window.addEventListener(
      "storage",
      onStorage
    )

    return () => {
      stopWatcher()

      window.removeEventListener(
        "storage",
        onStorage
      )
    }
  }, [])

  useEffect(() => {
    function closeDropdowns() {
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

  function cleanEmail() {
    return email
      .trim()
      .toLowerCase()
  }

  function cleanPhone() {
    return phone
      .trim()
      .replace(/\s+/g, "")
  }

  function shortAddress(
    address: string
  ) {
    if (!address) {
      return ""
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  async function copyFundingWallet() {
    if (!fundingWallet) {
      return
    }

    await navigator.clipboard.writeText(
      fundingWallet
    )

    setCopiedWallet(true)

    setTimeout(() => {
      setCopiedWallet(false)
    }, 1800)
  }

  async function shareFundingWallet() {
    if (!fundingWallet) {
      return
    }

    if (navigator.share) {
      await navigator.share({
        title:
          "NexusNON.ID Capsule Wallet",
        text:
          fundingShareText
      })

      return
    }

    await navigator.clipboard.writeText(
      fundingShareText
    )

    setCopiedWallet(true)

    setTimeout(() => {
      setCopiedWallet(false)
    }, 1800)
  }

  function stopWatcher() {
    if (watcherRef.current) {
      clearInterval(
        watcherRef.current
      )

      watcherRef.current =
        null
    }
  }

  function clearActiveRequest() {
    localStorage.removeItem(
      ACTIVE_REQUEST_KEY
    )
  }

  function statusText() {
    if (error) {
      return error
    }

    const map: Record<FlowStatus, string> = {
      idle:
        "Enter email and phone to connect with your NexusNON Capsule.",

      checking_capsule:
        "Checking Genesis Contract for your Capsule...",

      capsule_missing:
        "No Capsule found. Opening Gateway...",

      capsule_found:
        "Capsule found. Creating NEXUSNON.ID approval request...",

      pup_request_sent:
        "Request created. Open non.ID and approve the login.",

      pup_request_approved:
        "Approved. Opening Dashboard...",

      pup_request_denied:
        "Approval request denied.",

      pup_request_expired:
        "Approval request expired. Please try again.",

      capsule_locked:
        "Capsule is locked. Recovery approval is required.",

      conflict:
        "Capsule exists, but email or phone does not match.",

      failed:
        "Connection failed. Please try again."
    }

    return map[status]
  }

  async function readJsonSafe(
    response: Response
  ) {
    const text =
      await response.text()

    try {
      return JSON.parse(text)
    } catch {
      console.error(
        "API returned non JSON:",
        text
      )

      throw new Error(
        "API returned invalid JSON."
      )
    }
  }

async function openNonIdQrLogin() {
  try {
    setNonIdQrLoading(true)

    const response =
      await fetch(
        "/api/pup/qr/create",
        {
          method: "POST",
          cache: "no-store"
        }
      )

    const data =
      await readJsonSafe(response)

    if (
      !response.ok ||
      data.success !== true
    ) {
      throw new Error(
        data.error ||
        "QR_CREATE_FAILED"
      )
    }

    const sessionId =
      String(
        data?.session?.id ||
        data?.qr?.sessionId ||
        ""
      )

    if (!sessionId) {
      throw new Error(
        "QR_SESSION_MISSING"
      )
    }

    setNonIdQrSessionId(
      sessionId
    )

    setShowNonIdLogin(false)
setShowNonIdQr(true)

startNonIdQrWatcher(
  sessionId
)

  } catch (err: any) {
    alert(
      err?.message ||
      "Could not create QR login."
    )
  } finally {
    setNonIdQrLoading(false)
  }
}

  async function connectCapsule() {
    try {
      stopWatcher()

      setLoading(true)
      setError("")
      setFundingWallet("")
      setCopiedWallet(false)
      setCapsuleId("")
      setCapsuleWallet("")
      setPupRequestId("")
      setFlowStep("form")
      setStatus("checking_capsule")

      const emailValue =
        cleanEmail()

      const phoneValue =
        cleanPhone()

      if (
        !emailValue ||
        !phoneValue
      ) {
        setStatus("idle")
        setError(
          "Email and phone are required."
        )
        return
      }

      const response =
        await fetch(
          "/api/genesis/findCapsule",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            cache:
              "no-store",
            body:
              JSON.stringify({
                email:
                  emailValue,
                phone:
                  phoneValue
              })
          }
        )

      const data =
        await readJsonSafe(response)

      if (
        data?.exists === true &&
        data?.conflict === true
      ) {
        setStatus("conflict")
        setError(
          data.error ||
          "Capsule exists, but email or phone is wrong."
        )
        return
      }

      if (
        response.ok &&
        data.success === true &&
        data.exists === false
      ) {
        setStatus("capsule_missing")

        router.push(
          `/gateway?email=${encodeURIComponent(
            emailValue
          )}&phone=${encodeURIComponent(
            phoneValue
          )}`
        )

        return
      }

      if (
        !response.ok ||
        data.success !== true ||
        data.exists !== true ||
        data.matched !== true
      ) {
        setStatus("failed")
        setError(
          data.error ||
          data.message ||
          "Could not verify Capsule."
        )
        return
      }

      const foundCapsuleId =
        String(data.capsuleId || "")

      const foundCapsuleWallet =
        String(data.capsuleWallet || "")

      const foundStatus =
        typeof data?.capsulePublic?.status === "number"
          ? data.capsulePublic.status
          : typeof data?.status === "number"
            ? data.status
            : null

      if (foundStatus === 3) {
        setStatus("capsule_locked")
        setError(
          "Capsule is locked. Recovery is required."
        )
        return
      }

      setCapsuleId(
        foundCapsuleId
      )

      setCapsuleWallet(
        foundCapsuleWallet
      )

      setStatus("capsule_found")

const holdingsResponse =
  await fetch(
    `/api/wallet/holdings?address=${encodeURIComponent(
  foundCapsuleWallet
)}`,
    {
      method:
        "GET",
      cache:
        "no-store"
    }
  )

const holdingsData =
  await readJsonSafe(
    holdingsResponse
  )

const tokens =
  Array.isArray(
    holdingsData?.tokens
  )
    ? holdingsData.tokens
    : Array.isArray(
        holdingsData?.assets?.tokens
      )
      ? holdingsData.assets.tokens
      : []

const usdtToken =
  tokens.find((token: any) => {
    const symbol =
      String(
        token?.symbol ||
        token?.ticker ||
        token?.name ||
        ""
      ).toLowerCase()

    return (
      symbol === "usdt" ||
      symbol === "musdt" ||
      symbol.includes("usdt")
    )
  })

const usdtBalance =
  Number(
    usdtToken?.balance ||
    usdtToken?.formatted ||
    usdtToken?.amount ||
    0
  )

if (
  !holdingsResponse.ok ||
  !holdingsData?.success ||
  !usdtToken ||
  usdtBalance < 1
) {
  setFundingWallet(
    foundCapsuleWallet
  )

  setStatus("failed")

  setError(
    "Activation and access require minimum 1 USDT in your Capsule Wallet."
  )

  return
}

await createPupLoginRequest(
  foundCapsuleId,
  foundCapsuleWallet,
  emailValue,
  phoneValue,
  foundStatus
)

    } catch (err: any) {
      console.error(err)

      setStatus("failed")
      setError(
        err?.message ||
        "Could not connect Capsule."
      )

    } finally {
      setLoading(false)
    }
  }

  async function createPupLoginRequest(
    targetCapsuleId: string,
    targetWallet: string,
    targetEmail: string,
    targetPhone: string,
    targetStatus: number | null
  ) {
    const existingRaw =
      localStorage.getItem(
        ACTIVE_REQUEST_KEY
      )

    if (existingRaw) {
      try {
        const existing =
          JSON.parse(existingRaw)

        if (
          existing?.requestId &&
          String(existing?.capsuleId) ===
            String(targetCapsuleId) &&
          String(existing?.wallet || "").toLowerCase() ===
            String(targetWallet || "").toLowerCase()
        ) {
          const statusResponse =
  await fetch(
    `/api/pup/request/status?id=${encodeURIComponent(
      existing.requestId
    )}&wallet=${encodeURIComponent(
      targetWallet
    )}&capsuleId=${encodeURIComponent(
      targetCapsuleId
    )}&email=${encodeURIComponent(
      targetEmail
    )}`,
    {
      method: "GET",
      cache: "no-store"
    }
  )

          const statusData =
            await readJsonSafe(
              statusResponse
            )

          if (
            statusResponse.ok &&
            statusData.success === true &&
            statusData.request?.status === "pending"
          ) {
            setPupRequestId(
              existing.requestId
            )

            setFlowStep(
              "waiting_pup"
            )

            setStatus(
              "pup_request_sent"
            )

            startWatcher(
              existing.requestId,
              targetCapsuleId,
              targetWallet
            )

            return
          }

          clearActiveRequest()
        }
      } catch {
        clearActiveRequest()
      }
    }

    const activationRequired =
      targetStatus === 1

    const response =
      await fetch(
        "/api/pup/request/create",
        {
          method:
            "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          cache:
            "no-store",
          body:
            JSON.stringify({
              capsuleId:
                targetCapsuleId,
              wallet:
                targetWallet,
              email:
                targetEmail,
              phone:
                targetPhone,
              action:
                activationRequired
                  ? "ACTIVATE_PUP"
                  : "LOGIN_DASHBOARD",
              capsuleStatus:
                targetStatus,
              activationRequired
            })
        }
      )

    const data =
      await readJsonSafe(response)

    if (
      !response.ok ||
      data.success !== true
    ) {
      throw new Error(
        data.error ||
        "PUP_REQUEST_CREATE_FAILED"
      )
    }

    const requestId =
      String(
        data?.request?.id || ""
      )

    if (!requestId) {
      throw new Error(
        "PUP_REQUEST_ID_MISSING"
      )
    }

    setPupRequestId(
      requestId
    )

    localStorage.setItem(
      ACTIVE_REQUEST_KEY,
      JSON.stringify({
        requestId,
        capsuleId:
          targetCapsuleId,
        wallet:
          targetWallet,
        createdAt:
          Date.now()
      })
    )

    setFlowStep(
      "waiting_pup"
    )

    setStatus(
      "pup_request_sent"
    )

    startWatcher(
      requestId,
      targetCapsuleId,
      targetWallet
    )
  }

  async function checkRequestNow() {
    if (
      !pupRequestId ||
      !capsuleId ||
      !capsuleWallet
    ) {
      setError(
        "No active approval request found. Try Connect again."
      )
      return
    }

    await checkRequestStatus(
      pupRequestId,
      capsuleId,
      capsuleWallet
    )
  }

  async function checkRequestStatus(
    requestId: string,
    targetCapsuleId: string,
    targetWallet: string
  ) {
    const response =
  await fetch(
    `/api/pup/request/status?id=${encodeURIComponent(
      requestId
    )}&wallet=${encodeURIComponent(
      targetWallet
    )}&capsuleId=${encodeURIComponent(
      targetCapsuleId
    )}`,
        {
          method:
            "GET",
          cache:
            "no-store"
        }
      )

    const data =
      await readJsonSafe(response)

    if (
      !response.ok ||
      data.success !== true
    ) {
      return
    }

    const request =
      data.request

    if (
      request?.status === "approved"
    ) {
      stopWatcher()

      setStatus(
        "pup_request_approved"
      )

      setError("")

      createPupSession(
        targetCapsuleId,
        targetWallet
      )

      clearActiveRequest()

      window.location.href =
        `/dashboard?capsuleId=${encodeURIComponent(
          targetCapsuleId
        )}&wallet=${encodeURIComponent(
          targetWallet
        )}`

      return
    }

    if (
      request?.status === "denied"
    ) {
      stopWatcher()
      clearActiveRequest()

      setStatus(
        "pup_request_denied"
      )

      setError(
        "NEXUSNON.ID denied this login request."
      )

      setFlowStep("form")
      return
    }

    if (
      request?.status === "expired"
    ) {
      stopWatcher()
      clearActiveRequest()

      setStatus(
        "pup_request_expired"
      )

      setError(
        "Approval request expired. Please try again."
      )

      setFlowStep("form")
    }
  }

  function startWatcher(
    requestId: string,
    targetCapsuleId: string,
    targetWallet: string
  ) {
    stopWatcher()

    watcherRef.current =
      setInterval(
        async () => {
          try {
            await checkRequestStatus(
              requestId,
              targetCapsuleId,
              targetWallet
            )
          } catch (err) {
            console.error(
              "PUP_WATCH_ERROR:",
              err
            )
          }
        },
        3000
      )
  }

  const buttonText =
    loading
      ? "Processing..."
      : flowStep === "waiting_pup"
        ? "Waiting Approval"
        : "Connect Capsule"

    
        function startNonIdQrWatcher(
  sessionId: string
) {
  stopWatcher()

  watcherRef.current =
    setInterval(
      async () => {
        try {
          const response =
            await fetch(
              `/api/pup/qr/status?id=${encodeURIComponent(
                sessionId
              )}`,
              {
                method: "GET",
                cache: "no-store"
              }
            )

          const data =
            await readJsonSafe(
              response
            )

          if (
            !response.ok ||
            data.success !== true
          ) {
            return
          }

          const session =
            data.session

          if (
            session?.status === "approved"
          ) {
            stopWatcher()

            const capsuleId =
              String(
                session.capsuleId || ""
              )

            const wallet =
              String(
                session.wallet || ""
              )

            if (
              !capsuleId ||
              !wallet
            ) {
              alert(
                "Approved but session data missing."
              )
              return
            }

            createPupSession(
              capsuleId,
              wallet
            )

            window.location.href =
              `/dashboard?capsuleId=${encodeURIComponent(
                capsuleId
              )}&wallet=${encodeURIComponent(
                wallet
              )}`

            return
          }

          if (
            session?.status === "denied"
          ) {
            stopWatcher()

            alert(
              "Login denied."
            )

            setShowNonIdQr(false)

            return
          }

          if (
            session?.status === "expired"
          ) {
            stopWatcher()

            alert(
              "QR login expired."
            )

            setShowNonIdQr(false)
          }
        } catch (err) {
          console.error(
            "NONID_QR_WATCH_ERROR",
            err
          )
        }
      },
      2500
    )
}
async function openNonIdThisDeviceLogin() {
  try {
    setShowNonIdLogin(false)
    setShowThisDeviceFallback(false)

    const response = await fetch("/api/pup/qr/create", {
      method: "POST",
      cache: "no-store"
    })

    const data = await readJsonSafe(response)

    if (!response.ok || data.success !== true) {
      throw new Error(data.error || "LOGIN_REQUEST_CREATE_FAILED")
    }

    const sessionId = String(
      data?.session?.id ||
      data?.qr?.sessionId ||
      ""
    )

    if (!sessionId) {
      throw new Error("LOGIN_SESSION_MISSING")
    }

    setNonIdQrSessionId(sessionId)
    startNonIdQrWatcher(sessionId)

  window.location.href =
  `nexuspup://?sessionId=${encodeURIComponent(sessionId)}&mode=this_device`

    setTimeout(() => {
      setShowThisDeviceFallback(true)
    }, 1800)
  } catch (err: any) {
    alert(err?.message || "Could not start non.ID login.")
  }
}
  return (
    <main className="
      flex
      min-h-screen
      items-center
      justify-center
      bg-[#050816]
      px-4
      py-8
      text-white
      sm:px-6
    ">
      <div className="
        relative
        min-h-[800px]
        w-full
        max-w-[520px]
        overflow-visible
        rounded-[40px]
        border
        border-violet-500/20
        bg-gradient-to-b
        from-[#0B0B17]
        via-[#080811]
        to-[#05050B]
        p-6
        shadow-[0_0_90px_rgba(124,58,237,0.18)]
        sm:min-h-[880px]
        sm:p-8
      ">
        <div className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
          rounded-[40px]
          bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.20),transparent_45%)]
        " />

        <div className="
          absolute
          left-5
          top-5
          z-30
          sm:left-8
          sm:top-8
        ">
          <LanguageSelector />
        </div>

        {capsuleWallet && (
          <div className="
            absolute
            right-5
            top-20
            z-20
            max-w-[220px]
            rounded-2xl
            border
            border-violet-500/20
            bg-violet-500/5
            px-4
            py-3
            backdrop-blur-xl
            sm:right-8
            sm:top-8
          ">
            <div className="
              text-[10px]
              uppercase
              tracking-[0.22em]
              text-violet-400
            ">
              Capsule Wallet
            </div>

            <div className="
              mt-1
              text-sm
              font-semibold
            ">
              {shortAddress(capsuleWallet)}
            </div>

            <div className="
              mt-1
              text-[10px]
              text-zinc-500
            ">
              Capsule #{capsuleId}
            </div>
          </div>
        )}

        <div className="
          relative
          z-10
          flex
          justify-center
          pt-12
          sm:pt-0
        ">
          <img
            src={
              process.env.NEXT_PUBLIC_LOGO ||
              "/logo.png"
            }
            alt="NexusNON.ID"
            className="
              h-40
              w-40
              object-contain
              sm:h-48
              sm:w-48
            "
          />
        </div>

        <div className="
          relative
          z-10
          -mt-2
          sm:-mt-4
        ">
          <h1 className="
            text-4xl
            font-black
            leading-none
          ">
            Connect Capsule
          </h1>

          <p className="
            mt-5
            max-w-[390px]
            text-lg
            leading-8
            text-zinc-400
          ">
            Connect your NexusNON identity. NEXUSNON.ID approval is required before opening Dashboard.
          </p>

          <div className="
            mt-8
            rounded-3xl
            border
            border-violet-500/15
            bg-white/[0.03]
            p-5
          ">
            <div className="
              text-[10px]
              uppercase
              tracking-[0.28em]
              text-violet-400
            ">
              NexusNON.ID
            </div>

            <div
              className="relative"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

<button
  type="button"
  onClick={() => setShowNonIdLogin(true)}
  className="
    mt-4
    mb-4
    h-14
    w-full
    rounded-2xl
    border
    border-cyan-400/20
    bg-cyan-400/10
    text-base
    font-black
    text-cyan-200
    transition
    hover:bg-cyan-400/15
  "
>
  Login with non.ID
</button>
            
              <input
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  )

                  setShowEmailProviders(
                    e.target.value.includes("@")
                  )
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    phoneRef.current?.focus()
                  }
                }}
                placeholder="Enter email"
                autoComplete="email"
                disabled={
                  flowStep !== "form"
                }
                className="
                  mt-4
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/30
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  outline-none
                  placeholder:text-zinc-600
                  focus:border-violet-400/50
                  disabled:opacity-70
                "
              />

              {showEmailProviders && flowStep === "form" && (
                <div className="
                  absolute
                  left-0
                  top-[72px]
                  z-[999999]
                  w-full
                  overflow-hidden
                  rounded-[20px]
                  border
                  border-white/10
                  bg-[#0B1120]
                  shadow-2xl
                  backdrop-blur-xl
                ">
                  {emailProviders.map(
                    (provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => {
                          const base =
                            email.split("@")[0]

                          setEmail(
                            `${base}${provider}`
                          )

                          setShowEmailProviders(false)

                          phoneRef.current?.focus()
                        }}
                        className="
                          flex
                          h-[54px]
                          w-full
                          items-center
                          border-b
                          border-white/5
                          px-5
                          text-left
                          text-sm
                          font-medium
                          tracking-wide
                          text-white
                          transition
                          hover:bg-white/[0.05]
                        "
                      >
                        {provider}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="
              mt-4
              overflow-visible
              rounded-2xl
              border
              border-white/10
              bg-black/30
              px-2
            ">
              <PhoneInput
                defaultCountry="se"
                value={phone}
                onChange={(value) =>
                  setPhone(value)
                }
                disabled={
                  flowStep !== "form"
                }
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
    flowStep !== "form"
      ? "!h-14 !min-w-[118px] !border-0 !bg-transparent !cursor-not-allowed !text-white"
      : "!h-14 !min-w-[118px] !border-0 !bg-transparent !text-white hover:!bg-white/5",

  dropdownStyleProps: {
    className:
      "!fixed !left-4 !right-4 !top-[110px] !z-[999999999] !max-w-[calc(100vw-32px)] !bg-[#0B1120] !border !border-white/10 !text-white !rounded-[24px] !shadow-2xl",

    listItemClassName:
      "!min-h-14 !text-white hover:!bg-white/5",

    style: {
      maxHeight: "70vh",
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      width: "calc(100vw - 32px)"
    }
  }
}}
                inputClassName="
                  !h-14
                  !w-full
                  !border-0
                  !bg-transparent
                  !text-sm
                  !font-semibold
                  !text-white
                  placeholder:!text-zinc-600
                  focus:!ring-0
                "
              />
            </div>

            {flowStep === "waiting_pup" && (
              <div className="
                mt-5
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/5
                p-4
              ">
                <div className="
                  text-[10px]
                  uppercase
                  tracking-[0.22em]
                  text-cyan-300
                ">
                  non.ID Approval Required
                </div>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-zinc-300
                ">
                  OPEN non.ID on your approved device and authorize this request.
                </p>

                {pupRequestId && (
                  <p className="
                    mt-3
                    break-all
                    text-xs
                    text-zinc-500
                  ">
                    Request ID: {pupRequestId}
                  </p>
                )}

                <div className="
                  mt-4
                  grid
                  gap-3
                  sm:grid-cols-2
                ">
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "/pup",
                        "_blank"
                      )
                    }
                    className="
                      h-12
                      rounded-xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/10
                      text-sm
                      font-black
                      text-cyan-200
                    "
                  >
                    OPEN non.ID
                  </button>

                  <button
                    type="button"
                    onClick={checkRequestNow}
                    className="
                      h-12
                      rounded-xl
                      border
                      border-violet-400/20
                      bg-violet-400/10
                      text-sm
                      font-black
                      text-violet-200
                    "
                  >
                    Check Approval
                  </button>
                </div>
              </div>
            )}

            <p className="
              mt-4
              text-sm
              leading-6
              text-zinc-400
            ">
              {statusText()}
            </p>

            {fundingWallet && (
              <div className="
                mt-5
                rounded-3xl
                border
                border-amber-400/20
                bg-amber-400/10
                p-4
              ">
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
                      text-amber-200
                    ">
                      Funding required
                    </p>

                    <p className="
                      mt-1
                      text-xs
                      leading-5
                      text-amber-100/80
                    ">
                      Deposit minimum 1 USDT before activation or access can continue.
                    </p>
                  </div>

                  <span className="
                    rounded-full
                    border
                    border-amber-300/20
                    bg-black/25
                    px-3
                    py-1
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-amber-200
                  ">
                    USDT
                  </span>
                </div>

                <div className="
                  mt-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/30
                  p-4
                ">
                  <p className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.22em]
                    text-zinc-500
                  ">
                    Network
                  </p>

                  <p className="
                    mt-1
                    text-sm
                    font-black
                    text-white
                  ">
                    {fundingNetwork}
                  </p>

                  <p className="
                    mt-4
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.22em]
                    text-zinc-500
                  ">
                    Capsule Wallet
                  </p>

                  <p className="
                    mt-2
                    break-all
                    rounded-xl
                    border
                    border-white/10
                    bg-black/35
                    p-3
                    text-xs
                    leading-5
                    text-zinc-200
                  ">
                    {fundingWallet}
                  </p>

                  <div className="
                    mt-3
                    grid
                    gap-3
                    sm:grid-cols-2
                  ">
                    <button
                      type="button"
                      onClick={copyFundingWallet}
                      className="
                        h-11
                        rounded-xl
                        bg-amber-300
                        text-sm
                        font-black
                        text-black
                        transition
                        hover:scale-[1.01]
                      "
                    >
                      {copiedWallet
                        ? "Address copied"
                        : "Copy address"}
                    </button>

                    <button
                      type="button"
                      onClick={shareFundingWallet}
                      className="
                        h-11
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        text-sm
                        font-black
                        text-white
                        transition
                        hover:bg-white/15
                      "
                    >
                      Share / Send
                    </button>
                  </div>

                  <div className="
                    mt-4
                    flex
                    justify-center
                    rounded-2xl
                    bg-white
                    p-4
                  ">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(
                        fundingWallet
                      )}`}
                      alt="Capsule Wallet QR code"
                      className="
                        h-[190px]
                        w-[190px]
                      "
                    />
                  </div>

                  <p className="
                    mt-3
                    text-xs
                    leading-5
                    text-amber-100/80
                  ">
                    Send only USDT on Arbitrum to this Capsule Wallet. After deposit, press Connect Capsule again.
                  </p>
                </div>
              </div>
            )}

            <p className="
              mt-4
              text-xs
              leading-5
              text-zinc-500
            ">
              Capsule = Identity. PUP = Passport Approval Layer. Contract = Source of Truth.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={connectCapsule}
          disabled={
            loading ||
            flowStep === "waiting_pup"
          }
          className="
            absolute
            bottom-8
            left-6
            right-6
            z-20
            h-16
            rounded-2xl
            bg-gradient-to-r
            from-violet-700
            to-violet-500
            text-lg
            font-semibold
            shadow-lg
            shadow-violet-950/40
            transition
            hover:scale-[1.01]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:bottom-10
            sm:left-8
            sm:right-8
          "
        >
          {buttonText}
        </button>
            </div>

      {showNonIdLogin && (
        <div className="
          fixed
          inset-0
          z-[999999]
          flex
          items-center
          justify-center
          bg-black/70
          backdrop-blur-sm
        ">
          <div className="
            w-full
            max-w-[420px]
            rounded-[32px]
            border
            border-cyan-400/20
            bg-[#070A14]
            p-6
          ">
            <h2 className="
              text-2xl
              font-black
              text-white
            ">
              Login with non.ID
            </h2>

            <p className="
              mt-3
              text-sm
              text-zinc-400
            ">
              Choose how you want to continue.
            </p>

            <button
  type="button"
  onClick={openNonIdThisDeviceLogin}
  className="
    mt-6
    h-14
    w-full
    rounded-2xl
    bg-cyan-300
    text-black
    font-black
  "
>
  This Device
</button>

           <button
  type="button"
  onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()

  openNonIdQrLogin()
}}
  className="
    mt-3
    h-14
    w-full
    rounded-2xl
    border
    border-cyan-400/20
    bg-cyan-400/10
    text-cyan-200
    font-black
  "
>
  Another Device
</button>

            <button
              type="button"
              onClick={() => setShowNonIdLogin(false)}
              className="
                mt-4
                h-12
                w-full
                text-zinc-400
              "
            >
              Cancel
            </button>
          </div>
        </div>
            )}

      {showNonIdQr && (
        <div className="
          fixed
          inset-0
          z-[999999]
          flex
          items-center
          justify-center
          bg-black/70
          backdrop-blur-sm
        ">
          <div className="
            w-full
            max-w-[420px]
            rounded-[32px]
            border
            border-cyan-400/20
            bg-[#070A14]
            p-6
          ">
            <h2 className="text-2xl font-black text-white">
              non.ID QR Login
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Scan this QR code using non.ID on another device.
            </p>

            <div className="mt-6 flex justify-center rounded-2xl bg-white p-4">
              <img
  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    JSON.stringify({
      type: "NEXUSNON_NONID_LOGIN",
      sessionId: nonIdQrSessionId
    })
  )}`}
  alt="non.ID QR"
  className="h-[220px] w-[220px]"
/>
            </div>

            <button
              type="button"
              onClick={() => setShowNonIdQr(false)}
              className="
                mt-6
                h-12
                w-full
                rounded-xl
                border
                border-white/10
                bg-white/10
                font-bold
                text-white
              "
            >
              Close
            </button>
          </div>
        </div>
      )}

    </main>
  )
}