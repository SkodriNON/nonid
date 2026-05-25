
"use client"

import {
  useState
} from "react"


import {
  ethers
} from "ethers"



export default function Register() {

  const [
    username,
    setUsername
  ] = useState("")

  const [
    email,
    setEmail
  ] = useState("")

  const [
    phone,
    setPhone
  ] = useState("")

  const [
    password,
    setPassword
  ] = useState("")

  const [
    otp,
    setOtp
  ] = useState("")

  const [
    otpSent,
    setOtpSent
  ] = useState(false)

  const sendOtp =
    async () => {

      const res =
        await fetch(

          "/api/send-phone",

          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              phone
            })
          }
        )

      const data =
        await res.json()

      if (data.success) {

        setOtpSent(true)

        alert(
          "OTP SENT 😄🔥"
        )
      }
    }


const mint =
  async () => {

    const verify =
      await fetch(

        "/api/verify-otp",

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            phone,

            otp
          })
        }
      )

    const verifyData =
      await verify.json()

    if (
      !verifyData.success
    ) {

      alert(
        "INVALID OTP"
      )

      return
    }

const ethereum =
  (window as any)
    .ethereum

if (!ethereum) {

  alert(
    "Install MetaMask"
  )

  return
}

const provider =
  new ethers.providers.Web3Provider(
    ethereum
  )

await provider.send(

  "eth_requestAccounts",

  []
)

const signer =
  provider.getSigner()

const abi = [

  "function createIdentity(string noniId,string password)"
]

const contract =
  new ethers.Contract(

    process.env
      .NEXT_PUBLIC_CONTRACT_ADDRESS!,

    abi,

    signer
  )

const tx =
  await contract.createIdentity(

    username,

    password
  )

await tx.wait()

localStorage.setItem(

  "nexus_identity",

  JSON.stringify({

    username,
    email,
    phone,
    assistant:
      "Nexus AI"
  })
)

alert(
  "IDENTITY MINTED 😄🔥"
)

window.location.href =
  "/dashboard"



    window.location.href =
      "/dashboard"
}



  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
      px-6
    ">

      <div className="
        w-full
        max-w-[700px]
        rounded-[40px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        p-10
      ">

        <h1 className="
          text-5xl
          font-black
        ">

          NexusnΩn.id

        </h1>

        <div className="
          mt-10
          space-y-5
        ">

          <input
            placeholder="Username"
            value={username}
            onChange={e =>
              setUsername(
                e.target.value
              )
            }
            className="
              w-full
              p-4
              rounded-2xl
              bg-black/40
              border
              border-white/10
            "
          />

          <input
            placeholder="Email"
            value={email}
            onChange={e =>
              setEmail(
                e.target.value
              )
            }
            className="
              w-full
              p-4
              rounded-2xl
              bg-black/40
              border
              border-white/10
            "
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={e =>
              setPhone(
                e.target.value
              )
            }
            className="
              w-full
              p-4
              rounded-2xl
              bg-black/40
              border
              border-white/10
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              p-4
              rounded-2xl
              bg-black/40
              border
              border-white/10
            "
          />

          {

            otpSent && (

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={e =>
                  setOtp(
                    e.target.value
                  )
                }
                className="
                  w-full
                  p-4
                  rounded-2xl
                  bg-black/40
                  border
                  border-cyan-500
                "
              />
            )
          }

          {

            !otpSent ? (

              <button

                onClick={sendOtp}

                className="
                  w-full
                  p-4
                  rounded-2xl
                  bg-cyan-400
                  text-black
                  font-black
                "
              >

                SEND OTP

              </button>

            ) : (

              <button

                onClick={mint}

                className="
                  w-full
                  p-4
                  rounded-2xl
                  bg-white
                  text-black
                  font-black
                "
              >

                VERIFY & MINT

              </button>
            )
          }

        </div>

      </div>

    </main>
  )
}

