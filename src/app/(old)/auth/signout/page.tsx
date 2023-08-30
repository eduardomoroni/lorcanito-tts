"use client";

import Link from "next/link";
import { AuthLayout } from "~/components/AuthLayout";
import { Button } from "~/components/Button";
import { Logo } from "~/components/Logo";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFirebaseUser } from "~/3rd-party/firebase/FirebaseSessionProvider";
import { useAuth } from "reactfire";

// TODO: redirect to home page when there's no user session
export default function Login() {
  const { data: session } = useSession();
  const user = useFirebaseUser();
  const router = useRouter();
  const auth = useAuth();

  return (
    <>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home">
            <Logo className="h-10 w-auto rounded-full" />
          </Link>
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">Log out</h2>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-8">
          <div>
            <Button
              type="submit"
              variant="solid"
              color="blue"
              className="w-full"
              onClick={async () => {
                await Promise.all([
                  signOut({ redirect: false }),
                  auth.signOut(),
                ]);

                router.replace("/");
              }}
            >
              <span>
                Logout <span aria-hidden="true">&rarr;</span>
              </span>
            </Button>
            {/*<Button*/}
            {/*  type="submit"*/}
            {/*  variant="solid"*/}
            {/*  color="blue"*/}
            {/*  className="w-full"*/}
            {/*  href="/auth/signin"*/}
            {/*  onClick={() => {*/}
            {/*    router.push("/auth/signin");*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <span>*/}
            {/*    Login <span aria-hidden="true">&rarr;</span>*/}
            {/*  </span>*/}
            {/*</Button>*/}
          </div>

          {/*<div className="mt-20">*/}
          {/*  <h2 className="text-lg font-semibold text-gray-900">NextAuth</h2>*/}
          {/*  <p className="mt-2 text-sm text-gray-700">*/}
          {/*    {JSON.stringify(session)}*/}
          {/*  </p>*/}
          {/*  <h2 className="text-lg font-semibold text-gray-900">Firebase</h2>*/}
          {/*  <p className="mt-2 text-sm text-gray-700">{JSON.stringify(user)}</p>*/}
          {/*</div>*/}
        </div>
      </AuthLayout>
    </>
  );
}
