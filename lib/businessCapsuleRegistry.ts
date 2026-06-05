import {
  Redis
} from "@upstash/redis"

export type BusinessCapsule = {
  id: string
  requestId: string
  name: string
  symbol: string
  description: string
  creatorCapsuleId: string
  creatorWallet: string
  businessWallet: string
  status: "active"
  createdAt: number
}

const CAPSULE_PREFIX =
  "nexusnon:business:capsule:"

const CAPSULE_INDEX =
  "nexusnon:business:capsules"

const hasKv =
  Boolean(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  )

const redis =
  hasKv
    ? new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!
      })
    : null

const globalStore =
  globalThis as typeof globalThis & {
    __NEXUSNON_BUSINESS_CAPSULES__?: Map<string, BusinessCapsule>
  }

const memoryCapsules =
  globalStore.__NEXUSNON_BUSINESS_CAPSULES__ ||
  new Map<string, BusinessCapsule>()

globalStore.__NEXUSNON_BUSINESS_CAPSULES__ =
  memoryCapsules

export async function saveBusinessCapsule(
  capsule: BusinessCapsule
) {
  if (redis) {
    await redis.set(
      `${CAPSULE_PREFIX}${capsule.id}`,
      capsule
    )

    await redis.zadd(
      CAPSULE_INDEX,
      {
        score: capsule.createdAt,
        member: capsule.id
      }
    )

    return capsule
  }

  memoryCapsules.set(
    capsule.id,
    capsule
  )

  return capsule
}

export async function listBusinessCapsules() {
  if (redis) {
    const ids =
      await redis.zrange<string[]>(
        CAPSULE_INDEX,
        0,
        -1
      )

    const capsules: BusinessCapsule[] = []

    for (const id of ids) {
      const capsule =
        await redis.get<BusinessCapsule>(
          `${CAPSULE_PREFIX}${id}`
        )

      if (capsule) {
        capsules.push(capsule)
      }
    }

    return capsules.sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
  }

  return Array
    .from(memoryCapsules.values())
    .sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
}