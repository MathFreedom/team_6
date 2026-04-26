"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import {
  getFirebaseAuthErrorMessage,
  isFirebaseAuthAvailable,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth/firebase-auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  const isConfigured = isFirebaseAuthAvailable();
  const isValid = EMAIL_REGEX.test(email.trim()) && password.length >= 6;

  const handleEmailLogin = async () => {
    if (!isValid || !isConfigured) return;

    setLoading("email");
    try {
      await signInWithEmail({
        email: email.trim(),
        password,
      });
      router.push("/dashboard");
    } catch (error) {
      toast.error(getFirebaseAuthErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) return;

    setLoading("google");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      toast.error(getFirebaseAuthErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="app-shell page-gutter page-bottom-safe flex flex-col pb-8">
        <header
          className="pb-2 text-center pt-safe"
          style={{ paddingTop: "max(env(safe-area-inset-top), 48px)" }}
        >
          <h1 className="brand-wordmark text-[1.7rem] text-[#1e40af]">
            {APP_NAME}
          </h1>
        </header>

        <div className="mt-8">
          <MascotBubble
            gecko="/mascot/Auth_Screen_Preview.svg"
            message="Welcome back. Sign in to continue your Nova journey."
          />
        </div>

        <section className="mt-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0a1628]">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-[#5a6b80]">
            Use your email or your Google account.
          </p>
        </section>

        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleEmailLogin();
          }}
        >
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="marie@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
            />
          </Field>

          <Button
            type="submit"
            disabled={!isValid || !isConfigured || loading !== null}
            className="mt-2 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
          >
            {loading === "email" ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleGoogleLogin()}
            disabled={!isConfigured || loading !== null}
            className="h-14 w-full rounded-2xl border border-[rgba(10,22,40,0.08)] bg-white text-base font-medium text-[#0a1628] shadow-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <GoogleIcon className="mr-3 h-5 w-5" />
            {loading === "google" ? "Connecting to Google..." : "Continue with Google"}
          </Button>
        </div>

        {!isConfigured ? (
          <p className="mt-4 text-sm text-[#c2410c]">
            Firebase is not configured. Add the `NEXT_PUBLIC_FIREBASE_*` variables.
          </p>
        ) : null}

        <footer className="mt-auto pt-8 pb-2 text-center text-sm text-[#5a6b80]">
          Don't have an account yet?{" "}
          <Link href="/signup/identity" className="font-medium text-[#1e40af] hover:underline">
            Create an account
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#0a1628]">
        {label}
      </label>
      {children}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.39 3.58v2.96h3.86c2.26-2.08 3.58-5.15 3.58-8.78z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.96c-1.07.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.07C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.33c-.24-.72-.38-1.49-.38-2.33s.14-1.61.38-2.33V6.6H1.29A11.97 11.97 0 000 12c0 1.94.46 3.78 1.29 5.4l3.98-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.74c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.07C6.22 6.85 8.87 4.74 12 4.74z"
      />
    </svg>
  );
}
