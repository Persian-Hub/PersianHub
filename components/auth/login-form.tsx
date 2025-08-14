"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-cyan-800 hover:bg-cyan-900 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-cyan-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PH</span>
          </div>
        </div>
        <CardTitle className="font-serif text-2xl text-gray-900">Welcome back</CardTitle>
        <p className="font-sans text-gray-600">Sign in to your Persian Hub account</p>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-sans text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-sans">
                Email
              </label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-12" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-sans">
                Password
              </label>
              <Input id="password" name="password" type="password" required className="h-12" />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-gray-600 font-sans">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-cyan-800 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
