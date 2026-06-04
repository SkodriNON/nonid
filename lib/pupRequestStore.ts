import crypto from "crypto"

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

const globalStore =
  globalThis as typeof globalThis & {
    __NEXUSNON_PUP_REQUESTS__?: Map<string, PupRequest>
  }

export const pupRequests =
  globalStore.__NEXUSNON_PUP_REQUESTS__ ||
  new Map<string, PupRequest>()

globalStore.__NEXUSNON_PUP_REQUESTS__ =
  pupRequests

function now() {
  return Date.now()
}

function normalizeWallet(wallet: string) {
  return String(wallet || "").trim().toLowerCase()
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

  if (
    request.status === "pending" &&
    request.expiresAt <= current
  ) {
    request.status =
      "expired"

    request.updatedAt =
      current

    pupRequests.set(
      request.id,
      request
    )
  }

  return {
    ...request,
    wallet:
      normalizeWallet(request.wallet)
  }
}

export function createPupRequest(input: {
  capsuleId: string
  wallet: string
  email: string
  phone: string
  action?: string
  capsuleStatus?: number
  activationRequired?: boolean
}) {
  const id =
    createId()

  const createdAt =
    now()

  const request: PupRequest = {
    id,
    capsuleId:
      String(input.capsuleId),
    wallet:
      normalizeWallet(input.wallet),
    email:
      String(input.email || "")
        .trim()
        .toLowerCase(),
    phone:
      String(input.phone || "")
        .trim(),
    action:
      String(input.action || "LOGIN_DASHBOARD"),
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

  pupRequests.set(
    id,
    request
  )

  return normalizePupRequest(
    request
  )
}

export function getPupRequest(
  id: string
) {
  const request =
    pupRequests.get(id)

  if (!request) {
    return null
  }

  return normalizePupRequest(
    request
  )
}

export function approvePupRequest(
  id: string
) {
  const request =
    getPupRequest(id)

  if (!request) {
    return null
  }

  if (request.status !== "pending") {
    return request
  }

  const current =
    now()

  request.status =
    "approved"

  request.approvedAt =
    current

  request.updatedAt =
    current

  pupRequests.set(
    id,
    request
  )

  return normalizePupRequest(
    request
  )
}

export function denyPupRequest(
  id: string
) {
  const request =
    getPupRequest(id)

  if (!request) {
    return null
  }

  if (request.status !== "pending") {
    return request
  }

  const current =
    now()

  request.status =
    "denied"

  request.deniedAt =
    current

  request.updatedAt =
    current

  pupRequests.set(
    id,
    request
  )

  return normalizePupRequest(
    request
  )
}