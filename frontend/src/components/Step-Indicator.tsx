interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-colors ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "bg-accent text-accent-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <p className="mt-2 text-xs font-medium text-center text-foreground max-w-20">{step}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 w-12 transition-colors ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
