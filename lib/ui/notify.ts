import { toast } from "@/hooks/use-toast"

interface NotifyOptions {
  title?: string
  description: string
  duration?: number
}

export const notify = {
  success: (message: string, options?: Omit<NotifyOptions, "description">) => {
    toast({
      title: options?.title || "Success",
      description: message,
      duration: options?.duration || 4000,
      variant: "default",
    })
  },

  info: (message: string, options?: Omit<NotifyOptions, "description">) => {
    toast({
      title: options?.title || "Info",
      description: message,
      duration: options?.duration || 3000,
      variant: "default",
    })
  },

  warn: (message: string, options?: Omit<NotifyOptions, "description">) => {
    toast({
      title: options?.title || "Warning",
      description: message,
      duration: options?.duration || 5000,
      variant: "default",
    })
  },

  error: (message: string, options?: Omit<NotifyOptions, "description">) => {
    toast({
      title: options?.title || "Error",
      description: message,
      duration: options?.duration || 8000,
      variant: "destructive",
    })
  },
}
