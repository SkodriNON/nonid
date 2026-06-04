"use client"

import { useState } from "react"
import Link from "next/link"

import NexusHeader from "@/components/layout/NexusHeader"

import {
  useLanguage
} from "@/components/LanguageSystem"

type Panel =
  | "vision"
  | "architecture"
  | "security"
  | "roadmap"

export default function Page() {

  const { t } =
    useLanguage()

  const [active, setActive] =
    useState<Panel>("vision")

  const panels = {
    vision: {
      menu: t("home.menu.vision"),
      title: t("home.vision.title"),
      subtitle: t("home.vision.subtitle"),
      text: t("home.vision.text"),
      points: [
        t("home.point.ownership"),
        t("home.point.capsule"),
        t("home.point.contract")
      ]
    },

    architecture: {
      menu: t("home.menu.architecture"),
      title: t("home.architecture.title"),
      subtitle: t("home.architecture.subtitle"),
      text: t("home.architecture.text"),
      points: [
        t("home.point.oneWallet"),
        t("home.point.verification"),
        t("home.point.dashboard")
      ]
    },

    security: {
      menu: t("home.menu.security"),
      title: t("home.security.title"),
      subtitle: t("home.security.subtitle"),
      text: t("home.security.text"),
      points: [
        t("home.point.noLocal"),
        t("home.point.noDatabase"),
        t("home.point.noFake")
      ]
    },

    roadmap: {
      menu: t("home.menu.roadmap"),
      title: t("home.roadmap.title"),
      subtitle: t("home.roadmap.subtitle"),
      text: t("home.roadmap.text"),
      points: [
        t("home.point.phase1"),
        t("home.point.phase2"),
        t("home.point.phase3")
      ]
    }
  }

  const current =
    panels[active]

  return (
    <>
      <NexusHeader />

      <main className="
        nexus-page
        min-h-screen
        overflow-hidden
        text-white
      ">

        <div className="
          pointer-events-none
          fixed
          inset-0
          bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.15),transparent_42%)]
        " />

        <section className="
          nexus-container
          relative
          z-10
          min-h-screen
          pt-32
          pb-10
          sm:pt-36
          lg:pt-40
        ">

          <div className="
            flex
            w-full
            items-stretch
            gap-4
            sm:gap-6
          ">

            <aside className="
              w-[92px]
              shrink-0
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.035]
              p-3
              backdrop-blur-3xl
              sm:w-[180px]
              lg:w-[240px]
              xl:w-[260px]
            ">

              <div className="
                hidden
                overflow-visible
                rounded-[24px]
                border
                border-cyan-400/20
                bg-cyan-400/10
                p-5
                sm:block
              ">

                <img
                  src="/logo.png"
                  alt="NexusNON.ID"
                  className="
                    mx-auto
                    h-32
                    w-32
                    scale-150
                    object-contain
                    drop-shadow-[0_0_120px_rgba(0,255,255,0.9)]
                  "
                />

                <h3 className="
                  mt-5
                  text-center
                  text-lg
                  font-black
                  tracking-[-0.04em]
                  text-white
                ">
                  {t("home.menu.layers")}
                </h3>

              </div>

              <div className="
                grid
                gap-2
                sm:mt-4
              ">

                {(Object.keys(panels) as Panel[]).map(
                  (key) => {

                    const isActive =
                      active === key

                    return (

                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setActive(key)
                        }
                        className={`
                          min-h-[56px]
                          rounded-[20px]
                          border
                          px-2
                          text-center
                          transition
                          active:scale-[0.98]
                          sm:px-4
                          sm:text-left

                          ${
                            isActive
                              ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                              : "border-white/10 bg-black/20 text-white hover:bg-white/[0.05]"
                          }
                        `}
                      >

                        <span className="
                          block
                          text-[10px]
                          font-black
                          uppercase
                          leading-tight
                          sm:text-sm
                        ">
                          {panels[key].menu}
                        </span>

                      </button>
                    )
                  }
                )}

              </div>

              <div className="
                mt-4
                hidden
                gap-3
                sm:grid
              ">

                <Link
                  href="/connect"
                  className="
                    nexus-primary
                    w-full
                    px-4
                    text-center
                  "
                >
                  {t("nav.enter")}
                </Link>

                <Link
                  href="/dashboard"
                  className="
                    nexus-secondary
                    w-full
                    px-4
                    text-center
                  "
                >
                  {t("nav.dashboard")}
                </Link>

              </div>

            </aside>

            <section className="
              relative
              min-w-0
              flex-1
              overflow-hidden
              rounded-[34px]
              border
              border-white/10
              bg-white/[0.035]
              p-5
              backdrop-blur-3xl
              sm:rounded-[44px]
              sm:p-8
              lg:p-14
            ">

              <div className="
                absolute
                right-[-180px]
                top-[-180px]
                h-[420px]
                w-[420px]
                rounded-full
                bg-cyan-400/10
                blur-[170px]
              " />

              <div className="
                relative
                z-10
              ">

                <p className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-cyan-300
                  sm:text-xs
                  sm:tracking-[0.35em]
                ">
                  {t("home.badge")}
                </p>

                <h1 className="
                  mt-5
                  text-[clamp(2.4rem,8vw,7rem)]
                  font-black
                  leading-[0.88]
                  tracking-[-0.08em]
                ">
                  {t("home.title")}
                </h1>

                <h2 className="
                  mt-7
                  max-w-[840px]
                  text-[clamp(1.8rem,5vw,4.5rem)]
                  font-black
                  leading-[0.95]
                  tracking-[-0.06em]
                  text-cyan-100
                ">
                  {current.title}
                </h2>

                <p className="
                  mt-4
                  max-w-[820px]
                  text-base
                  font-semibold
                  text-white/75
                  sm:text-lg
                ">
                  {current.subtitle}
                </p>

                <p className="
                  mt-6
                  max-w-[820px]
                  text-sm
                  leading-7
                  text-zinc-400
                  sm:text-lg
                  sm:leading-8
                ">
                  {current.text}
                </p>

                <div className="
                  mt-8
                  grid
                  grid-cols-1
                  gap-4
                  lg:grid-cols-3
                ">

                  {current.points.map(
                    (point, index) => (

                      <div
                        key={point}
                        className="
                          rounded-[24px]
                          border
                          border-white/10
                          bg-black/20
                          p-4
                          backdrop-blur-xl
                          sm:rounded-[28px]
                          sm:p-5
                        "
                      >

                        <p className="
                          text-sm
                          font-black
                          text-cyan-300
                        ">
                          0{index + 1}
                        </p>

                        <p className="
                          mt-3
                          text-sm
                          leading-6
                          text-zinc-300
                          sm:mt-4
                          sm:leading-7
                        ">
                          {point}
                        </p>

                      </div>
                    )
                  )}

                </div>

                <div className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                ">

                  <Link
                    href="/connect"
                    className="
                      nexus-primary
                      w-full
                      px-8
                      sm:w-auto
                    "
                  >
                    {t("home.cta.enter")}
                  </Link>

                  <Link
                    href="/gateway"
                    className="
                      nexus-secondary
                      w-full
                      px-8
                      sm:w-auto
                    "
                  >
                    {t("home.cta.create")}
                  </Link>

                </div>

              </div>

            </section>

          </div>

        </section>

      </main>
    </>
  )
}