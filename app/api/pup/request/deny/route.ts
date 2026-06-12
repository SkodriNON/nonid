import {
  denyPupRequest
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

    const id =
      String(
        body.id ||
        body.requestId ||
        body.pupRequestId ||
        ""
      ).trim()

    const wallet =
      String(body.wallet || "")
        .trim()

    const capsuleId =
      String(body.capsuleId || "")
        .trim()

    const email =
      String(body.email || "")
        .trim()
        .toLowerCase()

    if (!id) {
      return Response.json(
        {
          success: false,
          error:
            "REQUEST_ID_REQUIRED"
        },
        {
          status: 400
        }
      )
    }

    if (
      !wallet &&
      !capsuleId &&
      !email
    ) {
      return Response.json(
        {
          success: false,
          error:
            "REQUEST_SCOPE_REQUIRED"
        },
        {
          status: 400
        }
      )
    }

    const request =
      await denyPupRequest(
        id,
        {
          wallet,
          capsuleId,
          email
        }
      )

    if (!request) {
      return Response.json(
        {
          success: false,
          error:
            "REQUEST_NOT_FOUND_OR_SCOPE_MISMATCH"
        },
        {
          status: 404
        }
      )
    }

    return Response.json({
      success: true,
      denied:
        request.status === "denied",
      request
    })

  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "PUP_DENY_FAILED"
      },
      {
        status: 500
      }
    )
  }
}