
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Github } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return redirect('/')
  }

  const signIn = async () => {
    'use server'

    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: 'repo read:user',
      },
    })

    if (error) {
      console.error(error)
      return redirect('/login?error=Could not authenticate user')
    }

    if (data.url) {
      return redirect(data.url)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Welcome back! Please login to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="flex flex-col gap-4">
            <Button variant="outline" className="w-full gap-2" type="submit">
              <Github className="h-4 w-4" />
              Sign in with GitHub
            </Button>
            {params?.error && (
              <p className="text-center text-sm font-medium text-destructive">
                {params.error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
