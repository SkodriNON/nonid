import { ethers } from "ethers"

import {
  approvePupRequest,
  getPupRequest
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

    const requestId =
      String(body.requestId || "").trim()

    const antiPhishing =
      String(body.antiPhishing || "").trim()

    const newPin =
      String(body.newPin || "").trim()

    const repeatPin =
      String(body.repeatPin || "").trim()

    if (!requestId) {
      return Response.json(
        {
          success: false,
          error: "REQUEST_ID_REQUIRED"
        },
        { status: 400 }
      )
    }

    if (
      !antiPhishing ||
      antiPhishing.length < 4
    ) {
      return Response.json(
        {
          success: false,
          error: "ANTI_PHISHING_REQUIRED"
        },
        { status: 400 }
      )
    }

    if (
      !newPin ||
      newPin.length < 6
    ) {
      return Response.json(
        {
          success: false,
          error: "PUP_PIN_MIN_6"
        },
        { status: 400 }
      )
    }

    if (newPin !== repeatPin) {
      return Response.json(
        {
          success: false,
          error: "PUP_PIN_MISMATCH"
        },
        { status: 400 }
      )
    }

    const request =
      await getPupRequest(requestId)

    if (!request) {
      return Response.json(
        {
          success: false,
          error: "REQUEST_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    if (request.status !== "pending") {
      return Response.json(
        {
          success: false,
          error: "REQUEST_NOT_PENDING",
          request
        },
        { status: 400 }
      )
    }

    const capsuleId =
      String(request.capsuleId)

    const wallet =
      String(request.wallet || "")

    if (!capsuleId || !wallet) {
      return Response.json(
        {
          success: false,
          error: "REQUEST_CAPSULE_OR_WALLET_MISSING"
        },
        { status: 400 }
      )
    }

    const pinProofHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PIN:${capsuleId}:${newPin}`
        )
      )

    const pukProofHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PUK:${capsuleId}:${wallet}:${antiPhishing}`
        )
      )

    const pupProofHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PUP:${capsuleId}:${wallet}:${Date.now()}`
        )
      )

    const origin =
      new URL(req.url).origin

    const activationResponse =
      await fetch(
        `${origin}/api/genesis/activate-pup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            capsuleId,
            pinProofHash,
            pukProofHash,
            pupProofHash
          })
        }
      )

    const activationData =
      await activationResponse.json()

    if (
      !activationResponse.ok ||
      activationData.success !== true
    ) {
      return Response.json(
        {
          success: false,
          error:
            activationData.message ||
            activationData.error ||
            "PUP_ACTIVATION_FAILED",
          activation:
            activationData
        },
        { status: 500 }
      )
    }

    const approvedRequest =
  await approvePupRequest(
    requestId,
    {
      wallet,
      capsuleId,
      email: request.email
    }
  )

    if (!approvedRequest) {
      return Response.json(
        {
          success: false,
          error: "APPROVE_AFTER_ACTIVATION_FAILED"
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      activated: true,
      approved: approvedRequest.status === "approved",
      request: approvedRequest,
      activation: activationData
    })

  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "MOBILE_ACTIVATE_APPROVE_FAILED"
      },
      { status: 500 }
    )
  }
}