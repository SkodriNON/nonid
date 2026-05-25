
import { Resend }
from "resend"

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

      email,

      code

    } = body

    if (

      !email ||

      !code

    ) {

      return Response.json({

        success: false
      })
    }

    await resend.emails.send({

      from:
        "NexusnΩn <onboarding@resend.dev>",

      to: email,

      subject:
        "Your NexusnΩn Verification Code",

      html: `

        <div style="font-family:sans-serif;padding:30px;background:black;color:white">

          <h1>NexusnΩn.id</h1>

          <p>Your verification code:</p>

          <h2>${code}</h2>

        </div>

      `
    })

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

