"use client"

import {
  LanguageProvider
} from "@/components/LanguageSystem"

export default function Providers({

  children

}: {

  children:
    React.ReactNode
}) {

  return (

    <LanguageProvider>

      {children}

    </LanguageProvider>
  )
}