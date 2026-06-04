export type OtpData = {
  otp?: string

  phoneOtp?: string

  emailOtp?: string

  expires: number

  phone?: string

  email?: string
}

const globalForOtp =
  globalThis as unknown as {
    nexusOtpStore?: Map<string, OtpData>
  }

export const otpStore =
  globalForOtp.nexusOtpStore ??
  new Map<string, OtpData>()

globalForOtp.nexusOtpStore =
  otpStore