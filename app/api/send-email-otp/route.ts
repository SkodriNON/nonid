import { Resend } from "resend"

import { generateOtp } from "@/lib/generateOtp"

import { otpStore } from "@/lib/otpStore"

export const runtime = "nodejs"

export const dynamic = "force-dynamic"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

const resend = new Resend(process.env.RESEND_API_KEY)

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

function normalizePhone(phone: string) {
  return String(phone || "").trim().replace(/\s+/g, "")
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function jsonResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const phone = normalizePhone(body?.phone || "")
    const email = normalizeEmail(body?.email || "")

    if (!email) {
      return jsonResponse(
        {
          success: false,
          error: "EMAIL_REQUIRED",
        },
        400
      )
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          success: false,
          error: "INVALID_EMAIL",
        },
        400
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return jsonResponse(
        {
          success: false,
          error: "RESEND_API_KEY_MISSING",
        },
        500
      )
    }

    const key = phone ? `${phone}:${email}` : email

    const existing = await otpStore.get(key)

    if (
      existing?.emailOtp &&
      existing?.expires &&
      existing.expires > Date.now()
    ) {
      return jsonResponse(
        {
          success: false,
          error: "OTP_ALREADY_SENT",
          message:
            "OTP was already sent. Please wait 5 minutes before requesting a new code.",
        },
        429
      )
    }

    const emailOtp = generateOtp()

    await otpStore.set(key, {
      phoneOtp: existing?.phoneOtp || "",
      emailOtp,
      expires: Date.now() + 5 * 60 * 1000,
      email,
    })

    const from =
      process.env.RESEND_FROM_EMAIL ||
      "NexusNON.ID <onboarding@resend.dev>"

    const result = await resend.emails.send({
      from,
      to: email,
      subject: "Your NexusNON.ID verification code",
      html: `
        <div style="font-family:Arial,sans-serif;padding:28px;background:#020617;color:#ffffff;border-radius:20px">
          <h1 style="margin:0 0 12px;font-size:28px">NexusNON.ID</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6">
            Your verification code is:
          </p>
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;margin:24px 0;color:#67e8f9">
            ${emailOtp}
          </div>
          <p style="color:#64748b;font-size:13px">
            This code expires in 5 minutes.
          </p>
        </div>
      `,
    })

    console.log("RESEND RESULT:", JSON.stringify(result, null, 2))

    return jsonResponse({
      success: true,
      message: "EMAIL_OTP_SENT",
      id: (result as any)?.data?.id || null,
    })
  } catch (error: any) {
    return jsonResponse(
      {
        success: false,
        error: "EMAIL_OTP_FAILED",
        message: error?.message || "Email OTP failed",
      },
      500
    )
  }
}
