"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "~/spaces/components/AuthLayout";
import { Button } from "~/spaces/components/Button";
import { Logo } from "~/spaces/components/Logo";
import { useEffect, useState } from "react";
import { confirmSignIn } from "~/libs/3rd-party/firebase";
import { signIn } from "next-auth/react";
import { shouldConnectAuthEmulator } from "~/libs/3rd-party/firebase/emulator";
import { useAuth } from "reactfire";
import { browserSessionPersistence, setPersistence } from "firebase/auth";

let counter = 0;

export default function Page() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [error, setError] = useState<unknown | undefined>(undefined);
  const auth = useAuth();

  useEffect(() => {
    counter++;
    async function nextAuthSignIn() {
      const email: string =
        window.localStorage.getItem("emailForSignIn") ||
        urlSearchParams?.get("email") ||
        window.prompt(
          "As a security measure, please confirm your e-mail address"
        ) ||
        "";

      try {
        if (shouldConnectAuthEmulator()) {
          console.log("Setting session persistence");
          await setPersistence(auth, browserSessionPersistence);
        }

        const result = await confirmSignIn(window.location.href, email);

        if (!result) {
          console.error("Not able to get user");
          window.alert(
            "Something went wrong. Please try again, make sure you are using the same browser during the whole process"
          );
          return;
        }

        const redirectUrl = urlSearchParams?.get("redirectUrl") || "/";
        const idToken = await result.user.getIdToken();
        await signIn("credentials", {
          idToken,
          callbackUrl: redirectUrl,
          redirect: true,
        });

        if (shouldConnectAuthEmulator()) {
          console.log("Logged in with credentials");
          console.log(result);
        }

        router.replace(redirectUrl);
        // router.push(redirectUrl);
      } catch (e) {
        console.error("Error while verifying email link, ", email);
        console.error(decodeURIComponent(window.location.search));
        console.error(e);
        // Strict mode runs twice,
        console.error("Counter: ", counter);
        setError(e);
      }
    }

    nextAuthSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo className="h-10 w-auto rounded-full" />
          </Link>
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              You should be redirected in 5 seconds, if you&amp;apos;re not
              redirect: make sure that you have open the link in the same
              browser you signed in.
            </p>
            {
              // @ts-expect-error error is not a string
              error?.message && (
                <p className="mt-2 text-sm text-red-600">
                  <Link
                    href="/auth/signin/"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Try again
                  </Link>{" "}
                  please.
                </p>
              )
            }
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-8">
          <div>
            <Button
              type="submit"
              variant="solid"
              color="blue"
              href="/auth/signin"
              className="w-full"
              onClick={() => {
                router.push("/auth/signin");
              }}
            >
              <span>Go to Sign in Page</span>
            </Button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
