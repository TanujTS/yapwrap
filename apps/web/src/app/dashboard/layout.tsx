"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PlusIcon,
  MenuIcon,
  XIcon,
  ListTodoIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  MoreVerticalIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const { data: session, isPending } = authClient.useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth")
    }
  }, [isPending, session, router])

  if (!isPending && !session) {
    return null
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
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
                  <MoreVerticalIcon className="h-4 w-4 text-sidebar-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={8}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                  <span>Theme</span>
                  <div className="flex items-center gap-1 rounded-md border p-0.5">
                    <button
                      onClick={() => setTheme("light")}
                      className={`rounded-sm p-1 transition-colors ${
                        theme === "light" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                      }`}
                    >
                      <SunIcon className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`rounded-sm p-1 transition-colors ${
                        theme === "dark" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                      }`}
                    >
                      <MoonIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  onClick={async () => {
                    await authClient.signOut()
                    router.push("/auth")
                  }}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden shrink-0">
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
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md lg:hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

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
