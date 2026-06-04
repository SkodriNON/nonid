"use client"

import {
  useEffect,
  useState
} from "react"

import {
  ethers
} from "ethers"

type PupRequest = {
  id: string
  capsuleId: string
  wallet: string
  email: string
  phone: string
  action: string
  status: string
  createdAt: number
  expiresAt: number
  capsuleStatus?: number
  activationRequired?: boolean
}

function shortAddress(
  address: string
) {
  if (!address) {
    return ""
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function timeLeft(
  expiresAt: number
) {
  const ms =
    expiresAt - Date.now()

  if (ms <= 0) {
    return "Expired"
  }

  const sec =
    Math.floor(ms / 1000)

  const min =
    Math.floor(sec / 60)

  const rest =
    sec % 60

  return `${min}:${String(rest).padStart(2, "0")}`
}

function passwordKey(
  capsuleId: string
) {
  return `NEXUSNON_PUP_PASSWORD_HASH_${capsuleId}`
}

function hashPassword(
  capsuleId: string,
  password: string
) {
  return ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `NEXUSNON_PUP_PASSWORD:${capsuleId}:${password.trim()}`
    )
  )
}

function savePupPassword(
  capsuleId: string,
  password: string
) {
  localStorage.setItem(
    passwordKey(capsuleId),
    hashPassword(
      capsuleId,
      password
    )
  )
}

function hasPupPassword(
  capsuleId: string
) {
  if (typeof window === "undefined") {
    return false
  }

  return Boolean(
    localStorage.getItem(
      passwordKey(capsuleId)
    )
  )
}

function verifyPupPassword(
  capsuleId: string,
  password: string
) {
  const stored =
    localStorage.getItem(
      passwordKey(capsuleId)
    )

  if (!stored) {
    return false
  }

  return (
    stored.toLowerCase() ===
    hashPassword(
      capsuleId,
      password
    ).toLowerCase()
  )
}

export default function PupPage() {
  const [requests, setRequests] =
    useState<PupRequest[]>([])

  const [loading, setLoading] =
    useState(true)

  const [actionLoading, setActionLoading] =
    useState("")

  const [message, setMessage] =
    useState("")

  const [selectedRequestId, setSelectedRequestId] =
    useState("")

  const [pupPassword, setPupPassword] =
    useState("")

  const [antiPhishing, setAntiPhishing] =
    useState("")

  const [newPassword, setNewPassword] =
    useState("")

  const [repeatPassword, setRepeatPassword] =
    useState("")

  async function loadRequests() {
    try {
      const res =
        await fetch(
          "/api/pup/request/list",
          {
            cache:
              "no-store"
          }
        )

      const data =
        await res.json()

 if (data.success) {
  setRequests(
    data.requests || []
  )
}
        
    } catch {
      setMessage(
        "Could not load PUP requests."
      )
    } finally {
      setLoading(false)
    }
  }

  function isActivationRequest(
    request: PupRequest
  ) {
    return (
      request.activationRequired === true ||
      Number(request.capsuleStatus) === 1 ||
      request.action === "ACTIVATE_PUP" ||
      request.action === "PENDING_ACTIVATION"
    )
  }

  function isLocalSetupRequest(
    request: PupRequest
  ) {
    return (
      !isActivationRequest(request) &&
      !hasPupPassword(request.capsuleId)
    )
  }

  function resetSecrets() {
    setPupPassword("")
    setAntiPhishing("")
    setNewPassword("")
    setRepeatPassword("")
  }

  async function approveRequestOnly(
    request: PupRequest
  ) {
    const res =
      await fetch(
        "/api/pup/request/approve",
        {
          method:
            "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify({
              requestId:
                request.id
            })
        }
      )

    const data =
      await res.json()

    if (!res.ok || !data.success) {
      throw new Error(
        data.error ||
        "APPROVE_FAILED"
      )
    }

    const approvedRequest =
      data.request

    if (
      approvedRequest?.capsuleId &&
      approvedRequest?.wallet
    ) {
      localStorage.setItem(
        "NEXUSNON_PUP_APPROVED",
        JSON.stringify({
          requestId:
            approvedRequest.id,
          capsuleId:
            approvedRequest.capsuleId,
          wallet:
            approvedRequest.wallet,
          approvedAt:
            Date.now()
        })
      )
    }

    localStorage.removeItem(
  "NEXUSNON_ACTIVE_PUP_REQUEST"
)

    return data
  }

  async function approveActiveLogin(
    request: PupRequest
  ) {
    if (
      !pupPassword.trim() ||
      pupPassword.trim().length < 4
    ) {
      throw new Error(
        "PUP password is required."
      )
    }

    const valid =
      verifyPupPassword(
        request.capsuleId,
        pupPassword
      )

    if (!valid) {
      throw new Error(
        "Invalid PUP password. If you lost it, use recovery flow."
      )
    }

    await approveRequestOnly(
      request
    )
  }

  async function setupLocalPupAndApprove(
  request: PupRequest
) {
  if (
    !antiPhishing.trim() ||
    antiPhishing.trim().length < 4
  ) {
    throw new Error(
      "Anti-Phishing Code is required before creating PUP password."
    )
  }

  if (
    !newPassword.trim() ||
    newPassword.trim().length < 6
  ) {
    throw new Error(
      "Create a PUP password with at least 6 characters."
    )
  }

  if (
    newPassword.trim() !==
    repeatPassword.trim()
  ) {
    throw new Error(
      "PUP passwords do not match."
    )
  }

  const verifyResponse =
    await fetch(
      "/api/genesis/verify-anti-phishing",
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify({
            capsuleId:
              request.capsuleId,
            antiPhishing:
              antiPhishing.trim()
          })
      }
    )

  const verifyData =
    await verifyResponse.json()

  if (
    !verifyResponse.ok ||
    verifyData.success !== true ||
    verifyData.valid !== true
  ) {
    throw new Error(
      verifyData.message ||
      verifyData.error ||
      "Invalid Anti-Phishing Code."
    )
  }

  savePupPassword(
    request.capsuleId,
    newPassword
  )

  await approveRequestOnly(
    request
  )
}

  async function activateAndApprove(
    request: PupRequest
  ) {
    if (
      !antiPhishing.trim() ||
      antiPhishing.trim().length < 4
    ) {
      throw new Error(
        "Anti-Phishing Code is required for first PUP activation."
      )
    }

    if (
      !newPassword.trim() ||
      newPassword.trim().length < 6
    ) {
      throw new Error(
        "New PUP password must be at least 6 characters."
      )
    }

    if (
      newPassword.trim() !==
      repeatPassword.trim()
    ) {
      throw new Error(
        "PUP passwords do not match."
      )
    }

    const pinProofHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PIN:${request.capsuleId}:${newPassword.trim()}`
        )
      )

    const pukProofHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PUK:${request.capsuleId}:${request.wallet}:${antiPhishing.trim()}`
        )
      )

    const pupProofHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `PUP:${request.capsuleId}:${request.wallet}:${Date.now()}`
        )
      )

    const activationResponse =
      await fetch(
        "/api/genesis/activate-pup",
        {
          method:
            "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify({
              capsuleId:
                request.capsuleId,
              antiPhishing:
                antiPhishing.trim(),
              pinProofHash,
              pukProofHash,
              pupProofHash,
              payWithNON:
                false,
              nonAmount:
                "0"
            })
        }
      )

    const activationData =
      await activationResponse.json()

    if (
      !activationResponse.ok ||
      activationData.success !== true
    ) {
      throw new Error(
        activationData.message ||
        activationData.error ||
        "PUP activation failed."
      )
    }

    savePupPassword(
      request.capsuleId,
      newPassword
    )

    await approveRequestOnly(
      request
    )
  }

  async function handleConfirm(
    request: PupRequest
  ) {
    try {
      setActionLoading(
        request.id
      )

      setMessage("")

      if (
        isActivationRequest(
          request
        )
      ) {
        await activateAndApprove(
          request
        )

        setMessage(
          "PUP activated and login approved."
        )
      } else if (
        isLocalSetupRequest(
          request
        )
      ) {
        await setupLocalPupAndApprove(
          request
        )

        setMessage(
          "PUP password created on this device and login approved."
        )
      } else {
        await approveActiveLogin(
          request
        )

        setMessage(
          "PUP login approved."
        )
      }

      setSelectedRequestId("")
      resetSecrets()

      await loadRequests()

    } catch (err: any) {
      setMessage(
        err?.message ||
        "PUP approval failed."
      )
    } finally {
      setActionLoading("")
    }
  }

  async function deny(
    id: string
  ) {
    try {
      setActionLoading(id)
      setMessage("")

      const res =
        await fetch(
          "/api/pup/request/deny",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                requestId:
                  id
              })
          }
        )

      const data =
        await res.json()

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
          "DENY_FAILED"
        )
      }

      setMessage(
        "PUP request denied."
      )

      setSelectedRequestId("")
      resetSecrets()

      await loadRequests()

    } catch (err: any) {
      setMessage(
        err?.message ||
        "Deny failed."
      )
    } finally {
      setActionLoading("")
    }
  }

  useEffect(() => {
    loadRequests()

    const timer =
      setInterval(
        loadRequests,
        2000
      )

    return () =>
      clearInterval(timer)
  }, [])

  const pending =
    requests.filter(
      (r) =>
        r.status === "pending"
    )

  const history =
    requests.filter(
      (r) =>
        r.status !== "pending"
    )

  return (
    <main className="
      min-h-screen
      bg-[#050816]
      px-4
      py-8
      text-white
      sm:px-6
      lg:px-10
    ">
      <section className="
        mx-auto
        max-w-6xl
      ">
        <div className="
          rounded-[40px]
          border
          border-cyan-400/20
          bg-gradient-to-b
          from-[#101026]
          via-[#080812]
          to-[#05050B]
          p-6
          shadow-[0_0_100px_rgba(34,211,238,0.12)]
          sm:p-8
        ">
          <div className="
            flex
            flex-col
            gap-6
            md:flex-row
            md:items-end
            md:justify-between
          ">
            <div>
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.35em]
                text-cyan-300
              ">
                NEXUSNON.ID PUP
              </p>

              <h1 className="
                mt-4
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
              ">
                Passport Approval Layer
              </h1>

              <p className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-zinc-400
                sm:text-base
              ">
                Active Capsules require PUP password. Pending Capsules require Anti-Phishing and new PUP password activation.
              </p>
            </div>

            <button
              onClick={loadRequests}
              className="
                h-12
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                px-6
                text-sm
                font-black
                text-cyan-200
                transition
                hover:bg-cyan-400/15
              "
            >
              Refresh
            </button>
          </div>

          {message && (
            <div className="
              mt-6
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-3
              text-sm
              text-zinc-300
            ">
              {message}
            </div>
          )}

          <div className="
            mt-8
            grid
            gap-6
            lg:grid-cols-[1.3fr_0.7fr]
          ">
            <div className="
              rounded-[30px]
              border
              border-white/10
              bg-black/20
              p-5
            ">
              <div className="
                flex
                items-center
                justify-between
                gap-4
              ">
                <h2 className="
                  text-xl
                  font-black
                ">
                  Pending Requests
                </h2>

                <span className="
                  rounded-full
                  border
                  border-cyan-400/20
                  bg-cyan-400/10
                  px-3
                  py-1
                  text-xs
                  font-black
                  text-cyan-200
                ">
                  {pending.length}
                </span>
              </div>

              <div className="
                mt-5
                grid
                gap-4
              ">
                {loading && (
                  <p className="
                    text-sm
                    text-zinc-500
                  ">
                    Loading PUP requests...
                  </p>
                )}

                {!loading &&
                  pending.length === 0 && (
                    <div className="
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      p-6
                      text-sm
                      leading-7
                      text-zinc-400
                    ">
                      No pending PUP requests. Open Connect and try login again.
                    </div>
                  )}

                {pending.map((request) => {
                  const activationMode =
                    isActivationRequest(
                      request
                    )

                  const localSetupMode =
                    isLocalSetupRequest(
                      request
                    )

                  return (
                    <div
                      key={request.id}
                      className="
                        rounded-3xl
                        border
                        border-cyan-400/20
                        bg-cyan-400/[0.04]
                        p-5
                      "
                    >
                      <div className="
                        flex
                        flex-col
                        gap-4
                        md:flex-row
                        md:items-start
                        md:justify-between
                      ">
                        <div>
                          <p className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.28em]
                            text-cyan-300
                          ">
                            {activationMode
                              ? "PUP ACTIVATION"
                              : localSetupMode
                                ? "LOCAL PUP SETUP"
                                : request.action}
                          </p>

                          <h3 className="
                            mt-2
                            text-2xl
                            font-black
                          ">
                            Capsule #{request.capsuleId}
                          </h3>

                          <p className="
                            mt-2
                            text-sm
                            text-zinc-400
                          ">
                            Wallet: {shortAddress(request.wallet)}
                          </p>

                          <p className="
                            mt-1
                            text-xs
                            text-zinc-500
                          ">
                            {request.email || "No email"} · {request.phone || "No phone"}
                          </p>

                          <p className="
                            mt-4
                            break-all
                            text-[11px]
                            text-zinc-600
                          ">
                            Request ID: {request.id}
                          </p>
                        </div>

                        <div className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/30
                          px-4
                          py-3
                          text-center
                        ">
                          <p className="
                            text-[10px]
                            uppercase
                            tracking-[0.22em]
                            text-zinc-500
                          ">
                            Mode
                          </p>

                          <p className="
                            mt-1
                            text-sm
                            font-black
                            text-cyan-200
                          ">
                            {activationMode
                              ? "Activation"
                              : localSetupMode
                                ? "Setup"
                                : "Login"}
                          </p>

                          <p className="
                            mt-2
                            text-xs
                            text-zinc-500
                          ">
                            {timeLeft(request.expiresAt)}
                          </p>
                        </div>
                      </div>

                      {selectedRequestId === request.id && (
                        <div className="
                          mt-5
                          rounded-2xl
                          border
                          border-cyan-400/20
                          bg-black/30
                          p-4
                        ">
                          {activationMode ? (
                            <>
                              <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-[0.22em]
                                text-cyan-300
                              ">
                                First PUP Activation
                              </p>

                              <input
                                value={antiPhishing}
                                onChange={(e) =>
                                  setAntiPhishing(
                                    e.target.value
                                  )
                                }
                                type="password"
                                placeholder="Anti-Phishing Code"
                                className="
                                  mt-4
                                  h-12
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-black/40
                                  px-4
                                  text-sm
                                  text-white
                                  outline-none
                                  placeholder:text-zinc-600
                                "
                              />

                              <input
                                value={newPassword}
                                onChange={(e) =>
                                  setNewPassword(
                                    e.target.value
                                  )
                                }
                                type="password"
                                placeholder="Create PUP Password"
                                className="
                                  mt-3
                                  h-12
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-black/40
                                  px-4
                                  text-sm
                                  text-white
                                  outline-none
                                  placeholder:text-zinc-600
                                "
                              />

                              <input
                                value={repeatPassword}
                                onChange={(e) =>
                                  setRepeatPassword(
                                    e.target.value
                                  )
                                }
                                type="password"
                                placeholder="Repeat PUP Password"
                                className="
                                  mt-3
                                  h-12
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-black/40
                                  px-4
                                  text-sm
                                  text-white
                                  outline-none
                                  placeholder:text-zinc-600
                                "
                              />

                              <p className="
                                mt-3
                                text-xs
                                leading-5
                                text-zinc-500
                              ">
                                Anti-Phishing is used only for activation or recovery. After activation, login uses your PUP password.
                              </p>
                            </>
                          ) : localSetupMode ? (
                            <>
                              <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-[0.22em]
                                text-cyan-300
                              ">
                                Setup PUP Password On This Device
                              </p>

                              <input
  value={antiPhishing}
  onChange={(e) =>
    setAntiPhishing(
      e.target.value
    )
  }
  type="password"
  placeholder="Anti-Phishing Code"
  className="
    mt-4
    h-12
    w-full
    rounded-xl
    border
    border-white/10
    bg-black/40
    px-4
    text-sm
    text-white
    outline-none
    placeholder:text-zinc-600
  "
/>

                              <input
                                value={newPassword}
                                onChange={(e) =>
                                  setNewPassword(
                                    e.target.value
                                  )
                                }
                                type="password"
                                placeholder="Create PUP Password"
                                className="
                                  mt-4
                                  h-12
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-black/40
                                  px-4
                                  text-sm
                                  text-white
                                  outline-none
                                  placeholder:text-zinc-600
                                "
                              />

                              <input
                                value={repeatPassword}
                                onChange={(e) =>
                                  setRepeatPassword(
                                    e.target.value
                                  )
                                }
                                type="password"
                                placeholder="Repeat PUP Password"
                                className="
                                  mt-3
                                  h-12
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-black/40
                                  px-4
                                  text-sm
                                  text-white
                                  outline-none
                                  placeholder:text-zinc-600
                                "
                              />

                              <p className="
                                mt-3
                                text-xs
                                leading-5
                                text-amber-300
                              ">
                                This Capsule is already active, but this device has no local PUP password. Create one for this device to continue.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="
                                text-xs
                                font-black
                                uppercase
                                tracking-[0.22em]
                                text-cyan-300
                              ">
                                Confirm PUP Password
                              </p>

                              <input
                                value={pupPassword}
                                onChange={(e) =>
                                  setPupPassword(
                                    e.target.value
                                  )
                                }
                                type="password"
                                placeholder="Enter PUP Password"
                                className="
                                  mt-4
                                  h-12
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-black/40
                                  px-4
                                  text-sm
                                  text-white
                                  outline-none
                                  placeholder:text-zinc-600
                                "
                              />

                              <p className="
  mt-3
  text-xs
  leading-5
  text-zinc-500
">
  Active Capsules require PUP password before approving access.
</p>

<button
  type="button"
  onClick={() =>
    window.location.href =
      `/pup/recovery?capsuleId=${encodeURIComponent(
        request.capsuleId
      )}`
  }
  className="
    mt-3
    block
    text-xs
    font-bold
    text-amber-300
    hover:text-amber-200
  "
>
  Lost PUP Password?
</button>

</>
)}
                          <button
                            type="button"
                            disabled={
                              actionLoading === request.id
                            }
                            onClick={() =>
                              handleConfirm(
                                request
                              )
                            }
                            className="
                              mt-4
                              h-12
                              w-full
                              rounded-xl
                              bg-cyan-300
                              text-sm
                              font-black
                              text-black
                              transition
                              hover:scale-[1.01]
                              disabled:opacity-50
                            "
                          >
                            {actionLoading === request.id
                              ? "Processing..."
                              : activationMode
                                ? "Activate PUP & Approve"
                                : localSetupMode
                                  ? "Create PUP Password & Approve"
                                  : "Confirm & Approve"}
                          </button>
                        </div>
                      )}

                      <div className="
                        mt-5
                        grid
                        gap-3
                        sm:grid-cols-2
                      ">
                        <button
                          disabled={
                            actionLoading === request.id
                          }
                          onClick={() => {
                            setSelectedRequestId(
                              request.id
                            )

                            resetSecrets()
                          }}
                          className="
                            h-13
                            rounded-2xl
                            bg-gradient-to-r
                            from-cyan-600
                            to-violet-600
                            px-5
                            py-4
                            text-sm
                            font-black
                            shadow-lg
                            shadow-cyan-950/30
                            transition
                            hover:scale-[1.01]
                            disabled:opacity-50
                          "
                        >
                          {activationMode
                            ? "Start Activation"
                            : localSetupMode
                              ? "Setup PUP"
                              : "Approve Access"}
                        </button>

                        <button
                          disabled={
                            actionLoading === request.id
                          }
                          onClick={() =>
                            deny(request.id)
                          }
                          className="
                            h-13
                            rounded-2xl
                            border
                            border-red-400/20
                            bg-red-400/10
                            px-5
                            py-4
                            text-sm
                            font-black
                            text-red-200
                            transition
                            hover:bg-red-400/15
                            disabled:opacity-50
                          "
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="
              rounded-[30px]
              border
              border-white/10
              bg-white/[0.03]
              p-5
            ">
              <h2 className="
                text-xl
                font-black
              ">
                PUP Integrity
              </h2>

              <div className="
                mt-5
                grid
                gap-3
              ">
                {[
                  ["Capsule", "Identity"],
                  ["Genesis", "Source of Truth"],
                  ["PUP", "Approval Layer"],
                  ["Active Login", "Password Required"],
                  ["First Activation", "Anti-Phishing Required"],
                  ["Recovery", "Fee Required Again"]
                ].map(([a, b]) => (
                  <div
                    key={a}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-white/10
                      bg-black/25
                      px-4
                      py-3
                    "
                  >
                    <span className="
                      text-sm
                      font-bold
                    ">
                      {a}
                    </span>

                    <span className="
                      text-xs
                      text-zinc-500
                    ">
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="
                mt-8
                text-sm
                font-black
                uppercase
                tracking-[0.24em]
                text-zinc-500
              ">
                Recent Activity
              </h3>

              <div className="
                mt-4
                grid
                gap-3
              ">
                {history.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-black/20
                      px-4
                      py-3
                    "
                  >
                    <div className="
                      flex
                      items-center
                      justify-between
                    ">
                      <span className="
                        text-sm
                        font-bold
                      ">
                        Capsule #{request.capsuleId}
                      </span>

                      <span className="
                        text-xs
                        uppercase
                        text-zinc-500
                      ">
                        {request.status}
                      </span>
                    </div>

                    <p className="
                      mt-1
                      text-xs
                      text-zinc-600
                    ">
                      {request.action}
                    </p>
                  </div>
                ))}

                {history.length === 0 && (
                  <p className="
                    text-sm
                    text-zinc-500
                  ">
                    No completed requests yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}