import {
  listBusinessCapsules
} from "@/lib/businessCapsuleRegistry"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function GET() {
  const capsules =
    await listBusinessCapsules()

  return Response.json({
    success: true,
    capsules
  })
}