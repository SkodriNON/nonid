import crypto from "crypto"

import {
  Redis
} from "@upstash/redis"

export type BusinessRequestStatus =
  | "pending"
  | "approved"
  | "denied"

export type BusinessSignerVote =
  | "pending"
  | "approved"
  | "denied"

export type BusinessSigner = {
  wallet: string
  capsuleId?: string
  weight: number
  vote: BusinessSignerVote
  votedAt?: number
}

export type BusinessCapsuleRequest = {
  id: string
  name: string
  symbol: string
  description: string
  creatorCapsuleId: string
  creatorWallet: string
  status: BusinessRequestStatus
  totalWeight: number
  approvedWeight: number
  requiredWeight: number
  signers: BusinessSigner[]
  createdAt: number
  updatedAt: number
}

const REQUEST_PREFIX =
  "nexusnon:business:request:"

const REQUEST_INDEX =
  "nexusnon:business:requests"

const hasKv =
  Boolean(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  )

const redis =
  hasKv
    ? new Redis({
        url:
          process.env.KV_REST_API_URL!,
        token:
          process.env.KV_REST_API_TOKEN!
      })
    : null

const globalStore =
  globalThis as typeof globalThis & {
    __NEXUSNON_BUSINESS_REQUESTS__?: Map<string, BusinessCapsuleRequest>
  }

const memoryRequests =
  globalStore.__NEXUSNON_BUSINESS_REQUESTS__ ||
  new Map<string, BusinessCapsuleRequest>()

globalStore.__NEXUSNON_BUSINESS_REQUESTS__ =
  memoryRequests

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

function createId() {
  return crypto
    .randomBytes(24)
    .toString("hex")
}

function calculateTotalWeight(
  signers: BusinessSigner[]
) {
  return signers.reduce(
    (sum, signer) =>
      sum + Number(signer.weight || 0),
    0
  )
}

function calculateRequiredWeight(
  totalWeight: number
) {
  return Math.floor(
    (totalWeight * 2) / 3
  ) + 1
}

function calculateApprovedWeight(
  signers: BusinessSigner[]
) {
  return signers
    .filter(
      (signer) =>
        signer.vote === "approved"
    )
    .reduce(
      (sum, signer) =>
        sum + Number(signer.weight || 0),
      0
    )
}

function normalizeRequest(
  request: BusinessCapsuleRequest
): BusinessCapsuleRequest {
  const approvedWeight =
    calculateApprovedWeight(
      request.signers || []
    )

  const totalWeight =
    calculateTotalWeight(
      request.signers || []
    )

  const requiredWeight =
    request.requiredWeight ||
    calculateRequiredWeight(
      totalWeight
    )

  const status: BusinessRequestStatus =
    approvedWeight >= requiredWeight
      ? "approved"
      : request.status === "denied"
        ? "denied"
        : "pending"

  return {
    ...request,
    creatorWallet:
      normalizeWallet(
        request.creatorWallet
      ),
    signers:
      (request.signers || []).map(
        (signer) => ({
          ...signer,
          wallet:
            normalizeWallet(
              signer.wallet
            ),
          weight:
            Number(
              signer.weight || 0
            ),
          vote:
            signer.vote || "pending"
        })
      ),
    totalWeight,
    requiredWeight,
    approvedWeight,
    status
  }
}

async function saveBusinessRequest(
  request: BusinessCapsuleRequest
) {
  const normalized =
    normalizeRequest(
      request
    )

  if (redis) {
    await redis.set(
      `${REQUEST_PREFIX}${normalized.id}`,
      normalized
    )

    await redis.zadd(
      REQUEST_INDEX,
      {
        score:
          normalized.createdAt,
        member:
          normalized.id
      }
    )

    return normalized
  }

  memoryRequests.set(
    normalized.id,
    normalized
  )

  return normalized
}

export async function createBusinessCapsuleRequest(
  input: any
) {
  const createdAt =
    now()

  const rawSigners =
    Array.isArray(input.signers)
      ? input.signers
      : []

  const signers: BusinessSigner[] =
    rawSigners.map(
      (signer: any) => ({
        wallet:
          normalizeWallet(
            signer.wallet
          ),
        capsuleId:
          String(
            signer.capsuleId || ""
          ).trim(),
        weight:
          Number(
            signer.weight || 0
          ),
        vote:
          "pending"
      })
    )

  const totalWeight =
    calculateTotalWeight(
      signers
    )

  const requiredWeight =
    calculateRequiredWeight(
      totalWeight
    )

  const request: BusinessCapsuleRequest = {
    id:
      createId(),
    name:
      String(
        input.name ||
        input.businessName ||
        ""
      ).trim(),
    symbol:
      String(
        input.symbol || ""
      ).trim().toUpperCase(),
    description:
      String(
        input.description || ""
      ).trim(),
    creatorCapsuleId:
      String(
        input.creatorCapsuleId ||
        input.capsuleId ||
        ""
      ).trim(),
    creatorWallet:
      normalizeWallet(
        input.creatorWallet ||
        input.wallet ||
        ""
      ),
    status:
      "pending",
    totalWeight,
    approvedWeight:
      0,
    requiredWeight,
    signers,
    createdAt,
    updatedAt:
      createdAt
  }

  return await saveBusinessRequest(
    request
  )
}

export async function getBusinessCapsuleRequest(
  id: string
) {
  if (redis) {
    const request =
      await redis.get<BusinessCapsuleRequest>(
        `${REQUEST_PREFIX}${id}`
      )

    if (!request) {
      return null
    }

    return normalizeRequest(
      request
    )
  }

  const request =
    memoryRequests.get(id)

  if (!request) {
    return null
  }

  return normalizeRequest(
    request
  )
}

export async function listBusinessCapsuleRequests() {
  if (redis) {
    const ids =
      await redis.zrange<string[]>(
        REQUEST_INDEX,
        0,
        -1
      )

    const requests: BusinessCapsuleRequest[] =
      []

    for (const id of ids) {
      const request =
        await getBusinessCapsuleRequest(
          id
        )

      if (request) {
        requests.push(
          request
        )
      }
    }

    return requests.sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
  }

  return Array
    .from(
      memoryRequests.values()
    )
    .map(
      normalizeRequest
    )
    .sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
}

export async function voteBusinessCapsuleRequest(
  input: any
) {
  const requestId =
    String(
      input.requestId ||
      input.id ||
      ""
    ).trim()

  const signerWallet =
    normalizeWallet(
      input.signerWallet ||
      input.wallet ||
      ""
    )

  const vote: BusinessSignerVote =
    input.vote === "denied" ||
    input.approve === false
      ? "denied"
      : "approved"

  const request =
    await getBusinessCapsuleRequest(
      requestId
    )

  if (!request) {
    throw new Error(
      "Business Capsule request not found."
    )
  }

  if (request.status !== "pending") {
    return request
  }

  const signer =
    request.signers.find(
      (item) =>
        normalizeWallet(
          item.wallet
        ) === signerWallet
    )

  if (!signer) {
    throw new Error(
      "Signer wallet is not authorized."
    )
  }

  signer.vote =
    vote

  signer.votedAt =
    now()

  const updated =
    normalizeRequest({
      ...request,
      updatedAt:
        now()
    })

  return await saveBusinessRequest(
    updated
  )
}