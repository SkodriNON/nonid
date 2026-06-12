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

const TTL =
  1000 * 60 * 5

const globalStore =
  globalThis as typeof globalThis & {
    __NEXUSNON_NONID_QR_SESSIONS__?: Map<string, NonIdQrSession>
  }

const sessions =
  globalStore.__NEXUSNON_NONID_QR_SESSIONS__ ||
  new Map<string, NonIdQrSession>()

globalStore.__NEXUSNON_NONID_QR_SESSIONS__ =
  sessions

function now() {
  return Date.now()
}

function createId() {
  return crypto
    .randomBytes(24)
    .toString("hex")
}

export function normalizeQrSession(
  session: NonIdQrSession
): NonIdQrSession {
  const current =
    now()

  if (
    session.status === "pending" &&
    session.expiresAt <= current
  ) {
    return {
      ...session,
      status: "expired",
      updatedAt: current
    }
  }

  return session
}

export async function createNonIdQrSession() {
  const createdAt =
    now()

  const session: NonIdQrSession = {
    id: createId(),
    status: "pending",
    createdAt,
    updatedAt: createdAt,
    expiresAt: createdAt + TTL
  }

  sessions.set(session.id, session)

  return session
}

export async function getNonIdQrSession(
  id: string
) {
  const session =
    sessions.get(id)

  if (!session) {
    return null
  }

  const normalized =
    normalizeQrSession(session)

  sessions.set(id, normalized)

  return normalized
}

export async function updateNonIdQrSession(
  id: string,
  patch: Partial<NonIdQrSession>
) {
  const existing =
    await getNonIdQrSession(id)

  if (!existing) {
    return null
  }

  const updated =
    normalizeQrSession({
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: now()
    })

  sessions.set(id, updated)

  return updated
}