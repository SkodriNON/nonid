import { createPupRequest } from "@/lib/pupRequestStore"

import {
  getNonIdQrSession,
  updateNonIdQrSession,
} from "../_store"

export const runtime = "nodejs"

export const dynamic = "force-dynamic"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const capsuleId = String(body.capsuleId || "").trim()
    const wallet = String(body.wallet || "").trim().toLowerCase()
    const email = String(body.email || "").trim().toLowerCase()
    const phone = String(body.phone || "").trim()
    const qr = body.qr || {}

    const sessionId = String(
      qr.sessionId ||
        qr.qrId ||
        qr.requestId ||
        body.sessionId ||
        body.qrId ||
        body.requestId ||
        ""
    ).trim()

    if (!sessionId) {
      return jsonResponse(
        {
          success: false,
          error: "QR_SESSION_ID_MISSING",
        },
        400
      )
    }

    if (!capsuleId || !/^\d+$/.test(capsuleId)) {
      return jsonResponse(
        {
          success: false,
          error: "INVALID_CAPSULE_ID",
        },
        400
      )
    }

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return jsonResponse(
        {
          success: false,
          error: "INVALID_WALLET",
        },
        400
      )
    }

    const session = await getNonIdQrSession(sessionId)

    if (!session) {
      return jsonResponse(
        {
          success: false,
          error: "QR_SESSION_NOT_FOUND",
        },
        404
      )
    }

    if (session.status === "expired") {
      return jsonResponse(
        {
          success: false,
          error: "QR_SESSION_EXPIRED",
        },
        410
      )
    }

    const request = await createPupRequest({
      capsuleId,
      wallet,
      email,
      phone,
      action: "LOGIN_WITH_NONID_QR",
      activationRequired: false,
    })

    const updated = await updateNonIdQrSession(sessionId, {
      status: "scanned",
      requestId: request.id,
      capsuleId,
      wallet,
      email,
      phone,
    })

    return jsonResponse({
      success: true,
      session: updated,
      request,
    })
  } catch (err: any) {
    return jsonResponse(
      {
        success: false,
        error: err?.message || "NONID_QR_SCAN_FAILED",
      },
      500
    )
  }
}