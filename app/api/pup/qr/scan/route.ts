import {
  createPupRequest
} from "@/lib/pupRequestStore"

import {
  getNonIdQrSession,
  updateNonIdQrSession
} from "../_store"

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

    const qr =
      body.qr || {}

    const sessionId =
      String(
        qr.sessionId ||
        qr.qrId ||
        qr.requestId ||
        ""
      ).trim()

    if (!sessionId) {
      return Response.json(
        {
          success: false,
          error: "QR_SESSION_ID_MISSING"
        },
        {
          status: 400
        }
      )
    }

    if (
      !capsuleId ||
      !/^\d+$/.test(capsuleId)
    ) {
      return Response.json(
        {
          success: false,
          error: "INVALID_CAPSULE_ID"
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
          error: "INVALID_WALLET"
        },
        {
          status: 400
        }
      )
    }

    const session =
      await getNonIdQrSession(sessionId)

    if (!session) {
      return Response.json(
        {
          success: false,
          error: "QR_SESSION_NOT_FOUND"
        },
        {
          status: 404
        }
      )
    }

    if (session.status === "expired") {
      return Response.json(
        {
          success: false,
          error: "QR_SESSION_EXPIRED"
        },
        {
          status: 410
        }
      )
    }

    const request =
      await createPupRequest({
        capsuleId,
        wallet,
        email,
        phone,
        action: "LOGIN_WITH_NONID_QR",
        activationRequired: false
      })

    const updated =
      await updateNonIdQrSession(
        sessionId,
        {
          status: "scanned",
          requestId: request.id,
          capsuleId,
          wallet,
          email,
          phone
        }
      )

    return Response.json({
      success: true,
      session: updated,
      request
    })
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "NONID_QR_SCAN_FAILED"
      },
      {
        status: 500
      }
    )
  }
}