import {
  voteBusinessCapsuleRequest
} from "@/lib/businessCapsuleStore"

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

    const request =
      await voteBusinessCapsuleRequest({
        requestId:
          String(
            body.requestId ||
            body.id ||
            ""
          ),
        signerWallet:
          String(
            body.signerWallet ||
            body.wallet ||
            ""
          ),
        approve:
          body.vote === "denied"
            ? false
            : body.approve === false
              ? false
              : true
      })

    return Response.json({
      success: true,
      request
    })

  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "BUSINESS_REQUEST_VOTE_FAILED"
      },
      {
        status: 500
      }
    )
  }
}