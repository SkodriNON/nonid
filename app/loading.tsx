"use client"

export default function Loading() {

return (

<main className="
  relative
  min-h-screen
  overflow-hidden
  bg-[#030712]
  text-white
  flex
  items-center
  justify-center
  px-6
">

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
      w-[1000px]
      h-[1000px]
      rounded-full
      bg-cyan-500/10
      blur-[220px]
    "/>

    <div className="
      absolute
      bottom-[-25%]
      right-[-10%]
      w-[800px]
      h-[800px]
      rounded-full
      bg-violet-500/10
      blur-[220px]
    "/>

  </div>

  <div className="
    relative
    z-10
    flex
    flex-col
    items-center
    text-center
  ">

    <div className="
      relative
      flex
      items-center
      justify-center
    ">

      <div className="
        absolute
        w-[220px]
        h-[220px]
        rounded-full
        bg-cyan-400/10
        blur-[70px]
        animate-pulse
      "/>

      <div className="
        relative
        w-[120px]
        h-[120px]
        rounded-[36px]
        border
        border-cyan-400/20
        bg-white/[0.04]
        backdrop-blur-3xl
        flex
        items-center
        justify-center
        shadow-2xl
      ">

        <span className="
          text-6xl
          font-black
          text-cyan-300
        ">
          Ω
        </span>

      </div>

    </div>

    <div className="mt-10">

      <div className="
        text-cyan-400
        text-xs
        uppercase
        tracking-[0.4em]
      ">
        Nexus Constitutional Network
      </div>

      <h1 className="
        mt-4
        text-[42px]
        sm:text-[60px]
        lg:text-[80px]
        font-black
        tracking-tight
        leading-none
      ">
        NexusnOn.ID
      </h1>

      <p className="
        mt-5
        text-zinc-400
        text-sm
        sm:text-base
        leading-relaxed
        max-w-[620px]
      ">
        Initializing sovereign capsule session,
        validating constitutional identity
        infrastructure and synchronizing
        blockchain state.
      </p>

    </div>

    <div className="
      mt-12
      w-[260px]
      sm:w-[360px]
      h-[8px]
      rounded-full
      bg-white/[0.05]
      overflow-hidden
    ">

      <div className="
        h-full
        w-[45%]
        rounded-full
        bg-gradient-to-r
        from-cyan-400
        to-violet-400
        animate-pulse
      "/>

    </div>

    <div className="
      mt-6
      text-[11px]
      uppercase
      tracking-[0.25em]
      text-zinc-500
    ">
      Arbitrum Infrastructure
    </div>

  </div>

</main>


)
}
