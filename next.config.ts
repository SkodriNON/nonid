
import type {
  NextConfig
} from "next"

const nextConfig: NextConfig = {

  webpack: (config) => {

    config.externals.push({

      "@nomicfoundation/hardhat-ignition/modules":
        "commonjs @nomicfoundation/hardhat-ignition/modules"
    })

    return config
  }
}

export default nextConfig

