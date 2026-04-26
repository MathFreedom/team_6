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

export default function AddressPage() {
  const router = useRouter();
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data: SignupData = JSON.parse(stored);
      if (data.address) {
        setStreet(data.address.street ?? "");
        setZipCode(data.address.zipCode ?? "");
        setCity(data.address.city ?? "");
      }
    } catch {
      /* noop */
    }
  }, []);

  const isValid =
    street.trim().length >= 5 &&
    /^\d{5}$/.test(zipCode) &&
    city.trim().length >= 2;

  const handleSubmit = () => {
    if (!isValid) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prev: SignupData = stored ? JSON.parse(stored) : {};
      const next: SignupData = {
        ...prev,
        address: { street: street.trim(), zipCode, city: city.trim() },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    router.push("/verify");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <SignupProgress step={3} />
      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[430px] flex-col px-6 pb-8">
        <div className="mt-4">
          <MascotBubble message="Dernière étape ! Ton adresse pour trouver les meilleures offres dispos chez toi." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Où habites-tu&nbsp;?
        </h1>

        <form
          className="mt-6 flex flex-1 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="street" className="text-sm font-medium text-[#0a1628]">
              Adresse
            </label>
            <Input
              id="street"
              type="text"
              autoComplete="street-address"
              placeholder="12 rue de la République"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex w-1/3 flex-col gap-2">
              <label htmlFor="zipCode" className="text-sm font-medium text-[#0a1628]">
                Code postal
              </label>
              <Input
                id="zipCode"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="69002"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
              />
            </div>
            <div className="flex w-2/3 flex-col gap-2">
              <label htmlFor="city" className="text-sm font-medium text-[#0a1628]">
                Ville
              </label>
              <Input
                id="city"
                type="text"
                autoComplete="address-level2"
                placeholder="Lyon"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="mt-auto h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
          >
            Terminer l&apos;inscription
          </Button>
        </form>
      </div>
    </main>
  );
}
