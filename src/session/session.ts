
/* STORAGE */

const SESSION_KEY =
  "non_session"

const SESSION_TIME_KEY =
  "non_session_started"

/* START */

export const startSession =
  () => {

    localStorage.setItem(

      SESSION_KEY,

      "active"
    )

    localStorage.setItem(

      SESSION_TIME_KEY,

      Date.now().toString()
    )
  }

/* END */

export const endSession =
  () => {

    localStorage.removeItem(
      SESSION_KEY
    )

    localStorage.removeItem(
      SESSION_TIME_KEY
    )
  }

/* STATUS */

export const hasSession =
  () => {

    return (

      localStorage.getItem(
        SESSION_KEY
      ) === "active"
    )
  }

/* STARTED */

export const getSessionStartedAt =
  () => {

    return localStorage.getItem(
      SESSION_TIME_KEY
    )
  }

