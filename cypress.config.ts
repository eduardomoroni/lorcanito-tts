import { defineConfig } from "cypress";

export default defineConfig({
  // Please create a file "./cypress.env.json" and add the env vars
  // env: env,
  e2e: {
    baseUrl: "http://localhost:3000",
    chromeWebSecurity: false,
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
