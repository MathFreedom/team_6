"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupProgress } from "@/components/signup/SignupProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";

const STORAGE_KEY = "nova-signup";

type SignupData = {
  identity?: { firstName: string; lastName: string; email: string };
  phone?: string;
  address?: { street: string; zipCode: string; city: string };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IdentityPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: SignupData = JSON.parse(raw);
      if (data.identity) {
        setFirstName(data.identity.firstName ?? "");
        setLastName(data.identity.lastName ?? "");
        setEmail(data.identity.email ?? "");
      }
    } catch {
      /* noop */
    }
  }, []);

  const isValid =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    EMAIL_REGEX.test(email.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev: SignupData = raw ? JSON.parse(raw) : {};
      const next: SignupData = {
        ...prev,
        identity: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    router.push("/signup/phone");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <SignupProgress step={1} />
      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[430px] flex-col px-6 pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/onboarding-1.svg" message="On commence par faire connaissance ! Comment tu t'appelles ?" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Faisons connaissance
        </h1>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field label="Prénom" htmlFor="firstName">
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Marie"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
            />
          </Field>
          <Field label="Nom" htmlFor="lastName">
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Dupont"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="marie@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
            />
          </Field>

          <Button
            type="submit"
            disabled={!isValid}
            className="mt-auto h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
            style={{ marginTop: "auto" }}
          >
            Continuer
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
