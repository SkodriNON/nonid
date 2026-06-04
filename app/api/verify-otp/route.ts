import {
  otpStore
} from "@/lib/otpStore"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

function normalizePhone(
  phone: string
) {
  return phone
    .trim()
    .replace(/\s+/g, "")
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json()

    const phone =
      body?.phone
        ? normalizePhone(body.phone)
        : ""

    const otp =
      String(
        body?.otp ||
        body?.phoneOtp ||
        body?.code ||
        body?.verificationCode ||
        ""
      ).trim()

    if (!phone) {
      return Response.json({
        success: false,
        verified: false,
        error: "PHONE_REQUIRED"
      })
    }

    if (!otp) {
      return Response.json({
        success: false,
        verified: false,
        error: "OTP_REQUIRED"
      })
    }

    const session =
      otpStore.get(phone)

    console.log("VERIFY OTP:", {
      phone,
      received: otp,
      stored: session?.otp,
      hasSession: Boolean(session)
    })

    if (!session) {
      return Response.json({
        success: false,
        verified: false,
        error: "OTP_SESSION_NOT_FOUND"
      })
    }

    if (
      Date.now() >
      session.expires
    ) {
      otpStore.delete(phone)

      return Response.json({
        success: false,
        verified: false,
        error: "OTP_EXPIRED"
      })
    }

    if (
      String(session.otp).trim() !== otp
    ) {
      return Response.json({
        success: false,
        verified: false,
        error: "INVALID_OTP"
      })
    }

    otpStore.delete(phone)

    return Response.json({
      success: true,
      verified: true,
      message: "OTP verified"
    })

  } catch (error: any) {
    console.error(
      "VERIFY_OTP_ERROR:",
      error
    )

    return Response.json({
      success: false,
      verified: false,
      error:
        error?.message ||
        "VERIFY_OTP_FAILED"
    })
  }
}