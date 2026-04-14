import { Activity, Bell, ChevronDown, Command, Search, UserCircle2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export function AppHeader() {
  return (
    <header className="fixed left-64 right-0 top-0 z-40 border-b border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-bg))] backdrop-blur-md">
      <div className="flex h-16 w-full items-center gap-4 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--claude-muted))]" />
            <Input
              aria-label="Search dashboard"
              className="h-9 rounded-lg border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] pl-10 text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-muted))]"
              placeholder="Search docs, intents, logs..."
            />
          </div>
          <Badge
            variant="outline"
            className="hidden items-center gap-1 rounded-md border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface-elevated))] px-2 py-1 text-[11px] font-medium text-[hsl(var(--claude-muted))] lg:inline-flex"
          >
            <Command />
            K
          </Badge>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Notifications"
            className="text-[hsl(var(--claude-text))] hover:bg-transparent hover:text-[hsl(var(--claude-accent))]"
          >
            <Bell />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Hub activity"
            className="text-[hsl(var(--claude-text))] hover:bg-transparent hover:text-[hsl(var(--claude-accent))]"
          >
            <Activity />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 rounded-lg border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] px-2.5 text-[hsl(var(--claude-text))] hover:bg-[hsl(var(--claude-surface-elevated))]">
                <Avatar className="size-6">
                  <AvatarImage src="/avatars/operator.png" alt="Can Tam" />
                  <AvatarFallback>CT</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Can</span>
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <UserCircle2 />
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/account/profile">Profile Settings</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/account/security">Security</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/account/notifications">Notifications</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/account/billing">Billing</a>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
