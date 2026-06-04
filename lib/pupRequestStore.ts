import crypto from "crypto"

import {
  Redis
} from "@upstash/redis"

export type PupRequestStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired"

export type PupRequest = {
  id: string
  capsuleId: string
  wallet: string
  email: string
  phone: string
  action: string
  status: PupRequestStatus
  createdAt: number
  updatedAt: number
  expiresAt: number
  approvedAt?: number
  deniedAt?: number
  capsuleStatus?: number
  activationRequired?: boolean
}

const TTL =
  1000 * 60 * 5

const TTL_SECONDS =
  60 * 5

const REQUEST_PREFIX =
  "nexusnon:pup:request:"

const REQUEST_INDEX =
  "nexusnon:pup:requests"

const hasKv =
  Boolean(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  )

const redis =
  hasKv
    ? new Redis({
        url:
          process.env.KV_REST_API_URL!,
        token:
          process.env.KV_REST_API_TOKEN!
      })
    : null

const globalStore =
  globalThis as typeof globalThis & {
    __NEXUSNON_PUP_REQUESTS__?: Map<string, PupRequest>
  }

const memoryRequests =
  globalStore.__NEXUSNON_PUP_REQUESTS__ ||
  new Map<string, PupRequest>()

globalStore.__NEXUSNON_PUP_REQUESTS__ =
  memoryRequests

function now() {
  return Date.now()
}

function normalizeWallet(
  wallet: string
) {
  return String(wallet || "")
    .trim()
    .toLowerCase()
}

function createId() {
  return crypto
    .randomBytes(24)
    .toString("hex")
}

export function normalizePupRequest(
  request: PupRequest
): PupRequest {
  const current =
    now()

  const normalized: PupRequest = {
    ...request,
    wallet:
      normalizeWallet(
        request.wallet
      )
  }

  if (
    normalized.status === "pending" &&
    normalized.expiresAt <= current
  ) {
    normalized.status =
      "expired"

    normalized.updatedAt =
      current
  }

  return normalized
}

async function saveRequest(
  request: PupRequest
) {
  const normalized =
    normalizePupRequest(
      request
    )

  if (redis) {
    await redis.set(
      `${REQUEST_PREFIX}${normalized.id}`,
      normalized,
      {
        ex:
          TTL_SECONDS
      }
    )

    await redis.zadd(
      REQUEST_INDEX,
      {
        score:
          normalized.createdAt,
        member:
          normalized.id
      }
    )

    return normalized
  }

  memoryRequests.set(
    normalized.id,
    normalized
  )

  return normalized
}

export async function createPupRequest(
  input: {
    capsuleId: string
    wallet: string
    email: string
    phone: string
    action?: string
    capsuleStatus?: number
    activationRequired?: boolean
  }
) {
  const id =
    createId()

  const createdAt =
    now()

  const request: PupRequest = {
    id,
    capsuleId:
      String(
        input.capsuleId
      ),
    wallet:
      normalizeWallet(
        input.wallet
      ),
    email:
      String(input.email || "")
        .trim()
        .toLowerCase(),
    phone:
      String(input.phone || "")
        .trim(),
    action:
      String(
        input.action ||
        "LOGIN_DASHBOARD"
      ),
    status:
      "pending",
    createdAt,
    updatedAt:
      createdAt,
    expiresAt:
      createdAt + TTL,
    capsuleStatus:
      input.capsuleStatus,
    activationRequired:
      input.activationRequired
  }

  return await saveRequest(
    request
  )
}

export async function getPupRequest(
  id: string
) {
  if (redis) {
    const request =
      await redis.get<PupRequest>(
        `${REQUEST_PREFIX}${id}`
      )

    if (!request) {
      return null
    }

    return normalizePupRequest(
      request
    )
  }

  const request =
    memoryRequests.get(id)

  if (!request) {
    return null
  }

  return normalizePupRequest(
    request
  )
}

export async function listPupRequests() {
  if (redis) {
    const ids =
      await redis.zrange<string[]>(
        REQUEST_INDEX,
        0,
        -1
      )

    const requests: PupRequest[] =
      []

    for (const id of ids) {
      const request =
        await getPupRequest(
          id
        )

      if (request) {
        requests.push(
          request
        )
      }
    }

    return requests
      .map(
        normalizePupRequest
      )
      .sort(
        (a, b) =>
          b.createdAt - a.createdAt
      )
  }

  return Array
    .from(
      memoryRequests.values()
    )
    .map(
      normalizePupRequest
    )
    .sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
}

export async function approvePupRequest(
  id: string
) {
  const request =
    await getPupRequest(
      id
    )

  if (!request) {
    return null
  }

  if (
    request.status !== "pending"
  ) {
    return request
  }

  const current =
    now()

  const updated: PupRequest = {
    ...request,
    status:
      "approved",
    approvedAt:
      current,
    updatedAt:
      current
  }

  return await saveRequest(
    updated
  )
}

export async function denyPupRequest(
  id: string
) {
  const request =
    await getPupRequest(
      id
    )

  if (!request) {
    return null
  }

  if (
    request.status !== "pending"
  ) {
    return request
  }

  const current =
    now()

  const updated: PupRequest = {
    ...request,
    status:
      "denied",
    deniedAt:
      current,
    updatedAt:
      current
  }

  return await saveRequest(
    updated
  )
}