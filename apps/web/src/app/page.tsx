"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ListChecksIcon,
  SparklesIcon,
} from "lucide-react"

import DotGrid from "@/components/DotGrid"
import { AuthActions } from "@/components/auth-actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const highlights = [
  {
    title: "Meeting wrap-ups",
    description: "Notes, owners, and next steps land in one tidy trail.",
    icon: SparklesIcon,
  },
  {
    title: "Action clarity",
    description: "Every follow-up has a person, a deadline, and a status.",
    icon: ListChecksIcon,
  },
  {
    title: "Gentle reminders",
    description: "Work resurfaces before it gets awkward to chase.",
    icon: Clock3Icon,
  },
]

export default function Home() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const dotgridBase = isDark ? "#2F293A" : "#ffffff"
  const dotgridActive = isDark ? "#10b981" : "#10b981"

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">

      {/* DotGrid background — fixed to viewport so it always fills */}
      <div className="fixed inset-0 z-0" style={{ width: "100vw", height: "100vh" }}>
        {mounted && (
          <DotGrid
            dotSize={5}
            gap={18}
            baseColor={dotgridBase}
            activeColor={dotgridActive}
            proximity={140}
            shockRadius={260}
            shockStrength={3}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-5">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-medium">
            <span className="flex size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              Y
            </span>
            Yapwrap
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthActions />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_420px] lg:py-16">
          <div className="flex max-w-3xl flex-col gap-7">
            <Badge variant="secondary" className="w-fit">
              Meeting momentum, neatly wrapped
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl font-heading text-5xl font-medium leading-tight text-foreground md:text-7xl">
                Yapwrap turns noisy calls into clear follow-through.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Capture the conversation, assign the work, and keep the room aligned after everyone leaves the call.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth">
                  Start wrapping
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#flow">See the flow</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-card/90 backdrop-blur">
            <CardHeader>
              <CardTitle>Today&apos;s wrap</CardTitle>
              <CardDescription>Product sync, 34 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">Ship onboarding polish</p>
                      <p className="text-sm text-muted-foreground">Owner assigned, review queued</p>
                    </div>
                    <Badge>
                      <CheckCircle2Icon data-icon="inline-start" />
                      Ready
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Notes", "Actions", "Reminders"].map((item, index) => (
                    <div key={item} className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-3">
                      <span className="text-sm text-muted-foreground">{item}</span>
                      <span className="font-heading text-2xl font-medium">{[18, 7, 3][index]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <AvatarGroup>
                    {["TS", "AK", "MN"].map((person) => (
                      <Avatar key={person}>
                        <AvatarFallback>{person}</AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Badge variant="outline">Synced</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <section id="flow" className="relative z-10 border-t border-border bg-background/95">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader>
                  <Icon className="mb-2 h-6 w-6 text-primary" />
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  )
}