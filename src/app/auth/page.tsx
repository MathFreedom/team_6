"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import {
  getFirebaseAuthErrorMessage,
  isFirebaseAuthAvailable,
  signInWithGoogle,
  splitDisplayName,
} from "@/lib/auth/firebase-auth";
import { Button } from "@/components/ui/button";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { APP_NAME } from "@/lib/constants";

export default function AuthPage() {
  const router = useRouter();
  const setProfile = useAuthProfileStore((state) => state.setProfile);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleSignup = async () => {
    if (!isFirebaseAuthAvailable()) {
      toast.error("Firebase is not configured in this application.");
      return;
    }

    setLoadingGoogle(true);
    try {
      const result = await signInWithGoogle();
      const { firstName, lastName } = splitDisplayName(result.user.displayName);

      setProfile({
        uid: result.user.uid,
        firstName,
        lastName,
        email: result.user.email ?? "",
        phone: result.user.phoneNumber ?? "",
      });

      router.push("/signup/phone");
    } catch (error) {
      toast.error(getFirebaseAuthErrorMessage(error));
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="app-shell page-gutter page-bottom-safe flex flex-col pb-8">
        <header className="pt-safe pb-2 text-center" style={{ paddingTop: "max(env(safe-area-inset-top), 48px)" }}>
          <h2 className="brand-wordmark text-[1.7rem] text-[#1e40af]">
            {APP_NAME}
          </h2>
        </header>

        <div className="mt-8">
          <MascotBubble
            gecko="/mascot/Auth_Screen_Preview.svg"
            message="Hi! I'm Nova, ready to help you save on your electricity bill?"
          />
        </div>

        <section className="mt-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0a1628]">
            Save on your electricity
          </h1>
        </section>

        <section className="mt-10 flex flex-col gap-3">
          <Button
            onClick={() => router.push("/signup/identity")}
            className="h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a]"
          >
            Create an account
          </Button>

          <Button
            variant="outline"
            onClick={() => void handleGoogleSignup()}
            disabled={loadingGoogle}
            className="h-14 w-full rounded-2xl border border-[rgba(10,22,40,0.08)] bg-white text-base font-medium text-[#0a1628] shadow-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <GoogleIcon className="mr-3 h-5 w-5" />
            {loadingGoogle ? "Connecting to Google..." : "Continue with Google"}
          </Button>
        </section>

        <footer className="mt-auto pt-8 pb-2 text-center">
          <p className="text-sm text-[#5a6b80]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-[#1e40af] hover:underline"
            >
              Sign in
            </button>
          </p>
        </footer>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.39 3.58v2.96h3.86c2.26-2.08 3.58-5.15 3.58-8.78z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.96c-1.07.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.07C3.26 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.33c-.24-.72-.38-1.49-.38-2.33s.14-1.61.38-2.33V6.6H1.29A11.97 11.97 0 000 12c0 1.94.46 3.78 1.29 5.4l3.98-3.07z"/>
      <path fill="#EA4335" d="M12 4.74c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.07C6.22 6.85 8.87 4.74 12 4.74z"/>
    </svg>
  );
}
