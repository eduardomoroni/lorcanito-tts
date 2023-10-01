"use client";

import Link from "next/link";
import { type ChangeEvent, useCallback, useState } from "react";

import { AuthLayout } from "~/spaces/components/AuthLayout";
import { Button } from "~/spaces/components/Button";
import { TextField } from "~/spaces/components/Fields";
import { Logo } from "~/spaces/components/Logo";
import { signIn } from "~/libs/3rd-party/firebase";
import { usePathname, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasError, setHasError] = useState<unknown>(undefined);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const sendSignInRequest = useCallback(() => {
    if (hasSubmitted) {
      return;
    }

    signIn(email, "/", window.location.origin)
      .then(() => {
        setHasSubmitted(true);
        setHasError(undefined);
      })
      .catch((error) => {
        console.error(error);
        setHasError(error);
      });
  }, [hasSubmitted, email]);

  return (
    <>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo className="h-10 w-auto rounded-full" />
          </Link>
          <div className="mt-20">
            {!hasError ? (
              <h2 className="text-lg font-semibold text-gray-900">
                Sign in to your account
              </h2>
            ) : (
              <h2 className="text-lg font-semibold text-red-700">
                Error during sign in
              </h2>
            )}
            {!hasError ? (
              <p className="mt-2 text-sm text-gray-700">
                For security concerns we only use passwordless authentication,
                just put your e-mail and check your inbox. You can also use a
                Fake or Temporary email, we don't really use your email for
                anything else other than signing you in.
                <br />
                Important note: You will receive a link via e-mail to sign in,
                you have to open the link in the SAME browser you used to open
                this page.
              </p>
            ) : (
              <p className="mt-2 text-sm text-red-700">
                {JSON.stringify(hasError)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-8">
          <TextField
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="true"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
            }}
            required
          />
          <div>
            <Button
              type="submit"
              autoComplete="true"
              color={hasSubmitted ? "slate" : `blue`}
              variant={hasSubmitted ? "outline" : `solid`}
              className="w-full"
              disabled={hasSubmitted}
              onClick={sendSignInRequest}
            >
              <span>
                {!hasSubmitted ? "Sign in" : "Check your inbox to sign in"}
              </span>
            </Button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
