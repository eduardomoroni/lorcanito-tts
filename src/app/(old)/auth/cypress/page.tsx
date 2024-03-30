"use client";

import { type ChangeEvent, useCallback, useEffect, useState } from "react";

import { Button } from "~/client/components/Button";
import { TextField } from "~/client/components/Fields";
import { signInWithCredentials } from "~/libs/3rd-party/firebase";
import { useAuth, useFirebaseApp, useUser } from "reactfire";
import { signIn, useSession } from "next-auth/react";

export default function SignInPage() {
  const firebase = useFirebaseApp();
  const auth = useAuth();

  const { data: session } = useSession();
  const { data: firebaseUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (window.Cypress && firebase) {
      // @ts-ignore
      window.firebase = firebase;
    }
  }, [firebase]);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (user && !session) {
        // console.log("User signed in", user);
        // console.log(session);
        user.getIdToken().then((token) => {
          console.log("token", token);
          signIn("credentials", {
            idToken: token,
            redirect: false,
          })
            .then(() => {
              console.log("Signed in with credentials");
            })
            .catch(console.error);
        });
      }
    });
  }, [firebaseUser, session]);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-y-8">
        <span className="text-2xl font-semibold text-gray-900">NEXT AUTH</span>
        <span data-test-id="next-auth-user">{JSON.stringify(session)}</span>
        <span className="text-2xl font-semibold text-gray-900">
          FIREBASE AUTH
        </span>
        <span data-test-id="firebase-user">
          {JSON.stringify(firebaseUser || {})}
        </span>
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
        <TextField
          required
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="false"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
          }}
        />
        <div>
          <Button
            type="submit"
            autoComplete="true"
            color={`blue`}
            variant={`solid`}
            className="w-full"
            onClick={() => {
              signInWithCredentials(email, password)
                .then(console.log)
                .catch(console.error);
            }}
          >
            <span>Sign in</span>
          </Button>
        </div>
      </div>
    </>
  );
}
