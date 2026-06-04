import {
  getPupRequest
} from "@/lib/pupRequestStore"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function GET(
  req: Request
) {
  const url =
    new URL(req.url)

  const id =
    String(
      url.searchParams.get("id") || ""
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
    await getPupRequest(id)

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
}