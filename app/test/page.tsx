
"use client"

export default function TestPage() {

  const send =
    async () => {

      const res =
        await fetch(

          "/api/send-phone",

          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              phone:
                "+46700297105"
            })
          }
        )

      const data =
        await res.json()

      console.log(data)

      alert(
        "SMS SENT ta ha zemren mesazhi i par nga Skodrinoni😄🔥"
      )
    }

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
    ">

      <button

        onClick={send}

        className="
          px-8
          py-4
          rounded-xl
          bg-cyan-400
          text-black
          font-bold
        "
      >

        SEND SMS TEST

      </button>

    </main>
  )
}

