"use client";

import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let persistencePromise: Promise<void> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureAuthReady() {
  if (!firebaseAuth) {
    throw new Error("firebase-auth-unavailable");
  }

  if (!persistencePromise) {
    persistencePromise = setPersistence(firebaseAuth, browserLocalPersistence);
  }

  await persistencePromise;
  return firebaseAuth;
}

export function isFirebaseAuthAvailable() {
  return Boolean(firebaseAuth);
}

export function getFirebaseAuthErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/invalid-email":
      return "This email address is invalid.";
    case "auth/weak-password":
      return "Password must contain at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a few minutes.";
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before completion.";
    case "auth/popup-blocked":
      return "The browser blocked the Google sign-in window.";
    case "auth/network-request-failed":
      return "Network connection failed. Try again in a moment.";
    case "auth/configuration-not-found":
      return "The Firebase provider is not enabled for this project.";
    default:
      return "An authentication error occurred.";
  }
}

export async function signInWithGoogle() {
  const auth = await ensureAuthReady();

  return signInWithPopup(auth, googleProvider);
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const auth = await ensureAuthReady();

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizeEmail(params.email),
    params.password,
  );

  const displayName = [params.firstName, params.lastName]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");

  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  return credential;
}

export async function signInWithEmail(params: {
  email: string;
  password: string;
}) {
  const auth = await ensureAuthReady();

  return signInWithEmailAndPassword(
    auth,
    normalizeEmail(params.email),
    params.password,
  );
}

export function splitDisplayName(displayName: string | null) {
  if (!displayName) {
    return { firstName: "", lastName: "" };
  }

  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}
