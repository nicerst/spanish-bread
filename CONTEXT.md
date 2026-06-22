# Domain Glossary — Spanish Bread

## Core Terms

**Player**
The adult user playing the game. Has no Spanish knowledge at game start. Goal: escape the town.

**Scene**
A fixed-camera 3D location containing exactly one NPC and one Task. The MVP has three Scenes: Café, Plaza, Bus Station.

**Task**
A real-world goal the Player must complete by speaking Spanish to the NPC. Completing all three Tasks triggers the Escape.

**Escape**
The win condition. Unlocked when all three Tasks are completed. Ends the current session.

**NPC (Non-Player Character)**
A Spanish-speaking character the Player interacts with. Each Scene has exactly one NPC. NPCs speak Spanish; the Player responds in Spanish.

**Dialogue Exchange**
A single back-and-forth unit: NPC speaks one line → Player chooses a response. A Scene contains 4–6 Dialogue Exchanges.

**Dialogue Option**
One of three Spanish phrases presented to the Player during a Dialogue Exchange. Exactly one is correct per Exchange.

**Correct Option**
The Dialogue Option that advances the story. Selecting it triggers a Correct Response from the NPC.

**Vocab Domain**
The cluster of Spanish vocabulary a Scene teaches. Each Scene owns exactly one Vocab Domain.
- Café → food/drink
- Plaza → directions
- Bus Station → travel/tickets

**Translation Gloss**
A brief English translation that fades in after a Player selects the Correct Option. Confirms meaning without interrupting flow.

**Confusion Reaction**
The NPC's animated/verbal response when the Player selects a wrong Dialogue Option. Signals incorrectness without a modal.

**Game State**
The persisted record of: current Scene, completed Tasks, and dialogue progress within the current Scene. Stored in localStorage.
