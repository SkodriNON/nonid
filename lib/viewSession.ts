export type CapsuleViewSession = {
  active: true
  capsuleId: string
  wallet: string
  viewOnly: true
  type: "VIEW"
  startedAt: number
  expiresAt: number
}

const VIEW_SESSION_KEY =
  "NEXUSNON_CAPSULE_VIEW_SESSION"

const VIEW_TTL =
  1000 * 60 * 30

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

export function createViewSession(
  capsuleId: string,
  wallet: string
) {
  if (typeof window === "undefined") {
    return null
  }

  const session: CapsuleViewSession = {
    active: true,
    capsuleId:
      String(capsuleId),
    wallet:
      normalizeWallet(wallet),
    viewOnly:
      true,
    type:
      "VIEW",
    startedAt:
      now(),
    expiresAt:
      now() + VIEW_TTL
  }

  localStorage.setItem(
    VIEW_SESSION_KEY,
    JSON.stringify(session)
  )

  return session
}

export function getViewSession():
  CapsuleViewSession | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw =
      localStorage.getItem(
        VIEW_SESSION_KEY
      )

    if (!raw) {
      return null
    }

    const session =
      JSON.parse(raw) as CapsuleViewSession

    if (
      !session ||
      session.active !== true ||
      session.viewOnly !== true ||
      session.type !== "VIEW" ||
      !session.capsuleId ||
      !session.wallet ||
      !session.expiresAt
    ) {
      clearViewSession()
      return null
    }

    if (session.expiresAt < now()) {
      clearViewSession()
      return null
    }

    return {
      ...session,
      wallet:
        normalizeWallet(session.wallet)
    }
  } catch {
    clearViewSession()
    return null
  }
}

export function clearViewSession() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(
    VIEW_SESSION_KEY
  )
}