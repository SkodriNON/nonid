"use client"

import {
  useEffect,
  useState
} from "react"

import {
  useRouter
} from "next/navigation"

export default function Dashboard() {

  const router =
    useRouter()

  const [
    identity,
    setIdentity
  ] = useState<any>(null)

  useEffect(() => {

    if (
      typeof window ===
      "undefined"
    ) return

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
        "nexus_identity"
      )

    if (stored) {

      setIdentity(
        JSON.parse(stored)
      )
    }

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
        max-w-[1200px]
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
              text-4xl
              sm:text-6xl
              font-black
              tracking-tight
            ">

              Dashboard

            </h1>

            <p className="
              mt-2
              text-zinc-500
            ">

              Sovereign identity control center

            </p>

          </div>

          <button

            onClick={() => {

              localStorage.removeItem(
                "non_trusted"
              )

              router.push("/")
            }}

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

            Logout

          </button>

        </div>

        {/* IDENTITY CARD */}

        <div className="
          mt-8
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
          p-8
        ">

          <div className="
            text-zinc-500
            text-sm
          ">

            Sovereign Identity

          </div>

          <div className="
            mt-4
            text-4xl
            font-black
          ">

            {
              identity?.username
              || "Anonymous"
            }

          </div>

          <div className="
            mt-3
            text-zinc-400
            break-all
          ">

            {
              identity?.email
              || "No email"
            }

          </div>

          <div className="
            mt-2
            text-zinc-500
          ">

            {
              identity?.phone
              || "No phone"
            }

          </div>

        </div>

        {/* ACTIONS */}

        <div className="
          mt-6
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        ">

          <button

            onClick={() =>
              router.push(
                "/history"
              )
            }

            className="
              h-[120px]
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              text-left
              p-6
            "
          >

            <div className="
              text-2xl
              font-black
            ">

              History

            </div>

            <div className="
              mt-2
              text-zinc-500
            ">

              Identity timeline

            </div>

          </button>

          <button

            onClick={() =>
              router.push(
                "/security"
              )
            }

            className="
              h-[120px]
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              text-left
              p-6
            "
          >

            <div className="
              text-2xl
              font-black
            ">

              Security

            </div>

            <div className="
              mt-2
              text-zinc-500
            ">

              PIN & biometrics

            </div>

          </button>

          <button

            onClick={() =>
              router.push(
                "/settings"
              )
            }

            className="
              h-[120px]
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              text-left
              p-6
            "
          >

            <div className="
              text-2xl
              font-black
            ">

              Settings

            </div>

            <div className="
              mt-2
              text-zinc-500
            ">

              Identity preferences

            </div>

          </button>

        </div>

      </div>

    </main>
  )
}