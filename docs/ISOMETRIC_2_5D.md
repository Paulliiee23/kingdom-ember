# Kingdom Ember — fixed isometric 2.5D city

The city camera is fixed at a 45-degree azimuth. One-finger drag pans and pinch/wheel zooms. Rotation gestures remain available on the world map only.

## Castle sprite contract
Create **original** transparent-background isometric castle artwork from the user's Kingdom Ember reference sheets. Place files at:

- `public/art/castles/frontier.webp` — levels 1–8, stone and timber, blue banners
- `public/art/castles/timber.webp` — levels 9–16, taller blue-bannered timber bastion
- `public/art/castles/red.webp` — levels 17–24, red roofs and banners, golden trim
- `public/art/castles/amethyst.webp` — levels 25–30, purple roofs, gold, crystal spires

The images must be transparent RGBA WebP with **no baked ground**, consistent view direction, consistent visual scale and identical anchor position at the centre of the building footprint. Recommended source art: 1536×1536 or 2048×2048, exported to optimised WebP. Leave margins for tall spires and flags. Use the same isometric viewpoint and consistent lighting for every tier. Do not use the whole reference-sheet image as a sprite.

The loader in `src/castleSprites.js` only selects the four tier artworks today. A separate per-level sprite set is required to meet the complete 1–30 visual-progression specification.

## Current status
The runtime will attempt to load the four WebP files; when absent, it falls back to the existing GLB castle. This is intentional. **No finished sprite artwork is included yet.** The surrounding city buildings remain 3D and will need their own 2.5D treatment. Visual QA on Android, artwork alignment, shadows, alpha sorting, and performance testing remain open.

Do not describe this as a finished 2.5D city until artwork and device tests are complete.
