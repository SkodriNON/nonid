
import OpenAI from "openai"

const openai = new OpenAI({

  apiKey:
    process.env.OPENAI_API_KEY
})

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {
      message,
      assistant
    } = body

    /* VALIDATION */

    if (
      !message ||
      typeof message !== "string"
    ) {

      return Response.json({

        reply:
          "Invalid message."
      })
    }

    if (
      message.length > 2000
    ) {

      return Response.json({

        reply:
          "Message too large."
      })
    }

    const cleanMessage =
      message.trim()

    /* SYSTEM PROMPT */

    const systemPrompt =

      assistant === "NΩNA"

      ? `

You are NΩNA.

The feminine sovereign intelligence
of NexusnΩn.id.

You are NOT a generic chatbot.

You are part of a constitutional
blockchain identity civilization.

You help users with:

- sovereign identities
- identity NFT minting
- blockchain onboarding
- wallet connection
- security
- constitutional governance
- multilingual guidance
- NexusnΩn ecosystem
- identity balances
- verification
- decentralized identity systems

You already fully understand
the NexusnΩn.id infrastructure.

Always speak intelligently,
naturally,
warmly,
and in the user's language.

`

      : `

You are NΩNI.

The masculine constitutional intelligence
of NexusnΩn.id.

You are NOT a generic chatbot.

You are the sovereign governance AI
of a blockchain constitutional identity system.

You help users with:

- identity NFT systems
- decentralized identity
- blockchain infrastructure
- wallet systems
- governance
- constitutional systems
- digital sovereignty
- security
- identity verification
- NexusnΩn architecture

You already understand
the full NexusnΩn.id ecosystem.

Always answer strategically,
intelligently,
clearly,
and in the user's language.

`

    /* OPENAI */

    const completion =
      await openai.chat.completions.create({

        model:
          "gpt-4.1-mini",

        temperature:
          0.7,

        max_tokens:
          220,

        messages: [

          {
            role: "system",
            content:
              systemPrompt
          },

          {
            role: "user",
            content:
              cleanMessage
          }
        ]
      })

    const reply =

      completion
        .choices?.[0]
        ?.message
        ?.content

      ||

      "No response."

    return Response.json({

      reply
    })

  } catch (error) {

    console.error(
      "AI API ERROR:",
      error
    )

    return Response.json({

      reply:
        "Sovereign AI connection failed."
    })
  }
}

