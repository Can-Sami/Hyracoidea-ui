import type { ComponentProps, ComponentType } from 'react'
import {
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Settings,
  TreePine,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SidebarPage = 'overview' | 'intents' | 'test-lab'

type NavItem = {
  label: string
  href: string
  icon: ComponentType<ComponentProps<'svg'>>
  active: boolean
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <a
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        item.active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon />
      <span className="uppercase tracking-wide">{item.label}</span>
    </a>
  )
}

export function AppSidebar({ activePage }: { activePage: SidebarPage }) {
  const primaryNav: NavItem[] = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: activePage === 'overview',
    },
    {
      label: 'Intents',
      href: '/intents',
      icon: TreePine,
      active: activePage === 'intents',
    },
    {
      label: 'Test Lab',
      href: '/test-lab',
      icon: FlaskConical,
      active: activePage === 'test-lab',
    },
    { label: 'Analytics', href: '#', icon: TrendingUp, active: false },
  ]

  const secondaryNav: NavItem[] = [
    { label: 'Settings', href: '#', icon: Settings, active: false },
    { label: 'Support', href: '#', icon: HelpCircle, active: false },
  ]

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-card p-6">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <TreePine className="size-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">IntentEngine</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Technical Backend
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {primaryNav.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>

      <Button asChild className="mb-6 h-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <a href="/intents/new">
          <Plus data-icon="inline-start" />
          New Intent
        </a>
      </Button>

      <nav className="flex flex-col gap-1 border-t pt-4">
        {secondaryNav.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  )
}
