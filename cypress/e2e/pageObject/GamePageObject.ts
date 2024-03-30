import type { Game } from "@lorcanito/engine";
import { LorcanitoCard } from "@lorcanito/engine";

export class GamePageObjectModel {
  gameId: string;
  game: Game;
  userId = "PoFBvS6qqsQAR7bdCVUeNLcldlu2";
  constructor(game: Game, gameId: string) {
    Promise.all([
      cy.task("createGame", { gameId: gameId, game, userId: this.userId }),
      cy.login(),
    ]);

    this.gameId = gameId;
    this.game = game;
    cy.log("Game created");
    // @ts-ignore
    cy.log(game);
  }

  visit() {
    cy.visit(`/game/${this.gameId}`);
    cy.findByTestId("privacy-policy-banner-accept", { log: false }).click({
      force: true,
    });
  }

  reloadAndWait() {
    cy.reload();
    cy.findByTestId(`play-zone-${this.userId}`).should("exist");
  }

  playerHand(params: { log?: false } = {}) {
    return cy
      .findByTestId(`hand-zone-${this.userId}`, params)
      .children(params)
      .filter("[data-id-card]", params);
  }

  discardPile() {
    return cy.findByTestId(`discard-pile-${this.userId}`);
  }

  playerInkwell() {
    return cy
      .findByTestId(`inkwell-zone-${this.userId}`)
      .children()
      .filter("[data-id-card]");
  }

  playerPlayArea(playerId = this.userId) {
    return cy
      .findByTestId(`play-zone-${playerId}`)
      .children()
      .filter("[data-id-card]");
  }

  alterHandModal() {
    const modalReference = cy.findByLabelText(/Altering Hand/i, {
      timeout: 7000,
    });

    return {
      submit() {
        modalReference.findByRole("button", { name: /Alter Hand/i }).click();

        return modalReference.should("not.exist");
      },
      findCards() {
        return modalReference.findByTestId("alter-hand-cards").children();
      },
    };
  }

  getPassTurnButton() {
    return cy.findByTestId(`pass-turn-button`);
  }

  opponent() {
    return {
      makeAMove: () => {},
      alterHand: (cardsToAlter: string[]) => {
        cy.task("makeAMove", {
          gameId: this.gameId,
          move: "ALTER_HAND",
          cardsToMulligan: cardsToAlter,
        });
      },
    };
  }

  quest(card: LorcanitoCard) {
    cy.intercept("POST", "/api/trpc/moves.quest*").as("quest");

    const instanceId = this.getInstanceId(card);
    this.playerPlayArea().filter(`[data-id-card="${instanceId}"]`).click();
    cy.get(`[data-testid="card-context-menu"]`).within(() => {
      cy.contains(/Quest/i).click();
    });

    cy.wait("@quest");
  }

  challenge(attacker: LorcanitoCard, defender: LorcanitoCard) {
    cy.intercept("POST", "/api/trpc/moves.challenge*").as("challenge");

    const instanceId = this.getInstanceId(attacker);
    this.playerPlayArea().filter(`[data-id-card="${instanceId}"]`).click();
    cy.get(`[data-testid="card-context-menu"]`).within(() => {
      cy.contains(/Challenge/i).click();
    });
    cy.get(`[data-id-card="${this.getInstanceId(defender)}"]`)
      .eq(1) // This is not the best, fix later
      .click();

    cy.wait("@challenge");
  }

  targetModalCard(card: LorcanitoCard) {
    return this.getTargetModal().within(() => {
      cy.get(`[data-id-card="${this.getInstanceId(card)}"]`);
    });
  }

  selectModalCards(cards: LorcanitoCard[]) {
    const instanceIds = cards.map((card) => this.getInstanceId(card));

    cy.intercept("POST", "/api/trpc/effects.resolveTopOfTheStack*", (req) => {
      const reqParams = req.body[0].json.params;
      expect(reqParams.player).to.equal(null);
      expect(reqParams.scry).to.equal(null);
      expect(reqParams.targets).to.have.all.members(instanceIds);
    }).as("resolveTopOfTheStack");

    this.getTargetModal().within(() => {
      instanceIds.forEach((card) => {
        cy.get(`[data-id-card="${card}"]`).click();
      });
    });
    cy.contains(/Confirm/i).click();
    cy.wait("@resolveTopOfTheStack");
  }
  getYesOrNoModal() {
    return cy.get(`[data-testid="yes-or-no-modal"]`, { log: false });
  }

  getStackLayerZone() {
    return cy.get(`[data-testid="stack-layer-zone"]`, { log: false });
  }

  getTargetModal() {
    return cy.get(`[data-testid="target-modal-cards"]`, { log: false });
  }

  getScryModal() {
    return cy.get(`[data-testid="scry-modal"]`, { log: false });
  }

  confirmOptionalAbility() {
    cy.log("Confirming optional ability");
    cy.intercept("POST", "/api/trpc/effects.resolveTopOfTheStack*").as(
      "resolveTopOfTheStack",
    );
    this.getYesOrNoModal().within(() => {
      cy.contains(/Yes/i, { log: false }).click({ log: false });
    });
    cy.wait("@resolveTopOfTheStack", { log: false });
    cy.get(`[data-testid="yes-or-no-modal"]`, { log: false }).should(
      "not.exist",
    );
  }

  addToInkwell(cardId: string) {
    this.playerHand().filter(`[data-id-card="${cardId}"]`).click();
    cy.findByTestId("card-context-menu")
      .findByTitle(/Add to Inkwell/i)
      .click();
  }

  playFromHand(card: LorcanitoCard) {
    cy.log(`Playing ${card.name}${card.title ? " - " + card.title : ""}`);
    cy.intercept("POST", "/api/trpc/moves.playCard*").as("playCard");
    const instanceId = this.getInstanceId(card);
    this.playerHand()
      .filter(`[data-id-card="${instanceId}"]`, { log: false })
      .should("have.length", 1, { log: false });
    this.playerHand()
      .filter(`[data-id-card="${instanceId}"]`, { log: false })
      .click();
    cy.findByTestId("card-context-menu").findByTitle(/Play/i).click();
    cy.wait("@playCard", { log: false });
  }

  playCard(cardId: string) {
    this.playerHand().filter(`[data-id-card="${cardId}"]`).click();
    cy.findByTestId("card-context-menu").findByTitle(/Play/i).click();
  }

  passTurn() {
    this.getPassTurnButton().click();
  }

  getInstanceId(card: LorcanitoCard) {
    const cards = Object.values(this.game.cards);
    const tableCard = cards.find((tableCard) => tableCard.cardId === card.id);
    return tableCard?.instanceId;
  }
  assertThatCardIsOnHand(card: LorcanitoCard) {
    this.playerHand()
      .filter(`[data-id-card="${this.getInstanceId(card)}"]`)
      .should("exist");
  }

  assertThatCardIsOnDiscard(card: LorcanitoCard) {
    this.discardPile().click({ force: true });
    this.targetModalCard(card).should("exist");
  }

  assertThatEffectsHaveBeenResolved() {
    this.getStackLayerZone().should("not.exist");
    this.getYesOrNoModal().should("not.exist");
    this.getTargetModal().should("not.exist");
    this.getScryModal().should("not.exist");
  }

  finalAsserts(assertions: () => void) {
    assertions();
    this.reloadAndWait();
    assertions();
  }
}
