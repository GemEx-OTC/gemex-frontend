import { GemExLogo } from "./gemex-logo"

export function AuthHeader() {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <GemExLogo size={48} />
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#641AE4] to-[#C8F55A] bg-clip-text text-transparent">
        GemEx
      </h1>
    </div>
  )
}
