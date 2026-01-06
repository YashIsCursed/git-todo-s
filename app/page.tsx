
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex bg-background min-h-screen flex-col items-center justify-center text-center">
      <main className="flex flex-col items-center gap-6 p-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Self Manager
        </h1>
        <p className="max-w-[600px] text-muted-foreground">
          Manage your GitHub repositories, tasks, and code anchors in one place.
        </p>
        <div className="flex gap-4">
           <Button asChild>
             <Link href="/login">Get Started</Link>
           </Button>
           <Button variant="outline" asChild>
             <Link href="https://github.com" target="_blank">View on GitHub</Link>
           </Button>
        </div>
      </main>
    </div>
  )
}
