import {
  createBusinessCapsuleRequest
} from "@/lib/businessCapsuleStore"

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

    const businessRequest =
      await createBusinessCapsuleRequest({
        name:
          String(body.name || ""),
        symbol:
          String(body.symbol || ""),
        description:
          String(body.description || ""),
        creatorCapsuleId:
          String(body.creatorCapsuleId || ""),
        creatorWallet:
          String(body.creatorWallet || ""),
        signers:
          Array.isArray(body.signers)
            ? body.signers
            : []
      })

    for (const signer of businessRequest.signers) {
      await createPupRequest({
        capsuleId:
          String(signer.capsuleId || ""),
        wallet:
          String(signer.wallet || ""),
        email:
          "",
        phone:
          "",
        action:
          `BUSINESS_CAPSULE_APPROVAL:${businessRequest.id}`,
        capsuleStatus:
          2,
        activationRequired:
          false
      })
    }

    return Response.json({
      success: true,
      request:
        businessRequest
    })

  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "BUSINESS_REQUEST_CREATE_FAILED"
      },
      {
        status: 500
      }
    )
  }
}