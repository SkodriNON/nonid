import crypto from "crypto"

import {
  getBusinessCapsuleRequest
} from "@/lib/businessCapsuleStore"

import {
  saveBusinessCapsule
} from "@/lib/businessCapsuleRegistry"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

function makeBusinessCapsuleId() {
  return `BUS-${crypto.randomBytes(10).toString("hex")}`
}

function makeBusinessWallet(seed: string) {
  const hash =
    crypto
      .createHash("sha256")
      .update(seed)
      .digest("hex")

  return `0x${hash.slice(0, 40)}`
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json()

    const requestId =
      String(body.requestId || "").trim()

    if (!requestId) {
      return Response.json(
        {
          success: false,
          error: "REQUEST_ID_REQUIRED"
        },
        {
          status: 400
        }
      )
    }

    const request =
      await getBusinessCapsuleRequest(requestId)

    if (!request) {
      return Response.json(
        {
          success: false,
          error: "BUSINESS_REQUEST_NOT_FOUND"
        },
        {
          status: 404
        }
      )
    }

    if (request.status !== "approved") {
      return Response.json(
        {
          success: false,
          error: "BUSINESS_REQUEST_NOT_APPROVED"
        },
        {
          status: 400
        }
      )
    }

    const businessCapsule = {
      id: makeBusinessCapsuleId(),
      requestId: request.id,
      name: request.name,
      symbol: request.symbol,
      description: request.description,
      creatorCapsuleId: request.creatorCapsuleId,
      creatorWallet: request.creatorWallet,
      businessWallet: makeBusinessWallet(request.id),
      status: "active" as const,
      createdAt: Date.now()
    }

    const saved =
      await saveBusinessCapsule(
        businessCapsule
      )

    return Response.json({
      success: true,
      businessCapsule: saved
    })

  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "BUSINESS_CAPSULE_ACTIVATION_FAILED"
      },
      {
        status: 500
      }
    )
  }
}