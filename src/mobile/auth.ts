
/* SESSION */

const TRUSTED_KEY =
  "non_trusted"

const SESSION_KEY =
  "non_session_started"

const PIN_KEY =
  "non_pin"

const FACE_ID_KEY =
  "non_faceid"

/* TRUSTED SESSION */

export const saveTrustedSession =
  () => {

    localStorage.setItem(

      TRUSTED_KEY,

      "true"
    )

    localStorage.setItem(

      SESSION_KEY,

      Date.now().toString()
    )
  }

export const hasTrustedSession =
  () => {

    return (

      localStorage.getItem(
        TRUSTED_KEY
      ) === "true"
    )
  }

export const removeTrustedSession =
  () => {

    localStorage.removeItem(
      TRUSTED_KEY
    )

    localStorage.removeItem(
      SESSION_KEY
    )
  }

/* PIN */

export const savePin = (

  pin: string

) => {

  localStorage.setItem(

    PIN_KEY,

    btoa(pin)
  )
}

export const getPin =
  () => {

    const pin =
      localStorage.getItem(
        PIN_KEY
      )

    if (!pin) {

      return null
    }

    try {

      return atob(pin)

    } catch {

      return null
    }
  }

/* FACE ID */

export const enableFaceId =
  () => {

    localStorage.setItem(

      FACE_ID_KEY,

      "true"
    )
  }

export const disableFaceId =
  () => {

    localStorage.setItem(

      FACE_ID_KEY,

      "false"
    )
  }

export const hasFaceId =
  () => {

    return (

      localStorage.getItem(
        FACE_ID_KEY
      ) === "true"
    )
  }

