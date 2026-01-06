
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderGit2, CheckSquare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Repositories',
    href: '/dashboard/repositories',
    icon: FolderGit2,
  },
  {
    title: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 text-sm font-medium lg:w-[240px]">
      {sidebarItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Button
            key={index}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className={cn(
              'justify-start gap-2',
              pathname === item.href && 'bg-secondary'
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
