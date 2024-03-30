# Engine

This folder contains the actual rule engine and the Domain Models (Mobx)

# Testing strategy

- Every card must have tests for their effects (and regression tests, if any)
- Every core concept (Stack, Effect, Condition, Target, Ability, etc...) must have their own tests, these tests MUST assert both happy and non-happy paths, so the card tests don't have to be that extensive

# Don'ts

- Couple anything with React, this folder should be able to run directly on the server and without any UI
