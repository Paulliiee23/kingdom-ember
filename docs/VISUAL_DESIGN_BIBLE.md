# Kingdom Ember — Visual Design Bible v1.0
Status: Art direction locked. Concept specification, not implemented 3D assets.

## Art direction
Polished stylised 3D medieval fantasy; readable silhouettes at mobile zoom; heroic proportions; hand-painted-inspired PBR materials; original IP. Primary palette: Midnight #171D30, Royal Violet #58358F, Antique Gold #CDA35C, Ember Orange #E27D38, Ivory #E8DFCB. Materials: warm limestone, dark oak, iron, bronze, fabric, translucent magical crystal. Target Three.js and responsive PC/mobile performance. Hero/prop models must have LOD and texture atlases.

## Founding heroes
| Name | Title | Role | Visual signature | Ability concept |
|---|---|---|---|---|
| Darian Ironcrest | The Unbroken | Infantry defence | Silver lion pauldron, violet cape, greatsword | Ironwall |
| Lyra Thornveil | The Wild Arrow | Ranged | Auburn braid, green leathers, leaf-shaped bow | Arrowstorm |
| Seraphina Emberborn | The Ember Queen | Leadership | Violet/gold plate, ember crown, ceremonial sword | Royal Decree |
| Alric Starweaver | The Arcane Scholar | Support | Indigo star-pattern robes, crystal staff | Astral Ward |
| Thorgrim Ashbreaker | The Mountain's Wrath | Assault | Copper beard, heavy iron, twin-headed axe | Earthshatter |

Hero deliverables: front/back turnaround, face portrait, rigged game model, idle/walk/attack/hit animations, weapon prop, three material variants, transparent portrait crop. Character names and abilities are proposals until gameplay integration.

## Troops
| Tier | Infantry | Ranged | Cavalry | Siege |
|---|---|---|---|---|
| I | Militia | Bow Scout | Rider | Wooden Ram |
| II | Footman | Longbowman | Lancer | Field Ballista |
| III | Sentinel | Marksman | Knight | Catapult |
| IV | Iron Guard | Storm Archer | Royal Charger | War Trebuchet |
| V | Ember Warden | Dawnseeker | Flameguard | Ember Colossus |

Tier silhouettes should be recognisable without colour; improve armour geometry, shields, mounts and machine frames. Faction colour belongs to banners, cloth and heraldry, not skin or armour materials.

## Locked fantasy cavalry progression
Cavalry direction: **fantasy progression** (confirmed). These are original Kingdom Ember designs, not adaptations of existing game characters.

| Tier | Unit | Mount | Visual identity | Intended role |
|---|---|---|---|---|
| I | Frontier Rider | Horse | Leather armour, small shield, spear, violet pennant | Fast entry-level cavalry |
| II | Ironmane Lancer | Armoured warhorse | Bronze barding, long lance, violet saddlecloth | Reliable charge unit |
| III | Thornhorn Cavalier | Giant antlered Thornhorn | Silver armour, forest motifs, reinforced saddle | Heavy woodland cavalry |
| IV | Ashfang Ravager | Obsidian-plated Ashfang beast | Dark volcanic plates, glowing amber markings | Aggressive assault cavalry |
| V | Embercrest Sovereign | Original lion-drake hybrid | Ivory-gold armour, crystalline mane, ember glow | Elite mythical cavalry |

### Barracks presentation contract
Four classes: Infantry, Ranged, Cavalry, Siege. Five tiers each. Show class and tier filters, unit name, owned/training counts, stats, unlock requirements, training cost and duration. On selection, reserve space for an animated rotatable 3D model (use original placeholder geometry until finished models exist). Keep a persistent visible training queue and timer, including on mobile. No silent automatic conversion of existing units: any promotion/retraining requires explicit rules and confirmation. Existing troop saves and class keys must remain compatible.

### Cavalry asset requirements
Each tier needs an original mount and rider silhouette, shared attachment points for saddle/rider/weapon, walk/run/charge/idle/hit animations, simple LOD meshes, and atlas-friendly materials. The Tier V lion-drake must not resemble a copyrighted game mount. Prioritize lightweight Three.js-compatible glTF/GLB exports.

## Castle progression
Levels 1–5: Frontier Keep (timber palisade, single tower).
Levels 6–15: Stone Citadel (masonry walls, gatehouse, watchtowers).
Levels 16–24: Royal Stronghold (double walls, grand keep, decorated rooftops).
Level 25: Ember Citadel (monumental towers, golden accents, ember crown).
Each stage must preserve a recognisable footprint, readable silhouette and camera-safe height.

## Building catalogue
Military: Barracks, Archery Range, Stables, Siege Workshop, Hospital.
Economy: Farm, Lumber Mill, Quarry, Mine, Gold Foundry, Warehouse.
Development: Academy, Forge, Hero Hall, Watchtower.
Command: Castle, Embassy, Rally Hall, Guild Hall.
Visual stages: Basic / Fortified / Elite; use modular foundations, wall pieces, roof kits and distinct animated accents.

## UI
Dark translucent navy panels, antique gold framing, violet selection, ember orange for high-priority actions. Resource bar at top; mobile-safe bottom navigation; icon+text labels; clear build/upgrade queues, battle reports, hero cards and formation selection. Accessible contrast, minimum 44px touch targets, reduced-motion option.

## World map
Biomes: Verdant Plains, Elderwood Forest, Ironspine Mountains, Frost Highlands, Fallen Ruins, Emberlands. Props: player castles, resource tiles, monsters, forts, roads, rivers and bridges. Camera LOD: silhouette pins at far zoom, simplified geometry mid zoom, detailed assets near zoom. Keep navigable terrain and selection targets distinct.

## Entrance screen
Five founding heroes form a cinematic composition: Seraphina central, Darian and Lyra foreground flanks, Alric and Thorgrim secondary flanks, kingdom skyline behind. Title at top, Enter Kingdom prominent, settings and accessibility accessible. Use actual game hero assets/portraits once available; no unrelated stock character artwork. Gentle cape movement, particles, idle motion; respect reduced motion.

## Asset implementation order
1. Character turnaround sheets and silhouettes.
2. Hero portrait crops and entrance-screen layout.
3. Rigged low-poly hero prototypes and animation contracts.
4. Troop tier-I archetypes, then tier variants.
5. Modular castle and buildings.
6. Shared UI component library.
7. World map biome/LOD kit.

## Acceptance criteria
Original visual identity; five heroes visually distinct; no clipped menus at 360px viewport; performant 3D scene; preserve local save keys kingdomEmberSave and emberGraphics; no copyrighted third-party assets.
