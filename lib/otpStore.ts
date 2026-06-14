export type OtpData = {
  otp?: string
  phoneOtp?: string
  emailOtp?: string
  expires: number
  phone?: string
  email?: string
}

const KV_REST_API_URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  ""

const KV_REST_API_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  ""

const globalForOtp = globalThis as unknown as {
  nexusOtpStore?: Map<string, OtpData>
}

const memoryStore =
  globalForOtp.nexusOtpStore ??
  new Map<string, OtpData>()

globalForOtp.nexusOtpStore = memoryStore

function redisEnabled() {
  return Boolean(KV_REST_API_URL && KV_REST_API_TOKEN)
}

function redisKey(key: string) {
  return `nexusnon:otp:${key}`
}

async function kvGet(key: string) {
  const res = await fetch(
    `${KV_REST_API_URL}/get/${encodeURIComponent(redisKey(key))}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()

  if (!res.ok || data?.error) {
    throw new Error(data?.error || "KV_GET_FAILED")
  }

  return data?.result || null
}

async function kvSet(key: string, value: OtpData) {
  const ttlSeconds = Math.max(
    1,
    Math.ceil((value.expires - Date.now()) / 1000)
  )

  const res = await fetch(
    `${KV_REST_API_URL}/set/${encodeURIComponent(redisKey(key))}/${encodeURIComponent(
      JSON.stringify(value)
    )}?EX=${ttlSeconds}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()

  if (!res.ok || data?.error) {
    throw new Error(data?.error || "KV_SET_FAILED")
  }

  return data?.result
}

async function kvDelete(key: string) {
  const res = await fetch(
    `${KV_REST_API_URL}/del/${encodeURIComponent(redisKey(key))}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()

  if (!res.ok || data?.error) {
    throw new Error(data?.error || "KV_DELETE_FAILED")
  }

  return data?.result
}

export const otpStore = {
  async get(key: string): Promise<OtpData | undefined> {
    if (!redisEnabled()) {
      return memoryStore.get(key)
    }

    const raw = await kvGet(key)

    if (!raw) return undefined

    try {
      return typeof raw === "string"
        ? (JSON.parse(raw) as OtpData)
        : (raw as OtpData)
    } catch {
      return undefined
    }
  },

  async set(key: string, value: OtpData) {
    if (!redisEnabled()) {
      memoryStore.set(key, value)
      return
    }

    await kvSet(key, value)
  },

  async delete(key: string) {
    if (!redisEnabled()) {
      memoryStore.delete(key)
      return
    }

    await kvDelete(key)
  },
}