import random
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import label

WALL = 1
FLOOR = 0

def is_edge(x, y, width, height):
    return x == 0 or y == 0 or x == width - 1 or y == height - 1

def count_wall_neighbors(grid, x, y, width, height):
    count = 0
    for dx in range(-1, 2):
        for dy in range(-1, 2):
            nx, ny = x + dx, y + dy
            if dx == 0 and dy == 0:
                continue
            if 0 <= nx < width and 0 <= ny < height:
                if grid[ny, nx] == WALL:
                    count += 1
            else:
                count += 1
    return count

def flood_fill_regions(grid):
    structure = np.array([[1,1,1],[1,1,1],[1,1,1]])
    labeled, num_features = label(grid == FLOOR, structure)
    regions = []
    for i in range(1, num_features + 1):
        region = np.argwhere(labeled == i)
        regions.append(region)
    return regions

def largest_region(regions):
    return max(regions, key=lambda r: len(r)) if regions else []

def carve_corridor(grid, region_a, region_b):
    min_dist = float('inf')
    best_pair = (region_a[0], region_b[0])

    for (y1, x1) in region_a:
        for (y2, x2) in region_b:
            dist = abs(x1 - x2) + abs(y1 - y2)
            if dist < min_dist:
                min_dist = dist
                best_pair = ((y1, x1), (y2, x2))

    (y1, x1), (y2, x2) = best_pair

    if random.random() < 0.5:
        for x in range(min(x1, x2), max(x1, x2) + 1):
            grid[y1, x] = FLOOR
        for y in range(min(y1, y2), max(y1, y2) + 1):
            grid[y, x2] = FLOOR
    else:
        for y in range(min(y1, y2), max(y1, y2) + 1):
            grid[y, x1] = FLOOR
        for x in range(min(x1, x2), max(x1, x2) + 1):
            grid[y2, x] = FLOOR

    return grid

def micro_smooth(grid, width, height):
    new_grid = grid.copy()
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            n = count_wall_neighbors(grid, x, y, width, height)
            if n > 5:
                new_grid[y, x] = WALL
            elif n < 3:
                new_grid[y, x] = FLOOR
    return new_grid

def generate_cave(params):
    width, height = params['width'], params['height']
    fill_p = params['fill_prob']
    birth, survive = params['birth'], params['survive']
    steps = params['ca_steps']
    min_region = params['min_region']
    smoothing_passes = params['smoothing_passes']

    grid = np.zeros((height, width), dtype=int)

    for y in range(height):
        for x in range(width):
            if is_edge(x, y, width, height):
                grid[y, x] = WALL
            else:
                grid[y, x] = WALL if random.random() < fill_p else FLOOR

    for _ in range(steps):
        new_grid = grid.copy()
        for y in range(height):
            for x in range(width):
                n = count_wall_neighbors(grid, x, y, width, height)
                if grid[y, x] == WALL:
                    new_grid[y, x] = WALL if n >= survive else FLOOR
                else:
                    new_grid[y, x] = WALL if n >= birth else FLOOR
        grid = new_grid

    regions = flood_fill_regions(grid)
    if regions:
        main = largest_region(regions)
        for region in regions:
            if len(region) >= min_region and not np.array_equal(region, main):
                grid = carve_corridor(grid, main, region)

    for _ in range(smoothing_passes):
        grid = micro_smooth(grid, width, height)

    return grid

# Parameters
params = {
    'width': 100,
    'height': 40,
    'fill_prob': 0.45,
    'birth': 5,
    'survive': 4,
    'ca_steps': 5,
    'min_region': 30,
    'smoothing_passes': 2
}

# Generate and display
cave = generate_cave(params)

plt.figure(figsize=(10, 6))
plt.imshow(cave, cmap='gray_r')
plt.title("Cave with Corrected Axis (X = Width, Y = Height)")
plt.axis('off')
plt.show()
