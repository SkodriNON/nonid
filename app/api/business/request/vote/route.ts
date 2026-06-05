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
      await voteBusinessCapsuleRequest(
        String(body.id || ""),
        String(body.wallet || ""),
        body.vote === "denied"
          ? "denied"
          : "approved"
      )

    if (!request) {
      return Response.json(
        {
          success: false,
          error:
            "REQUEST_NOT_FOUND"
        },
        {
          status: 404
        }
      )
    }

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