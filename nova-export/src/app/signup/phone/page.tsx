"use client";

import { useEffect, useMemo, useState } from "react";
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

function formatFrPhone(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 4));
  if (d.length > 4) parts.push(d.slice(4, 6));
  if (d.length > 6) parts.push(d.slice(6, 8));
  if (d.length > 8) parts.push(d.slice(8, 10));
  return parts.join(" ");
}

export default function PhonePage() {
  const router = useRouter();
  const [raw, setRaw] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data: SignupData = JSON.parse(stored);
      if (data.phone) setRaw(data.phone.replace(/\D/g, "").slice(0, 10));
    } catch {
      /* noop */
    }
  }, []);

  const display = useMemo(() => formatFrPhone(raw), [raw]);
  const isValid = /^0[1-9]\d{8}$/.test(raw);

  const handleSubmit = () => {
    if (!isValid) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prev: SignupData = stored ? JSON.parse(stored) : {};
      const next: SignupData = { ...prev, phone: raw };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    router.push("/signup/address");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <SignupProgress step={2} />
      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[430px] flex-col px-6 pb-8">
        <div className="mt-4">
          <MascotBubble message="Ton numéro pour te confirmer le compte par SMS. Pas de spam, promis." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Ton numéro de téléphone
        </h1>

        <form
          className="mt-6 flex flex-1 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-[#0a1628]">
              Numéro de téléphone
            </label>
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-[#5a6b80]"
              >
                +33
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="06 12 34 56 78"
                value={display}
                onChange={(e) => setRaw(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white pl-14 text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="mt-auto h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
          >
            Continuer
          </Button>
        </form>
      </div>
    </main>
  );
}
