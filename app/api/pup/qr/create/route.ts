import {
  createNonIdQrSession
} from "../_store"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function POST() {
  try {
    const session =
      await createNonIdQrSession()

    return Response.json({
      success: true,
      session,
      qr: {
        type: "NEXUSNON_NONID_LOGIN",
        sessionId: session.id,
        expiresAt: session.expiresAt
      }
    })
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "NONID_QR_CREATE_FAILED"
      },
      {
        status: 500
      }
    )
  }
}