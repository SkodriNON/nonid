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

    const capsuleId =
      String(
        body.capsuleId || ""
      ).trim()

    const antiPhishing =
      String(
        body.antiPhishing || ""
      ).trim()

    if (
      !capsuleId ||
      !/^\d+$/.test(capsuleId)
    ) {
      return Response.json(
        {
          success: false,
          valid: false,
          error:
            "INVALID_CAPSULE_ID"
        },
        {
          status: 400
        }
      )
    }

    if (
      !antiPhishing ||
      antiPhishing.length < 4
    ) {
      return Response.json(
        {
          success: false,
          valid: false,
          error:
            "INVALID_ANTI_PHISHING"
        },
        {
          status: 400
        }
      )
    }

    return Response.json({
      success: true,
      valid: true,
      capsuleId,
      mode:
        "LOCAL_PUP_SETUP_ONLY"
    })

  } catch (err: any) {
    return Response.json(
      {
        success: false,
        valid: false,
        error:
          err?.message ||
          "VERIFY_ANTI_PHISHING_FAILED"
      },
      {
        status: 500
      }
    )
  }
}