"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PromptOptions {
  title: string
  label: string
  placeholder?: string
  defaultValue?: string
  validation?: (value: string) => string | null
}

let promptResolver: ((value: string | null) => void) | null = null

export function PromptDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [options, setOptions] = React.useState<PromptOptions>({
    title: "",
    label: "",
    placeholder: "",
    defaultValue: "",
  })

  React.useEffect(() => {
    // Global prompt function
    ;(window as any).__prompt = (opts: PromptOptions) => {
      return new Promise<string | null>((resolve) => {
        promptResolver = resolve
        setOptions(opts)
        setValue(opts.defaultValue || "")
        setError(null)
        setIsOpen(true)
      })
    }
  }, [])

  const handleConfirm = () => {
    if (options.validation) {
      const validationError = options.validation(value)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setIsOpen(false)
    promptResolver?.(value)
    promptResolver = null
  }

  const handleCancel = () => {
    setIsOpen(false)
    promptResolver?.(null)
    promptResolver = null
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription>{options.label}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="prompt-input">{options.label}</Label>
          <Input
            id="prompt-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={options.placeholder}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to show prompt dialog
export function prompt(options: PromptOptions): Promise<string | null> {
  if (typeof window !== "undefined" && (window as any).__prompt) {
    return (window as any).__prompt(options)
  }
  // Fallback for server-side or when dialog not mounted
  return Promise.resolve(null)
}
