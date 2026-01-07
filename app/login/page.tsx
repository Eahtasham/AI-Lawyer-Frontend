'use client'


import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Github, Mail, Loader2, Scale } from 'lucide-react'

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const handleGoogleLogin = async () => {
    setLoadingProvider('google')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/chat`,
      },
    })
    if (error) {
        setLoadingProvider(null)
        console.error("Google Login failed:", error.message)
    }
  }

  const handleGithubLogin = async () => {
    setLoadingProvider('github')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/chat`,
      },
    })
    if (error) {
        setLoadingProvider(null)
        console.error("Github Login failed:", error.message)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoadingProvider('email')
    setMessage(null)
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/chat`,
      },
    })

    setLoadingProvider(null)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <Scale className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight">SamVidhaan</span>
            </Link>
          <CardTitle className="text-2xl font-bold">Log in / Sign up</CardTitle>
          <CardDescription>
            Choose your preferred method to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
                <Button 
                    variant="outline" 
                    onClick={handleGoogleLogin}
                    disabled={loadingProvider !== null}
                    className="w-full h-11"
                >
                    {loadingProvider === 'google' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                    )}
                    Continue with Google
                </Button>
                <Button 
                    variant="outline" 
                    onClick={handleGithubLogin}
                    disabled={loadingProvider !== null}
                    className="w-full h-11"
                >
                    {loadingProvider === 'github' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Github className="mr-2 h-4 w-4" />
                    )}
                    Continue with GitHub
                </Button>
            </div>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="ddc@samvidhaan.live" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loadingProvider !== null}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loadingProvider !== null}>
                    {loadingProvider === 'email' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Mail className="mr-2 h-4 w-4" />
                    )}
                    Sign in with Email
                </Button>
            </form>

            {message && (
                <div className={`p-3 rounded-md text-sm text-center ${message.type === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-600 dark:text-green-400'}`}>
                    {message.text}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
