import { GemOTCLogo } from "./gemotc-logo"

export function AuthHeader() {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <GemOTCLogo size={48} />
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#641AE4] to-[#C8F55A] bg-clip-text text-transparent">
        GemOTC
      </h1>
    </div>
  )
}
