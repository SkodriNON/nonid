export function generatePupPassport(
  capsuleId: string,
  wallet: string
) {
  return {
    pupId: `PUP-NON-${capsuleId}`,
    capsuleId,
    wallet,
    role: "Sovereign Citizen"
  }
}