import "./globals.css"

import Providers
from "./providers"

import type {
  Metadata,
  Viewport
} from "next"

export const metadata: Metadata = {

  title:
    "NexusNON.ID",

  description:
    "Universal Sovereign Identity Protocol",

  manifest:
    "/manifest.json",

  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico"
  }
}

export const viewport: Viewport = {

  themeColor:
    "#000000"
}

export default function RootLayout({

  children,

}: {

  children:
    React.ReactNode

}) {

  return (

    <html
      lang="en"
      suppressHydrationWarning
    >

      <body className="
        min-h-screen
        overflow-x-hidden
        bg-black
        text-white
        antialiased
        selection:bg-cyan-400
        selection:text-black
      ">

        <Providers>

          <main className="
            relative
            w-full
            min-h-screen
            overflow-hidden
          ">

            <div className="
              pointer-events-none
              fixed
              inset-0
              -z-10
              overflow-hidden
            ">

              <div className="
                absolute
                top-[-250px]
                left-[-180px]
                h-[600px]
                w-[600px]
                rounded-full
                bg-cyan-400/10
                blur-[180px]
              " />

              <div className="
                absolute
                bottom-[-260px]
                right-[-200px]
                h-[650px]
                w-[650px]
                rounded-full
                bg-blue-500/10
                blur-[200px]
              " />

            </div>

            {children}

          </main>

        </Providers>

      </body>

    </html>
  )
}