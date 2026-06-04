export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

export async function GET() {
  try {
    const rpcUrl =
      process.env
        .ARBITRUM_SEPOLIA_RPC_URL

    if (!rpcUrl) {
      return Response.json({
        success: false,
        error:
          "ARBITRUM_SEPOLIA_RPC_URL missing"
      })
    }

    const response =
      await fetch(
        rpcUrl,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_chainId",
            params: []
          })
        }
      )

    const text =
      await response.text()

    return Response.json({
      success: true,
      rpcUrl,
      status:
        response.status,
      text
    })

  } catch (error: any) {
    return Response.json({
      success: false,
      message:
        error?.message ||
        "RPC_TEST_FAILED",
      cause:
        error?.cause?.message ||
        null,
      code:
        error?.cause?.code ||
        null
    })
  }
}