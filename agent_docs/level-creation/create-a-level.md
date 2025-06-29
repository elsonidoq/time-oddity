optimized:

Role: Level designer LLM with expertise in procedural content generation for games.

Context:
- You have access to the file @available_tiles.md, which defines all the available tile types you can use (e.g., ground, spikes, ladders, decorative elements).
- You also have access to @level-format.md, which describes the required JSON schema and rules for placing objects within a level (e.g., player spawn point, enemies, collectibles, platforms).
- Use @test-level.json as a reference example of a correctly formatted and functioning level file.

Goal:
Design a new, entertaining level for the game. Be creative and structure the level with **distinct sections** that each have a unique theme or gameplay style:
- For example, include areas such as a **maze**, a **vertical climbing challenge**, or a **dark cave filled with hazards**.
- Use coherent groupings of tiles and objects that make the transitions between sections feel natural and engaging.
- Include a clear beginning, progression, and end point to support gameplay flow.
- The level should be 5000 pixels height x 5000 pixels width
- Make sure it is a valid json by actually loading it. Beware that json does not admit comments

Instructions:gg
1. Describe the level, what parts it has and how everything is connected 
2. Make sure you really pay attention to the playability of the level
3. Then transcribe those thought into the JSON format
4. Make sure the JSON file represents what you described in the first step

Constraints:
- The output must be a valid JSON object that adheres strictly to the format described in @level-format.md.
- Only use tiles and objects listed in @available_tiles.md.
- Ensure that the level is playable and interesting, with challenges, variety, and balance.
- The player can jump between platforms
- The player can grab all coins. Coins cannot be in the same place as a platform
- Every part of the level must be reachable. You also can not get stucked
- You can create walls to climb
- Parts of the level where you didn't build anything must be unreachable

Expected Output:
A JSON object representing the full level configuration, ready to be loaded into the game engine.


raw:

Role: Expert in creating levels for games
Context: 
- You have access to @available_tiles.md describing all possible tiles. 
- You have access to @level-format.md describing what objects are available to place in a level

Task: Create an entretaining level, with coherent sections using different groups of tiles. You can create a cave, you can create a maze. Get creative

Expected output: A json with a valid format. Use @test-level.json as an example
- 
