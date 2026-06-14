import { listPupRequests } from "@/lib/pupRequestStore"

export const runtime = "nodejs"

export const dynamic = "force-dynamic"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export async function GET(request: Request) {
  const url = new URL(request.url)

  const wallet = url.searchParams.get("wallet") || ""
  const capsuleId = url.searchParams.get("capsuleId") || ""
  const email = url.searchParams.get("email") || ""

  if (!wallet && !capsuleId && !email) {
    return jsonResponse(
      {
        success: false,
        error: "Missing request scope. Provide wallet, capsuleId or email.",
      },
      400
    )
  }

  const normalized = await listPupRequests({
    wallet,
    capsuleId,
    email,
  })

  const latestByCapsule = new Map<string, any>()

  for (const request of normalized) {
    const key = `${request.capsuleId}:${request.wallet}:${request.action}`

    const existing = latestByCapsule.get(key)

    if (!existing || request.createdAt > existing.createdAt) {
      latestByCapsule.set(key, request)
    }
  }

  const requests = Array.from(latestByCapsule.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  )

  return jsonResponse({
    success: true,
    requests,
  })
}
