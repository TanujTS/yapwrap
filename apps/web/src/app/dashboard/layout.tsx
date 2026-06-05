"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PlusIcon,
  MenuIcon,
  XIcon,
  ListTodoIcon,
  BellIcon,
} from "lucide-react"
import { useState } from "react"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

function initials(name?: string | null, email?: string | null) {
  const value = name || email || "Y"
  return value
    .split(/[ .@_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

const navItems = [
  {
    label: "All Meetings",
    href: "/dashboard",
    icon: CalendarDaysIcon,
  },
  {
    label: "Action Items",
    href: "/dashboard/action-items",
    icon: ListTodoIcon,
  },
  {
    label: "Reminders",
    href: "/dashboard/reminders",
    icon: BellIcon,
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!isPending && !session) {
    router.push("/auth")
    return null
  }

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-medium text-sidebar-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-sm font-semibold">
              Y
            </span>
            Yapwrap
          </Link>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <div className="pt-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/meetings/new">
                <PlusIcon data-icon="inline-start" />
                New Meeting
              </Link>
            </Button>
          </div>
        </nav>
        <Separator />
        <div className="p-4">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                {session.user.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                ) : null}
                <AvatarFallback>
                  {initials(session.user.name, session.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {session.user.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {session.user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={async () => {
                  await authClient.signOut()
                  router.push("/")
                }}
              >
                <LogOutIcon className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-medium"
          >
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
              Y
            </span>
            Yapwrap
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </Button>
        </header>

        {/* Mobile nav overlay */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-heading text-lg font-medium">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XIcon className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
              <div className="pt-3">
                <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/dashboard/meetings/new">
                    <PlusIcon data-icon="inline-start" />
                    New Meeting
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
