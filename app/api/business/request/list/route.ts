import {
  listBusinessCapsuleRequests
} from "@/lib/businessCapsuleStore"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function GET() {
  const requests =
    await listBusinessCapsuleRequests()

  return Response.json({
    success: true,
    requests
  })
}