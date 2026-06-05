"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ArrowLeftIcon } from "lucide-react"

import DotGrid from "@/components/DotGrid"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
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
      <div className="pointer-events-none fixed inset-0 z-0 bg-background/50" />
      <div className="relative z-10 flex min-h-svh w-full flex-col px-5 py-5">
        <header className="flex items-center justify-between">
          <Button asChild variant="ghost" className="backdrop-blur bg-background/30 hover:bg-background/50">
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" className="mr-2" />
              Back
            </Link>
          </Button>
        </header>
        <section className="flex flex-1 items-center justify-center py-10">
          <AuthForm />
        </section>
      </div>
    </main>
  )
}
