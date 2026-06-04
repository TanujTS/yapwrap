"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  GlobeIcon,
  LoaderCircleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type AuthMode = "sign-in" | "sign-up"

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [error, setError] = useState("")

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"

  const title = mode === "sign-in" ? "Welcome back" : "Create your account"
  const description = useMemo(
    () =>
      mode === "sign-in"
        ? "Continue into your Yapwrap workspace."
        : "Start with email or continue with Google.",
    [mode]
  )

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({
              email,
              password,
              callbackURL: `${baseUrl}/dashboard`,
              rememberMe,
            })
          : await authClient.signUp.email({
              email,
              password,
              name: name.trim() || email.split("@")[0] || "Yapwrap user",
              callbackURL: `${baseUrl}/dashboard`,
            })

      if (result.error) {
        const message = result.error.message || "Authentication failed."
        setError(message)
        toast.error(message)
        return
      }

      toast.success(mode === "sign-in" ? "Signed in." : "Account created.")
      router.push("/dashboard")
      router.refresh()
    } catch {
      const message = "Authentication failed. Please try again."
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleAuth() {
    setError("")
    setIsGoogleSubmitting(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${baseUrl}/dashboard`,
        errorCallbackURL: `${baseUrl}/auth`,
        newUserCallbackURL: `${baseUrl}/dashboard`,
      })

      if (result.error) {
        const message = result.error.message || "Google sign-in is not configured yet."
        setError(message)
        toast.error(message)
      }
    } catch {
      const message = "Google sign-in is not available right now."
      setError(message)
      toast.error(message)
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/95 backdrop-blur" size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailAuth}>
          <FieldGroup>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => value && setMode(value as AuthMode)}
              variant="outline"
              spacing={0}
              className="w-full"
            >
              <ToggleGroupItem value="sign-in" className="flex-1">
                Sign in
              </ToggleGroupItem>
              <ToggleGroupItem value="sign-up" className="flex-1">
                Create account
              </ToggleGroupItem>
            </ToggleGroup>

            {mode === "sign-up" ? (
              <Field>
                <FieldLabel htmlFor="name">
                  <UserIcon data-icon="inline-start" />
                  Name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isSubmitting || isGoogleSubmitting}
                />
              </Field>
            ) : null}

            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="email">
                <MailIcon data-icon="inline-start" />
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                required
                aria-invalid={!!error}
              />
            </Field>

            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">
                <LockIcon data-icon="inline-start" />
                Password
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                required
                minLength={8}
                aria-invalid={!!error}
              />
              <FieldError>{error}</FieldError>
            </Field>

            {mode === "sign-in" ? (
              <Field orientation="horizontal">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(value) => setRememberMe(value === true)}
                  disabled={isSubmitting || isGoogleSubmitting}
                />
                <FieldLabel htmlFor="remember">Remember me</FieldLabel>
              </Field>
            ) : null}

            <Button type="submit" size="lg" disabled={isSubmitting || isGoogleSubmitting}>
              {isSubmitting ? (
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <ArrowRightIcon data-icon="inline-start" />
              )}
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>

            <FieldSeparator>or</FieldSeparator>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || isGoogleSubmitting}
            >
              {isGoogleSubmitting ? (
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <GlobeIcon data-icon="inline-start" />
              )}
              Continue with Google
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to keep meetings moving without chasing threads.
        </p>
      </CardFooter>
    </Card>
  )
}
