import {
  listPupRequests
} from "@/lib/pupRequestStore"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function GET() {
  const normalized =
    await listPupRequests()

  const latestByCapsule =
    new Map<string, any>()

  for (const request of normalized) {
    const key =
      `${request.capsuleId}:${request.wallet}:${request.action}`

    const existing =
      latestByCapsule.get(key)

    if (
      !existing ||
      request.createdAt >
        existing.createdAt
    ) {
      latestByCapsule.set(
        key,
        request
      )
    }
  }

  const requests =
    Array.from(
      latestByCapsule.values()
    ).sort(
      (a, b) =>
        b.createdAt -
        a.createdAt
    )

  return Response.json({
    success: true,
    requests
  })
}