import { Activity, Bell, ChevronDown, Search, UserCircle2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  return (
    <header className="fixed left-64 right-0 top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center gap-4 px-6 lg:gap-6 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search dashboard"
              className="h-9 pl-10"
              placeholder="Search parameters, intents, or logs..."
            />
          </div>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground xl:flex">
            <a href="#" className="hover:text-foreground">
              Docs
            </a>
            <a href="#" className="hover:text-foreground">
              API Status
            </a>
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Hub activity">
            <Activity />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-5" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarImage src="/avatars/operator.png" alt="Casey Taylor" />
                  <AvatarFallback>CT</AvatarFallback>
                </Avatar>
                <span className="text-sm">Casey</span>
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
  );
}
