import {
  createPupRequest
} from "@/lib/pupRequestStore"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json()

    const capsuleId =
      String(body.capsuleId || "")
        .trim()

    const wallet =
      String(body.wallet || "")
        .trim()

    const email =
      String(body.email || "")
        .trim()
        .toLowerCase()

    const phone =
      String(body.phone || "")
        .trim()

    const action =
      String(body.action || "LOGIN_DASHBOARD")
        .trim()

    if (
      !capsuleId ||
      !/^\d+$/.test(capsuleId)
    ) {
      return Response.json(
        {
          success: false,
          error:
            "INVALID_CAPSULE_ID"
        },
        {
          status: 400
        }
      )
    }

    if (
      !wallet ||
      !/^0x[a-fA-F0-9]{40}$/.test(wallet)
    ) {
      return Response.json(
        {
          success: false,
          error:
            "INVALID_WALLET"
        },
        {
          status: 400
        }
      )
    }

    const request =
      createPupRequest({
        capsuleId,
        wallet,
        email,
        phone,
        action
      })

    return Response.json({
      success: true,
      request
    })

  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "PUP_REQUEST_CREATE_FAILED"
      },
      {
        status: 500
      }
    )
  }
}