import type { FirebaseApp } from "firebase/app";
import { signInWithCredentials } from "~/libs/3rd-party/firebase";

function signInProgrammatically(email: string, password: string) {
  cy.window()
    .its("firebase")
    .then((firebase) => {
      cy.wrap(firebase).as("firebaseApp");
    });

  return cy.get("@firebaseApp").then((firebaseApp) => {
    signInWithCredentials(
      email,
      password,
      firebaseApp as unknown as FirebaseApp,
    )
      .then((userCredential) => {
        const user = userCredential.user;

        return cy.wrap(user);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

Cypress.Commands.add(
  "login",
  (
    email = Cypress.env(`EMAIL`) as string,
    password = Cypress.env(`PASSWORD`) as string,
  ) => {
    cy.session(
      email,
      () => {
        cy.intercept("GET", "/api/auth/session").as("session");
        cy.intercept("POST", "**/api/auth/callback/credentials").as(
          "credentials",
        );
        cy.visit("/auth/cypress");
        signInProgrammatically(email, password);
        cy.wait("@credentials");
        cy.wait("@session");
      },
      {
        validate: async () => {
          cy.request("PATCH", "/api/auth/status").then(({ body, status }) => {
            if (status !== 200) {
              throw new Error("Failed to login");
            }

            window.localStorage.setItem("userId", body.id);
          });
        },
        cacheAcrossSpecs: true,
      },
    ).then(async () => {
      const sessionData = await Cypress.session.getSession(email);
    });
  },
);
