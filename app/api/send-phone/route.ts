
import Twilio
from "twilio"

import {
  generateOtp
} from "../../../lib/generateOtp"

import {
  otpStore
} from "../../../lib/otpStore"

const client =
  Twilio(

    process.env
      .TWILIO_ACCOUNT_SID!,

    process.env
      .TWILIO_AUTH_TOKEN!
  )

export async function POST(

  req: Request

) {

  try {

    const body =
      await req.json()

    const {
      phone
    } = body

    if (!phone) {

      return Response.json({

        success: false
      })
    }

    const otp =
      generateOtp()

    otpStore.set(

      phone,

      otp
    )

    await client.messages.create({

      body:
        `NexusnΩn verification code: ${otp}`,

      from:
        process.env
          .TWILIO_PHONE_NUMBER!,

      to: phone
    })

    console.log(

      "OTP SAVED:",

      phone,

      otp
    )

    return Response.json({

      success: true
    })

  } catch (error) {

    console.error(error)

    return Response.json({

      success: false
    })
  }
}

