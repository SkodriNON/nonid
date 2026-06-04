import { Resend }
from "resend"

import {
  generateOtp
} from "@/lib/generateOtp"

import {
  otpStore
} from "@/lib/otpStore"

const resend =
  new Resend(
    process.env
      .RESEND_API_KEY
  )

export async function POST(
  req: Request
) {
  try {

    const body =
      await req.json()

    const {
      phone,
      email
    } = body

    if (
      !phone ||
      !email
    ) {
      return Response.json({
        success: false,
        message:
          "Phone and email required"
      })
    }

    const key =
      `${phone}:${email}`

    const existing =
      otpStore.get(key)

    const emailOtp =
      generateOtp()

    otpStore.set(
      key,
      {
        phoneOtp:
          existing?.phoneOtp || "",
        emailOtp,
        expires:
          Date.now() +
          5 * 60 * 1000,
        email
      }
    )

    console.log(
      "EMAIL OTP:",
      emailOtp
    )

    const result =
      await resend.emails.send({
        from:
          "NexusnΩn <onboarding@resend.dev>",

        to:
          email,

        subject:
          "Your NexusnΩn Verification Code",

        html: `
          <div style="font-family:sans-serif;padding:30px;background:black;color:white">
            <h1>NexusNON.ID</h1>
            <p>Your verification code:</p>
            <h2>${emailOtp}</h2>
          </div>
        `
      })

    console.log(
      "RESEND RESULT:",
      result
    )

    return Response.json({
      success: true,
      message:
        "Email OTP sent"
    })

  } catch (error) {

    console.error(
      "SEND EMAIL OTP ERROR:",
      error
    )

    return Response.json({
      success: false,
      message:
        "Email OTP failed"
    })
  }
}