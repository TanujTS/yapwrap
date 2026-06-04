"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOutIcon, UserRoundIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

function initials(name?: string | null, email?: string | null) {
  const value = name || email || "Y"
  return value
    .split(/[ .@_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AuthActions() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        Account
      </Button>
    )
  }

  if (!session) {
    return (
      <Button asChild>
        <Link href="/auth">
          <UserRoundIcon data-icon="inline-start" />
          Sign in
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        {session.user.image ? (
          <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
        ) : null}
        <AvatarFallback>{initials(session.user.name, session.user.email)}</AvatarFallback>
      </Avatar>
      <Button
        variant="outline"
        onClick={async () => {
          await authClient.signOut()
          router.refresh()
        }}
      >
        <LogOutIcon data-icon="inline-start" />
        Sign out
      </Button>
    </div>
  )
}
