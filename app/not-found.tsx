
"use client"

import {
  useRouter
} from "next/navigation"

export default function NotFound() {

  const router =
    useRouter()

  return (

    <main className="
      relative
      min-h-screen
      overflow-hidden
      bg-black
      text-white
      flex
      items-center
      justify-center
      px-6
    ">

      {/* BACKGROUND */}

      <div className="
        absolute
        inset-0
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

        <div className="
          absolute
          bottom-[-20%]
          right-[-10%]
          w-[700px]
          h-[700px]
          rounded-full
          bg-pink-500/10
          blur-[180px]
        "/>

      </div>

      {/* CARD */}

      <div className="
        relative
        z-10
        w-full
        max-w-[720px]
        rounded-[42px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        p-8
        sm:p-12
        text-center
        overflow-hidden
      ">

        {/* GLOW */}

        <div className="
          absolute
          top-[-120px]
          left-1/2
          -translate-x-1/2
          w-[300px]
          h-[300px]
          rounded-full
          bg-cyan-500/10
          blur-[120px]
        "/>

        {/* Ω */}

        <div className="
          relative
          mx-auto
          w-[120px]
          h-[120px]
          rounded-[38px]
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
          flex
          items-center
          justify-center
          text-6xl
          font-black
          shadow-[0_0_80px_rgba(59,130,246,0.20)]
        ">

          Ω

        </div>

        {/* 404 */}

        <h1 className="
          mt-10
          text-[72px]
          sm:text-[110px]
          font-black
          leading-none
          tracking-tight
          bg-gradient-to-b
          from-white
          to-zinc-600
          bg-clip-text
          text-transparent
        ">

          404

        </h1>

        {/* TEXT */}

        <div className="
          mt-6
          text-zinc-400
          text-base
          sm:text-lg
          leading-relaxed
          max-w-[520px]
          mx-auto
        ">

          This sovereign identity route
          does not exist within the
          NexusnΩn constitutional network.

        </div>

        {/* BUTTON */}

        <button

          onClick={() =>
            router.push("/")
          }

          className="
            mt-10
            h-[68px]
            px-10
            rounded-[24px]
            bg-white
            text-black
            font-black
            text-lg
            transition-all
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >

          Return Home

        </button>

      </div>

    </main>
  )
}

