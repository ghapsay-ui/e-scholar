'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignUp() {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Account created! You can now click Sign In.")
    }
    setIsLoading(false)
  }

  async function handleSignIn() {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert("Error: " + error.message)
    } else {
      // If login is successful, send the student to the registration form!
      router.push('/register')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-900">E-Scholar Portal</CardTitle>
          <CardDescription>Sign in or create an account to apply.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="student@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? "Loading..." : "Sign In"}
            </Button>
            <Button onClick={handleSignUp} variant="outline" disabled={isLoading}>
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
