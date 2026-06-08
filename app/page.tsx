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
        overflow-x-hidden
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
          px-4
          pt-28
          pb-8
          sm:px-6
          sm:pt-32
          lg:px-8
          lg:pt-40
        ">
          <div className="
            flex
            w-full
            flex-col
            gap-4
            sm:gap-6
            lg:flex-row
            lg:items-stretch
          ">
            <aside className="
              w-full
              shrink-0
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.035]
              p-3
              backdrop-blur-3xl
              sm:p-4
              lg:w-[240px]
              xl:w-[260px]
            ">
              <div className="
                rounded-[24px]
                border
                border-cyan-400/20
                bg-cyan-400/10
                p-4
                sm:p-5
              ">
                <img
                  src="/logo.png"
                  alt="NexusNON.ID"
                  className="
                    mx-auto
                    h-24
                    w-24
                    object-contain
                    drop-shadow-[0_0_90px_rgba(0,255,255,0.75)]
                    sm:h-28
                    sm:w-28
                    lg:h-32
                    lg:w-32
                    lg:scale-125
                  "
                />

                <h3 className="
                  mt-4
                  text-center
                  text-base
                  font-black
                  tracking-[-0.04em]
                  text-white
                  sm:text-lg
                ">
                  {t("home.menu.layers")}
                </h3>
              </div>

              <div className="
                mt-4
                grid
                grid-cols-2
                gap-2
                lg:grid-cols-1
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
                          min-h-[54px]
                          rounded-[18px]
                          border
                          px-3
                          text-center
                          transition
                          active:scale-[0.98]
                          lg:text-left

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
                          sm:text-xs
                          lg:text-sm
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
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:grid-cols-1
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
              w-full
              min-w-0
              flex-1
              overflow-hidden
              rounded-[28px]
              border
              border-white/10
              bg-white/[0.035]
              p-5
              backdrop-blur-3xl
              sm:rounded-[36px]
              sm:p-8
              lg:rounded-[44px]
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
                  tracking-[0.22em]
                  text-cyan-300
                  sm:text-xs
                  sm:tracking-[0.35em]
                ">
                  {t("home.badge")}
                </p>

                <h1 className="
                  mt-5
                  text-[clamp(2.3rem,11vw,7rem)]
                  font-black
                  leading-[0.9]
                  tracking-[-0.08em]
                ">
                  {t("home.title")}
                </h1>

                <h2 className="
                  mt-7
                  max-w-[840px]
                  text-[clamp(1.7rem,7vw,4.5rem)]
                  font-black
                  leading-[0.98]
                  tracking-[-0.06em]
                  text-cyan-100
                ">
                  {current.title}
                </h2>

                <p className="
                  mt-4
                  max-w-[820px]
                  text-sm
                  font-semibold
                  leading-7
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
                  md:grid-cols-3
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
                      text-center
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
                      text-center
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