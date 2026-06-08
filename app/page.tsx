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
  const { t } = useLanguage()

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

  const current = panels[active]

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
          bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.10),transparent_40%)]
        " />

        <section className="
          nexus-container
          relative
          z-10
          min-h-screen
          px-4
          pt-24
          pb-8
          sm:px-6
          sm:pt-28
          lg:px-8
          lg:pt-32
        ">
          <div className="
            mx-auto
            flex
            w-full
            max-w-[1280px]
            flex-col
            gap-4
            lg:flex-row
            lg:items-stretch
          ">
            <aside className="
              w-full
              shrink-0
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-3
              backdrop-blur-2xl
              lg:w-[200px]
            ">
              <div className="
                rounded-xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                p-4
              ">
                <img
                  src="/logo.png"
                  alt="NexusNON.ID"
                  className="
                    mx-auto
                    h-20
                    w-20
                    object-contain
                    drop-shadow-[0_0_40px_rgba(0,255,255,0.55)]
                    lg:h-24
                    lg:w-24
                  "
                />

                <h3 className="
                  mt-3
                  text-center
                  text-sm
                  font-bold
                  tracking-[-0.02em]
                  text-white
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
                          min-h-[42px]
                          rounded-xl
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
                          font-bold
                          uppercase
                          leading-tight
                          sm:text-xs
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
                gap-2
              ">
                <Link
                  href="/connect"
                  className="
                    nexus-primary
                    w-full
                    px-4
                    text-center
                    text-xs
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
                    text-xs
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
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-5
              backdrop-blur-2xl
              sm:p-6
              lg:p-8
            ">
              <div className="
                absolute
                right-[-160px]
                top-[-160px]
                h-[360px]
                w-[360px]
                rounded-full
                bg-cyan-400/10
                blur-[140px]
              " />

              <div className="
                relative
                z-10
              ">
                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-cyan-300
                ">
                  {t("home.badge")}
                </p>

                <h1 className="
                  mt-4
                  text-4xl
                  font-black
                  leading-none
                  tracking-[-0.05em]
                  sm:text-5xl
                  xl:text-6xl
                ">
                  {t("home.title")}
                </h1>

                <h2 className="
                  mt-5
                  max-w-[850px]
                  text-2xl
                  font-black
                  leading-tight
                  tracking-[-0.04em]
                  text-cyan-100
                  sm:text-3xl
                  xl:text-4xl
                ">
                  {current.title}
                </h2>

                <p className="
                  mt-4
                  max-w-[760px]
                  text-sm
                  font-semibold
                  leading-6
                  text-white/75
                  sm:text-base
                ">
                  {current.subtitle}
                </p>

                <p className="
                  mt-4
                  max-w-[760px]
                  text-sm
                  leading-6
                  text-zinc-400
                  sm:text-base
                  sm:leading-7
                ">
                  {current.text}
                </p>

                <div className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-3
                  md:grid-cols-3
                ">
                  {current.points.map(
                    (point, index) => (
                      <div
                        key={point}
                        className="
                          rounded-xl
                          border
                          border-white/10
                          bg-black/20
                          p-4
                          backdrop-blur-xl
                        "
                      >
                        <p className="
                          text-xs
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
                        ">
                          {point}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="
                  mt-6
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
                      px-6
                      text-center
                      text-xs
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
                      px-6
                      text-center
                      text-xs
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