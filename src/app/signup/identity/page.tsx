"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupProgress } from "@/components/signup/SignupProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import {
  getFirebaseAuthErrorMessage,
  isFirebaseAuthAvailable,
  signUpWithEmail,
} from "@/lib/auth/firebase-auth";
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import { useAuthProfileHydrated } from "@/lib/store/use-auth-profile-hydrated";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IdentityPage() {
  const router = useRouter();
  const hydrated = useAuthProfileHydrated();
  const storedFirstName = useAuthProfileStore((s) => s.firstName);
  const storedLastName = useAuthProfileStore((s) => s.lastName);
  const storedEmail = useAuthProfileStore((s) => s.email);
  const setProfile = useAuthProfileStore((s) => s.setProfile);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setFirstName(storedFirstName);
    setLastName(storedLastName);
    setEmail(storedEmail);
  }, [hydrated, storedFirstName, storedLastName, storedEmail]);

  const isValid =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    EMAIL_REGEX.test(email.trim()) &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async () => {
    if (!isValid) return;

    if (!isFirebaseAuthAvailable()) {
      toast.error("Firebase is not configured in this application.");
      return;
    }

    setLoading(true);
    try {
      const credential = await signUpWithEmail({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      setProfile({
        uid: credential.user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      router.push("/signup/phone");
    } catch (error) {
      toast.error(getFirebaseAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <SignupProgress step={1} />
      <div className="app-screen app-fill page-gutter page-bottom-safe flex flex-col pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/onboarding-1.svg" message="Let's start with the basics. What's your name?" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Let's get to know each other
        </h1>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <Field label="First name" htmlFor="firstName">
            <Input id="firstName" type="text" autoComplete="given-name" placeholder="Marie" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <Input id="lastName" type="text" autoComplete="family-name" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="marie@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword">
            <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Type your password again" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
          </Field>

          <Button
            type="submit"
            disabled={!isValid || loading}
            className="mt-auto h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
            style={{ marginTop: "auto" }}
          >
            {loading ? "Creating account..." : "Continue"}
          </Button>
        </form>
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
