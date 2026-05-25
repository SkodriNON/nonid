
import "./globals.css"

import Providers
from "./providers"

import type {
  Metadata
} from "next"

export const metadata: Metadata = {

  title:
    "NexusnΩn.id",

  description:
    "Universal Sovereign Identity Protocol",

    manifest: "/manifest.json",

  icons: {

    icon: "/favicon.ico"
  }
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
      ">

        <Providers>

          <main className="
            relative
            w-full
            min-h-screen
          ">

            {children}

          </main>

        </Providers>

      </body>

    </html>
  )
}

