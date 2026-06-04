"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  LanguageSelector,
  useLanguage
} from "@/components/LanguageSystem"

export default function NexusHeader() {

  const pathname =
    usePathname()

  const { t } =
    useLanguage()

  function active(
    path: string
  ) {

    return pathname === path
  }

  return (

    <header className="
      fixed
      left-0
      right-0
      top-0
      z-[9999]
      safe-top
      px-3
      pt-3
      sm:px-6
      lg:px-10
    ">

      <div className="
        nexus-glass
        mx-auto
        flex
        h-[72px]
        max-w-[1500px]
        items-center
        justify-between
        gap-3
        rounded-[26px]
        px-3
        sm:px-5
      ">

        <Link
          href="/"
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          <img
            src="/logo.png"
            alt="NexusNON.ID"
            className="
              h-10
              w-10
              shrink-0
              object-contain
              drop-shadow-[0_0_30px_rgba(0,255,255,0.25)]
            "
          />

          <div className="min-w-0">

            <div className="
              truncate
              text-sm
              font-black
              tracking-[-0.03em]
            ">
              NexusNON.ID
            </div>

            <div className="
              hidden
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-cyan-300
              sm:block
            ">
              Sovereign Identity Layer
            </div>

          </div>

        </Link>

        <nav className="
          hidden
          items-center
          gap-2
          lg:flex
        ">

          <NavItem
            href="/"
            label={t("nav.home")}
            active={active("/")}
          />

          <NavItem
            href="/connect"
            label={t("nav.connect")}
            active={active("/connect")}
          />

          <NavItem
            href="/gateway"
            label={t("nav.gateway")}
            active={active("/gateway")}
          />

          <NavItem
            href="/dashboard"
            label={t("nav.dashboard")}
            active={active("/dashboard")}
          />

        </nav>

        <div className="
          flex
          items-center
          gap-2
        ">

          <div className="
            hidden
            rounded-full
            border
            border-cyan-400/20
            bg-cyan-400/10
            px-4
            py-2
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-cyan-300
            md:block
          ">
            {t("nav.phase")}
          </div>

          <LanguageSelector />

          <Link
            href="/connect"
            className="
              nexus-primary
              hidden
              px-5
              text-[11px]
              sm:inline-flex
            "
          >
            {t("nav.enter")}
          </Link>

        </div>

      </div>

    </header>
  )
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {

  return (

    <Link
      href={href}
      className={`
        rounded-full
        px-4
        py-2
        text-xs
        font-bold
        uppercase
        tracking-[0.14em]
        transition

        ${
          active
            ? `
              border
              border-cyan-400/20
              bg-cyan-400/10
              text-cyan-300
            `
            : `
              text-zinc-400
              hover:bg-white/[0.05]
              hover:text-white
            `
        }
      `}
    >
      {label}
    </Link>
  )
}