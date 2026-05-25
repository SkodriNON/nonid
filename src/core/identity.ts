
export interface Identity {

  nftId?: number

  username: string

  balance: string

  createdAt: number

  active: boolean

  nonce?: number
}

/* STORAGE */

const STORAGE_KEY =
  "non_identity"

/* GET */

export const getIdentity =
  (): Identity | null => {

    try {

      const stored =
        localStorage.getItem(
          STORAGE_KEY
        )

      if (!stored) {

        return null
      }

      return JSON.parse(
        stored
      )

    } catch {

      return null
    }
  }

/* SAVE */

export const saveIdentity = (

  identity: Identity

) => {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(identity)
  )
}

/* REMOVE */

export const clearIdentity =
  () => {

    localStorage.removeItem(
      STORAGE_KEY
    )
  }

/* STATUS */

export const isIdentityActive =
  () => {

    const identity =
      getIdentity()

    return (
      identity?.active === true
    )
  }

