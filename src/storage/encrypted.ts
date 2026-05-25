
/* ENCRYPT */

export const encryptData = (

  value: string

) => {

  try {

    return btoa(value)

  } catch {

    return value
  }
}

/* DECRYPT */

export const decryptData = (

  value: string

) => {

  try {

    return atob(value)

  } catch {

    return value
  }
}

/* SAVE */

export const saveEncrypted = (

  key: string,

  value: any

) => {

  const encrypted =

    encryptData(

      JSON.stringify(value)
    )

  localStorage.setItem(

    key,

    encrypted
  )
}

/* GET */

export const getEncrypted =
  (key: string) => {

    const stored =
      localStorage.getItem(
        key
      )

    if (!stored) {

      return null
    }

    try {

      return JSON.parse(

        decryptData(stored)
      )

    } catch {

      return null
    }
  }

/* REMOVE */

export const removeEncrypted =
  (key: string) => {

    localStorage.removeItem(
      key
    )
  }

