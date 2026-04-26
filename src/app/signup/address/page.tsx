"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupProgress } from "@/components/signup/SignupProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import { useAuthProfileHydrated } from "@/lib/store/use-auth-profile-hydrated";

export default function AddressPage() {
  const router = useRouter();
  const hydrated = useAuthProfileHydrated();
  const storedAddress = useAuthProfileStore((s) => s.address);
  const setProfile = useAuthProfileStore((s) => s.setProfile);

  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    setStreet(storedAddress.street);
    setZipCode(storedAddress.zipCode);
    setCity(storedAddress.city);
  }, [hydrated, storedAddress.street, storedAddress.zipCode, storedAddress.city]);

  const isValid =
    street.trim().length >= 5 &&
    /^\d{5}$/.test(zipCode) &&
    city.trim().length >= 2;

  const handleSubmit = () => {
    if (!isValid) return;
    setProfile({
      address: { street: street.trim(), zipCode, city: city.trim() },
    });
    router.push("/scan-prm");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <SignupProgress step={3} />
      <div className="app-screen app-fill page-gutter page-bottom-safe flex flex-col pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/onboarding-1.svg" message="Last step. Your address helps me find the best offers available where you live." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Where do you live?
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
              Address
            </label>
            <Input id="street" type="text" autoComplete="street-address" placeholder="12 rue de la Republique" value={street} onChange={(e) => setStreet(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
          </div>

          <div className="flex gap-3">
            <div className="flex w-1/3 flex-col gap-2">
              <label htmlFor="zipCode" className="text-sm font-medium text-[#0a1628]">
                ZIP code
              </label>
              <Input id="zipCode" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="69002" maxLength={5} value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
            </div>
            <div className="flex w-2/3 flex-col gap-2">
              <label htmlFor="city" className="text-sm font-medium text-[#0a1628]">
                City
              </label>
              <Input id="city" type="text" autoComplete="address-level2" placeholder="Lyon" value={city} onChange={(e) => setCity(e.target.value)} className="h-14 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white text-base" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="mt-auto h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
          >
            Finish sign up
          </Button>
        </form>
      </div>
    </main>
  );
}
