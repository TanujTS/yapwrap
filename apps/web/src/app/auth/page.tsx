import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import DotGrid from "@/components/DotGrid"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
  return (
    <main className="relative flex min-h-svh overflow-hidden bg-background">
      <DotGrid
        className="pointer-events-none absolute inset-0 opacity-100"
        dotSize={5}
        gap={18}
        baseColor="#2F293A"
        activeColor="#059669"
        proximity={130}
        shockRadius={220}
        shockStrength={3}
      />
      <div className="pointer-events-none absolute inset-0 bg-background/55" />
      <div className="relative z-10 flex min-h-svh w-full flex-col px-5 py-5">
        <header className="flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              Yapwrap
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
