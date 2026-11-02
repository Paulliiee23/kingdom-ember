# Kingdom Ember — whole-game 2.5D migration

## Art direction
Use the player's original Kingdom Ember castle concept sheets as the source of truth. The whole game uses a fixed 45-degree isometric azimuth, smooth drag panning and pinch/wheel zoom. This is a **visual presentation migration**, not a gameplay reset.

## Rendering approach
- **Castle city:** transparent, hand-painted isometric building sprites anchored to selectable 3D plot groups; simple 3D ground retains depth and placement calculations.
- **World map:** isometric terrain tiles, painted castles/forts/monsters, sprite-based march and battle effects; keep the existing coordinate system and path calculations.
- **Troops, heroes and villagers:** directional sprite sheets or skeletal 2D animation with consistent lighting and scale.
- **Tycoon:** illustrated board/platform layers, animated token, crystal and reward effects.
- **Labyrinth:** painted chamber backgrounds, boss and hero animation layers, particles and UI overlays.
- **UI:** keep existing menus and saves; replace placeholder imagery progressively.

## Current code
- `src/castleSprites.js` loads castle tier sprites from `public/art/castles/{frontier,timber,red,amethyst}.webp`.
- `src/buildingSprites.js` loads building sprites from `public/art/buildings/<building-type>.webp`.
- The main city renderer uses a loaded building sprite when available and otherwise retains the current procedural building.
- Both city and world map now share a fixed 45-degree azimuth. Drag and pinch zoom remain supported.

## Required production work
1. Produce and review actual original transparent sprite artwork for all castle levels and each city building.
2. Convert world terrain, objectives, monsters, armies and march visuals to layered sprites.
3. Convert Tycoon and Labyrinth stage artwork and animations.
4. Tune alpha sorting, building hit targets, occlusion, camera framing and sprite scaling.
5. Test on Android for memory, frame rate, visibility and build correctness.

**Not done:** The sprite images do not yet exist in the repository; the world map, Tycoon and Labyrinth still use their prior geometry. This commit is a camera and asset-pipeline foundation, not a completed 2.5D game.
