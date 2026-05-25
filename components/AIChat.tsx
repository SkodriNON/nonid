
"use client"

import {
  useState,
  useRef,
  useEffect
} from "react"

export default function AIChat({

  assistant

}: {

  assistant:
    "NΩNI" | "NΩNA"
}) {

  const [
    message,
    setMessage
  ] = useState("")

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    listening,
    setListening
  ] = useState(false)

  const [
    messages,
    setMessages
  ] = useState<any[]>([])

  const recognitionRef =
    useRef<any>(null)

  useEffect(() => {

    return () => {

      try {

        speechSynthesis.cancel()

        if (
          recognitionRef.current
        ) {

          recognitionRef.current.stop()
        }

      } catch {}
    }

  }, [])

  const speak =
    (text: string) => {

      try {

        if (
          typeof window ===
          "undefined"
        ) return

        speechSynthesis.cancel()

        const utterance =
          new SpeechSynthesisUtterance(
            text
          )

        utterance.rate =
          1

        utterance.pitch =

          assistant === "NΩNA"

          ? 1.2

          : 0.9

        speechSynthesis.speak(
          utterance
        )

      } catch {}
    }

  const startVoice =
    () => {

      try {

        const SpeechRecognition =

          (window as any)
            .SpeechRecognition

          ||

          (window as any)
            .webkitSpeechRecognition

        if (!SpeechRecognition)
          return

        const recognition =
          new SpeechRecognition()

        recognitionRef.current =
          recognition

        recognition.lang =
          navigator.language

        recognition.start()

        setListening(true)

        recognition.onresult =
          (event: any) => {

            const transcript =

              event.results[0][0]
                .transcript

            setMessage(
              transcript
            )

            setListening(false)
          }

        recognition.onend =
          () => {

            setListening(false)
          }

      } catch {

        setListening(false)
      }
    }

  const send =
    async () => {

      if (
        !message ||
        loading
      ) return

      const currentMessage =
        message

      setMessage("")

      setMessages(prev => [

        ...prev,

        {

          role: "user",

          content:
            currentMessage
        }
      ])

      setLoading(true)

      try {

        const res =
          await fetch(

            "/api/chat",

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                message:
                  currentMessage,

                assistant
              })
            }
          )

        const data =
          await res.json()

        const reply =

          data.reply ||

          "No response."

        setMessages(prev => [

          ...prev,

          {

            role:
              "assistant",

            content:
              reply
          }
        ])

        speak(reply)

      } catch {

        setMessages(prev => [

          ...prev,

          {

            role:
              "assistant",

            content:
              "AI connection failed."
          }
        ])

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="
      w-full
      rounded-[28px]
      border
      border-white/10
      bg-black/30
      backdrop-blur-2xl
      overflow-hidden
    ">

      {/* CHAT AREA */}

      <div className="
        h-[240px]
        sm:h-[300px]
        overflow-y-auto
        p-5
        flex
        flex-col
        gap-4
      ">

        {

          messages.length === 0 && (

            <div className="
              text-zinc-400
              text-sm
              leading-relaxed
            ">

              {

                assistant === "NΩNA"

                ? `
                  Hello. I am NΩNA.
                  Your sovereign identity guide.
                  `

                : `
                  Welcome. I am NΩNI.
                  Your constitutional identity assistant.
                  `
              }

            </div>
          )
        }

        {

          messages.map(

            (m, i) => (

              <div
                key={i}
                className={`
                  max-w-[85%]
                  rounded-[18px]
                  px-4
                  py-3
                  text-sm
                  leading-relaxed
                  whitespace-pre-wrap

                  ${
                    m.role === "user"

                    ? `
                      self-end
                      bg-cyan-500
                      text-black
                    `

                    : `
                      self-start
                      bg-white/[0.06]
                      text-white
                    `
                  }
                `}
              >

                {m.content}

              </div>
            )
          )
        }

      </div>

      {/* INPUT BAR */}

      <div className="
        border-t
        border-white/10
        p-3
        flex
        items-center
        gap-2
      ">

        <input
          value={message}
          onChange={(e)=>
            setMessage(
              e.target.value
            )
          }
          onKeyDown={(e)=>{

            if (
              e.key === "Enter"
            ) {

              send()
            }
          }}
          placeholder="Speak with AI..."

          className="
            flex-1
            h-[52px]
            rounded-[16px]
            bg-white/[0.05]
            px-4
            text-sm
            text-white
            outline-none
          "
        />

        <button
          onClick={startVoice}

          className="
            h-[52px]
            px-4
            rounded-[16px]
            bg-pink-500
            text-white
            text-sm
            font-bold
            whitespace-nowrap
          "
        >

          {

            listening

            ? "..."

            : "Voice"
          }

        </button>

        <button
          onClick={send}

          className="
            h-[52px]
            px-5
            rounded-[16px]
            bg-white
            text-black
            text-sm
            font-bold
            whitespace-nowrap
          "
        >

          {

            loading

            ? "..."

            : "Send"
          }

        </button>

      </div>

    </div>
  )
}

