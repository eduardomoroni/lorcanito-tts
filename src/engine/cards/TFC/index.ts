import type { LorcanitoCard } from "~/engine/cards/cardTypes";
import {
  beastMirror,
  coconutbasket,
  dingleHopper,
  drFacilierCards,
  eyeOfTheFate,
  fishboneQuill,
  fryingPan,
  lantern,
  magicGoldenFlower,
  magicMirror,
  musketeerTabard,
  plasmaBlaster,
  poisonedApple,
  scepterOfArendelle,
  shieldOfVirtue,
  stolenScimitar,
  swordOfTruth,
  ursulaCaldron,
  ursulaShellNecklace,
  whiteRabbitPocketWatch,
} from "~/engine/cards/TFC/items/items";
import {
  aWholeNewWorld,
  beOurGuest,
  bePrepared,
  friendsOnTheOtherSide,
  grabYourSword,
  hakunaMatata,
  letItGo,
  motherKnowsBest,
  oneJumpAhead,
  partOfOurWorld,
  reflection,
  suddenChill,
} from "~/engine/cards/TFC/songs/songs";
import {
  befuddle,
  breakAction,
  controlYourTemper,
  cutToTheChase,
  developYourBrain,
  doItAgain,
  dragonFire,
  fanTheFlames,
  fireTheCannons,
  freeze,
  healingGlow,
  hesGotASword,
  ifItsNotBaroque,
  justInTime,
  ransack,
  smash,
  stampede,
  stealFromRich,
  tangle,
  theBeastIsMine,
  viciousBetrayal,
  workTogether,
  youHaveForgottenMe,
} from "~/engine/cards/TFC/actions/actions";
import {
  abuMischievenusMonkey,
  aladdinCorneredSwordman,
  aladdinHeroicOutlaw,
  aladdinPrinceAli,
  aladdinStreetRat,
  annaHeirToArrendelle,
  archimedsHighlyEducatedOwl,
  arielOnHumanLegs,
  arielSpectacularSinger,
  arielWhoseitCollector,
  auroraBriarRose,
  auroraDreamingGuardian,
  auroraRegalPrincess,
  beastHardheaded,
  beastWolfbane,
  belleInventive,
  belleStrangeButBeautiful,
  captainColonelsLieutenant,
  captainHookCaptainOfTheJollyRoger,
  captainHookForcefulDuelist,
  captainHookRecklessPirate,
  captainHookThinkingAHappyThought,
  cerberusThreeHeadedDog,
  cheshireCat,
  chiefTui,
  cinderellaGentleAndKind,
  cruellaDeVilMiserableAsUsual,
  donaldDuck,
  donaldDuckMusketeer,
  donaldDuckStruttingHisStuff,
  drFacilierAgentProvocateur,
  drFacilierCharlatan,
  drFacilierRemarkable,
  dukeOfWeselton,
  elsaIceSurfer,
  elsaQueenRegent,
  elsaSnowQueen,
  elsaSpiritOfWinter,
  flotsamUrsulaSpy,
  flounderVoiceOfReason,
  flynnRiderCharmingRogue,
  gantuGalactic,
  gastonArrogantHunter,
  genieOnTheJob,
  geniePowerUnleashed,
  genieTheEverImpressive,
  goodyDaredevil,
  goofyMusketeer,
  goonsMaleficent,
  grammaTallaStoryteller,
  hadesInfernalSchemer,
  hadesKingOfOlympus,
  hadesLordOfUnderworld,
  hansThirteenthInLine,
  hasnSchemingPrince,
  heiheiBoatSnack,
  herculesTrueHero,
  horaceNoGood,
  iagoLoudMouthedParrot,
  jafarKeeperOfTheSecrets,
  jafarWicked,
  jasmineDisguised,
  jasmineQueenOfAgrabah,
  jasperCommonCrook,
  jetsamUrsulaSpy,
  johnSilverAlienPirate,
  jumbaJokibaaRenegadeScientist,
  kristoff,
  kronRightHandMan,
  kuzcoTemperamentalEmperor,
  ladyTremaine,
  lefouInstigator,
  legouBumbler,
  liloGalacticHero,
  liloMakingAWish,
  madHatterGraciousHost,
  magicBroomBucketBrigade,
  maleficentBinding,
  maleficentMonstrousDragon,
  maleficentSinisterVisitor,
  maleficentSorceress,
  maleficentUninvited,
  marshmallowPersistentGuardian,
  mauiDemiGod,
  mauiHeroToAll,
  mauriceWorldFamousInventor,
  maximusPalaceHorse,
  maximusRentlessPersuer,
  megaraPullingTheStrings,
  merlinSelfAppointmentMentor,
  mickeyBraveLittleTailor,
  mickeyMouseArtfulRogue,
  mickeyMouseDetective,
  mickeyMouseMusketeer,
  mickeyMouseSteamBoatPilot,
  mickeyMouseTrueFriend,
  mickeyMouseWaywardSorcerer,
  minnieMouseBelovedPrincess,
  minniMouseAlwaysClassy,
  moanaOfMotunui,
  moanChosenByTheOcean,
  motherGoethelSelfishManipulator,
  mrSmee,
  mufasaKingOfProudLands,
  mulanImperialSoldier,
  olafFriendlySnowman,
  pascalRapunzelCompanion,
  peterPanFearless,
  peterPanNeverLanding,
  philoctetes,
  pongoOlRascal,
  priceEricDashingAndBrave,
  princePhillipDragonSlayer,
  pumbaFriendlyWarhog,
  rafikiMysterious,
  rapunzelGiftedWithHealing,
  rapunzelLettingHerHairDown,
  robinHoodUnrivaledArcher,
  scarFieryUsurper,
  scarMastermind,
  scarShamelessFirebrand,
  seargentTibbies,
  sebastianCourtComposer,
  simbaFutureKing,
  simbaProtectiveCub,
  simbaReturnedKing,
  simbaRightfulHeir,
  starkeyHooksHenchman,
  stichtCarefreeSurfer,
  stichtNewDog,
  stitchAbomination,
  stitchRockStar,
  svenOficialIceDeliverer,
  tamatoaDrabLittleCrab,
  tamatoaSoShiny,
  teKaHeartless,
  teKaTheBurningOne,
  theQueenWickedAndVain,
  theWardrobeBelleConfident,
  tiggerWonderfulThing,
  timonGrubRustler,
  tinkerBellGiantFairy,
  tinkerBellMostHelpful,
  tinkerBellPeterPan,
  tinkerBellTinyTactician,
  tritonTheSeaKing,
  ursulaPowerHungry,
  yzmaAlchemist,
  zeusGodOfLightning,
} from "~/engine/cards/TFC/characters/characters";

export const allTFCCards: LorcanitoCard[] = [
  arielOnHumanLegs,
  arielSpectacularSinger,
  cinderellaGentleAndKind,
  goofyMusketeer,
  hadesKingOfOlympus,
  hadesLordOfUnderworld,
  heiheiBoatSnack,
  legouBumbler,
  liloMakingAWish,
  maximusPalaceHorse,
  maximusRentlessPersuer,
  mickeyMouseTrueFriend,
  minnieMouseBelovedPrincess,
  moanaOfMotunui,
  mrSmee,
  princePhillipDragonSlayer,
  pumbaFriendlyWarhog,
  rapunzelGiftedWithHealing,
  sebastianCourtComposer,
  simbaProtectiveCub,
  stichtCarefreeSurfer,
  stichtNewDog,
  stitchRockStar,
  timonGrubRustler,
  beOurGuest,
  controlYourTemper,
  hakunaMatata,
  healingGlow,
  justInTime,
  partOfOurWorld,
  youHaveForgottenMe,
  dingleHopper,
  lantern,
  ursulaShellNecklace,
  annaHeirToArrendelle,
  archimedsHighlyEducatedOwl,
  drFacilierAgentProvocateur,
  drFacilierCharlatan,
  drFacilierRemarkable,
  elsaQueenRegent,
  elsaSnowQueen,
  elsaSpiritOfWinter,
  flotsamUrsulaSpy,
  jafarKeeperOfTheSecrets,
  jafarWicked,
  jetsamUrsulaSpy,
  magicBroomBucketBrigade,
  maleficentBinding,
  maleficentSorceress,
  marshmallowPersistentGuardian,
  mickeyMouseWaywardSorcerer,
  olafFriendlySnowman,
  pascalRapunzelCompanion,
  rafikiMysterious,
  svenOficialIceDeliverer,
  theQueenWickedAndVain,
  theWardrobeBelleConfident,
  tinkerBellPeterPan,
  ursulaPowerHungry,
  yzmaAlchemist,
  zeusGodOfLightning,
  befuddle,
  freeze,
  friendsOnTheOtherSide,
  reflection,
  magicMirror,
  ursulaCaldron,
  whiteRabbitPocketWatch,
  aladdinPrinceAli,
  beastWolfbane,
  cheshireCat,
  cruellaDeVilMiserableAsUsual,
  dukeOfWeselton,
  flynnRiderCharmingRogue,
  genieOnTheJob,
  geniePowerUnleashed,
  genieTheEverImpressive,
  scarShamelessFirebrand,
  hasnSchemingPrince,
  horaceNoGood,
  iagoLoudMouthedParrot,
  jasperCommonCrook,
  johnSilverAlienPirate,
  jumbaJokibaaRenegadeScientist,
  kuzcoTemperamentalEmperor,
  ladyTremaine,
  madHatterGraciousHost,
  megaraPullingTheStrings,
  mickeyMouseArtfulRogue,
  mickeyMouseSteamBoatPilot,
  motherGoethelSelfishManipulator,
  peterPanNeverLanding,
  tamatoaDrabLittleCrab,
  tinkerBellMostHelpful,
  doItAgain,
  motherKnowsBest,
  stampede,
  stealFromRich,
  suddenChill,
  theBeastIsMine,
  viciousBetrayal,
  drFacilierCards,
  stolenScimitar,
  abuMischievenusMonkey,
  aladdinHeroicOutlaw,
  aladdinStreetRat,
  captainColonelsLieutenant,
  captainHookRecklessPirate,
  donaldDuck,
  elsaIceSurfer,
  gastonArrogantHunter,
  goodyDaredevil,
  lefouInstigator,
  maleficentMonstrousDragon,
  mauiHeroToAll,
  mickeyBraveLittleTailor,
  minniMouseAlwaysClassy,
  moanChosenByTheOcean,
  mulanImperialSoldier,
  peterPanFearless,
  pongoOlRascal,
  rapunzelLettingHerHairDown,
  scarFieryUsurper,
  seargentTibbies,
  stitchAbomination,
  teKaTheBurningOne,
  tiggerWonderfulThing,
  bePrepared,
  cutToTheChase,
  dragonFire,
  fanTheFlames,
  hesGotASword,
  tangle,
  poisonedApple,
  shieldOfVirtue,
  swordOfTruth,
  arielWhoseitCollector,
  auroraBriarRose,
  auroraDreamingGuardian,
  auroraRegalPrincess,
  belleInventive,
  belleStrangeButBeautiful,
  chiefTui,
  donaldDuckStruttingHisStuff,
  flounderVoiceOfReason,
  grammaTallaStoryteller,
  hadesInfernalSchemer,
  jasmineDisguised,
  jasmineQueenOfAgrabah,
  maleficentSinisterVisitor,
  maleficentUninvited,
  mauriceWorldFamousInventor,
  merlinSelfAppointmentMentor,
  mickeyMouseDetective,
  mufasaKingOfProudLands,
  philoctetes,
  robinHoodUnrivaledArcher,
  scarMastermind,
  tamatoaSoShiny,
  tritonTheSeaKing,
  developYourBrain,
  ifItsNotBaroque,
  letItGo,
  oneJumpAhead,
  workTogether,
  coconutbasket,
  eyeOfTheFate,
  fishboneQuill,
  magicGoldenFlower,
  scepterOfArendelle,
  aladdinCorneredSwordman,
  beastHardheaded,
  captainHookCaptainOfTheJollyRoger,
  captainHookForcefulDuelist,
  captainHookThinkingAHappyThought,
  cerberusThreeHeadedDog,
  donaldDuckMusketeer,
  gantuGalactic,
  goonsMaleficent,
  hansThirteenthInLine,
  herculesTrueHero,
  kristoff,
  kronRightHandMan,
  liloGalacticHero,
  mauiDemiGod,
  mickeyMouseMusketeer,
  priceEricDashingAndBrave,
  simbaFutureKing,
  simbaReturnedKing,
  simbaRightfulHeir,
  starkeyHooksHenchman,
  teKaHeartless,
  tinkerBellGiantFairy,
  tinkerBellTinyTactician,
  aWholeNewWorld,
  breakAction,
  fireTheCannons,
  grabYourSword,
  ransack,
  smash,
  beastMirror,
  fryingPan,
  musketeerTabard,
  plasmaBlaster,
];

export const allTFCCardsById: Record<string, LorcanitoCard> = {};
allTFCCards.forEach((card) => (allTFCCardsById[card.id] = card));
