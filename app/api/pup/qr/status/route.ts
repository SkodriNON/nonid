import {
  getNonIdQrSession,
  updateNonIdQrSession,
} from "../_store"

import { getPupRequest } from "@/lib/pupRequestStore"

export const runtime = "nodejs"

export const dynamic = "force-dynamic"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const id = String(
      url.searchParams.get("id") ||
        url.searchParams.get("sessionId") ||
        url.searchParams.get("qrId") ||
        ""
    ).trim()

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error: "QR_SESSION_ID_REQUIRED",
        },
        400
      )
    }

    const session = await getNonIdQrSession(id)

    if (!session) {
      return jsonResponse(
        {
          success: false,
          error: "QR_SESSION_NOT_FOUND",
        },
        404
      )
    }

    if (!session.requestId) {
      return jsonResponse({
        success: true,
        session,
      })
    }

    const request = await getPupRequest(session.requestId)

    if (!request) {
      return jsonResponse({
        success: true,
        session,
      })
    }

    let nextStatus = session.status

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
        ? await updateNonIdQrSession(session.id, {
            status: nextStatus,
          })
        : session

    return jsonResponse({
      success: true,
      session: updated,
      request,
    })
  } catch (err: any) {
    return jsonResponse(
      {
        success: false,
        error: err?.message || "NONID_QR_STATUS_FAILED",
      },
      500
    )
  }
}