import { Activity, Bell, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export function AppHeader() {
  return (
    <header className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-background/90 px-8 backdrop-blur">
      <div className="flex flex-1 items-center gap-6">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search dashboard"
            className="pl-10"
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

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Hub activity">
          <Activity />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <Button className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          Deploy Model
        </Button>
      </div>
    </header>
  )
}
