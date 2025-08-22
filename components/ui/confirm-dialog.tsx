"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

let confirmResolver: ((value: boolean) => void) | null = null

export function ConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: "",
    description: "",
    confirmText: "Continue",
    cancelText: "Cancel",
    variant: "default",
  })

  React.useEffect(() => {
    // Global confirm function
    ;(window as any).__confirm = (opts: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
        confirmResolver = resolve
        setOptions({
          confirmText: "Continue",
          cancelText: "Cancel",
          variant: "default",
          ...opts,
        })
        setIsOpen(true)
      })
    }
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    confirmResolver?.(true)
    confirmResolver = null
  }

  const handleCancel = () => {
    setIsOpen(false)
    confirmResolver?.(false)
    confirmResolver = null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              options.variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Helper function to show confirm dialog
export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).__confirm) {
    return (window as any).__confirm(options)
  }
  // Fallback for server-side or when dialog not mounted
  return Promise.resolve(false)
}
