
"use client"

import {

  useEffect,
  useState

} from "react"

import {
  useRouter
} from "next/navigation"

export default function Identity() {

  const router =
    useRouter()

  const [
    identity,
    setIdentity
  ] = useState<any>(null)

  useEffect(() => {

    const trusted =
      localStorage.getItem(
        "non_trusted"
      )

    if (
      trusted !== "true"
    ) {

      router.push(
        "/login"
      )

      return
    }

    const stored =
      localStorage.getItem(
        "non_identity"
      )

    if (!stored) {

      router.push(
        "/register"
      )

      return
    }

    setIdentity(
      JSON.parse(stored)
    )

  }, [router])

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      px-4
      sm:px-6
      lg:px-10
      py-6
      overflow-hidden
    ">

      {/* BACKGROUND */}

      <div className="
        fixed
        inset-0
        -z-10
        overflow-hidden
      ">

        <div className="
          absolute
          top-[-20%]
          left-1/2
          -translate-x-1/2
          w-[900px]
          h-[900px]
          rounded-full
          bg-cyan-500/10
          blur-[180px]
        "/>

      </div>

      <div className="
        max-w-[1100px]
        mx-auto
      ">

        {/* HEADER */}

        <div className="
          flex
          items-center
          justify-between
          gap-4
          flex-wrap
        ">

          <div>

            <h1 className="
              text-3xl
              sm:text-5xl
              font-black
              tracking-tight
            ">

              Identity

            </h1>

            <p className="
              mt-2
              text-zinc-500
            ">

              Sovereign NFT identity layer

            </p>

          </div>

          <button

            onClick={() =>
              router.push(
                "/dashboard"
              )
            }

            className="
              h-[54px]
              px-6
              rounded-[18px]
              border
              border-white/10
              bg-white/[0.04]
              font-bold
            "
          >

            Dashboard

          </button>

        </div>

        {/* USERNAME */}

        <div className="
          mt-8
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
          p-6
          sm:p-8
        ">

          <div className="
            text-zinc-500
            text-sm
          ">

            Identity Username

          </div>

          <div className="
            mt-5
            text-4xl
            sm:text-6xl
            font-black
            break-all
            tracking-tight
          ">

            {identity?.username}

          </div>

        </div>

        {/* STATUS GRID */}

        <div className="
          mt-6
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        ">

          <StatusCard
            label="NFT Status"
            value="ACTIVE"
          />

          <StatusCard
            label="Blockchain"
            value="ARBITRUM"
          />

          <StatusCard
            label="Identity Layer"
            value="VERIFIED"
          />

        </div>

        {/* CREATED */}

        <div className="
          mt-6
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
          p-6
          sm:p-8
        ">

          <div className="
            text-zinc-500
            text-sm
          ">

            Identity Created

          </div>

          <div className="
            mt-4
            text-2xl
            sm:text-3xl
            font-black
          ">

            {

              identity?.createdAt

              ? new Date(

                  identity.createdAt

                ).toLocaleDateString()

              : "-"
            }

          </div>

        </div>

        {/* BALANCE */}

        <div className="
          mt-6
          rounded-[32px]
          border
          border-cyan-500/20
          bg-cyan-500/5
          backdrop-blur-3xl
          p-6
          sm:p-8
        ">

          <div className="
            text-zinc-500
            text-sm
          ">

            NON Constitutional Balance

          </div>

          <div className="
            mt-5
            text-5xl
            sm:text-7xl
            font-black
            tracking-tight
          ">

            {identity?.balance || 0}

          </div>

          <div className="
            mt-3
            text-cyan-400
            font-bold
            tracking-[0.3em]
          ">

            NON
          </div>

        </div>

      </div>

    </main>
  )
}

function StatusCard({

  label,
  value

}: any) {

  return (

    <div className="
      rounded-[28px]
      border
      border-white/10
      bg-white/[0.04]
      backdrop-blur-3xl
      p-6
    ">

      <div className="
        text-zinc-500
        text-sm
      ">

        {label}

      </div>

      <div className="
        mt-3
        text-xl
        font-black
        text-green-400
      ">

        {value}

      </div>

    </div>
  )
}

