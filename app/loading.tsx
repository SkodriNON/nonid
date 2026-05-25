
export default function Loading() {

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

      {/* CONTENT */}

      <div className="
        relative
        z-10
        flex
        flex-col
        items-center
        text-center
      ">

        {/* LOGO */}

        <div className="
          relative
          flex
          items-center
          justify-center
        ">

          <div className="
            absolute
            w-[180px]
            h-[180px]
            rounded-full
            bg-cyan-500/10
            blur-[50px]
            animate-pulse
          "/>

          <div className="
            relative
            w-[110px]
            h-[110px]
            rounded-[34px]
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-3xl
            flex
            items-center
            justify-center
            text-5xl
            font-black
            shadow-2xl
          ">

            Ω

          </div>

        </div>

        {/* TITLE */}

        <h1 className="
          mt-10
          text-[38px]
          sm:text-[56px]
          lg:text-[72px]
          font-black
          tracking-tight
          leading-none
        ">

          NexusnΩn.id

        </h1>

        {/* SUBTITLE */}

        <p className="
          mt-5
          text-zinc-400
          text-sm
          sm:text-base
          leading-relaxed
          max-w-[520px]
        ">

          Initializing sovereign identity session...

        </p>

        {/* LOADING BAR */}

        <div className="
          mt-10
          w-[240px]
          sm:w-[320px]
          h-[6px]
          rounded-full
          bg-white/[0.06]
          overflow-hidden
        ">

          <div className="
            h-full
            w-[40%]
            rounded-full
            bg-cyan-400
            animate-pulse
          "/>

        </div>

      </div>

    </main>
  )
}

