"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import InputText from '@/components/form/InputText';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogIn: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);
    if (result?.error) {
      setError("The email or password is incorrect.");
      return;
    }

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    router.push(callbackUrl || "/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-full flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-16 bg-white p-8 transition-all sm:max-w-lg sm:flex-none sm:rounded-3xl sm:p-16">
        <div className="h-8 w-auto">
          <img
            className="h-full w-full object-contain"
            src="/logos/text-black-logo.svg"
            alt="Taplify Logo"
          />
        </div>

        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-semibold">Welcome back!</h1>
            <p className="text-primary-500">
              New to Taplify?{" "}
              <Link
                className="text-accent-500 transition-all hover:text-accent-700"
                href="/register"
              >
                Register
              </Link>
              .
            </p>
          </div>

          <form
            method="POST"
            onSubmit={handleLogIn}
            className="flex w-full flex-col gap-4"
          >
            <InputText
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
            />
            <InputText
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={setPassword}
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary-900 px-6 py-3 font-semibold text-primary-50 ring-primary-900 ring-offset-2 transition-all duration-200 focus:outline-none enabled:hover:bg-primary-950 enabled:focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex w-full items-center justify-center rounded-lg border border-primary-200 px-6 py-3 text-sm font-semibold transition hover:bg-primary-50"
          >
            Continue with Google
          </button>

          <Link
            className="text-primary-500 underline underline-offset-2 transition-all hover:text-primary-700"
            href="/forgot-password"
          >
            Forgot password or email?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
