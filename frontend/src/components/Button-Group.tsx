import type { ReactNode } from "react"

interface ButtonGroupProps {
  children: ReactNode
  layout?: "horizontal" | "vertical"
  className?: string
}

export function ButtonGroup({
  children,
  layout = "horizontal",
  className = "",
}: ButtonGroupProps) {
  const layoutClass = layout === "vertical" ? "flex-col" : "flex-row"

  return <div className={`flex ${layoutClass} gap-4 ${className}`}>{children}</div>
}
