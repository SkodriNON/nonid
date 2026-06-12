import {
  getScopedPupRequest
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

  const wallet =
    String(
      url.searchParams.get("wallet") || ""
    ).trim()

  const capsuleId =
    String(
      url.searchParams.get("capsuleId") || ""
    ).trim()

  const email =
    String(
      url.searchParams.get("email") || ""
    )
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
    await getScopedPupRequest(
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
    request
  })
}