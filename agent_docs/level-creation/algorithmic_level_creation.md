# A Modular, Multi-Layered Architecture for Procedural Level Generation in 2D Platformers

## Introduction: A Principled Framework for Platformer PCG

### A. The Challenge of Procedural Platformers

Procedural Content Generation (PCG) has become a cornerstone of modern game development, offering solutions for increasing replayability, reducing development costs, and generating vast game worlds.1 From the infinite dungeons of

_Rogue_ (1980) to the sprawling galaxies of _Elite_ (1984), PCG has a long and successful history.3 However, its application to 2D platformers presents a unique and formidable set of challenges that distinguish it from other genres.

The core difficulty lies in the genre's fundamental mechanics. In a top-down role-playing game (RPG) or a strategy game, the connectivity of a map is often the primary constraint; as long as a player can navigate from point A to point B, the level is typically functional. In a platformer, however, the very geometry of the world is intrinsically tied to the player's physical abilities.5 A seemingly minor change—widening a chasm by a single tile or raising a platform beyond the player's maximum jump height—can transform a level from a fair challenge into a physically impossible barrier.6 This sensitivity means that the loosely constrained, random placement of elements that proves effective in dungeon or terrain generation can easily lead to accidentally unwinnable or frustratingly unfair platformer levels.6

Early PCG systems were often driven by technical necessity, such as data compression to fit massive worlds into limited memory, or the simple desire to provide endless content.1 The result was often functional but lacked the deliberate design and pacing that characterize high-quality, handcrafted levels. The output could feel chaotic, random, and ultimately, less engaging than a human-designed experience.7 The evolution of PCG in platformers is therefore a direct response to this challenge: a shift in focus from the

_quantity_ of content to the _quality_ of the player experience. The goal is no longer just to create more levels, but to generate more _good_ levels—levels that are not only solvable but also interesting, varied, and intentionally paced.8

### B. Core Philosophy: The Hybrid, Multi-Layered Approach

To address the unique constraints of the platformer genre, a more sophisticated approach than pure algorithmic generation is required. This report advocates for a core philosophy centered on a **hybrid, multi-layered architectural framework**. This paradigm moves away from the idea of a single, monolithic algorithm that generates a level from scratch. Instead, it conceives of level generation as a pipeline of distinct, specialized processes that intelligently blend designer-authored content with procedural techniques.

This philosophy is embodied by some of the most successful procedurally generated platformers, such as _Spelunky_ and _Dead Cells_.10 These games do not rely on pure randomness. Instead, they leverage a library of handcrafted "chunks," "templates," or "rooms" as their fundamental building blocks.10 This hybrid model allows designers to retain fine-grained control over the micro-level gameplay experience—ensuring that individual challenges are fair, fun, and well-tested—while empowering the procedural algorithm to handle the macro-level assembly, creating novel combinations and layouts that ensure high replayability.11 The human designer's role is not eliminated but elevated: they transition from placing individual tiles to designing the rules, components, and patterns that fuel the generative system.14

The architecture detailed in this report formalizes this hybrid philosophy by decomposing the generation process into four distinct, logical layers:

1.  **Macro-Generation:** Defines the high-level structure and flow of the level, establishing a guaranteed solvable "critical path" before any geometry is placed.
    
2.  **Meso-Generation:** Translates the abstract macro-structure into concrete, large-scale geometry and terrain, forming the main structural shell of the level.
    
3.  **Micro-Generation:** Populates the structure with fine-grained gameplay elements, such as platforms, enemies, hazards, and collectibles, focusing on moment-to-moment challenge and rhythm.
    
4.  **Decoration-Generation:** Applies aesthetic and atmospheric elements, dressing the functional level in a cohesive and visually appealing theme, completely separate from gameplay logic.
    

This layered approach provides a structured solution to a complex problem, allowing each stage to focus on a specific set of concerns, guided by a clear set of constraints and objectives.6

### C. Key Architectural Pillars

To successfully implement this multi-layered philosophy, the generation system must be built upon a foundation of robust software engineering principles. The following pillars are essential for creating a system that is not only powerful but also maintainable and extensible over the lifetime of a project.

**Modularity and Extensibility:** The system must be designed from the ground up to support change and growth. A developer should be able to add a new level scenario (e.g., a "haunted mansion"), a new generation algorithm, or new types of game content without needing to refactor the entire generator.15 This requirement points directly to the use of established software design patterns, such as the Strategy and Factory patterns, which decouple components and allow for interchangeable behaviors and objects.14

**Constraint-Driven Generation:** At every stage of the pipeline, the generator must be governed by a set of inviolable constraints. The most critical of these are the player's physics capabilities (maximum jump height and distance, run speed, wall-jump mechanics, etc.) and the absolute necessity of a guaranteed solvable path from the level's entrance to its exit.5 The system must be able to query a physics model to validate that a proposed challenge is possible before committing to its placement.6

**Separation of Concerns:** A clean and maintainable architecture demands a strict separation of concerns. The logic that places a collidable platform should be entirely distinct from the logic that places a decorative vine on its underside. Similarly, the algorithm that generates the layout of a cave should be independent of the system that populates it with enemies. This separation simplifies development, testing, and debugging, and allows different specialists (e.g., level designers, artists) to contribute to the system without interfering with one another's work.

By adhering to these principles, it is possible to construct a procedural generation framework that is powerful, flexible, and capable of producing an endless variety of high-quality, engaging, and atmospheric platformer levels.

## The Generator's Core Architecture: A Strategy-Based, Multi-Layered Approach

The foundation of a robust and extensible procedural generation system is an architecture that separates the high-level orchestration from the specific, interchangeable algorithms that perform the generation. By leveraging proven software design patterns, we can create a framework that is easy to understand, maintain, and expand. This section details the core classes and interfaces that form the system's backbone, emphasizing the use of the Strategy and Factory patterns to achieve maximum modularity.

### A. The `LevelGenerator` Context Class

At the heart of the system lies the `LevelGenerator` class. This class acts as the central "context" or "director" for the entire generation process. Crucially, it does not contain any specific generation logic itself. Its role is purely one of orchestration and state management. This design choice is fundamental to the system's flexibility.

The primary responsibilities of the `LevelGenerator` are:

1.  **Dependency Management:** It holds references to the key components required for generation, which are injected at the time of its creation. These include the current `IGenerationStrategy`, the active `IDifficultyStrategy`, and a reference to the `ComponentFactory`. This dependency injection allows the generator's behavior to be configured externally.
    
2.  **Pipeline Execution:** It exposes a single primary method, such as `GenerateLevel()`, which executes the various stages of the generation pipeline in a predefined sequence (Macro, Meso, Micro, Decoration). It acts as the high-level "script" that calls upon its specialized strategies to do the actual work.
    
3.  **Seed Management:** It manages the master `seed` for the pseudo-random number generator (PRNG). This is critical for reproducibility. By using the same seed, the generator can produce the exact same level every time, which is invaluable for debugging, testing, and allowing players to share interesting level layouts.4 The
    
    `LevelGenerator` will instantiate a PRNG with this seed and pass it down to all subsequent strategies, ensuring that all random decisions are deterministic and repeatable.
    

### B. The `IGenerationStrategy` Interface (The Strategy Pattern)

The cornerstone of the architecture's modularity is the **Strategy design pattern**.16 This pattern is perfectly suited to the requirement of supporting multiple, distinct level scenarios (e.g., open-air terrain, caves, cityscapes). The pattern works by defining a common interface for a family of algorithms, allowing them to be swapped interchangeably at runtime.16

We define an interface, `IGenerationStrategy`, which establishes the contract that all concrete generation strategies must follow. This interface decouples the `LevelGenerator` from the implementation details of any specific level type. The `LevelGenerator` only needs to know that it can call methods like `ExecuteMacro` on its current strategy object, without needing to know _how_ that strategy creates a critical path.

The `IGenerationStrategy` interface contract would include methods corresponding to the major phases of the generation pipeline:

-   `ExecuteMacro(blueprint, rng, difficultyParams)`: Responsible for creating the high-level structure and critical path.
    
-   `ExecuteMeso(blueprint, rng, difficultyParams)`: Responsible for building the main level geometry based on the macro plan.
    
-   `ExecuteMicro(blueprint, rng, difficultyParams)`: Responsible for populating the level with gameplay elements like enemies and platforms.
    
-   `ExecuteDecoration(blueprint, rng)`: Responsible for applying aesthetic tiles and background elements.
    

This design makes the system incredibly extensible. To add a new level type, such as "underwater ruins," a developer simply needs to create a new class, `UnderwaterRuinsStrategy`, that implements the `IGenerationStrategy` interface. No changes are needed to the core `LevelGenerator` class.

### C. Concrete Strategy Implementations

Following the Strategy pattern, we create concrete classes for each desired level scenario. Each class provides a unique implementation of the `IGenerationStrategy` interface, using different algorithms suited to the theme.

-   **`OpenAirTerrainStrategy`:** This strategy is designed for creating sprawling, outdoor levels with rolling hills and open spaces.
    
    -   **Macro:** It might use an agent-based "Drunkard's Walk" to define a winding but generally horizontal critical path.7
        
    -   **Meso:** It will primarily rely on noise functions like Perlin or Simplex noise to generate a 1D heightmap for the ground terrain, creating natural-looking hills and valleys.19 The critical path from the macro phase can guide the overall vertical trend of the noise function.
        
    -   **Micro:** It will focus on placing platforms to bridge gaps dictated by the terrain, ensuring jump feasibility using physics calculations.5
        
-   **`CaveGeneratorStrategy`:** This strategy focuses on creating enclosed, labyrinthine cave systems.
    
    -   **Macro:** It is well-suited to the _Spelunky_-style grid-based random walk, which generates a branching, multi-room layout with a guaranteed path.13
        
    -   **Meso:** The core algorithm here is **Cellular Automata (CA)**. The process starts with a grid of random noise and iteratively applies rules to "smooth" the noise into organic, cave-like structures.8 This phase must include crucial post-processing steps, such as using a flood-fill algorithm to identify and connect or remove isolated pockets, ensuring a single, contiguous playable area.24
        
    -   **Micro:** It will populate the caves with theme-appropriate enemies (e.g., bats, spiders) and hazards.
        
-   **`CityscapeStrategy`:** This strategy aims to generate urban environments with rooftops, buildings, and alleyways.
    
    -   **Macro:** A graph-based approach is ideal here. Key nodes (start, end, points of interest) are placed, and a path is found between them. This path represents the intended route for the player over rooftops and through buildings.
        
    -   **Meso:** This phase will place the large, structural shells of buildings along the critical path. Generative grammars or L-systems can be used to create varied building silhouettes and layouts, ensuring the critical path remains unobstructed.25
        
    -   **Micro:** It will add platforming elements like fire escapes, window ledges, and cranes, as well as urban-themed hazards.
        
-   **`VerticalChallengeStrategy`:** This strategy is specialized for vertical "tower climb" or "descent" levels.
    
    -   **Macro:** The critical path is inherently simple: a vertical line. However, the nodes along this path can be tagged with increasing difficulty values.
        
    -   **Meso/Micro:** This strategy will rely heavily on **rhythm-based generation**.5 It translates a sequence of player actions (e.g.,
        
        `JUMP_SHORT`, `WALL_JUMP_LEFT`, `WAIT`) into precise geometric placements. The player's physics model is paramount here to ensure that the sequence of challenges is demanding but fair.5
        

The following table provides a comparative overview of the core algorithms and their roles within this strategic framework.

Algorithm

Primary Use Case

Strengths

Weaknesses

Role in Architecture

**Noise Functions (Perlin/Simplex)**

Organic, natural-looking terrain; textures; background elements.

Fast to compute; produces smooth, continuous results; easily tileable.

Can be predictable; lacks inherent structure for complex gameplay.

Core of `OpenAirTerrainStrategy`; used in `Decoration` phase for clouds, etc. 20

**Cellular Automata (CA)**

Cave systems; organic, eroded structures; fire/fluid spread.

Simple rules lead to complex, emergent behavior; creates natural-looking caves.

Requires post-processing to ensure connectivity and remove small artifacts; can be chaotic without careful rule-tuning.

Core of `CaveGeneratorStrategy` Meso-generation. 8

**L-Systems / Grammars**

Structured, branching growth; plants; road networks; building facades.

High designer control over structure; can generate immense complexity from simple rules.

Can be computationally intensive; rules can be complex to design for non-fractal structures.

Used in `CityscapeStrategy` for building shells; ideal for procedural decoration (e.g., background skylines, plants). 27

**Chunk/Template Assembly**

Hybrid design, combining authored content with procedural layout.

High control over micro-gameplay; guarantees fun and fair segments; easy to author.

Variety is limited by the size of the template library; can feel repetitive if not managed well.

A core technique for Meso-generation across multiple strategies, especially `CaveGeneratorStrategy` and `CityscapeStrategy`. 10

**Agent-Based (Drunkard's Walk)**

Creating winding paths, tunnels, or rivers.

Simple to implement; creates meandering, unpredictable paths.

Lacks high-level structure; can self-intersect or create uninteresting patterns without guidance.

A technique for Macro-generation in `OpenAirTerrainStrategy` or for connecting rooms in `CaveGeneratorStrategy`. 7

This table serves as a decision-making tool, linking abstract algorithmic concepts to their concrete applications within the proposed modular architecture. It clarifies which tool is appropriate for which task, empowering the developer to make informed design choices.

### D. The `LevelBlueprint` Data Structure

A common mistake in PCG implementation is for each stage to write its output directly to the final game data structure (e.g., a Phaser Tilemap). This creates tight coupling and makes it difficult to pass information between stages. A more robust solution is to use an intermediate data structure, which we will call the `LevelBlueprint`.

The `LevelBlueprint` is a comprehensive data object that represents the level in an abstract, engine-agnostic way. Each stage of the generation pipeline reads from and writes to this single object, progressively adding layers of detail. This approach decouples the generation logic from the final rendering and game engine implementation.

A well-designed `LevelBlueprint` would contain multiple distinct data layers:

-   `structural_grid`: A 2D array of integers or enums representing the core, collidable tiles of the level (e.g., `WALL`, `GROUND`, `PLATFORM`, `EMPTY`). This is the output of the Meso-generation phase.
    
-   `decoration_grid`: A parallel 2D array for non-collidable, purely aesthetic foreground tiles (e.g., `GRASS_DECO`, `VINE_DECO`). This is populated by the Decoration phase.
    
-   `background_layers`: An array of data structures, each describing a parallax background layer, including its texture or generation parameters.
    
-   `gameplay_objects`: A list of object descriptors, each containing a type, position, and set of properties (e.g., `{type: 'enemy_bat', position: {x: 128, y: 256}, patrol_range: 50}`). This is populated by the Micro-generation phase.
    
-   `critical_path_graph`: A graph data structure (a collection of nodes and edges) representing the guaranteed solvable path. This is the primary output of the Macro-generation phase.
    
-   `metadata`: A dictionary of key-value pairs containing high-level information about the level, such as `theme: "cave"`, `difficulty_target: 0.75`, `length: "medium"`, or tags for specific regions like `zone: "puzzle"`. This metadata is used to guide decisions in subsequent generation phases.
    

### E. The `ComponentFactory` (The Factory Pattern)

To achieve the ultimate level of decoupling and extensibility, the generation system should not be responsible for creating concrete game objects. If a generation strategy contains code like `new BatEnemy()`, that strategy is now tightly coupled to the `BatEnemy` class. Adding a new enemy type would require modifying the strategy code.

The **Factory Method design pattern** provides an elegant solution.32 We introduce a

`ComponentFactory` class that abstracts the creation of all game objects. Instead of instantiating objects directly, the generation strategies will make requests to the factory.

For example, the CaveGeneratorStrategy would not call new BatEnemy(). Instead, it would call:

componentFactory.Create("enemy", { theme: "cave", difficulty: "easy" })

The `ComponentFactory` would then contain the logic to interpret this request. It would know that an "easy" enemy for a "cave" theme is a `BatEnemy` and would be responsible for instantiating and returning the correct object. This centralizes the object creation logic. Adding a new `SlimeEnemy` to caves only requires updating the `ComponentFactory`; none of the generation strategies need to be touched.

This combination of the Strategy and Factory patterns creates a powerful, two-axis system of extensibility. The Strategy pattern allows for the addition of new _types of levels_ (the "how"), while the Factory pattern allows for the addition of new _types of content_ within those levels (the "what"). This creates a professional, forward-thinking framework that is built to accommodate the inevitable expansion of the game's scope.

## Macro-Generation: Defining the Level's Backbone

The Macro-generation phase is the first and arguably most critical stage in the procedural pipeline. Its purpose is to establish the high-level flow and structure of the level, ensuring a solvable path from start to finish _before_ any concrete geometry is placed. This "plan first, build later" approach is the key to generating complex, non-linear levels that are guaranteed to be playable, avoiding the fundamental pitfalls of purely random generation in platformers.6 The primary output of this stage is a

`critical_path_graph` stored within the `LevelBlueprint`.

### A. The Principle of the Critical Path

The concept of a "critical path" or "solution path" is a cornerstone of modern procedural level design, famously demonstrated in the generation algorithm for _Spelunky_.13 The path is an abstract representation—a sequence of connected nodes or rooms—that defines a traversable route through the level space. By generating this path first, the system guarantees that no matter how complex the surrounding geometry becomes, there is always at least one valid way for the player to complete the level.

However, the critical path is more than just a geometric route; it is the fundamental narrative and rhythmic structure of the level. The sequence of nodes and the connections between them can be seen as a high-level script for the player's experience. Moving from one node to the next represents a challenge or a gameplay "beat." The series of these beats forms the level's overall rhythm.5 By thinking of the Macro-generator not just as a maze-maker but as an

**Experience Scripter**, we can unlock a much higher level of design control. The output graph becomes a blueprint for pacing, allowing a designer to shape the emotional arc of a level by manipulating abstract data rather than individual tiles.

### B. Techniques for Critical Path Generation

Several algorithms can be employed to generate the critical path, each with distinct characteristics that make it suitable for different level scenarios. The choice of algorithm is typically encapsulated within the active `IGenerationStrategy`.

#### The _Spelunky_ Model (Grid-Based Random Walk)

This technique is exceptionally effective for creating room-based, dungeon-like levels and is a prime candidate for a `CaveGeneratorStrategy` or other similar scenarios. The process, as detailed by its creators, works as follows 13:

1.  **Define a Grid:** The level space is divided into a coarse grid of "rooms," for example, 4x4 or 5x5.
    
2.  **Place Start Room:** A start room is placed in a random cell in the top row of the grid.
    
3.  **Perform Random Walk:** From the start room, the algorithm performs a random walk to an adjacent cell. This walk is biased; for example, there might be a 40% chance to move left, a 40% chance to move right, and a 20% chance to move down.
    
4.  **Enforce Connectivity:** This is the crucial step. If the walk moves horizontally, the room templates used can be simple (e.g., guaranteed left/right exits). However, if the walk decides to move _down_, the generator must ensure vertical connectivity. It does this by constraining the room types. The room being exited _must_ be changed to a type that has a bottom exit, and the room being entered _must_ be a type that has a top exit.13 This simple rule-based constraint ensures the path is always traversable.
    
5.  **Place Exit Room:** The walk continues until it reaches the bottom row. An attempt to move down from the bottom row results in the placement of the exit room.
    
6.  **Populate Off-Path Rooms:** All grid cells not part of the critical path are filled with "side rooms," which have no exit guarantees and can lead to dead ends, rewarding exploration.13
    

This method is simple, fast, and robust, reliably producing interesting, branching layouts that are always solvable.

#### Agent-Based Methods (Drunkard's Walk)

For more linear or organic, winding paths, such as those in an `OpenAirTerrainStrategy`, an agent-based approach is highly suitable. This method, often called a "Drunkard's Walk," simulates an agent carving a path through the level space.7

1.  **Place Agent:** A virtual "digger" or "walker" agent is placed at the designated start point.
    
2.  **Move and Carve:** For a set number of steps, the agent moves in a random direction, marking its path. This path becomes the critical path.
    
3.  **Introduce Bias:** To prevent a purely chaotic and unusable path, the agent's movement is typically biased. For example, it might have a higher probability of moving right than left, and a constraint to stay within a certain vertical band. A "turn chance" parameter can be used to create long hallways punctuated by random turns, giving the path more structure than a simple random walk.7
    

This technique is excellent for creating single, continuous paths that feel less structured and more natural than a grid-based approach.

#### Graph-Based Pathfinding

For scenarios requiring a high degree of control, such as levels with specific quest objectives or lock-and-key puzzles, a more deliberate graph-based method is appropriate.

1.  **Define Key Nodes:** The designer or a higher-level system places key nodes in the level space. These could be the `start`, `exit`, `key_location`, `locked_door`, and `quest_giver`.
    
2.  **Connect Nodes:** A pathfinding algorithm is used to find a route between these nodes. Standard A* pathfinding operates on a pre-existing grid of walkable tiles, which we don't have yet. Therefore, a specialized variant is needed for platformers. In this variant, the "neighbors" of a given node are not adjacent tiles but are potential landing spots reachable via the player's physical abilities (jumping, dashing, etc.).5 The "cost" of traversing an edge in the A* algorithm can be a function of the jump's difficulty, calculated using the game's physics engine.5
    
3.  **Construct Path:** The algorithm finds the optimal path connecting the key nodes in the required sequence (e.g., must visit `key_location` before `locked_door`). This sequence of connections forms the critical path graph.
    

This method provides the most explicit control over the level's structure and is ideal for story-driven or complex puzzle-based levels.

### C. Defining Level Zones and Pacing

Once the critical path graph is generated, it serves as a scaffold for layering in pacing and difficulty information. This is where the Macro-generator truly becomes an Experience Scripter. The nodes and edges of the graph are annotated with metadata that will guide the subsequent generation phases.

For example, a node on the graph can be tagged with a zone type, such as `zone: "safe_area"`, `zone: "puzzle_challenge"`, `zone: "enemy_gauntlet"`, or `zone: "boss_encounter"`. The edges connecting the nodes can be tagged with a desired rhythm or difficulty, such as `rhythm: "easy_jumps"`, `difficulty: 0.2` or `rhythm: "complex_traversal"`, `difficulty: 0.8`.

This creates a deliberate emotional arc for the player. A level might be structured to start with a safe area, build through a series of moderate platforming and combat challenges, peak with a difficult mini-boss encounter, and then provide a brief respite before the exit.36 By encoding this pacing information at the abstract macro level, the system ensures that the generated level has a coherent and intentional design flow, moving far beyond the capabilities of simple random generation. The graph is no longer just a path; it is a complete, high-level script for the experience that is about to be built.

## Meso-Generation: Fleshing out the Structure

With the abstract `critical_path_graph` established in the Macro-generation phase, the Meso-generation phase takes on the task of translating this high-level plan into the concrete, structural geometry of the level. This is the stage where the world's main landmasses, cave walls, and building shells are constructed. The output of this phase is the populated `structural_grid` in the `LevelBlueprint`, which defines all collidable surfaces. The specific techniques used are heavily dependent on the chosen `IGenerationStrategy`, as different scenarios require vastly different structural forms.

### A. From Abstract Graph to Concrete Geometry

The core responsibility of the Meso-generator is to interpret the nodes and edges of the critical path graph and instantiate corresponding geometry. If the Macro-generator is the architect drawing the blueprints, the Meso-generator is the construction crew erecting the frame and walls of the building. This phase bridges the gap between abstract intent and physical form, laying the foundation upon which all finer gameplay details will be placed.

A powerful paradigm that combines the benefits of authored design with procedural variety is the concept of recursive, or "fractal," content generation. Instead of relying solely on a fixed library of fully handcrafted chunks, the system can use "chunk generators." For each node in the critical path, the Meso-generator calls a specialized function (e.g., `GenerateCavePuzzleChunk()`) that procedurally creates a unique, bespoke chunk that fits the required constraints (entry/exit points, difficulty, theme). This function might use its own localized generator, like a small Cellular Automata or a set of placement rules, to build the chunk on the fly. This approach provides near-infinite variety at both the macro (level layout) and meso (chunk content) scales, while still retaining the strong structural guarantees of a template-based system. It represents a significant evolution from simply stitching together a limited set of prefabs.

### B. Chunk-Based Assembly

A highly effective and widely adopted technique for Meso-generation is chunk-based assembly. This hybrid approach leverages pre-designed level segments ("chunks" or "templates") and assembles them procedurally, offering a potent balance between designer control and algorithmic variety.10

The process works by iterating through the nodes and edges of the critical path graph. For each element in the path, the generator selects an appropriate chunk from a library and places it into the world.

-   **Chunk Libraries:** Chunks are self-contained, authored level segments. They can be designed in a text editor, a tile editor, or stored as data structures (e.g., JSON files).37 Each chunk has defined properties, including its dimensions, theme, difficulty rating, and, most importantly, its connection points (e.g., "entry_left," "exit_right," "exit_bottom").
    
-   **Constrained Selection:** The selection of a chunk is not random but constrained by the metadata on the critical path graph. If a graph node is tagged `zone: "puzzle"` and `theme: "cave"`, the generator will only select from a pool of chunks that match these tags. The difficulty parameter further narrows the selection.36
    
-   **Stitching and Validation:** As chunks are placed, they must be stitched together seamlessly. The generator ensures that the exit point of one chunk aligns with the entry point of the next. A crucial validation step must confirm that the transition between the two chunks is traversable by the player, respecting their physical abilities.5 This prevents situations where two perfectly valid chunks are combined in a way that creates an impossible jump.
    

This method is versatile and can be applied across many strategies. It gives designers immense power to craft the moment-to-moment experience, while the algorithm provides the high-level structural variation.30

### C. Terrain Generation Algorithms

For more organic or continuous environments, particularly in the `OpenAirTerrainStrategy` and `CaveGeneratorStrategy`, specific algorithms are used to generate the primary landmass.

#### For `OpenAirTerrainStrategy`:

The goal here is to create natural-looking, rolling landscapes. **Noise functions** are the ideal tool for this task.

1.  A 1D noise function, such as Perlin or Simplex noise, is used to generate a height value for each column along the level's x-axis.20 To create more interesting and less uniform terrain, multiple noise functions (called "octaves") with different frequencies and amplitudes are layered together. A low-frequency, high-amplitude function creates the main rolling hills, while higher-frequency, lower-amplitude functions add smaller, rougher details on top.39
    
2.  The critical path generated in the macro phase can act as a guide. For example, the path can define the baseline height, and the noise function can be used to add variation above and below this baseline, ensuring the terrain generally follows the intended vertical progression.
    
3.  The output is a heightmap that is then translated into solid `ground` tiles in the `structural_grid`, creating the primary landmass.
    

#### For `CaveGeneratorStrategy`:

To create enclosed, organic cave systems, **Cellular Automata (CA)** is the classic and most effective algorithm.8

1.  **Initialization:** The process begins by creating a grid and filling it with random noise. Each cell is randomly assigned as either a "wall" or a "floor" based on a fill percentage (e.g., 45% wall).22
    
2.  **Simulation:** The grid then undergoes several simulation steps. In each step, every cell's state in the next generation is determined by the state of its neighbors in the current generation. A common rule set for cave generation is the "4-5 rule": a wall tile becomes a floor if it has fewer than 4 wall neighbors (it's on the edge of a cavern), and a floor tile becomes a wall if it has more than 5 wall neighbors (it's part of a small pillar that should be filled in).22
    
3.  **Post-Processing:** The raw output of a CA simulation is often fragmented, containing multiple disconnected cave systems and small, undesirable artifacts. Post-processing is therefore not optional but essential.24 A
    
    **flood-fill** algorithm is used to identify all separate contiguous regions of floor tiles. The generator can then be configured to keep only the largest region (filling all others to become solid wall) or to carve tunnels between the largest regions using an agent-based digger, ensuring the entire playable area is connected.
    

### D. Structural Generation for `CityscapeStrategy`

Generating a cityscape presents a unique structural challenge. The Meso-generator for this strategy is concerned with creating the large-scale, collidable forms of buildings that define the playable space.

1.  The critical path dictates a route across rooftops and through alleyways.
    
2.  The generator places large, simple geometric primitives (e.g., rectangles) along this path to represent the core shells of buildings. These are marked as `WALL` tiles in the `structural_grid`.
    
3.  The placement algorithm must ensure that the critical path remains clear and traversable. For example, if the path requires a jump between two buildings, the generator must ensure the buildings are placed at an appropriate distance and height.
    
4.  More advanced implementations can use **generative grammars** or **L-systems** at this stage to create more varied and complex building silhouettes, moving beyond simple rectangles to produce more architecturally interesting forms.25 The actual details like windows and doors are not handled here; this phase is strictly about the solid, impassable structure of the city.
    

## V. Micro-Generation: Populating with Gameplay Elements

After the Meso-generation phase has constructed the level's structural shell, the Micro-generation phase breathes life into it. This stage is responsible for populating the world with all the interactive and dynamic elements that constitute the core gameplay loop. It operates on the `structural_grid` and places platforms, enemies, collectibles, hazards, and other interactive objects, adding them to the `gameplay_objects` list in the `LevelBlueprint`. This process must be meticulously guided by constraints to ensure playability, challenge, and a coherent game feel.

### A. Placing Gameplay Entities

The fundamental task of the Micro-generator is to strategically place entities within the established structure. This is not a random scattering; every placement must be deliberate and rule-based. Enemies should not be spawned inside walls, keys must be reachable, and critical platforms must be positioned to allow progress. This phase transforms the static architectural space into a dynamic, interactive environment.

A critical insight for this phase is the recognition of a productive tension between top-down, experience-driven design and bottom-up, simulation-driven validation. A purely top-down approach, like rhythm-based generation, dictates the _intended player experience_ (e.g., "the player should feel a fast-paced series of hops"). A purely bottom-up approach, like physics-based validation, determines what is _physically possible_ (e.g., "a jump of this length is achievable"). A naive rhythm generator might script a sequence that is impossible to implement, while a purely physics-based generator might create solvable but boring, arhythmic levels. A truly robust system requires a feedback loop between these two concerns. The rhythm generator proposes a challenge, and the geometry placer attempts to realize it by querying the physics validator. If a valid placement cannot be found, it can report failure, prompting the rhythm system to try an alternative. This dialogue between desired experience and physical possibility leads to levels that are both playable and intentionally paced.

### B. Rhythm-Based Placement

One of the most powerful techniques for crafting engaging platforming sequences is **rhythm-based generation**.26 This approach views a level not as a collection of static objects, but as a sequence of actions or "verbs" that the player is expected to perform. These verbs might include

`JUMP_LONG`, `JUMP_SHORT`, `WALL_JUMP`, `WAIT`, `SLIDE`, or `FIGHT_ENEMY`.5

The Micro-generator can take a "rhythm string"—which could be defined in the metadata of the critical path graph—and translate it into geometry and enemy placements.

-   A `JUMP_LONG` verb would trigger the placement of a platform at a distance corresponding to the player's maximum horizontal jump.
    
-   A `WAIT` verb could instantiate a timed trap or a patrolling enemy that forces the player to pause and observe before proceeding.
    
-   A sequence like `JUMP_SHORT, JUMP_SHORT, JUMP_LONG` creates a distinct, learnable pattern of movement for the player.
    

This method allows designers to control the "feel" and pacing of a level at a very high level of abstraction. By using this technique in conjunction with a search-based method like a genetic algorithm, it's even possible to generate levels that automatically target a specific difficulty or play style, evolving solutions that maximize a "fun" metric defined by the desired rhythm.1

### C. Probabilistic and Rule-Based Placement

To introduce fine-grained variety, especially within pre-authored chunks or templates, **probabilistic placement** is an invaluable tool. This technique, used to great effect in _Spelunky_, allows a single room template to have dozens of potential variations.29

Instead of a tile being definitively a spike trap, a location in a template can be marked as `PROB_SPIKE_33`, giving it a 33% chance of spawning a spike. Another location might be `PROB_BLOCK_50`, indicating a 50/50 chance of being a solid block or empty space. This approach dramatically increases replayability for a very low authoring cost, as a small library of templates can produce a vast number of unique gameplay encounters.

Alongside probabilistic placement, the Micro-generator must enforce a strict set of **placement rules**. These are logical constraints that ensure the game remains fair and solvable. Examples include:

-   **Reachability:** A collectible or key must be placed in a location the player can physically reach.
    
-   **Logical Order:** A key must always be placed _before_ its corresponding locked door along the critical path.
    
-   **Fairness:** An enemy should not be placed directly at the landing spot of a blind jump, preventing unavoidable damage.
    
-   **Grounding:** Non-flying enemies must be placed on solid ground.
    

### D. The Playability Validator

Underpinning the entire Micro-generation phase is the **Playability Validator**. This is a non-negotiable, critical sub-module that acts as the system's "conscience," ensuring that the generator does not create impossible challenges.

Before committing to the placement of any element essential for progression—especially platforms needed to cross gaps on the critical path—the generator must query the validator: `Validator.IsReachable(startPosition, endPosition)`.

This function is not a simple distance check. It must be a precise simulation based on the game's actual physics parameters.5 It calculates the projectile motion trajectory given the player's

`jump_force`, `gravity`, `run_speed`, and any other movement abilities like double-jumping or dashing. The validator can determine not only if a jump is possible, but also how difficult it is, perhaps by calculating the size of the "success window" from which the player can initiate a successful jump.6

The Playability Validator is the ultimate safeguard against the cardinal sin of platformer PCG: creating a level that cannot be completed. Its rigorous application at every step of the Micro-generation phase is what allows the system to explore a vast design space while remaining anchored to the fundamental constraint of playability.

## VI. The Art of Atmosphere: Procedural Decoration

A procedurally generated level that is functionally perfect but aesthetically barren is merely a gymnasium—a series of challenges without a soul. The Decoration-Generation phase is what transforms this functional space into a believable and atmospheric world. This stage is intentionally last in the pipeline and is strictly separated from gameplay generation. It operates on the completed `structural_grid` and `gameplay_objects` from the `LevelBlueprint`, but its sole purpose is to add non-collidable, purely aesthetic elements that create mood, provide context, and enrich the visual experience.

This separation is a critical architectural principle. The logic for decoration should be able to be changed, expanded, or even completely disabled without ever affecting the playability of the level. This allows artists and designers to iterate on the game's look and feel independently of the core level design. Furthermore, procedural decoration can be used to provide subtle gameplay cues, a form of environmental storytelling. Players are adept at recognizing patterns, and a system can leverage this by linking visual motifs to gameplay concepts. For example, rules for placing decorative elements could be influenced by metadata from the `LevelBlueprint`. An area tagged as `secret_path` might have a higher density of a specific type of decorative moss, subconsciously teaching the player to associate that visual with hidden passages. Similarly, the "wear and tear" on background props could increase as the player enters a more dangerous zone, telegraphing the difficulty increase thematically. This allows the "art" to be informed by the "design," creating a more cohesive and immersive final product.

### A. Foreground Decoration (The "Dressing" Pass)

After the main structure is finalized, a "dressing pass" iterates over the grid to add foreground decorative elements. This is typically accomplished using a set of simple, powerful rules.

-   **Rule-Based Tiling (Auto-tiling):** This is the most common technique for making a tile-based world look more natural. Instead of just having a single `ground` tile, the system applies rules based on a tile's neighbors to select a more appropriate visual.
    
    -   **Example Rule:** "If a tile is `ground` and the tile directly above it is `air`, replace the `ground` tile's visual with a `grass_edge` tile."
        
    -   **Example Rule:** "If a `wall` tile is completely surrounded by other `wall` tiles (i.e., it's deep inside a solid mass), use a `deep_wall_variant` tile that has a different texture to break up visual repetition".40
        
    -   This can be extended with more complex logic like bitmasking, which uses a tile's 8 neighbors to compute an index for selecting a highly specific border or corner tile from a tileset.
        
-   **Design Principles for Prop Placement:** To avoid a sterile, grid-like feeling, the placement of decorative props can follow established art and design principles.
    
    -   **"Barnacling" and "Footing":** These principles suggest how objects should relate to one another to appear natural.8 For example, a large boulder ("parent" object) should be surrounded by smaller rocks and pebbles ("child" objects) of decreasing size. A tree should have some raised dirt or roots at its base to "foot" it into the terrain.
        
    -   **Rule-Based Prop Spawning:** Simple rules can be used to place non-interactive props. For a `CaveStrategy`, a rule might be: "For every `cave_floor` tile, there is a 5% chance to place a decorative `mushroom` prop on top of it." For a `CityscapeStrategy`: "For every `building_wall` tile that is not adjacent to the ground, there is a 20% chance to place a `window` decoration."
        

### B. Background Generation

The background is crucial for establishing the scale, mood, and location of the level. A robust PCG system should be able to generate compelling backgrounds that match the level's theme.

-   **Multi-Layered Parallax:** This is a fundamental technique for creating a sense of depth in 2D games. The system should generate several distinct background layers, each moving at a different speed relative to the camera. Layers farther from the camera move more slowly, creating a powerful illusion of distance.
    
-   **Noise for Natural Backgrounds:** For outdoor or natural settings like the `OpenAirTerrainStrategy`, 2D noise functions are highly effective. A few layers of Perlin or Simplex noise can be used to generate convincing cloud formations, distant hazy mountain silhouettes, or rolling forests. The colors and shapes can be controlled by the level's theme parameters.
    
-   **L-Systems for Structured Backgrounds:** For man-made environments like the `CityscapeStrategy`, noise functions can feel too random. This is an ideal application for **Lindenmayer systems (L-systems)**.27
    
    1.  **Generate a String:** A simple grammar-based L-system is used to generate a long string of characters. For example, an axiom `A` with rules like `A -> F[+A]F[-A]` and `F -> FF` can produce complex, branching patterns.27
        
    2.  **Interpret with a Turtle:** A virtual "turtle" graphics system interprets this string as a series of drawing commands. `F` might mean "draw a vertical line segment (a building wall)," `+` and `-` could mean "move horizontally," and `[` and `]` could be used to create branching structures like towers or cranes.42
        
    3.  **Create a Silhouette:** By drawing these simple shapes, the L-system can generate a complex and structured silhouette of a distant city skyline. This adds immense atmospheric depth and a sense of place, transforming a simple platforming challenge into a journey through a vast metropolis, all without adding any gameplay-level complexity.25
        

By thoughtfully applying these decoration techniques, the generator can produce levels that are not only fun to play but also visually rich, atmospheric, and memorable.

## VII. Dynamic Difficulty Adjustment (DDA)

A key advantage of procedural generation is its ability to tailor content on the fly. Dynamic Difficulty Adjustment (DDA) is the process of automatically modifying the game's challenge to match a player's skill level.44 The goal of DDA is to maintain player engagement by keeping them in a state of "Flow," where the challenge is high enough to be stimulating but not so high as to cause frustration, and not so low as to cause boredom.46 A well-implemented DDA system can significantly enhance player retention and satisfaction.

However, DDA must be handled with care. If the adjustments are too obvious, players may feel "cheated" or patronized, breaking their immersion and trust in the game's fairness.47 The most effective DDA systems are those that are nearly invisible to the player. The architectural approach of generating levels procedurally is particularly well-suited for subtle DDA. Instead of changing the rules of the game the player is currently experiencing (e.g., making enemies weaker), the system can change the

_nature of the challenges in the next level_ that is about to be generated. Because the player has no "before" state to compare against, the change feels natural and fair. The DDA system doesn't alter the game; it curates the upcoming experience.

### A. Modeling Difficulty

To adjust difficulty, the system must first be able to measure it. Difficulty is not a single, monolithic value but a multi-faceted concept that arises from various gameplay factors.48 A comprehensive difficulty model should account for several types of challenges:

-   **Execution Challenge:** This relates to the raw mechanical skill required. It can be quantified by measuring factors like the width of gaps, the required precision of jumps (e.g., the size of the target platform), and the time constraints imposed by traps or moving hazards.
    
-   **Strategic Challenge:** This involves decision-making and tactical planning. It can be measured by the density of enemies, the complexity of their attack patterns, and the types of enemies present (e.g., a simple melee enemy has a lower difficulty cost than one with a complex projectile attack).
    
-   **Resource Challenge:** This pertains to the management of in-game resources. It can be controlled by adjusting the scarcity of health packs, ammunition, power-ups, or other beneficial collectibles.
    

Within the proposed architecture, each component—from individual "verbs" like `JUMP_PRECISE` to entire authored chunks—can be assigned a "difficulty cost" based on a weighted sum of these factors. This allows the generator to quantify the challenge of the content it is selecting or creating.

### B. Modeling the Player

The other half of the DDA equation is a model of the player's current skill level. The system tracks player performance over time to build this model, which then informs the difficulty target for the next generated level. Player models can range in sophistication:

-   **Simple Progression Model:** This is the most basic approach, where difficulty is tied directly to player progress. For example, the difficulty value simply increments with each level completed. This is not truly "dynamic" but provides a basic scaling curve.
    
-   **Performance-Based Model:** This model tracks concrete performance metrics to gauge skill. Common metrics include level completion time, number of deaths per level, damage taken, or success/failure rates on specific types of challenges.49 If a player dies frequently, the model might conclude they are struggling, and the DDA system would lower the difficulty target for the subsequent level.
    
-   **Affective Model:** More advanced systems attempt to model the player's emotional state (e.g., frustration, boredom) using physiological data (e.g., from EEG) or by analyzing in-game behaviors.51 While powerful, this is often beyond the scope of typical indie development.
    

For most games, a robust performance-based model provides an effective balance of accuracy and implementation simplicity.

### C. DDA Implementation Strategies

The mechanism for adjusting difficulty is another ideal application for the **Strategy Pattern**. The main `LevelGenerator` can be configured with an `IDifficultyStrategy`, allowing different DDA approaches to be tested and swapped easily.

-   **`ParameterTuningStrategy`:** This is the most straightforward implementation. Based on the player model, this strategy directly adjusts the parameters used by the generation algorithms. For example, if the player is succeeding, it might increase the `enemy_spawn_chance`, decrease the `health_pack_frequency`, or increase the `max_gap_width` that the Meso-generator is allowed to create.30 This method is simple but can sometimes be too direct and noticeable.
    
-   **`BudgetBasedStrategy`:** This is a more subtle and powerful approach.
    
    1.  The DDA system first determines a total "difficulty budget" for the entire level based on the player's skill profile.
        
    2.  During the Meso- and Micro-generation phases, the generator "spends" this budget. Each chunk, template, enemy, or hazard has a pre-calculated difficulty "cost."
        
    3.  The generator selects a combination of elements whose total cost does not exceed the budget.36 This transforms difficulty scaling into a constrained selection problem (a variation of the knapsack problem). This method is less likely to be noticed by the player, as it affects the composition of the level rather than altering the properties of individual elements.
        
-   **`ReactiveGenerationStrategy`:** This is the most advanced and truly "dynamic" technique, suitable for games that generate levels chunk-by-chunk as the player progresses (e.g., endless runners). The generator observes player performance in the _current_ chunk and uses that immediate data to select or generate the very _next_ chunk. For example, if the player flawlessly navigates a platforming section, the next chunk generated might feature more complex jumps. If they struggle with a particular enemy, that enemy type might be less frequent in the upcoming sections. This creates a tight feedback loop between player action and level generation.49
    

By integrating one of these DDA strategies, the procedural generation system can move beyond creating static, one-size-fits-all levels and instead produce personalized experiences that remain compelling and engaging for players across a wide range of skill levels.

## VIII. Synthesis: High-Level Pseudocode Implementation

This final section consolidates the architectural principles and techniques discussed throughout the report into a high-level pseudocode summary. This summary is designed to serve as a practical blueprint for implementing a robust, modular, and extensible procedural level generation system in a game engine like Phaser. It illustrates the data flow, the interaction between core components, and the overall logic of the generation pipeline.

### A. Core Interfaces and Data Structures

First, we define the core data structures and interfaces that form the architectural backbone. These abstractions decouple the various parts of the system.

Code snippet

```
// The LevelBlueprint acts as an intermediate representation of the level.
// Each generation phase reads from and writes to this object.
class LevelBlueprint {
    // Grid representing collidable tiles (e.g., WALL, GROUND)
    structural_grid: 2DArray<TileType>

    // Grid for non-collidable aesthetic tiles (e.g., GRASS_DECO)
    decoration_grid: 2DArray<TileType>

    // List of dynamic objects (enemies, items, etc.) with their properties
    gameplay_objects: List<GameObjectDescriptor>

    // Graph representing the guaranteed solvable path from start to exit
    critical_path_graph: Graph

    // Data for parallaxing background layers
    background_layers: List<BackgroundLayerDescriptor>

    // High-level properties of the level (theme, difficulty, etc.)
    metadata: Dictionary<String, Any>

    constructor(width, height) {
        this.structural_grid = new 2DArray(width, height, TileType.EMPTY)
        //... initialize other properties
    }
}

// The Strategy interface defines the contract for all level generation algorithms.
interface IGenerationStrategy {
    function ExecuteMacro(blueprint: LevelBlueprint, rng: PRNG, params: DifficultyParams)
    function ExecuteMeso(blueprint: LevelBlueprint, rng: PRNG, params: DifficultyParams)
    function ExecuteMicro(blueprint: LevelBlueprint, rng: PRNG, params: DifficultyParams)
    function ExecuteDecoration(blueprint: LevelBlueprint, rng: PRNG)
}

// The Difficulty Strategy interface handles player modeling and difficulty targeting.
interface IDifficultyStrategy {
    function GetDifficultyTarget(playerProfile: PlayerProfile) -> DifficultyParams
    function UpdatePlayerModel(playerProfile: PlayerProfile, sessionStats: SessionStats)
}

// The Component Factory abstracts the creation of concrete game objects.
class ComponentFactory {
    function Create(type: String, properties: Dictionary) -> GameObject {
        // Logic to instantiate the correct game object based on type and properties.
        // e.g., if type is "enemy" and properties.theme is "cave", return new Bat()
    }
}

```

The following table provides a clear map of the architectural layers, their responsibilities, and their inputs/outputs within the `LevelBlueprint`, linking them to the concepts discussed previously.

Phase

Primary Responsibility

Core Algorithms & Techniques

Input from Blueprint

Output to Blueprint

Key Source Refs

**Macro-Generation**

Ensure solvability, define high-level pacing and flow.

Grid-Based Random Walk, Agent-Based Walk, Graph Pathfinding.

`metadata` (theme, length, difficulty target).

`critical_path_graph`, updated `metadata` (zone tags).

7

**Meso-Generation**

Translate abstract path into concrete, collidable geometry.

Chunk/Template Assembly, Noise Functions (Perlin), Cellular Automata.

`critical_path_graph`, `metadata`.

`structural_grid`.

22

**Micro-Generation**

Populate the level with interactive gameplay elements.

Rhythm-Based Placement, Probabilistic Placement, Rule-Based Placement.

`structural_grid`, `critical_path_graph`, `metadata`.

`gameplay_objects`.

6

**Decoration-Generation**

Apply aesthetic themes and atmosphere.

Rule-Based Tiling, L-Systems, Parallax Layers.

`structural_grid`, `gameplay_objects`, `metadata`.

`decoration_grid`, `background_layers`.

8

### B. Main Generator Class and Pipeline

The `LevelGenerator` class orchestrates the entire process, calling each stage of the pipeline in sequence.

Code snippet

```
class LevelGenerator {
    // Dependencies are injected via the constructor for modularity.
    strategy: IGenerationStrategy
    difficultyModel: IDifficultyStrategy
    componentFactory: ComponentFactory
    masterSeed: int

    constructor(strategy, difficultyModel, factory, seed) {
        this.strategy = strategy
        this.difficultyModel = difficultyModel
        this.componentFactory = factory
        this.masterSeed = seed
    }

    // Main public method to generate a complete level.
    function GenerateLevel(playerProfile: PlayerProfile) -> LevelBlueprint {
        // --- 1. INITIALIZATION ---
        // Create a new, empty blueprint for this level.
        let blueprint = new LevelBlueprint(LEVEL_WIDTH, LEVEL_HEIGHT)
        // Initialize a deterministic random number generator with the master seed.
        let rng = new PRNG(this.masterSeed)

        // Consult the difficulty model to get parameters for this generation.
        let difficultyParams = this.difficultyModel.GetDifficultyTarget(playerProfile)
        blueprint.metadata["difficulty"] = difficultyParams.targetValue
        blueprint.metadata["theme"] = this.strategy.getTheme() // Strategy exposes its theme.

        // --- 2. MACRO-GENERATION ---
        // Delegate to the current strategy to create the high-level plan.
        this.strategy.ExecuteMacro(blueprint, rng, difficultyParams)
        // POST-CONDITION: blueprint.critical_path_graph is now populated.

        // --- 3. MESO-GENERATION ---
        // Delegate to the strategy to build the main level structure.
        this.strategy.ExecuteMeso(blueprint, rng, difficultyParams)
        // POST-CONDITION: blueprint.structural_grid is now populated with walls, ground, etc.

        // --- 4. MICRO-GENERATION ---
        // Delegate to the strategy to place enemies, platforms, items, etc.
        this.strategy.ExecuteMicro(blueprint, rng, difficultyParams)
        // POST-CONDITION: blueprint.gameplay_objects list is now populated.

        // --- 5. DECORATION-GENERATION ---
        // Delegate to the strategy for the final aesthetic pass.
        this.strategy.ExecuteDecoration(blueprint, rng)
        // POST-CONDITION: blueprint.decoration_grid and blueprint.background_layers are populated.

        // --- 6. FINALIZATION & RETURN ---
        // Perform any final validation checks (e.g., ensure start/end points are valid).
        // The blueprint is now complete and ready to be rendered by the game engine.
        return blueprint
    }
}

```

### C. Example Concrete Strategy (`CaveGeneratorStrategy`)

This pseudocode illustrates how a specific strategy, `CaveGeneratorStrategy`, would implement the interface methods.

Code snippet

```
class CaveGeneratorStrategy implements IGenerationStrategy {

    function ExecuteMacro(blueprint, rng, params) {
        // Use the Spelunky-style grid-based random walk.
        let grid = new Grid(4, 4)
        let path = GenerateRandomWalk(grid, rng, { down_chance: 0.2 })
        blueprint.critical_path_graph = ConvertPathToGraph(path)
        // Tag nodes in the graph for later phases.
        TagGraphNodes(blueprint.critical_path_graph, ["entrance", "puzzle", "exit"], rng)
    }

    function ExecuteMeso(blueprint, rng, params) {
        // For each room in the critical path, select a pre-made chunk.
        for (roomNode in blueprint.critical_path_graph.nodes) {
            let chunkType = roomNode.tag // e.g., "puzzle"
            let chunk = SelectChunkFromLibrary("cave", chunkType, params.difficulty, rng)
            PlaceChunkInGrid(blueprint.structural_grid, chunk, roomNode.position)
        }
        // For off-path rooms, use Cellular Automata for more organic shapes.
        for (emptyRoom in GetOffPathRooms(blueprint)) {
            let caGrid = RunCellularAutomata(rng, { iterations: 5, fill_percent: 0.45 })
            CleanAndConnectCave(caGrid) // Flood-fill to ensure one large cavern.
            PlaceGridInBlueprint(blueprint.structural_grid, caGrid, emptyRoom.position)
        }
        // Finally, connect the critical path chunks to the CA caves.
        CarveTunnelsBetweenRooms(blueprint.structural_grid, blueprint.critical_path_graph)
    }

    function ExecuteMicro(blueprint, rng, params) {
        // Populate rooms based on their tags.
        for (room in blueprint.getRooms()) {
            if (room.tag == "puzzle") {
                PlacePuzzleElements(room, blueprint, rng)
            } else {
                // Use probabilistic placement for enemies and items.
                for (tile in room.getFloorTiles()) {
                    if (rng.chance(params.enemySpawnChance)) {
                        blueprint.gameplay_objects.add({ type: "enemy_bat", pos: tile.position })
                    }
                }
            }
        }
    }

    function ExecuteDecoration(blueprint, rng) {
        // Apply auto-tiling rules for cave walls/floors.
        ApplyCaveAutoTiling(blueprint.structural_grid, blueprint.decoration_grid)
        // Place decorative props like mushrooms and crystals.
        PlaceDecorativeProps(blueprint, rng, { type: "crystal", chance: 0.05 })
    }
}

```

### D. Example Decoration Sub-System (`LSystemCityscapeBackground`)

This demonstrates a self-contained decoration module that could be called by the `CityscapeStrategy`.

Code snippet

```
class LSystemBackgroundGenerator {
    function Generate(rng, params) -> BackgroundLayerDescriptor {
        // Define the L-system rules for a city skyline.
        let rules = {
            "A": "F[+A]F",
            "B": "FFF[+A]",
            "F": "FF"
        }
        let axiom = "A"
        let iterations = 4
        let angle = 20 // degrees

        // 1. Generate the L-system string.
        let lsystemString = ExpandLSystem(axiom, rules, iterations)

        // 2. Interpret the string with a turtle to draw a silhouette.
        let turtle = new Turtle(start_x: 0, start_y: 0)
        let path = new Path()

        for (char in lsystemString) {
            switch (char) {
                case "F":
                    path.add(turtle.moveForward(params.building_height))
                    break
                case "+":
                    turtle.turn(angle)
                    break
                case "-":
                    turtle.turn(-angle)
                    break
                case "":
                    turtle.popState()
                    break
            }
        }

        // 3. Return a descriptor for the background layer.
        return new BackgroundLayerDescriptor({
            path_data: path,
            color: params.skyline_color,
            parallax_factor: 0.2
        })
    }
}

```

This comprehensive pseudocode, combined with the architectural principles outlined, provides a complete and expert-level roadmap for developing a sophisticated, modular, and highly replayable procedural level generation system for a 2D platformer.