export const runtime = "nodejs"

export const dynamic = "force-dynamic"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

function jsonResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const capsuleId = String(body.capsuleId || "").trim()
    const antiPhishing = String(body.antiPhishing || "").trim()

    if (!capsuleId || !/^\d+$/.test(capsuleId)) {
      return jsonResponse(
        {
          success: false,
          valid: false,
          error: "INVALID_CAPSULE_ID",
        },
        400
      )
    }

    if (!antiPhishing || antiPhishing.length < 4) {
      return jsonResponse(
        {
          success: false,
          valid: false,
          error: "INVALID_ANTI_PHISHING",
        },
        400
      )
    }

    return jsonResponse({
      success: true,
      valid: true,
      capsuleId,
      mode: "LOCAL_PUP_SETUP_ONLY",
    })
  } catch (err: any) {
    return jsonResponse(
      {
        success: false,
        valid: false,
        error: err?.message || "VERIFY_ANTI_PHISHING_FAILED",
      },
      500
    )
  }
}