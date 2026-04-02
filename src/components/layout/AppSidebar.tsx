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
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
        item.active
          ? 'bg-primary/14 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.22)]'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      <Icon className="size-[18px]" />
      <span className="tracking-wide">{item.label}</span>
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
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border/70 bg-card/90 px-5 py-6 backdrop-blur-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.28)]">
          <TreePine className="size-4" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight">Hyrax</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/90">
            Hyrax Call Steering
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {primaryNav.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>

      <Button asChild className="mb-5 h-10">
        <a href="/intents/new">
          <Plus data-icon="inline-start" />
          New Intent
        </a>
      </Button>

      <nav className="flex flex-col gap-1.5 border-t border-border/80 pt-4">
        {secondaryNav.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  )
}
