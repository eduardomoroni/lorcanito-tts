import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { signInWithCredentials } from "~/libs/3rd-party/firebase";

function signInProgrammatically(email: string, password: string) {
  cy.window()
    .its("firebase")
    .then((firebase) => {
      cy.wrap(firebase).as("firebaseApp");
    });

  cy.get("@firebaseApp").then((firebaseApp) => {
    signInWithCredentials(
      email,
      password,
      firebaseApp as unknown as FirebaseApp,
    )
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  // return cy.wrap(signIn);
}

Cypress.Commands.add(
  "login",
  (
    email = Cypress.env(`EMAIL`) as string,
    password = Cypress.env(`PASSWORD`) as string,
  ) => {
    cy.session(
      "player_one_session",
      () => {
        cy.intercept("POST", "**/api/auth/callback/credentials?").as(
          "credentials",
        );
        cy.visit("/auth/cypress");
        signInProgrammatically(email, password);
        cy.wait("@credentials");
      },
      {
        validate: async () => {
          cy.get("@firebaseApp").then((firebaseApp) => {
            // This is not the best, we should ideally call an endpoint that requires both auths present  (firebase and next-auth)
            cy.getCookie(Cypress.env(`COOKIE_NAME`)).should("exist");
          });
        },
        cacheAcrossSpecs: true,
      },
    );
  },
);
