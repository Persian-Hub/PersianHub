"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

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
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

function GoogleSignUpButton() {
  const [isPending, setIsPending] = useState(false)

  const handleGoogleSignUp = async () => {
    setIsPending(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Google sign-up failed:", error)
      }
    } catch (error) {
      console.error("Google sign-up failed:", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleGoogleSignUp}
      disabled={isPending}
      variant="outline"
      className="w-full py-6 text-lg font-medium rounded-lg h-[60px] border-gray-300 hover:bg-gray-50 bg-transparent"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  )
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-cyan-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">PH</span>
          </div>
        </div>
        <CardTitle className="font-serif text-2xl text-gray-900">Join Persian Hub</CardTitle>
        <p className="font-sans text-gray-600">Create your account to get started</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-sans text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg font-sans text-sm">
              {state.success}
            </div>
          )}

          <GoogleSignUpButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-sans">Or continue with email</span>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 font-sans">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  required
                  className="h-12"
                />
              </div>

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
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="h-12"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="businessOwner" name="businessOwner" />
                <label htmlFor="businessOwner" className="text-sm font-medium text-gray-700 font-sans">
                  I am a business owner
                </label>
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="text-center text-gray-600 font-sans">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cyan-800 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
