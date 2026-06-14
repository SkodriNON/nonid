import { approvePupRequest } from "@/lib/pupRequestStore"

import { voteBusinessCapsuleRequest } from "@/lib/businessCapsuleStore"

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

    const id = String(
      body.id ||
        body.requestId ||
        body.pupRequestId ||
        ""
    ).trim()

    const wallet = String(body.wallet || "").trim().toLowerCase()
    const capsuleId = String(body.capsuleId || "").trim()
    const email = String(body.email || "").trim().toLowerCase()

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error: "REQUEST_ID_REQUIRED",
        },
        400
      )
    }

    if (!wallet && !capsuleId && !email) {
      return jsonResponse(
        {
          success: false,
          error: "REQUEST_SCOPE_REQUIRED",
        },
        400
      )
    }

    const request = await approvePupRequest(id, {
      wallet,
      capsuleId,
      email,
    })

    if (!request) {
      return jsonResponse(
        {
          success: false,
          error: "REQUEST_NOT_FOUND_OR_SCOPE_MISMATCH",
        },
        404
      )
    }

    let businessVote = null

    if (
      request.status === "approved" &&
      String(request.action || "").startsWith("BUSINESS_CAPSULE_APPROVAL:")
    ) {
      const businessRequestId = String(request.action)
        .replace("BUSINESS_CAPSULE_APPROVAL:", "")
        .trim()

      businessVote = await voteBusinessCapsuleRequest({
        requestId: businessRequestId,
        signerWallet: request.wallet,
        approve: true,
      })
    }

    return jsonResponse({
      success: true,
      approved: request.status === "approved",
      request,
      businessVote,
    })
  } catch (err: any) {
    return jsonResponse(
      {
        success: false,
        error: err?.message || "PUP_APPROVE_FAILED",
      },
      500
    )
  }
}