import { expect, Locator, Page } from "@playwright/test";

export class GamePage {
  readonly page: Page;
  readonly disclaimerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.disclaimerButton = page.getByRole("button", { name: "I understand" });
  }

  async goto() {
    await this.page.goto("/game");
    await this.disclaimerButton.click();
  }
}
