import {
  pupRequests
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

    const request =
      pupRequests.get(id)

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

    const now =
      Date.now()

    request.status =
      "denied"

    request.deniedAt =
      now

    request.updatedAt =
      now

    pupRequests.set(
      id,
      request
    )

    return Response.json({
      success: true,
      denied: true,
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