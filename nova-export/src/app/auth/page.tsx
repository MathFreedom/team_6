"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MascotBubble } from "@/components/onboarding/MascotBubble";

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pb-8">
        {/* Header */}
        <header className="pt-12 pb-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1e40af]">
            Nova
          </h2>
        </header>

        {/* Mascotte + bulle */}
        <div className="mt-8">
          <MascotBubble message="Salut ! Je suis Nova, prêt à te faire économiser sur ta facture d'électricité ?" />
        </div>

        {/* Titre central */}
        <section className="mt-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0a1628]">
            Économise sur ton électricité
          </h1>
        </section>

        {/* Boutons */}
        <section className="mt-10 flex flex-col gap-3">
          <Button
            onClick={() => router.push("/signup/identity")}
            className="h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a]"
          >
            Créer un compte
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/signup/identity?google=1")}
            className="h-14 w-full rounded-2xl border border-[rgba(10,22,40,0.08)] bg-white text-base font-medium text-[#0a1628] shadow-sm hover:bg-gray-50"
          >
            <GoogleIcon className="mr-3 h-5 w-5" />
            Continuer avec Google
          </Button>
        </section>

        {/* Lien bas */}
        <footer className="mt-auto pt-8 pb-2 text-center">
          <p className="text-sm text-[#5a6b80]">
            Déjà inscrit ?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-[#1e40af] hover:underline"
            >
              Se connecter
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
