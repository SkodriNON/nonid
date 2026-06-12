import {
  getNonIdQrSession,
  updateNonIdQrSession
} from "../_store"

import {
  getPupRequest
} from "@/lib/pupRequestStore"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function GET(
  req: Request
) {
  try {
    const url =
      new URL(req.url)

    const id =
      String(
        url.searchParams.get("id") || ""
      ).trim()

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "QR_SESSION_ID_REQUIRED"
        },
        {
          status: 400
        }
      )
    }

    const session =
      await getNonIdQrSession(id)

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

    if (!session.requestId) {
      return Response.json({
        success: true,
        session
      })
    }

    const request =
      await getPupRequest(
        session.requestId
      )

    if (!request) {
      return Response.json({
        success: true,
        session
      })
    }

    let nextStatus =
      session.status

    if (request.status === "approved") {
      nextStatus = "approved"
    }

    if (request.status === "denied") {
      nextStatus = "denied"
    }

    if (request.status === "expired") {
      nextStatus = "expired"
    }

    const updated =
      nextStatus !== session.status
        ? await updateNonIdQrSession(
            session.id,
            {
              status: nextStatus
            }
          )
        : session

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
          "NONID_QR_STATUS_FAILED"
      },
      {
        status: 500
      }
    )
  }
}