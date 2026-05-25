
import {
  otpStore
} from "../../../lib/otpStore"

export async function POST(

  req: Request

) {

  try {

    const body =
      await req.json()

    const {

      phone,

      otp

    } = body

    const savedOtp =
      otpStore.get(phone)

    if (

      savedOtp === otp

    ) {

      return Response.json({

        success: true
      })
    }

    return Response.json({

      success: false
    })

  } catch (error) {

    return Response.json({

      success: false
    })
  }
}

