const { ethers } = require("ethers")

async function proofHash(value) {
  const encoder =
    new TextEncoder()

  const data =
    encoder.encode(value)

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    )

  return "0x" + Array.from(
    new Uint8Array(hashBuffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("")
}

function renderActivatePupRequest(
  identity,
  request,
  errorMessage = ""
) {
  root().innerHTML = `
    <main class="app">
      <section class="card">
        <div class="top">
          <div class="brand">
            <img src="${identity.logo || DEFAULT_LOGO}" class="brand-logo" alt="NEXUSNON.ID" />
            <div>
              <div class="brand-title">NΩN Activate</div>
              <div class="brand-subtitle">PUP Activation</div>
            </div>
          </div>
          <div class="badge badge-active">ACTIVATE</div>
        </div>

        <div class="hero">
          <p class="eyebrow">Capsule Passport Layer</p>
          <h2>Activate PUP</h2>
          <p>Confirm Anti-Phishing Code and create your PUP PIN.</p>
        </div>

        ${
          errorMessage
            ? `
              <div class="identity-panel">
                <div class="identity-row">
                  <span>Error</span>
                  <strong class="text-red">${errorMessage}</strong>
                </div>
              </div>
            `
            : ""
        }

        <div class="identity-panel">
          <div class="identity-row">
            <span>Capsule</span>
            <strong>#${request.capsuleId}</strong>
          </div>

          <div class="identity-row">
            <span>Wallet</span>
            <strong>${request.wallet || request.capsuleWallet}</strong>
          </div>

          <input id="activateAnti" type="password" placeholder="Anti-Phishing Code" class="pup-input" />
          <input id="activatePin" type="password" placeholder="Create PUP PIN" class="pup-input" />
          <input id="activateConfirmPin" type="password" placeholder="Confirm PUP PIN" class="pup-input" />
        </div>

        <div class="actions">
          <button class="primary" id="activatePupNow">Activate PUP</button>
          <button class="secondary" id="backToRequests">Back</button>
        </div>

        <div class="footer">
          Activation charges 1 USDT from Capsule Wallet to Fee Vault.
        </div>
      </section>
    </main>
  `

  document.getElementById("backToRequests").onclick =
    async () => {
      const requests =
        await window.NexusRequestManager.getRequests()

      renderRequests(identity, requests)
    }

  document.getElementById("activatePupNow").onclick =
    async () => {
      const anti =
        document.getElementById("activateAnti").value.trim()

      const pin =
        document.getElementById("activatePin").value.trim()

      const confirmPin =
        document.getElementById("activateConfirmPin").value.trim()

      if (!anti || !pin || !confirmPin) {
        renderActivatePupRequest(
          identity,
          request,
          "Anti-Phishing Code and PIN are required."
        )
        return
      }

      if (pin.length < PIN_MIN_LENGTH) {
        renderActivatePupRequest(
          identity,
          request,
          "PIN must be at least 8 characters."
        )
        return
      }

      if (pin !== confirmPin) {
        renderActivatePupRequest(
          identity,
          request,
          "PIN confirmation does not match."
        )
        return
      }

      try {
        const capsuleId =
          String(request.capsuleId)

        const wallet =
          request.wallet || request.capsuleWallet

        const pinProofHash =
          await proofHash(`PIN:${capsuleId}:${pin}`)

        const pukProofHash =
          await proofHash(`PUK:${capsuleId}:${wallet}`)

        const pupProofHash =
          await proofHash(`PUP:${capsuleId}:${wallet}:${anti}`)

        const response =
          await fetch(
            ACTIVATE_PUP_API,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                capsuleId,
                pinProofHash,
                pukProofHash,
                pupProofHash,
                payWithNON: false,
                nonAmount: "0"
              })
            }
          )

        const data =
          await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
            data.message ||
            "PUP activation failed."
          )
        }

        const pinHash =
          await hashPin(pin)

        await chrome.storage.local.set({
          pupSessionActive: true,
          pupCapsuleId: capsuleId,
          pupWallet: wallet,
          pupPinHash: pinHash,
          pupUnlocked: true,
          pupLastUnlock: Date.now()
        })

        await window.NexusRequestManager.updateRequestStatus(
          request.id,
          "approved"
        )

        bootIdentity()
      } catch (error) {
        renderActivatePupRequest(
          identity,
          request,
          error?.message ||
            "PUP activation failed."
        )
      }
    }
}

const API_URL =
  "http://localhost:3000/api/genesis/activate-pup"

const CAPSULE_ID =
  "1"

const ANTI_PHISHING_CODE =
  "2020"

async function main() {

  if (
    !ANTI_PHISHING_CODE ||
    ANTI_PHISHING_CODE.length < 4
  ) {
    throw new Error(
      "Anti-Phishing Code must be at least 4 characters"
    )
  }

  const pinProofHash =
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `NEXUSNON_PIN:${CAPSULE_ID}:${ANTI_PHISHING_CODE}`
      )
    )

  const pukProofHash =
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `NEXUSNON_PUK:${CAPSULE_ID}:${ANTI_PHISHING_CODE}`
      )
    )

  const pupProofHash =
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `NEXUSNON_PUP:${CAPSULE_ID}:${ANTI_PHISHING_CODE}`
      )
    )

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          capsuleId: CAPSULE_ID,
          pinProofHash,
          pukProofHash,
          pupProofHash,
          payWithNON: false,
          nonAmount: "0"
        })
      }
    )

  const data =
    await response.json()

  console.log(data)

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
      "Failed to set Anti-Phishing Code"
    )
  }

  console.log(
    "Anti-Phishing Code added to Capsule #1"
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})