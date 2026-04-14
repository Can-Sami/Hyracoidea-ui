import type { ComponentProps, ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronRight,
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

type SidebarPage = 'overview' | 'intents' | 'test-lab' | 'analytics'

type NavItem = {
  label: string
  href: string
  icon: ComponentType<ComponentProps<'svg'>>
  active: boolean
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon

  const itemClassName = cn(
    'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
    item.active
      ? 'border-[hsl(var(--claude-accent)/0.45)] bg-[hsl(var(--claude-accent-soft))] text-[hsl(var(--claude-text))]'
      : 'border-transparent text-[hsl(var(--claude-muted))] hover:border-[hsl(var(--claude-border))] hover:bg-[hsl(var(--claude-surface-elevated))] hover:text-[hsl(var(--claude-text))]',
  )

  const content = (
    <>
      <Icon className="size-4" />
      <span className="font-medium">{item.label}</span>
      {item.active ? (
        <ChevronRight className="ml-auto size-4 text-[hsl(var(--claude-accent))]" />
      ) : null}
    </>
  )

  if (item.href.startsWith('/')) {
    return (
      <Link to={item.href} className={itemClassName}>
        {content}
      </Link>
    )
  }

  return (
    <a href={item.href} className={itemClassName}>
      {content}
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
    {
      label: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
      active: activePage === 'analytics',
    },
  ]

  const secondaryNav: NavItem[] = [
    { label: 'Settings', href: '#', icon: Settings, active: false },
    { label: 'Support', href: '#', icon: HelpCircle, active: false },
  ]

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-bg))] px-4 py-4 text-[hsl(var(--claude-text))]">
      <div className="flex items-center gap-3 border-b border-[hsl(var(--claude-border))] px-2 pb-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--claude-accent))] text-[hsl(var(--claude-text))]">
          <TreePine className="size-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Hyrax</h1>
          <p className="text-[11px] text-[hsl(var(--claude-muted))]">
            Platform Console
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--claude-muted))]">
          Workspace
        </p>
        <Button asChild className="h-9 justify-start bg-[hsl(var(--claude-accent))] text-[hsl(var(--claude-text))] hover:bg-[hsl(var(--claude-accent)/0.92)]">
          <a href="/intents/new">
            <Plus data-icon="inline-start" />
            New Intent
          </a>
        </Button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--claude-muted))]">
          Navigation
        </p>
        {primaryNav.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>

      <nav className="flex flex-col gap-1 border-t border-[hsl(var(--claude-border))] px-2 pt-4">
        {secondaryNav.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  )
}
