export type PupSession = {
  active: true
  capsuleId: string
  wallet: string
  type: "PUP"
  createdAt: number
  expiresAt: number
}

const KEY =
  "NEXUSNON_PUP_SESSION"

const SESSION_TTL =
  1000 * 60 * 60 * 6

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

export function createPupSession(
  capsuleId: string,
  wallet: string
) {
  if (typeof window === "undefined") {
    return null
  }

  const session: PupSession = {
    active: true,
    capsuleId:
      String(capsuleId),
    wallet:
      normalizeWallet(wallet),
    type:
      "PUP",
    createdAt:
      now(),
    expiresAt:
      now() + SESSION_TTL
  }

  localStorage.setItem(
    KEY,
    JSON.stringify(session)
  )

  return session
}

export function getPupSession():
  PupSession | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw =
      localStorage.getItem(KEY)

    if (!raw) {
      return null
    }

    const session =
      JSON.parse(raw) as PupSession

    if (
      !session ||
      session.active !== true ||
      session.type !== "PUP" ||
      !session.capsuleId ||
      !session.wallet ||
      !session.expiresAt
    ) {
      clearPupSession()
      return null
    }

    if (session.expiresAt < now()) {
      clearPupSession()
      return null
    }

    return {
      ...session,
      wallet:
        normalizeWallet(session.wallet)
    }
  } catch {
    clearPupSession()
    return null
  }
}

export function clearPupSession() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(KEY)
}