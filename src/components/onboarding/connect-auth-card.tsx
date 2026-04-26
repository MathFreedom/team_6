"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type ConfirmationResult,
  type User,
  RecaptchaVerifier,
} from "firebase/auth";
import { LoaderCircle, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firebaseAuth } from "@/lib/firebase";
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import { cn } from "@/lib/utils/cn";

type AuthMode = "google" | "email" | "phone";

const actionCodeSettings = {
  url: "http://localhost:3000/connect",
  handleCodeInApp: true,
};

export function ConnectAuthCard() {
  const [mode, setMode] = useState<AuthMode>("google");
  const [currentUser, setCurrentUser] = useState<User | null>(firebaseAuth.currentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [emailLinkBusy, setEmailLinkBusy] = useState(false);
  const recaptchaContainerId = useId();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const setProfile = useAuthProfileStore((state) => state.setProfile);

  useEffect(() => {
    const storedState = useAuthProfileStore.getState();
    setEmail(storedState.email);
    setPhone(storedState.phone);
    setAddress(storedState.address);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      const storedState = useAuthProfileStore.getState();
      setCurrentUser(user);
      setProfile({
        uid: user?.uid ?? null,
        email: user?.email ?? storedState.email,
        phone: user?.phoneNumber ?? storedState.phone,
      });
    });

    return unsubscribe;
  }, [setProfile]);

  useEffect(() => {
    void (async () => {
      try {
        await getRedirectResult(firebaseAuth);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Google sign-in failed.";
        toast.error(message);
      }
    })();
  }, []);

  useEffect(() => {
    setProfile({ email, phone, address });
  }, [address, email, phone, setProfile]);

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const provider = useMemo(() => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    return googleProvider;
  }, []);

  const createRecaptchaVerifier = () => {
    if (typeof window === "undefined") {
      throw new Error("Phone sign-in is only available in the browser.");
    }

    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
      size: "normal",
      callback: () => undefined,
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const persistSession = async () => {
    await setPersistence(firebaseAuth, browserLocalPersistence);
  };

  const isMobileViewport = () => window.matchMedia("(max-width: 768px)").matches;

  const handleGoogleAuth = async () => {
    setIsBusy(true);

    try {
      await persistSession();

      if (isMobileViewport()) {
        await signInWithRedirect(firebaseAuth, provider);
        return;
      }

      await signInWithPopup(firebaseAuth, provider);
      toast.success("Google account connected.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleEmailAuth = async (intent: "signup" | "signin") => {
    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setIsBusy(true);

    try {
      await persistSession();

      if (intent === "signup") {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
        toast.success("Account created.");
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        toast.success("Signed in.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email authentication failed.";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleEmailLink = async () => {
    if (!email) {
      toast.error("Enter an email address first.");
      return;
    }

    setEmailLinkBusy(true);

    try {
      await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
      window.localStorage.setItem("nova-email-link", email);
      toast.success("Magic link sent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Magic link failed.";
      toast.error(message);
    } finally {
      setEmailLinkBusy(false);
    }
  };

  const handlePhoneStart = async () => {
    if (!phone) {
      toast.error("Enter a phone number in international format.");
      return;
    }

    setIsBusy(true);

    try {
      await persistSession();
      const verifier = createRecaptchaVerifier();
      const result = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
      setConfirmationResult(result);
      toast.success("SMS code sent.");
    } catch (error) {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      const message = error instanceof Error ? error.message : "Phone authentication failed.";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!confirmationResult || !smsCode) {
      toast.error("Enter the SMS code.");
      return;
    }

    setIsBusy(true);

    try {
      await confirmationResult.confirm(smsCode);
      toast.success("Phone number verified.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid SMS code.";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/15">
      <CardHeader className="space-y-3 pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" />
          Secure entry point
        </div>
        <CardTitle className="text-2xl">Authenticate on your phone, then continue</CardTitle>
        <CardDescription>
          The QR code opens this page directly on mobile. You can sign in with Google, email and password, or SMS code, then keep your address handy for the rest of the flow.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-muted/50 p-1">
          {([
            ["google", "Google"],
            ["email", "Email"],
            ["phone", "Phone"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-[18px] px-3 py-2 text-sm font-semibold transition",
                mode === value ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {currentUser ? (
          <div className="space-y-3 rounded-[24px] border border-primary/15 bg-primary/6 p-4 text-sm">
            <div className="font-medium text-foreground">Authenticated session active</div>
            <div className="space-y-1 text-muted-foreground">
              <div>{currentUser.email ?? "No email provided"}</div>
              <div>{currentUser.phoneNumber ?? phone ?? "No phone provided"}</div>
              <div>{address || "No address provided"}</div>
            </div>
            <Button type="button" variant="secondary" onClick={() => void signOut(firebaseAuth)}>
              Disconnect
            </Button>
          </div>
        ) : null}

        {mode === "google" ? (
          <div className="space-y-3">
            <Button type="button" className="w-full" onClick={() => void handleGoogleAuth()} disabled={isBusy}>
              {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Continue with Google
            </Button>
            <p className="text-xs text-muted-foreground">
              On mobile we use a redirect flow so scanning the QR code can continue inside the browser without a desktop popup.
            </p>
          </div>
        ) : null}

        {mode === "email" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="pl-11"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" onClick={() => void handleEmailAuth("signup")} disabled={isBusy}>
                {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Create account
              </Button>
              <Button type="button" variant="secondary" onClick={() => void handleEmailAuth("signin")} disabled={isBusy}>
                Sign in
              </Button>
            </div>

            <Button type="button" variant="ghost" className="w-full" onClick={() => void handleEmailLink()} disabled={emailLinkBusy}>
              {emailLinkBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Send magic link instead
            </Button>
          </div>
        ) : null}

        {mode === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-phone">Phone number</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="pl-11"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <Button type="button" className="w-full" onClick={() => void handlePhoneStart()} disabled={isBusy}>
              {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Send SMS code
            </Button>

            {confirmationResult ? (
              <div className="space-y-2">
                <Label htmlFor="auth-sms-code">SMS code</Label>
                <Input
                  id="auth-sms-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={smsCode}
                  onChange={(event) => setSmsCode(event.target.value)}
                  placeholder="123456"
                />
                <Button type="button" variant="secondary" className="w-full" onClick={() => void handlePhoneVerify()} disabled={isBusy}>
                  Verify code
                </Button>
              </div>
            ) : null}

            <div id={recaptchaContainerId} className="overflow-hidden rounded-[20px]" />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="auth-address">Address</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="auth-address"
              type="text"
              autoComplete="street-address"
              className="pl-11"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="12 rue des Lilas, 75011 Paris"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This stays available locally so the rest of the onboarding can reuse it once you connect your contract.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
