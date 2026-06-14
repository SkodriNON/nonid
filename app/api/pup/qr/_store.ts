import crypto from "crypto"

export type NonIdQrStatus =
  | "pending"
  | "scanned"
  | "approved"
  | "denied"
  | "expired"

export type NonIdQrSession = {
  id: string
  status: NonIdQrStatus
  createdAt: number
  updatedAt: number
  expiresAt: number
  requestId?: string
  capsuleId?: string
  wallet?: string
  email?: string
  phone?: string
}

const TTL = 1000 * 60 * 5

const KV_REST_API_URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  ""

const KV_REST_API_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  ""

const globalStore =
  globalThis as typeof globalThis & {
    __NEXUSNON_NONID_QR_SESSIONS__?: Map<string, NonIdQrSession>
  }

const memorySessions =
  globalStore.__NEXUSNON_NONID_QR_SESSIONS__ ||
  new Map<string, NonIdQrSession>()

globalStore.__NEXUSNON_NONID_QR_SESSIONS__ =
  memorySessions

function redisEnabled() {
  return Boolean(KV_REST_API_URL && KV_REST_API_TOKEN)
}

function now() {
  return Date.now()
}

function createId() {
  return crypto.randomBytes(24).toString("hex")
}

function redisKey(id: string) {
  return `nexusnon:qr:${id}`
}

async function kvGet(id: string) {
  const res = await fetch(
    `${KV_REST_API_URL}/get/${encodeURIComponent(redisKey(id))}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()

  if (!res.ok || data?.error) {
    throw new Error(data?.error || "KV_QR_GET_FAILED")
  }

  return data?.result || null
}

async function kvSet(session: NonIdQrSession) {
  const ttlSeconds = Math.max(
    1,
    Math.ceil((session.expiresAt - Date.now()) / 1000)
  )

  const res = await fetch(
    `${KV_REST_API_URL}/set/${encodeURIComponent(
      redisKey(session.id)
    )}/${encodeURIComponent(JSON.stringify(session))}?EX=${ttlSeconds}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()

  if (!res.ok || data?.error) {
    throw new Error(data?.error || "KV_QR_SET_FAILED")
  }

  return data?.result
}

export function normalizeQrSession(
  session: NonIdQrSession
): NonIdQrSession {
  const current = now()

  if (
    session.status === "pending" &&
    session.expiresAt <= current
  ) {
    return {
      ...session,
      status: "expired",
      updatedAt: current,
    }
  }

  return session
}

export async function createNonIdQrSession() {
  const createdAt = now()

  const session: NonIdQrSession = {
    id: createId(),
    status: "pending",
    createdAt,
    updatedAt: createdAt,
    expiresAt: createdAt + TTL,
  }

  if (!redisEnabled()) {
    memorySessions.set(session.id, session)
    return session
  }

  await kvSet(session)

  return session
}

export async function getNonIdQrSession(id: string) {
  if (!redisEnabled()) {
    const session = memorySessions.get(id)

    if (!session) {
      return null
    }

    const normalized = normalizeQrSession(session)
    memorySessions.set(id, normalized)

    return normalized
  }

  const raw = await kvGet(id)

  if (!raw) {
    return null
  }

  let session: NonIdQrSession

  try {
    session =
      typeof raw === "string"
        ? JSON.parse(raw)
        : raw
  } catch {
    return null
  }

  const normalized = normalizeQrSession(session)

  await kvSet(normalized)

  return normalized
}

export async function updateNonIdQrSession(
  id: string,
  patch: Partial<NonIdQrSession>
) {
  const existing = await getNonIdQrSession(id)

  if (!existing) {
    return null
  }

  const updated = normalizeQrSession({
    ...existing,
    ...patch,
    id: existing.id,
    updatedAt: now(),
  })

  if (!redisEnabled()) {
    memorySessions.set(id, updated)
    return updated
  }

  await kvSet(updated)

  return updated
}