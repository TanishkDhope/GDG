import type { ReactNode } from "react"

interface CardContainerProps {
  children: ReactNode
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function CardContainer({
  children,
  className = "",
  onMouseEnter,
  onMouseLeave,
}: CardContainerProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-6 shadow-sm ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  )
}
