"use client"

import {
  useEffect,
  useState
} from "react"

import {
  useRouter,
  useSearchParams
} from "next/navigation"

import {
  ethers
} from "ethers"

function passwordKey(capsuleId: string) {
  return `NEXUSNON_PUP_PASSWORD_HASH_${capsuleId}`
}

function hashPassword(capsuleId: string, password: string) {
  return ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `NEXUSNON_PUP_PASSWORD:${capsuleId}:${password.trim()}`
    )
  )
}

function savePupPassword(capsuleId: string, password: string) {
  localStorage.setItem(
    passwordKey(capsuleId),
    hashPassword(capsuleId, password)
  )
}

export default function PupRecoveryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [capsuleId, setCapsuleId] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [antiPhishing, setAntiPhishing] = useState("")
  const [otp, setOtp] = useState("")
  const [newPin, setNewPin] = useState("")
  const [repeatPin, setRepeatPin] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  function cleanEmail() {
    return email.trim().toLowerCase()
  }

  function cleanPhone() {
    return phone.trim().replace(/\s+/g, "")
  }

  async function loadCapsulePrivate(id: string) {
    try {
      setLoading(true)
      setMessage("")

      const response = await fetch(
        `/api/genesis/capsule-private?capsuleId=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      )

      const data = await response.json()

      if (!response.ok || data.success !== true) {
        throw new Error(data.error || "CAPSULE_PRIVATE_READ_FAILED")
      }

      setCapsuleId(String(data.capsuleId || id))
      setEmail(String(data.email || ""))
      setPhone(String(data.phone || ""))

    } catch (err: any) {
      setMessage(err?.message || "Could not load Capsule recovery data.")
    } finally {
      setLoading(false)
    }
  }

  async function sendOtp() {
    try {
      setLoading(true)
      setMessage("")

      if (!cleanEmail()) {
        throw new Error("Email is missing from Capsule.")
      }

      if (!cleanPhone()) {
        throw new Error("Phone is missing from Capsule.")
      }

      const response = await fetch("/api/send-email-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: cleanEmail(),
          phone: cleanPhone()
        })
      })

      const data = await response.json()

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || data.error || "OTP send failed.")
      }

      setOtpSent(true)
      setMessage("OTP sent to your registered email.")
    } catch (err: any) {
      setMessage(err?.message || "Could not send OTP.")
    } finally {
      setLoading(false)
    }
  }

  async function recover() {
    try {
      setLoading(true)
      setMessage("")

      if (!capsuleId || !/^\d+$/.test(capsuleId)) {
        throw new Error("Capsule ID is missing.")
      }

      if (!cleanEmail()) {
        throw new Error("Email is missing from Capsule.")
      }

      if (!cleanPhone()) {
        throw new Error("Phone is missing from Capsule.")
      }

      if (!antiPhishing.trim() || antiPhishing.trim().length < 4) {
        throw new Error("Anti-Phishing Code is required.")
      }

      if (!otp.trim() || otp.trim().length !== 6) {
        throw new Error("Email OTP is required.")
      }

      if (!newPin.trim() || newPin.trim().length < 6) {
        throw new Error("New PUP PIN must be at least 6 characters.")
      }

      if (newPin.trim() !== repeatPin.trim()) {
        throw new Error("PUP PINs do not match.")
      }

      const otpResponse = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: cleanEmail(),
          phone: cleanPhone(),
          emailOtp: otp.trim()
        })
      })

      const otpData = await otpResponse.json()

      if (!otpResponse.ok || otpData.success !== true) {
        throw new Error(otpData.message || otpData.error || "Invalid OTP.")
      }

      const findResponse = await fetch("/api/genesis/findCapsule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: cleanEmail(),
          phone: cleanPhone(),
          antiPhishing: antiPhishing.trim()
        })
      })

      const findData = await findResponse.json()

      if (
        !findResponse.ok ||
        findData.success !== true ||
        findData.exists !== true ||
        findData.matched !== true ||
        !findData.capsuleId ||
        !findData.capsuleWallet
      ) {
        throw new Error(
          findData.message ||
          findData.error ||
          "Capsule not found or identity data does not match."
        )
      }

      const wallet = String(findData.capsuleWallet)

      const pinProofHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PIN:${capsuleId}:${newPin.trim()}`
        )
      )

      const pukProofHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PUK:${capsuleId}:${wallet}:${antiPhishing.trim()}`
        )
      )

      const pupProofHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PUP:${capsuleId}:${wallet}:${Date.now()}`
        )
      )

      const recoveryResponse = await fetch("/api/genesis/recover-pup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          capsuleId,
          newPinProofHash: pinProofHash,
          newPukProofHash: pukProofHash,
          newPupProofHash: pupProofHash
        })
      })

      const recoveryData = await recoveryResponse.json()

      if (!recoveryResponse.ok || recoveryData.success !== true) {
        throw new Error(
          recoveryData.message ||
          recoveryData.error ||
          "PUP recovery failed. Capsule Wallet must have 1 USDT."
        )
      }

      savePupPassword(capsuleId, newPin)

      setMessage("PUP recovered successfully. 1 USDT recovery fee was processed.")

      setTimeout(() => {
        router.push("/pup")
      }, 1800)

    } catch (err: any) {
      setMessage(err?.message || "Recovery failed.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = searchParams.get("capsuleId") || ""

    if (id) {
      loadCapsulePrivate(id)
    } else {
      setMessage("Open recovery from PUP so Capsule ID can be loaded automatically.")
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-10">
      <section className="mx-auto max-w-2xl">
        <div className="rounded-[40px] border border-amber-400/20 bg-gradient-to-b from-[#101026] via-[#080812] to-[#05050B] p-6 shadow-[0_0_100px_rgba(251,191,36,0.10)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
            NEXUSNON.ID PUP
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            PUP Recovery
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Recovery data is verified against your Capsule Identity. Confirm Anti-Phishing, Email OTP, and new PUP PIN. Recovery requires 1 USDT from your Capsule Wallet.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}

          <div className="mt-8 grid gap-4">
            <input
              value={capsuleId}
              readOnly
              placeholder="Capsule ID"
              className="h-14 cursor-not-allowed rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-400 outline-none"
            />

            <input
              value={email}
              readOnly
              placeholder="Email from Capsule"
              className="h-14 cursor-not-allowed rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-400 outline-none"
            />

            <input
              value={phone}
              readOnly
              placeholder="Phone from Capsule"
              className="h-14 cursor-not-allowed rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-zinc-400 outline-none"
            />

            <input
              value={antiPhishing}
              onChange={(e) => setAntiPhishing(e.target.value)}
              type="password"
              placeholder="Anti-Phishing Code"
              className="h-14 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
            />

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading || !email || !phone}
              className="h-13 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm font-black text-amber-200 transition hover:bg-amber-400/15 disabled:opacity-50"
            >
              {otpSent ? "Send OTP Again" : "Send Email OTP"}
            </button>

            <input
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="Email OTP"
              inputMode="numeric"
              maxLength={6}
              className="h-14 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
            />

            <input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              type="password"
              placeholder="New PUP PIN"
              className="h-14 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
            />

            <input
              value={repeatPin}
              onChange={(e) => setRepeatPin(e.target.value)}
              type="password"
              placeholder="Repeat New PUP PIN"
              className="h-14 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <button
            type="button"
            onClick={recover}
            disabled={loading}
            className="mt-6 h-14 w-full rounded-2xl bg-amber-300 text-sm font-black text-black transition hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? "Recovering..." : "Recover PUP"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/pup")}
            className="mt-4 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black text-zinc-300"
          >
            Back to PUP
          </button>
        </div>
      </section>
    </main>
  )
}