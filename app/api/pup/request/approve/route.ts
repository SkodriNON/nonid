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

    if (request.status !== "pending") {
      return Response.json({
        success: true,
        request
      })
    }

    const now =
      Date.now()

    request.status =
      "approved"

    request.approvedAt =
      now

    request.updatedAt =
      now

    pupRequests.set(
      id,
      request
    )

    return Response.json({
      success: true,
      approved: true,
      request
    })

  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "PUP_APPROVE_FAILED"
      },
      {
        status: 500
      }
    )
  }
}