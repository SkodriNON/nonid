export type BusinessRequestStatus =
  | "pending"
  | "approved"
  | "rejected"

export type BusinessSigner = {
  capsuleId: string
  wallet: string
  weight: number
  approved: boolean
}

export type BusinessCapsuleRequest = {
  id: string
  creatorCapsuleId: string
  creatorWallet: string
  businessName: string
  symbol: string
  description: string
  signers: BusinessSigner[]
  totalWeight: number
  requiredWeight: number
  approvedWeight: number
  status: BusinessRequestStatus
  createdAt: string
  updatedAt: string
}

const requests: BusinessCapsuleRequest[] = []

function safe(value: any) {
  return String(value || "").trim()
}

function normalizeWallet(wallet: string) {
  return safe(wallet).toLowerCase()
}

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function getTotalWeight(signers: BusinessSigner[]) {
  return signers.reduce((sum, signer) => sum + Number(signer.weight || 0), 0)
}

function getRequiredWeight(totalWeight: number) {
  return Math.ceil((totalWeight * 2) / 3)
}

function getApprovedWeight(signers: BusinessSigner[]) {
  return signers
    .filter((signer) => signer.approved)
    .reduce((sum, signer) => sum + Number(signer.weight || 0), 0)
}

export function listBusinessCapsuleRequests() {
  return requests
}

export function createBusinessCapsuleRequest(input: any) {
  const now = new Date().toISOString()

  const creatorCapsuleId =
    safe(input.creatorCapsuleId || input.capsuleId)

  const creatorWallet =
    safe(input.creatorWallet || input.wallet)

  const businessName =
    safe(input.businessName || input.name || input.organizationName)

  const symbol =
    safe(input.symbol).toUpperCase()

  const description =
    safe(input.description)

  const rawSigners =
    Array.isArray(input.signers) ? input.signers : []

  const signers: BusinessSigner[] =
    rawSigners.map((signer: any) => ({
      capsuleId: safe(signer.capsuleId),
      wallet: safe(signer.wallet),
      weight: Number(signer.weight || 0),
      approved: false
    }))

  const totalWeight = getTotalWeight(signers)
  const requiredWeight = getRequiredWeight(totalWeight)

  const request: BusinessCapsuleRequest = {
    id: makeId(),
    creatorCapsuleId,
    creatorWallet,
    businessName,
    symbol,
    description,
    signers,
    totalWeight,
    requiredWeight,
    approvedWeight: 0,
    status: "pending",
    createdAt: now,
    updatedAt: now
  }

  requests.unshift(request)

  return request
}

export function voteBusinessCapsuleRequest(input: any) {
  const requestId =
    safe(input.requestId || input.id)

  const signerWallet =
    safe(input.signerWallet || input.wallet)

  const approve =
    Boolean(input.approve)

  const request =
    requests.find((item) => item.id === requestId)

  if (!request) {
    throw new Error("Business Capsule request not found.")
  }

  if (request.status !== "pending") {
    throw new Error("Business Capsule request is not pending.")
  }

  const signer =
    request.signers.find(
      (item) =>
        normalizeWallet(item.wallet) === normalizeWallet(signerWallet)
    )

  if (!signer) {
    throw new Error("Signer wallet is not authorized.")
  }

  signer.approved = approve

  const approvedWeight = getApprovedWeight(request.signers)

  request.approvedWeight = approvedWeight

  request.status =
    approvedWeight >= request.requiredWeight
      ? "approved"
      : "pending"

  request.updatedAt = new Date().toISOString()

  return request
}