export type OtpData = {
  otp?: string
  phoneOtp?: string
  emailOtp?: string
  expires: number
  phone?: string
  email?: string
}

const UPSTASH_REDIS_REST_URL =
  process.env.UPSTASH_REDIS_REST_URL || ""

const UPSTASH_REDIS_REST_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || ""

const globalForOtp = globalThis as unknown as {
  nexusOtpStore?: Map<string, OtpData>
}

const memoryStore =
  globalForOtp.nexusOtpStore ??
  new Map<string, OtpData>()

globalForOtp.nexusOtpStore = memoryStore

function redisEnabled() {
  return Boolean(
    UPSTASH_REDIS_REST_URL &&
      UPSTASH_REDIS_REST_TOKEN
  )
}

function redisKey(key: string) {
  return `nexusnon:otp:${key}`
}

async function redisCommand(args: string[]) {
  if (!redisEnabled()) {
    throw new Error("UPSTASH_REDIS_NOT_CONFIGURED")
  }

  const res = await fetch(UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  })

  const data = await res.json()

  if (!res.ok || data?.error) {
    throw new Error(
      data?.error || "UPSTASH_REDIS_COMMAND_FAILED"
    )
  }

  return data?.result
}

export const otpStore = {
  async get(key: string): Promise<OtpData | undefined> {
    if (!redisEnabled()) {
      return memoryStore.get(key)
    }

    const raw = await redisCommand([
      "GET",
      redisKey(key),
    ])

    if (!raw) return undefined

    try {
      return JSON.parse(raw) as OtpData
    } catch {
      return undefined
    }
  },

  async set(key: string, value: OtpData) {
    if (!redisEnabled()) {
      memoryStore.set(key, value)
      return
    }

    const ttlSeconds = Math.max(
      1,
      Math.ceil(
        (value.expires - Date.now()) / 1000
      )
    )

    await redisCommand([
      "SET",
      redisKey(key),
      JSON.stringify(value),
      "EX",
      String(ttlSeconds),
    ])
  },

  async delete(key: string) {
    if (!redisEnabled()) {
      memoryStore.delete(key)
      return
    }

    await redisCommand([
      "DEL",
      redisKey(key),
    ])
  },
}