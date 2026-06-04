import Twilio from "twilio"

import {
  generateOtp
} from "@/lib/generateOtp"

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

  const body =
    await req.json()

  const phone =
    body?.phone
      ? normalizePhone(body.phone)
      : ""

  if (!phone) {
    return Response.json({
      success: false,
      error: "PHONE_REQUIRED"
    })
  }

  const otp =
    generateOtp()

  otpStore.set(
    phone,
    {
      otp,
      phone,
      expires:
        Date.now() + 5 * 60 * 1000
    }
  )

  console.log("NEXUSNON DEV OTP:", {
    phone,
    otp
  })

  try {

    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {

      const twilio =
        Twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        )

      await twilio.messages.create({
        from:
          process.env.TWILIO_PHONE_NUMBER,
        to:
          phone,
        body:
          `Your NexusNON.ID verification code is: ${otp}`
      })
    }

  } catch (error: any) {

    console.error(
      "TWILIO_SKIPPED_DEV_MODE:",
      error?.message || error
    )
  }

  return Response.json({
    success: true,
    message: "OTP generated",
    devOtp:
      process.env.NODE_ENV === "development"
        ? otp
        : undefined
  })
}