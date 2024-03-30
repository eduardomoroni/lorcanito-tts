export const LOBBIES_CHANNEL_ID =
  process.env.NODE_ENV === "development"
    ? "DEV_ENV_Lobbies"
    : "ProductionLobbiesID";
export const LOBBIES_CHANNEL_NAME =
  process.env.NODE_ENV === "development" ? "DEV ENVIRONMENT" : "Lorcanito Chat";
