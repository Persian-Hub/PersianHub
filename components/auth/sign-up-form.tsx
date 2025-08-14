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
        <form action={formAction} className="space-y-6">
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 font-sans">
                Full Name
              </label>
              <Input id="fullName" name="fullName" type="text" placeholder="Your full name" required className="h-12" />
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

          <div className="text-center text-gray-600 font-sans">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cyan-800 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
