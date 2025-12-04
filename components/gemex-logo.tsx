export function GemExLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crescent moon */}
      <path d="M 50 50 Q 30 100 50 150 Q 90 150 110 120 Q 90 100 110 80 Q 90 50 50 50 Z" fill="#641AE4" />
      {/* Star */}
      <g transform="translate(140, 70)">
        <path d="M 0 -15 L 4 -4 L 15 -2 L 8 5 L 10 16 L 0 11 L -10 16 L -8 5 L -15 -2 L -4 -4 Z" fill="#641AE4" />
      </g>
    </svg>
  )
}
