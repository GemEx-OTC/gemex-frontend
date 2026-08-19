import Image from "next/image"

export function GemOTCLogo({ size = 40 }: { size?: number }) {
  return (
    <div 
      className="relative flex items-center justify-center bg-card rounded-xl border border-primary/30 shadow-md flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image 
        src="/images/gemex-20logo.png" 
        alt="GemOTC Logo" 
        width={Math.round(size * 0.7)} 
        height={Math.round(size * 0.7)} 
        className="object-contain" 
      />
    </div>
  )
}
