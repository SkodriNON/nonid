"use client"

import { useState } from "react"

export default function TestUSDTPage() {
  const [wallet, setWallet] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [txHash, setTxHash] = useState("")

  async function sendUSDT() {
    try {
      setLoading(true)
      setMessage("")
      setTxHash("")

      const res = await fetch("/api/test/send-usdt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wallet,
          email,
          phone
        })
      })

      const data = await res.json()

      if (!res.ok || data.success !== true) {
        throw new Error(data.message || "Send failed")
      }

      setMessage("10 mUSDT sent successfully.")
      setTxHash(data.txHash || "")
    } catch (err: any) {
      setMessage(err?.message || "Send failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white">
      <section className="mx-auto max-w-xl rounded-[36px] border border-cyan-400/20 bg-black/30 p-6 shadow-[0_0_100px_rgba(34,211,238,0.10)]">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
          NEXUSNON.ID TESTNET
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Send Test USDT
        </h1>

        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Enter your Capsule Wallet, email and phone. This sends 10 mUSDT on Arbitrum Sepolia.
        </p>

        {message && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Capsule Wallet 0x..."
            className="h-14 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm outline-none"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-14 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm outline-none"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="h-14 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm outline-none"
          />
        </div>

        <button
          onClick={sendUSDT}
          disabled={loading}
          className="mt-6 h-14 w-full rounded-2xl bg-cyan-300 text-sm font-black text-black transition hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send 10 mUSDT"}
        </button>

        {txHash && (
          <p className="mt-4 break-all text-xs text-cyan-300">
            TX: {txHash}
          </p>
        )}
      </section>
    </main>
  )
}