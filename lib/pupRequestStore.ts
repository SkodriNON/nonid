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

export type PupRequestScope = {
  wallet?: string
  capsuleId?: string
  email?: string
}

const TTL =
  1000 * 60 * 5

const TTL_SECONDS =
  60 * 5

const REQUEST_PREFIX =
  "nexusnon:pup:request:"

const ACTIVE_WALLET_PREFIX =
  "nexusnon:pup:active:wallet:"

const ACTIVE_CAPSULE_PREFIX =
  "nexusnon:pup:active:capsule:"

const ACTIVE_EMAIL_PREFIX =
  "nexusnon:pup:active:email:"

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
    __NEXUSNON_PUP_ACTIVE_WALLET__?: Map<string, string>
    __NEXUSNON_PUP_ACTIVE_CAPSULE__?: Map<string, string>
    __NEXUSNON_PUP_ACTIVE_EMAIL__?: Map<string, string>
  }

const memoryRequests =
  globalStore.__NEXUSNON_PUP_REQUESTS__ ||
  new Map<string, PupRequest>()

const activeWallet =
  globalStore.__NEXUSNON_PUP_ACTIVE_WALLET__ ||
  new Map<string, string>()

const activeCapsule =
  globalStore.__NEXUSNON_PUP_ACTIVE_CAPSULE__ ||
  new Map<string, string>()

const activeEmail =
  globalStore.__NEXUSNON_PUP_ACTIVE_EMAIL__ ||
  new Map<string, string>()

globalStore.__NEXUSNON_PUP_REQUESTS__ =
  memoryRequests

globalStore.__NEXUSNON_PUP_ACTIVE_WALLET__ =
  activeWallet

globalStore.__NEXUSNON_PUP_ACTIVE_CAPSULE__ =
  activeCapsule

globalStore.__NEXUSNON_PUP_ACTIVE_EMAIL__ =
  activeEmail

function now() {
  return Date.now()
}

function normalizeWallet(wallet: string) {
  return String(wallet || "")
    .trim()
    .toLowerCase()
}

function normalizeCapsuleId(capsuleId: string) {
  return String(capsuleId || "")
    .trim()
}

function normalizeEmail(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase()
}

function normalizeScope(scope?: PupRequestScope) {
  return {
    wallet:
      scope?.wallet
        ? normalizeWallet(scope.wallet)
        : "",
    capsuleId:
      scope?.capsuleId
        ? normalizeCapsuleId(scope.capsuleId)
        : "",
    email:
      scope?.email
        ? normalizeEmail(scope.email)
        : ""
  }
}

function hasScope(scope?: PupRequestScope) {
  const normalized =
    normalizeScope(scope)

  return Boolean(
    normalized.wallet ||
    normalized.capsuleId ||
    normalized.email
  )
}

function matchesScope(
  request: PupRequest,
  scope?: PupRequestScope
) {
  const normalized =
    normalizeScope(scope)

  if (
    normalized.wallet &&
    request.wallet !== normalized.wallet
  ) {
    return false
  }

  if (
    normalized.capsuleId &&
    request.capsuleId !== normalized.capsuleId
  ) {
    return false
  }

  if (
    normalized.email &&
    request.email !== normalized.email
  ) {
    return false
  }

  return true
}

function createId() {
  return crypto
    .randomBytes(24)
    .toString("hex")
}

function requestKey(id: string) {
  return `${REQUEST_PREFIX}${id}`
}

function activeWalletKey(wallet: string) {
  return `${ACTIVE_WALLET_PREFIX}${wallet}`
}

function activeCapsuleKey(capsuleId: string) {
  return `${ACTIVE_CAPSULE_PREFIX}${capsuleId}`
}

function activeEmailKey(email: string) {
  return `${ACTIVE_EMAIL_PREFIX}${email}`
}

export function normalizePupRequest(
  request: PupRequest
): PupRequest {
  const current =
    now()

  const normalized: PupRequest = {
    ...request,
    capsuleId:
      normalizeCapsuleId(request.capsuleId),
    wallet:
      normalizeWallet(request.wallet),
    email:
      normalizeEmail(request.email),
    phone:
      String(request.phone || "").trim(),
    action:
      String(
        request.action ||
        "LOGIN_DASHBOARD"
      ).trim()
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

async function saveActivePointers(
  request: PupRequest
) {
  if (redis) {
    if (request.wallet) {
      await redis.set(
        activeWalletKey(request.wallet),
        request.id,
        {
          ex:
            TTL_SECONDS
        }
      )
    }

    if (request.capsuleId) {
      await redis.set(
        activeCapsuleKey(request.capsuleId),
        request.id,
        {
          ex:
            TTL_SECONDS
        }
      )
    }

    if (request.email) {
      await redis.set(
        activeEmailKey(request.email),
        request.id,
        {
          ex:
            TTL_SECONDS
        }
      )
    }

    return
  }

  if (request.wallet) {
    activeWallet.set(
      request.wallet,
      request.id
    )
  }

  if (request.capsuleId) {
    activeCapsule.set(
      request.capsuleId,
      request.id
    )
  }

  if (request.email) {
    activeEmail.set(
      request.email,
      request.id
    )
  }
}

async function saveRequest(
  request: PupRequest
) {
  const normalized =
    normalizePupRequest(request)

  if (redis) {
    await redis.set(
      requestKey(normalized.id),
      normalized,
      {
        ex:
          TTL_SECONDS
      }
    )

    await saveActivePointers(
      normalized
    )

    return normalized
  }

  memoryRequests.set(
    normalized.id,
    normalized
  )

  await saveActivePointers(
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
      normalizeCapsuleId(input.capsuleId),
    wallet:
      normalizeWallet(input.wallet),
    email:
      normalizeEmail(input.email),
    phone:
      String(input.phone || "").trim(),
    action:
      String(
        input.action ||
        "LOGIN_DASHBOARD"
      ).trim(),
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

  return await saveRequest(request)
}

export async function getPupRequest(id: string) {
  if (redis) {
    const request =
      await redis.get<PupRequest>(
        requestKey(id)
      )

    if (!request) {
      return null
    }

    return normalizePupRequest(request)
  }

  const request =
    memoryRequests.get(id)

  if (!request) {
    return null
  }

  return normalizePupRequest(request)
}

async function getActiveRequestId(
  scope: PupRequestScope
) {
  const normalized =
    normalizeScope(scope)

  if (redis) {
    if (normalized.wallet) {
      const id =
        await redis.get<string>(
          activeWalletKey(normalized.wallet)
        )

      if (id) {
        return id
      }
    }

    if (normalized.capsuleId) {
      const id =
        await redis.get<string>(
          activeCapsuleKey(normalized.capsuleId)
        )

      if (id) {
        return id
      }
    }

    if (normalized.email) {
      const id =
        await redis.get<string>(
          activeEmailKey(normalized.email)
        )

      if (id) {
        return id
      }
    }

    return null
  }

  if (normalized.wallet) {
    const id =
      activeWallet.get(normalized.wallet)

    if (id) {
      return id
    }
  }

  if (normalized.capsuleId) {
    const id =
      activeCapsule.get(normalized.capsuleId)

    if (id) {
      return id
    }
  }

  if (normalized.email) {
    const id =
      activeEmail.get(normalized.email)

    if (id) {
      return id
    }
  }

  return null
}

export async function getScopedPupRequest(
  id: string,
  scope: PupRequestScope
) {
  if (!hasScope(scope)) {
    return null
  }

  const request =
    await getPupRequest(id)

  if (!request) {
    return null
  }

  if (!matchesScope(request, scope)) {
    return null
  }

  return request
}

export async function listPupRequests(
  filter?: PupRequestScope
) {
  if (!hasScope(filter)) {
    return []
  }

  const activeId =
    await getActiveRequestId(
      filter || {}
    )

  if (!activeId) {
    return []
  }

  const request =
    await getScopedPupRequest(
      activeId,
      filter || {}
    )

  if (!request) {
    return []
  }

  return [request]
}

export async function approvePupRequest(
  id: string,
  scope: PupRequestScope
) {
  const request =
    await getScopedPupRequest(
      id,
      scope
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

  return await saveRequest(updated)
}

export async function denyPupRequest(
  id: string,
  scope?: PupRequestScope
) {
  const request =
    scope && hasScope(scope)
      ? await getScopedPupRequest(id, scope)
      : await getPupRequest(id)

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

  return await saveRequest(updated)
}