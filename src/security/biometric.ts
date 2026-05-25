
/* STORAGE */

const BIOMETRIC_KEY =
  "non_faceid"

/* STATUS */

export const biometricEnabled =
  () => {

    return (

      localStorage.getItem(
        BIOMETRIC_KEY
      ) === "true"
    )
  }

/* ENABLE */

export const enableBiometric =
  () => {

    localStorage.setItem(

      BIOMETRIC_KEY,

      "true"
    )
  }

/* DISABLE */

export const disableBiometric =
  () => {

    localStorage.setItem(

      BIOMETRIC_KEY,

      "false"
    )
  }

/* TOGGLE */

export const toggleBiometric =
  () => {

    if (
      biometricEnabled()
    ) {

      disableBiometric()

      return false
    }

    enableBiometric()

    return true
  }

