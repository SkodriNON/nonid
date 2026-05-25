export const createSession = () => {

  const session = {

    created:
      Date.now(),

    active:
      true,

    device:
      navigator.userAgent
  }

  localStorage.setItem(
    "non_session",
    JSON.stringify(session)
  )
}

export const getSession = () => {

  const session =
    localStorage.getItem(
      "non_session"
    )

  if (!session) {

    return null
  }

  return JSON.parse(session)
}

export const destroySession = () => {

  localStorage.removeItem(
    "non_session"
  )
}

export const isAuthenticated = () => {

  const session =
    getSession()

  if (!session) {

    return false
  }

  return session.active === true
}