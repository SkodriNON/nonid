
"use client"

import {
  useEffect,
  useState
} from "react"

import {
  ethers
} from "ethers"

export default function Dashboard() {

  const [
    identity,
    setIdentity
  ] = useState<any>(null)

  const [
    wallet,
    setWallet
  ] = useState("")

  const [
    chain,
    setChain
  ] = useState("")

  const connectWallet =
    async () => {

      try {

        if (
          !(window as any)
            .ethereum
        ) {

          return
        }

        const provider =
          new ethers.providers.Web3Provider(

            (window as any)
              .ethereum
          )

       const accounts =
  await provider.listAccounts()

        const network =
          await provider.getNetwork()

        setChain(
          network.name
        )

      } catch (err) {

        console.error(err)
      }
    }

  useEffect(() => {

    const data =
      localStorage.getItem(
        "nexus_identity"
      )

    if (!data) {

      window.location.replace(
        "/register"
      )

      return
    }

    setIdentity(
      JSON.parse(data)
    )

    connectWallet()

  }, [])

  if (!identity) {

    return (

      <main className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-black
        text-white
      ">

        Loading...

      </main>

    )
  }

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      px-6
      py-16
      flex
      items-center
      justify-center
    ">

      <div className="
        w-full
        max-w-[1100px]
        rounded-[42px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        p-10
      ">

        <div className="
          flex
          items-center
          justify-between
          gap-6
          flex-wrap
        ">

          <div>

            <div className="
              text-zinc-500
              uppercase
              tracking-[0.3em]
              text-sm
            ">

              Sovereign Capsule

            </div>

            <h1 className="
              mt-4
              text-[52px]
              font-black
            ">

              {identity.username}

            </h1>

          </div>

          <div className="
            px-6
            py-3
            rounded-full
            bg-cyan-500
            text-black
            font-black
          ">

            CAPSULE ACTIVE

          </div>

        </div>

        <div className="
          mt-12
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
        ">

          <Card
            title="Email"
            value={identity.email}
          />

          <Card
            title="Phone"
            value={identity.phone}
          />

          <Card
            title="Assistant"
            value={identity.assistant}
          />

          <Card
            title="Wallet"
            value={wallet || "Not Connected"}
            small
          />

          <Card
            title="Network"
            value={chain || "Unknown"}
          />

          <Card
            title="Status"
            value="ACTIVE"
          />

        </div>

        <div className="
          mt-12
          rounded-[32px]
          border
          border-cyan-500/20
          bg-cyan-500/5
          p-8
        ">

          <div className="
            text-zinc-500
            uppercase
            tracking-[0.3em]
            text-sm
          ">

            Constitutional Notice

          </div>

          <div className="
            mt-5
            text-zinc-300
            leading-relaxed
          ">

            Your sovereign capsule
            identity is blockchain initialized
            and wallet bound.

            Keep your credentials,
            wallet access,
            and private keys secure.

          </div>

        </div>

      </div>

    </main>
  )
}

function Card({

  title,
  value,
  small

}: any) {

  return (

    <div className="
      rounded-[28px]
      border
      border-white/10
      bg-black/30
      p-6
    ">

      <div className="
        text-zinc-500
        text-sm
      ">

        {title}

      </div>

      <div className={`
        mt-3
        font-bold
        break-all
        ${
          small
            ? "text-sm"
            : "text-xl"
        }
      `}>

        {value}

      </div>

    </div>
  )
}

