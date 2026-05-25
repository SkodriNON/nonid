
"use client"

import {
  useEffect,
  useState
} from "react"

import {
  ethers
} from "ethers"

const abi = [

  "function getMyIdentityId() view returns(uint256)",

  "function getIdentity(uint256 nftId) view returns(uint256,string,uint256,bool,uint256,uint256)",

  "function sessionActive(uint256 nftId) view returns(bool)"
]

export default function Dashboard() {

  const [
    identity,
    setIdentity
  ] = useState<any>(null)

  const [
    wallet,
    setWallet
  ] = useState("")

  const [
    chain,
    setChain
  ] = useState("")

  useEffect(() => {

    loadIdentity()

  }, [])

  const loadIdentity =
    async () => {

      try {

        const ethereum =
          (window as any)
            .ethereum

        if (!ethereum) {

          return
        }

        const provider =
          new ethers.providers.Web3Provider(
            ethereum
          )

        await provider.send(
          "eth_requestAccounts",
          []
        )

        const signer =
          provider.getSigner()

        const address =
          await signer.getAddress()

        setWallet(address)

        const network =
          await provider.getNetwork()

        setChain(
          network.name
        )

        const contract =
          new ethers.Contract(

            process.env
              .NEXT_PUBLIC_CONTRACT_ADDRESS!,

            abi,

            signer
          )

        const data =
          await contract.getIdentity(
            1
          )

        const session =
          await contract.sessionActive(
            1
          )

        setIdentity({

          nftId:
            data[0].toString(),

          noniId:
            data[1],

          createdAt:
            new Date(

              Number(data[2]) * 1000

            ).toLocaleString(),

          active:
            data[3]
              ? "YES"
              : "NO",

          nonce:
            data[4].toString(),

          balance:
            data[5].toString(),

          session:
            session
              ? "ACTIVE"
              : "OFFLINE"
        })

      } catch (err) {

        console.error(err)
      }
    }

  if (!identity) {

    return (

      <main className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
      ">

        Loading Identity...

      </main>
    )
  }

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      px-6
      py-16
      flex
      justify-center
    ">

      <div className="
        w-full
        max-w-[1200px]
        rounded-[42px]
        border
        border-white/10
        bg-white/[0.03]
        backdrop-blur-3xl
        p-10
      ">

        <div className="
          flex
          items-center
          justify-between
          flex-wrap
          gap-6
        ">

          <div>

            <div className="
              uppercase
              tracking-[0.3em]
              text-zinc-500
              text-sm
            ">

              Sovereign Identity

            </div>

            <h1 className="
              mt-4
              text-[56px]
              font-black
              bg-gradient-to-r
              from-white
              to-cyan-400
              bg-clip-text
              text-transparent
            ">

              {identity.noniId}

            </h1>

          </div>

          <div className="
            px-6
            py-3
            rounded-full
            bg-cyan-400
            text-black
            font-black
          ">

            {identity.session}

          </div>

        </div>

        <div className="
          mt-12
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-5
        ">

          <Card
            title="NFT ID"
            value={identity.nftId}
          />

          <Card
            title="Wallet"
            value={wallet}
            small
          />

          <Card
            title="Network"
            value={chain}
          />

          <Card
            title="Created"
            value={identity.createdAt}
          />

          <Card
            title="Nonce"
            value={identity.nonce}
          />

          <Card
            title="Internal Balance"
            value={identity.balance}
          />

        </div>

      </div>

    </main>
  )
}

function Card({

  title,
  value,
  small

}: any) {

  return (

    <div className="
      rounded-[28px]
      border
      border-white/10
      bg-black/40
      p-6
    ">

      <div className="
        text-zinc-500
        text-sm
      ">

        {title}

      </div>

      <div className={`

        mt-3
        font-bold
        break-all

        ${
          small

          ? "text-sm"

          : "text-xl"
        }

      `}>

        {value}

      </div>

    </div>
  )
}

