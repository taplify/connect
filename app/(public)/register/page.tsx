"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import InputText from "@/components/form/InputText";
import Logo from "@/components/logo/TaplifyLogo";
import useStep from "@/hooks/step";

function Register() {
  const { currentStep, nextStep } = useStep(2);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUsername = e.target.value;
    setUsername(inputUsername);
  };

  const handleCreateAccount = async () => {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to create your account.");
      setIsSubmitting(false);
      return;
    }

    const signedIn = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (signedIn?.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-full flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col justify-center gap-12 bg-white p-8 transition-all sm:max-w-lg sm:flex-none sm:rounded-3xl sm:p-16">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg">
          <Logo />
        </div>

        {currentStep === 1 && (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold">Register to Taplify</h1>
              <p className="text-primary-700">
                Get your customized profile and more for free.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-1 items-center gap-2 rounded-lg border-0 px-3 py-4 ring-1 ring-primary-200 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-900">
                  <div className="relative h-5 w-5">
                    <img
                      className="h-full w-full object-contain"
                      src="/logos/letter-black-logo.svg"
                      alt="Taplify Letter Logo"
                    />
                  </div>

                  <div className="flex flex-1 items-center">
                    <span className="font-semibold">taplify.io/</span>
                    <input
                      value={username}
                      onChange={handleUsernameInput}
                      className="w-full bg-transparent placeholder:text-primary-200 focus:outline-none"
                      type="text"
                      placeholder="username"
                    />
                  </div>

                  {username ? (
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6 text-red-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <button
                  onClick={nextStep}
                  className="w-full rounded-lg bg-primary-900 px-6 py-3 font-semibold text-primary-50 ring-primary-900 ring-offset-2 transition-all duration-200 focus:outline-none enabled:hover:bg-primary-950 enabled:focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next Step
                </button>
              </div>

              <p className="text-sm text-primary-500">
                By registering an account, you agree to our{" "}
                <a href="#" className="underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <p className="text-sm text-primary-500">
              Already have an account?{" "}
              <Link className="text-accent-700" href="/login">
                Login
              </Link>
              .
            </p>
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary-900">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg">{username} is available!</p>
              </div>
              <h1 className="text-3xl font-semibold">
                Let's create an account
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <InputText
                id="email"
                label="Email"
                value={email}
                onChange={setEmail}
              />
              <InputText
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
              />
              {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateAccount}
                className="mt-2 w-full rounded-lg bg-primary-900 px-6 py-3 text-sm font-semibold text-primary-50 ring-primary-900 ring-offset-2 transition-all duration-200 focus:outline-none enabled:hover:bg-primary-950 enabled:focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </div>

            <p className="text-sm text-primary-500">
              By registering an account, you agree to our{" "}
              <a href="#" className="underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
