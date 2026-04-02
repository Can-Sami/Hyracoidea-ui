import { Activity, Bell, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export function AppHeader() {
  return (
    <header className="fixed left-64 right-0 top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
        <div className="flex flex-1 items-center gap-6">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search dashboard"
              className="h-9 pl-10"
              placeholder="Search parameters, intents, or logs..."
            />
          </div>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#" className="hover:text-foreground">
              Docs
            </a>
            <a href="#" className="hover:text-foreground">
              API Status
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Hub activity">
            <Activity />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-5" />
          <Button>
            Deploy Model
          </Button>
        </div>
      </div>
    </header>
  )
}
