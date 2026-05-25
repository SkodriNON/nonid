
"use client"

import Image from "next/image"
import Link from "next/link"

import {
  usePrivy
} from "@privy-io/react-auth"



import {
  useEffect,
  useState
} from "react"

import AIChat
from "../components/AIChat"

export default function Home() {

  const [
    assistant,
    setAssistant
  ] = useState<
    "NΩNI" | "NΩNA"
  >("NΩNI")

  const [
    language,
    setLanguage
  ] = useState("en")

  useEffect(() => {

    if (
      typeof window ===
      "undefined"
    ) return

    const savedLanguage =
      localStorage.getItem(
        "nexus_language"
      )

    if (savedLanguage) {

      setLanguage(
        savedLanguage
      )
    }

  }, [])

 
const translations: any = {

  en: {

    start:
      "Start Identity",

    dashboard:
      "Dashboard",

    subtitle:
      "Universal sovereign identity infrastructure."
  },

  sq: {

    start:
      "Fillo Identitetin",

    dashboard:
      "Paneli",

    subtitle:
      "Infrastrukturë sovrane universale identiteti."
  },

  sv: {

    start:
      "Starta Identitet",

    dashboard:
      "Kontrollpanel",

    subtitle:
      "Universell suverän identitetsinfrastruktur."
  },

  de: {

    start:
      "Identität Starten",

    dashboard:
      "Dashboard",

    subtitle:
      "Universelle souveräne Identitätsinfrastruktur."
  },

  fr: {

    start:
      "Démarrer l'identité",

    dashboard:
      "Tableau de bord",

    subtitle:
      "Infrastructure universelle d'identité souveraine."
  },

  es: {

    start:
      "Iniciar Identidad",

    dashboard:
      "Panel",

    subtitle:
      "Infraestructura universal de identidad soberana."
  },

  it: {

    start:
      "Avvia Identità",

    dashboard:
      "Dashboard",

    subtitle:
      "Infrastruttura universale di identità sovrana."
  },

  tr: {

    start:
      "Kimliği Başlat",

    dashboard:
      "Panel",

    subtitle:
      "Evrensel egemen kimlik altyapısı."
  },

  ar: {

    start:
      "ابدأ الهوية",

    dashboard:
      "لوحة التحكم",

    subtitle:
      "بنية تحتية عالمية للهوية السيادية."
  },

  ru: {

    start:
      "Начать идентификацию",

    dashboard:
      "Панель",

    subtitle:
      "Универсальная инфраструктура суверенной идентичности."
  },

  zh: {

    start:
      "开始身份",

    dashboard:
      "控制面板",

    subtitle:
      "全球主权身份基础设施。"
  },

  ja: {

    start:
      "IDを開始",

    dashboard:
      "ダッシュボード",

    subtitle:
      "ユニバーサル主権IDインフラ。"
  },

  ko: {

    start:
      "신원 시작",

    dashboard:
      "대시보드",

    subtitle:
      "범용 주권 신원 인프라."
  }
}


const {

  login,

  authenticated,

  user

} = usePrivy()


  const t =

    translations[language]

    || translations.en

  return (

    <main className="
      relative
      min-h-screen
      overflow-hidden
      flex
      items-center
      justify-center
      px-4
      py-6
      bg-black
    ">

      {/* BACKGROUND */}

      <div className="
        absolute
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

      {/* LANGUAGE */}

      <div className="
        absolute
        top-4
        right-4
        z-50
      ">

        <select

          value={language}

          onChange={(e)=>{

            setLanguage(
              e.target.value
            )

            localStorage.setItem(

              "nexus_language",

              e.target.value
            )
          }}

          className="
            h-[42px]
            w-[150px]
            rounded-[14px]
            border
            border-white/10
            bg-black/60
            px-3
            text-sm
            text-white
            backdrop-blur-xl
            outline-none
          "
        >
<option value="en">
  🇺🇸 English
</option>

<option value="sq">
  🇦🇱 Shqip
</option>

<option value="sv">
  🇸🇪 Svenska
</option>

<option value="de">
  🇩🇪 Deutsch
</option>

<option value="fr">
  🇫🇷 Français
</option>

<option value="es">
  🇪🇸 Español
</option>

<option value="it">
  🇮🇹 Italiano
</option>

<option value="tr">
  🇹🇷 Türkçe
</option>

<option value="ar">
  🇸🇦 العربية
</option>

<option value="ru">
  🇷🇺 Русский
</option>

<option value="zh">
  🇨🇳 中文
</option>

<option value="ja">
  🇯🇵 日本語
</option>

<option value="ko">
  🇰🇷 한국어
</option>



        </select>

      </div>

      {/* MAIN CARD */}

      <div className="
        relative
        w-full
        max-w-[1180px]
        rounded-[32px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-3xl
        overflow-hidden
        shadow-2xl
      ">

        <div className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%)]
        "/>

        <div className="
          relative
          z-10
          flex
          flex-col
          items-center
          px-5
          sm:px-8
          py-8
        ">

          {/* LOGO */}

          <Image
            src="/logo.png"
            alt="NexusnΩn.id"
            width={900}
            height={900}
            priority
            className="
              w-[150px]
              sm:w-[190px]
              lg:w-[240px]
              object-contain
              drop-shadow-[0_0_30px_rgba(59,130,246,0.35)]
            "
          />

          {/* TITLE */}

          <h1 className="
            mt-3
            text-center
            text-[30px]
            sm:text-[46px]
            lg:text-[62px]
            font-black
            leading-none
            tracking-tight
          ">

            NexusnΩn.id

          </h1>

          {/* SUBTITLE */}

          <div className="
            mt-4
            max-w-[620px]
            text-center
            text-zinc-400
            text-sm
            sm:text-base
            leading-relaxed
          ">

            {t.subtitle}

          </div>

          {/* ASSISTANTS */}

          <div className="
            mt-7
            flex
            items-center
            gap-4
            justify-center
            flex-wrap
          ">

            <button

              onClick={()=>
                setAssistant(
                  "NΩNA"
                )
              }

              className={`
                relative
                w-[130px]
                h-[165px]
                rounded-[24px]
                border
                transition-all
                duration-300
                overflow-hidden

                ${
                  assistant === "NΩNA"

                  ? `
                    border-pink-500/50
                    bg-pink-500/10
                  `

                  : `
                    border-white/10
                    bg-white/[0.03]
                  `
                }
              `}
            >

              <div className="
                absolute
                inset-0
                bg-gradient-to-b
                from-pink-500/10
                to-transparent
              "/>

              <div className="
                relative
                z-10
                flex
                flex-col
                items-center
                justify-center
                h-full
              ">

                <Image
                  src="/nona.png"
                  alt="NΩNA"
                  width={500}
                  height={500}
                  className="
                    w-[70px]
                    object-contain
                  "
                />

                <div className="
                  mt-3
                  text-xl
                  font-black
                ">

                  NΩNA

                </div>

              </div>

            </button>

            <button

              onClick={()=>
                setAssistant(
                  "NΩNI"
                )
              }

              className={`
                relative
                w-[130px]
                h-[165px]
                rounded-[24px]
                border
                transition-all
                duration-300
                overflow-hidden

                ${
                  assistant === "NΩNI"

                  ? `
                    border-cyan-500/50
                    bg-cyan-500/10
                  `

                  : `
                    border-white/10
                    bg-white/[0.03]
                  `
                }
              `}
            >

              <div className="
                absolute
                inset-0
                bg-gradient-to-b
                from-cyan-500/10
                to-transparent
              "/>

              <div className="
                relative
                z-10
                flex
                flex-col
                items-center
                justify-center
                h-full
              ">

                <Image
                  src="/non.png"
                  alt="NΩNI"
                  width={500}
                  height={500}
                  className="
                    w-[70px]
                    object-contain
                  "
                />

                <div className="
                  mt-3
                  text-xl
                  font-black
                ">

                  NΩNI

                </div>

              </div>

            </button>

          </div>

          {/* ACTIONS */}

          <div className="
            mt-7
            w-full
            max-w-[420px]
            flex
            flex-col
            gap-3
          ">

            <Link
              href="/register"
              className="
                h-[58px]
                rounded-[20px]
                bg-white
                text-black
                font-black
                text-base
                flex
                items-center
                justify-center
                transition-all
                hover:scale-[1.01]
              "
            >

              {t.start}

            </Link>

            <Link
              href="/dashboard"
              className="
                h-[58px]
                rounded-[20px]
                border
                border-white/10
                bg-white/[0.04]
                text-white
                font-black
                text-base
                flex
                items-center
                justify-center
              "
            >

              {t.dashboard}

            </Link>

          </div>

          {/* AI CHAT */}

          <div className="
            mt-7
            w-full
            max-h-[420px]
            overflow-hidden
          ">

            <AIChat

            // import AIChat from "./components/AIChat"
              assistant={assistant}
            />

          </div>

        </div>

      </div>

<div className="
  fixed
  bottom-8
  right-8
  z-50
">

  <button

    onClick={login}

    className="
      px-8
      py-4
      rounded-2xl
      bg-cyan-400
      text-black
      font-black
      shadow-2xl
      shadow-cyan-500/30
    "
  >

    {

      authenticated

      ? "CONNECTED 😄🔥"

      : "Connect Nexus ID"

    }

  </button>

</div>


    </main>
  )
}

