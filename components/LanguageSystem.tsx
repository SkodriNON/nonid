"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

export const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "sq", label: "Shqip", flag: "🇦🇱" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "sr", label: "Srpski", flag: "🇷🇸" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
] as const

export type LanguageCode =
  typeof languages[number]["code"]

const en = {
  "nav.home": "Home",
  "nav.connect": "Connect",
  "nav.gateway": "Gateway",
  "nav.dashboard": "Dashboard",
  "nav.enter": "Enter",
  "nav.phase": "Phase 1",

  "home.badge": "Sovereign Constitutional Identity",
  "home.title": "NexusNON.ID",
  "home.menu.layers": "Identity Layers",
  "home.menu.vision": "Vision",
  "home.menu.architecture": "Architecture",
  "home.menu.security": "Security",
  "home.menu.roadmap": "Roadmap",

  "home.vision.title": "Sovereign Identity Infrastructure",
  "home.vision.subtitle": "Digital existence begins from ownership.",
  "home.vision.text": "NexusNON.ID is a sovereign digital identity infrastructure where the NFT Identity Capsule is the identity. It is not a normal login system, but a constitutional layer for digital existence.",

  "home.architecture.title": "NFT Capsule Architecture",
  "home.architecture.subtitle": "One wallet. One sovereign Capsule.",
  "home.architecture.text": "Each wallet can create only one Capsule. The wallet is controlled by MetaMask, the Capsule is verified through walletToCapsule, and identity is read from the contract.",

  "home.security.title": "No Identity Storage",
  "home.security.subtitle": "Browser storage is not identity authority.",
  "home.security.text": "Identity is not stored in localStorage, not stored in a database, and not controlled by a centralized system. The browser is not the source of truth.",

  "home.roadmap.title": "Phase 1 → Mainnet",
  "home.roadmap.subtitle": "Clean Phase 1 before PUP/NON session.",
  "home.roadmap.text": "Phase 1 focuses on MetaMask login, NFT minting, Identity Capsule, Dashboard, Privacy Settings, OTP, and mainnet preparation. PUP/NON session comes later.",

  "home.point.ownership": "Identity begins from ownership, not from accounts.",
  "home.point.capsule": "The NFT Identity Capsule is the sovereign digital root.",
  "home.point.contract": "The contract is the source of truth.",
  "home.point.oneWallet": "One wallet creates one Capsule.",
  "home.point.verification": "Capsule verification comes from the smart contract.",
  "home.point.dashboard": "Dashboard reads real on-chain identity state.",
  "home.point.noLocal": "No localStorage identity.",
  "home.point.noDatabase": "No database identity authority.",
  "home.point.noFake": "No fake biometric or fake encrypted storage.",
  "home.point.phase1": "Phase 1: Sovereign Capsule foundation.",
  "home.point.phase2": "Phase 2: PUP/NON session layer.",
  "home.point.phase3": "Phase 3: AI and internal sovereign economy.",

  "home.cta.enter": "Enter NexusNON.ID",
  "home.cta.create": "Create Capsule",

  "wallet.title": "Connect Wallet",
  "wallet.description": "Connect your wallet to begin creating or accessing your sovereign identity.",
  "wallet.connect": "Connect Wallet",
  "wallet.connecting": "Connecting...",
  "wallet.continue": "Continue Nexus Session",
  "wallet.create": "Create Sovereign Identity",
  "wallet.rule": "NFT Identity Capsule is the identity. No identity is stored in localStorage or database.",
  "wallet.label.wallet": "Wallet",
  "wallet.status.idle": "Connect your wallet to begin.",
  "wallet.status.metamaskMissing": "MetaMask is not installed.",
  "wallet.status.switching": "Switching to Arbitrum Sepolia...",
  "wallet.status.connecting": "Connecting MetaMask...",
  "wallet.status.checking": "Checking Identity Capsule on-chain...",
  "wallet.status.found": "Identity Capsule found.",
  "wallet.status.missing": "No Identity Capsule found.",
  "wallet.status.wrongNetwork": "Please switch to Arbitrum Sepolia.",
  "wallet.status.failed": "Connection failed. Please try again.",
  "wallet.error.capsuleCheck": "Could not check Identity Capsule from contract.",
  "wallet.error.connection": "Wallet connection failed.",

  "gateway.email": "EMAIL ADDRESS",
  "gateway.email.placeholder": "identity",
  "gateway.phone": "PHONE NUMBER",
  "gateway.password": "CAPSULE PASSWORD",
  "gateway.password.placeholder": "Create capsule password",
  "gateway.otp": "VERIFICATION CODE",
  "gateway.sendOtp": "Send OTP",
  "gateway.sending": "Sending...",
  "gateway.otpSent": "OTP Sent ✓",
  "gateway.activate": "Activate Identity Capsule",
  "gateway.session": "Continue With Nexus Session",
  "gateway.security": "Sovereign Identity Security",
  "gateway.securityText": "Session protected constitutional identity infrastructure with encrypted sovereign verification.",
  "gateway.footer1": "Nexus Constitutional Identity Layer",
  "gateway.footer2": "Arbitrum Infrastructure",
  "gateway.success.title": "Identity Activated",
  "gateway.success.text": "Your Nexus Capsule has been minted or verified successfully through sovereign constitutional infrastructure.",
  "gateway.success.continue": "Continue To Dashboard",
  "gateway.error.metamask": "MetaMask not found",
  "gateway.error.phoneRequired": "Phone number required",
  "gateway.error.otpSend": "Failed to send OTP",
  "gateway.error.network": "Switch to Arbitrum Sepolia",
  "gateway.error.emailPhone": "Email and phone required",
  "gateway.error.password": "Capsule password required",
  "gateway.error.mintConfirmedMissing": "Mint confirmed but capsule not found",
  "gateway.error.noCapsule": "No Identity Capsule found for this wallet.",
  "gateway.error.session": "Session verification failed",
  "gateway.error.otpLength": "Please enter 6 digit OTP",
  "gateway.error.otpInvalid": "Invalid OTP",
  "gateway.error.activation": "Identity activation failed",

  "dashboard.title": "Sovereign Dashboard",
  "dashboard.subtitle": "Your NFT Identity Capsule is verified directly from the smart contract.",
  "dashboard.wallet": "Wallet",
  "dashboard.capsule": "Identity Capsule",
  "dashboard.tokenId": "Token ID",
  "dashboard.contract": "Contract Source of Truth",
  "dashboard.status": "Status",
  "dashboard.active": "Active",
  "dashboard.privacy": "Privacy Settings",
  "dashboard.refresh": "Refresh Capsule",
  "dashboard.logout": "Exit Dashboard",
  "dashboard.loading": "Loading dashboard...",
  "dashboard.noCapsule": "No Identity Capsule found.",
  "dashboard.error": "Dashboard verification failed.",
  "dashboard.created": "Created",
  "dashboard.updated": "Updated",
  "dashboard.network": "Network",
  "dashboard.owner": "Owner",
  "dashboard.identity": "Identity",
  "dashboard.verified": "Verified",
  "dashboard.notVerified": "Not verified",
  "dashboard.source": "Smart Contract Source",
  "dashboard.rule": "NFT Identity Capsule is the identity. Contract is the source of truth.",

  "common.loading": "Loading...",
  "common.success": "Success",
  "common.error": "Error",
  "common.cancel": "Cancel",
  "common.continue": "Continue",
} as const

export type TranslationKey =
  keyof typeof en

const translations: Record<
  LanguageCode,
  Partial<Record<TranslationKey, string>>
> = {
  en,

  sq: {
    ...en,
    "nav.home": "Ballina",
    "nav.connect": "Lidhu",
    "nav.gateway": "Gateway",
    "nav.dashboard": "Paneli",
    "nav.enter": "Hyr",
    "nav.phase": "Faza 1",

    "home.badge": "Identitet Kushtetues Sovran",
    "home.menu.layers": "Shtresat e Identitetit",
    "home.menu.vision": "Vizioni",
    "home.menu.architecture": "Arkitektura",
    "home.menu.security": "Siguria",
    "home.menu.roadmap": "Roadmap",

    "home.vision.title": "Infrastrukturë Sovrane Identiteti",
    "home.vision.subtitle": "Ekzistenca dixhitale fillon nga pronësia.",
    "home.vision.text": "NexusNON.ID është infrastrukturë sovrane identiteti dixhital ku NFT Identity Capsule është identiteti. Nuk është login i zakonshëm, por shtresë kushtetuese për ekzistencë dixhitale.",

    "home.architecture.title": "Arkitekturë NFT Capsule",
    "home.architecture.subtitle": "Një wallet. Një Capsule sovrane.",
    "home.architecture.text": "Çdo wallet mund të krijojë vetëm një Capsule. Wallet kontrollohet nga MetaMask, Capsule verifikohet me walletToCapsule, dhe identiteti merret nga kontrata.",

    "home.security.title": "Pa Ruajtje Identiteti",
    "home.security.subtitle": "Browser storage nuk është autoritet identiteti.",
    "home.security.text": "Identiteti nuk ruhet në localStorage, nuk ruhet në database dhe nuk kontrollohet nga sistem i centralizuar. Browser-i nuk është burimi i së vërtetës.",

    "home.roadmap.title": "Faza 1 → Mainnet",
    "home.roadmap.subtitle": "Faza 1 e pastër para PUP/NON session.",
    "home.roadmap.text": "Faza 1 fokusohet te MetaMask login, NFT mint, Identity Capsule, Dashboard, Privacy Settings, OTP dhe përgatitja për mainnet. PUP/NON session ndërtohet më vonë.",

    "home.point.ownership": "Identiteti fillon nga pronësia, jo nga llogaritë.",
    "home.point.capsule": "NFT Identity Capsule është rrënja sovrane dixhitale.",
    "home.point.contract": "Kontrata është burimi i së vërtetës.",
    "home.point.oneWallet": "Një wallet krijon një Capsule.",
    "home.point.verification": "Verifikimi i Capsule vjen nga smart contract.",
    "home.point.dashboard": "Dashboard lexon gjendjen reale on-chain.",
    "home.point.noLocal": "Pa localStorage identity.",
    "home.point.noDatabase": "Pa autoritet identiteti në database.",
    "home.point.noFake": "Pa biometrikë false ose storage false.",
    "home.point.phase1": "Faza 1: themeli sovran i Capsule.",
    "home.point.phase2": "Faza 2: PUP/NON session layer.",
    "home.point.phase3": "Faza 3: AI dhe ekonomi e brendshme sovrane.",

    "home.cta.enter": "Hyr në NexusNON.ID",
    "home.cta.create": "Krijo Capsule",

    "wallet.title": "Lidh Wallet",
    "wallet.description": "Lidhe wallet-in për të krijuar ose hyrë në identitetin tënd sovran.",
    "wallet.connect": "Lidh Wallet",
    "wallet.connecting": "Duke u lidhur...",
    "wallet.continue": "Vazhdo Nexus Session",
    "wallet.create": "Krijo Identitet Sovran",
    "wallet.rule": "NFT Identity Capsule është identiteti. Identiteti nuk ruhet në localStorage apo database.",
    "wallet.label.wallet": "Wallet",
    "wallet.status.idle": "Lidhe wallet-in për të filluar.",
    "wallet.status.metamaskMissing": "MetaMask nuk është instaluar.",
    "wallet.status.switching": "Duke kaluar në Arbitrum Sepolia...",
    "wallet.status.connecting": "Duke lidhur MetaMask...",
    "wallet.status.checking": "Duke kontrolluar Identity Capsule on-chain...",
    "wallet.status.found": "Identity Capsule u gjet.",
    "wallet.status.missing": "Nuk u gjet Identity Capsule.",
    "wallet.status.wrongNetwork": "Kalo në Arbitrum Sepolia.",
    "wallet.status.failed": "Lidhja dështoi. Provo përsëri.",
    "wallet.error.capsuleCheck": "Nuk mund të kontrollohet Identity Capsule nga kontrata.",
    "wallet.error.connection": "Lidhja e wallet-it dështoi.",

    "gateway.email": "EMAIL ADRESA",
    "gateway.email.placeholder": "identiteti",
    "gateway.phone": "NUMRI I TELEFONIT",
    "gateway.password": "FJALËKALIMI I KAPSULËS",
    "gateway.password.placeholder": "Krijo fjalëkalimin e kapsulës",
    "gateway.otp": "KODI I VERIFIKIMIT",
    "gateway.sendOtp": "Dërgo OTP",
    "gateway.sending": "Duke dërguar...",
    "gateway.otpSent": "OTP u dërgua ✓",
    "gateway.activate": "Aktivizo Identity Capsule",
    "gateway.session": "Vazhdo me Nexus Session",
    "gateway.security": "Siguria e Identitetit Sovran",
    "gateway.securityText": "Infrastrukturë identiteti kushtetues e mbrojtur me verifikim sovran të enkriptuar.",
    "gateway.footer1": "Shtresa Kushtetuese e Identitetit Nexus",
    "gateway.footer2": "Infrastruktura Arbitrum",
    "gateway.success.title": "Identiteti u Aktivizua",
    "gateway.success.text": "Nexus Capsule u mintua ose u verifikua me sukses përmes infrastrukturës kushtetuese sovrane.",
    "gateway.success.continue": "Vazhdo te Dashboard",
    "gateway.error.metamask": "MetaMask nuk u gjet",
    "gateway.error.phoneRequired": "Numri i telefonit kërkohet",
    "gateway.error.otpSend": "Dërgimi i OTP dështoi",
    "gateway.error.network": "Kalo në Arbitrum Sepolia",
    "gateway.error.emailPhone": "Email dhe telefoni kërkohen",
    "gateway.error.password": "Fjalëkalimi i kapsulës kërkohet",
    "gateway.error.mintConfirmedMissing": "Mint u konfirmua por kapsula nuk u gjet",
    "gateway.error.noCapsule": "Nuk u gjet Identity Capsule për këtë wallet.",
    "gateway.error.session": "Verifikimi i session dështoi",
    "gateway.error.otpLength": "Shkruaj kodin OTP me 6 shifra",
    "gateway.error.otpInvalid": "OTP i pavlefshëm",
    "gateway.error.activation": "Aktivizimi i identitetit dështoi",

    "dashboard.title": "Dashboard Sovran",
    "dashboard.subtitle": "NFT Identity Capsule verifikohet direkt nga smart contract.",
    "dashboard.wallet": "Wallet",
    "dashboard.capsule": "Identity Capsule",
    "dashboard.tokenId": "Token ID",
    "dashboard.contract": "Kontrata është burimi i së vërtetës",
    "dashboard.status": "Statusi",
    "dashboard.active": "Aktiv",
    "dashboard.privacy": "Cilësimet e Privatësisë",
    "dashboard.refresh": "Rifresko Capsule",
    "dashboard.logout": "Dil nga Dashboard",
    "dashboard.loading": "Duke ngarkuar dashboard...",
    "dashboard.noCapsule": "Nuk u gjet Identity Capsule.",
    "dashboard.error": "Verifikimi i dashboard dështoi.",
    "dashboard.created": "Krijuar",
    "dashboard.updated": "Përditësuar",
    "dashboard.network": "Rrjeti",
    "dashboard.owner": "Pronari",
    "dashboard.identity": "Identiteti",
    "dashboard.verified": "Verifikuar",
    "dashboard.notVerified": "I paverifikuar",
    "dashboard.source": "Burimi Smart Contract",
    "dashboard.rule": "NFT Identity Capsule është identiteti. Kontrata është burimi i së vërtetës.",

    "common.loading": "Duke ngarkuar...",
    "common.success": "Sukses",
    "common.error": "Gabim",
    "common.cancel": "Anulo",
    "common.continue": "Vazhdo",
  },

  de: {
    ...en,
    "nav.home": "Startseite",
    "nav.connect": "Verbinden",
    "nav.dashboard": "Dashboard",
    "nav.enter": "Eintreten",
    "nav.phase": "Phase 1",
    "wallet.title": "Wallet verbinden",
    "wallet.connect": "Wallet verbinden",
    "wallet.connecting": "Verbinden...",
    "gateway.sendOtp": "OTP senden",
    "gateway.sending": "Senden...",
    "gateway.activate": "Identity Capsule aktivieren",
    "gateway.session": "Mit Nexus Session fortfahren",
    "dashboard.title": "Souveränes Dashboard",
    "dashboard.logout": "Dashboard verlassen",
  },

  fr: {
    ...en,
    "nav.home": "Accueil",
    "nav.connect": "Connecter",
    "nav.dashboard": "Tableau de bord",
    "nav.enter": "Entrer",
    "nav.phase": "Phase 1",
    "wallet.title": "Connecter le wallet",
    "wallet.connect": "Connecter le wallet",
    "wallet.connecting": "Connexion...",
    "gateway.sendOtp": "Envoyer OTP",
    "gateway.sending": "Envoi...",
    "gateway.activate": "Activer Identity Capsule",
    "gateway.session": "Continuer avec Nexus Session",
    "dashboard.title": "Tableau de bord souverain",
    "dashboard.logout": "Quitter le tableau de bord",
  },

  sv: {
    ...en,
    "nav.home": "Hem",
    "nav.connect": "Anslut",
    "nav.dashboard": "Dashboard",
    "nav.enter": "Gå in",
    "nav.phase": "Fas 1",
    "wallet.title": "Anslut wallet",
    "wallet.connect": "Anslut wallet",
    "wallet.connecting": "Ansluter...",
    "gateway.sendOtp": "Skicka OTP",
    "gateway.sending": "Skickar...",
    "gateway.activate": "Aktivera Identity Capsule",
    "gateway.session": "Fortsätt med Nexus Session",
    "dashboard.title": "Suverän Dashboard",
    "dashboard.logout": "Lämna Dashboard",
  },

  ar: {
    ...en,
    "nav.home": "الرئيسية",
    "nav.connect": "اتصال",
    "nav.gateway": "البوابة",
    "nav.dashboard": "لوحة التحكم",
    "nav.enter": "دخول",
    "nav.phase": "المرحلة 1",
    "wallet.title": "ربط المحفظة",
    "wallet.connect": "ربط المحفظة",
    "wallet.connecting": "جار الاتصال...",
    "gateway.sendOtp": "إرسال OTP",
    "gateway.sending": "جار الإرسال...",
    "gateway.activate": "تفعيل Identity Capsule",
    "gateway.session": "المتابعة بجلسة Nexus",
    "dashboard.title": "لوحة تحكم سيادية",
    "dashboard.logout": "الخروج من لوحة التحكم",
  },

  zh: {
    ...en,
    "nav.home": "首页",
    "nav.connect": "连接",
    "nav.gateway": "网关",
    "nav.dashboard": "仪表板",
    "nav.enter": "进入",
    "nav.phase": "阶段 1",
    "wallet.title": "连接钱包",
    "wallet.connect": "连接钱包",
    "wallet.connecting": "连接中...",
    "gateway.sendOtp": "发送 OTP",
    "gateway.sending": "发送中...",
    "gateway.activate": "激活 Identity Capsule",
    "gateway.session": "继续 Nexus Session",
    "dashboard.title": "主权仪表板",
    "dashboard.logout": "退出仪表板",
  },

  it: {
    ...en,
    "nav.home": "Home",
    "nav.connect": "Connetti",
    "nav.dashboard": "Dashboard",
    "nav.enter": "Entra",
    "nav.phase": "Fase 1",
    "wallet.title": "Connetti wallet",
    "wallet.connect": "Connetti wallet",
    "wallet.connecting": "Connessione...",
    "gateway.sendOtp": "Invia OTP",
    "gateway.sending": "Invio...",
    "gateway.activate": "Attiva Identity Capsule",
    "gateway.session": "Continua con Nexus Session",
    "dashboard.title": "Dashboard Sovrana",
    "dashboard.logout": "Esci dalla Dashboard",
  },

  sr: {
    ...en,
    "nav.home": "Početna",
    "nav.connect": "Poveži",
    "nav.dashboard": "Kontrolna tabla",
    "nav.enter": "Uđi",
    "nav.phase": "Faza 1",
    "wallet.title": "Poveži wallet",
    "wallet.connect": "Poveži wallet",
    "wallet.connecting": "Povezivanje...",
    "gateway.sendOtp": "Pošalji OTP",
    "gateway.sending": "Slanje...",
    "gateway.activate": "Aktiviraj Identity Capsule",
    "gateway.session": "Nastavi sa Nexus Session",
    "dashboard.title": "Suverena kontrolna tabla",
    "dashboard.logout": "Izađi iz Dashboard-a",
  },

  el: {
    ...en,
    "nav.home": "Αρχική",
    "nav.connect": "Σύνδεση",
    "nav.dashboard": "Πίνακας",
    "nav.enter": "Είσοδος",
    "nav.phase": "Φάση 1",
    "wallet.title": "Σύνδεση wallet",
    "wallet.connect": "Σύνδεση wallet",
    "wallet.connecting": "Σύνδεση...",
    "gateway.sendOtp": "Αποστολή OTP",
    "gateway.sending": "Αποστολή...",
    "gateway.activate": "Ενεργοποίηση Identity Capsule",
    "gateway.session": "Συνέχεια με Nexus Session",
    "dashboard.title": "Κυρίαρχος Πίνακας",
    "dashboard.logout": "Έξοδος από Dashboard",
  },

  no: {
    ...en,
    "nav.home": "Hjem",
    "nav.connect": "Koble til",
    "nav.dashboard": "Dashboard",
    "nav.enter": "Gå inn",
    "nav.phase": "Fase 1",
    "wallet.title": "Koble til wallet",
    "wallet.connect": "Koble til wallet",
    "wallet.connecting": "Kobler til...",
    "gateway.sendOtp": "Send OTP",
    "gateway.sending": "Sender...",
    "gateway.activate": "Aktiver Identity Capsule",
    "gateway.session": "Fortsett med Nexus Session",
    "dashboard.title": "Suverent Dashboard",
    "dashboard.logout": "Forlat Dashboard",
  },
}

type LanguageContextType = {
  language: LanguageCode
  setLanguage: (value: LanguageCode) => void
  languages: typeof languages
  t: (key: TranslationKey) => string
}

const LanguageContext =
  createContext<LanguageContextType | null>(null)

function isLanguageCode(
  value: string | null
): value is LanguageCode {
  return languages.some((item) =>
    item.code === value
  )
}

function resolveBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined") {
    return "en"
  }

  const code =
    navigator.language
      ?.slice(0, 2)
      .toLowerCase()

  return isLanguageCode(code)
    ? code
    : "en"
}

function applyDocumentLanguage(
  value: LanguageCode
) {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.lang =
    value

  document.documentElement.dir =
    value === "ar"
      ? "rtl"
      : "ltr"
}

export function LanguageProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [language, setLanguageState] =
    useState<LanguageCode>("en")

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "nexus_language"
      )

    const next =
      isLanguageCode(saved)
        ? saved
        : resolveBrowserLanguage()

    setLanguageState(next)

    applyDocumentLanguage(next)
  }, [])

  const setLanguage =
    (value: LanguageCode) => {
      localStorage.setItem(
        "nexus_language",
        value
      )

      applyDocumentLanguage(value)

      setLanguageState(value)
    }

  const t =
    (key: TranslationKey) => {
      return (
        translations[language]?.[key] ||
        translations.en[key] ||
        key
      )
    }

  const value =
    useMemo(() => ({
      language,
      setLanguage,
      languages,
      t,
    }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context =
    useContext(LanguageContext)

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    )
  }

  return context
}

export function LanguageSelector() {
  const {
    language,
    setLanguage,
    languages,
  } =
    useLanguage()

  return (
    <select
      value={language}
      onChange={(event) =>
        setLanguage(
          event.target.value as LanguageCode
        )
      }
      className="
        h-[40px]
        max-w-[155px]
        rounded-full
        border
        border-white/10
        bg-white/[0.06]
        px-3
        text-[12px]
        font-black
        text-white
        outline-none
        backdrop-blur-xl
      "
    >
      {languages.map((item) => (
        <option
          key={item.code}
          value={item.code}
          className="bg-black text-white"
        >
          {item.flag} {item.label}
        </option>
      ))}
    </select>
  )
}