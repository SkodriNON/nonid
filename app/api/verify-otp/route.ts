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

function jsonResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  })
}

function normalizePhone(phone: string) {
  return String(phone || "").trim().replace(/\s+/g, "")
}

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const phone = body?.phone ? normalizePhone(body.phone) : ""
    const email = body?.email ? normalizeEmail(body.email) : ""

    const otp = String(
      body?.otp ||
        body?.phoneOtp ||
        body?.emailOtp ||
        body?.code ||
        body?.verificationCode ||
        ""
    ).trim()

    if (!phone && !email) {
      return jsonResponse({
        success: false,
        verified: false,
        error: "PHONE_OR_EMAIL_REQUIRED",
      })
    }

    if (!otp) {
      return jsonResponse({
        success: false,
        verified: false,
        error: "OTP_REQUIRED",
      })
    }

    const keys =
      email && phone
        ? [`${phone}:${email}`, phone, email]
        : email
          ? [email]
          : [phone]

    let session: any = null
    let usedKey = ""

    for (const key of keys) {
      const found = otpStore.get(key)

      if (found) {
        session = found
        usedKey = key
        break
      }
    }

    console.log("VERIFY OTP:", {
      phone,
      email,
      received: otp,
      usedKey,
      hasSession: Boolean(session),
      hasOtp: Boolean(session?.otp),
      hasPhoneOtp: Boolean(session?.phoneOtp),
      hasEmailOtp: Boolean(session?.emailOtp),
    })

    if (!session) {
      return jsonResponse({
        success: false,
        verified: false,
        error: "OTP_SESSION_NOT_FOUND",
      })
    }

    if (Date.now() > session.expires) {
      otpStore.delete(usedKey)

      return jsonResponse({
        success: false,
        verified: false,
        error: "OTP_EXPIRED",
      })
    }

    const validOtps = [session.otp, session.phoneOtp, session.emailOtp]
      .filter(Boolean)
      .map((value) => String(value).trim())

    if (!validOtps.includes(otp)) {
      return jsonResponse({
        success: false,
        verified: false,
        error: "INVALID_OTP",
      })
    }

    otpStore.delete(usedKey)

    return jsonResponse({
      success: true,
      verified: true,
      message: "OTP verified",
    })
  } catch (error: any) {
    console.error("VERIFY_OTP_ERROR:", error)

    return jsonResponse(
      {
        success: false,
        verified: false,
        error: error?.message || "VERIFY_OTP_FAILED",
      },
      500
    )
  }
}