import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

interface RadioGroupProps extends React.ComponentProps<"div"> {
  value?: string
  onValueChange?: (value: string) => void
}

function RadioGroup({ className, value, onValueChange, ...props }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        role="radiogroup"
        className={cn("", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps extends React.ComponentProps<"input"> {
  value: string
}

function RadioGroupItem({ className, value, id, ...props }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext)
  const isChecked = context.value === value

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={isChecked}
      onChange={() => context.onValueChange?.(value)}
      className={cn("sr-only", className)}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
