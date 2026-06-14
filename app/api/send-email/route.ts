import { Resend } from "resend"

import { generateOtp } from "@/lib/generateOtp"
import { otpStore } from "@/lib/otpStore"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const resend = new Resend(
  process.env.RESEND_API_KEY
)

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

function normalizePhone(phone: string) {
  return String(phone || "").trim().replace(/\s+/g, "")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const phone = normalizePhone(body?.phone || "")
    const email = normalizeEmail(body?.email || "")

    if (!phone || !email) {
      return Response.json(
        {
          success: false,
          message: "PHONE_AND_EMAIL_REQUIRED"
        },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        {
          success: false,
          message: "RESEND_API_KEY_MISSING"
        },
        { status: 500 }
      )
    }

    const from =
      process.env.RESEND_FROM_EMAIL ||
      "NexusNON.ID <verify@skodrinon.com>"

    const key = `${phone}:${email}`

    const existing = await otpStore.get(key)

    const emailOtp = generateOtp()

    await otpStore.set(key, {
      phoneOtp: existing?.phoneOtp || "",
      emailOtp,
      expires: Date.now() + 5 * 60 * 1000,
      email
    })

    const result = await resend.emails.send({
      from,
      to: email,
      subject: "Your NexusNON.ID Verification Code",
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px;background:#020617;color:white;border-radius:18px">
          <h1 style="margin:0 0 12px">NexusNON.ID</h1>
          <p>Your verification code:</p>
          <h2 style="font-size:36px;letter-spacing:8px;color:#67e8f9">${emailOtp}</h2>
          <p style="color:#94a3b8">This code expires in 5 minutes.</p>
        </div>
      `
    })

    return Response.json({
      success: true,
      message: "EMAIL_OTP_SENT",
      id: (result as any)?.data?.id || null
    })
  } catch (error: any) {
    console.error("SEND_EMAIL_OTP_ERROR:", error)

    return Response.json(
      {
        success: false,
        message: error?.message || "EMAIL_OTP_FAILED"
      },
      { status: 500 }
    )
  }
}
