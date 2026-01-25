import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import {
  ArrayGrid,
  GridLocation,
  orthogonalNeighbors,
  Vector,
} from "@macil/grid";
import { combinationSet } from "@hugoalh/setation/set";
import { BidirectionalMap } from "@std/data-structures/unstable-bidirectional-map";

function parse(input: string): GridLocation[] {
  return input.trimEnd().split("\n").map((line) =>
    GridLocation.fromString(line)
  );
}

function rectangleArea(corner1: GridLocation, corner2: GridLocation): number {
  const width = Math.abs(corner1.column - corner2.column) + 1;
  const height = Math.abs(corner1.row - corner2.row) + 1;
  return width * height;
}

function part1(input: string): number {
  const redTiles = parse(input);
  return combinationSet(redTiles, 2)
    .map(([loc1, loc2]) => rectangleArea(loc1, loc2))
    .reduce((maxArea, area) => Math.max(maxArea, area));
}

/**
 * Compresses a set of coordinates into a smaller range by sorting the unique
 * values and assigning each a unique index. If a value is at least 2 greater
 * than the previous value, its index is incremented by 2 to create a gap.
 *
 * @returns A tuple of a bidirectional map from the original values to their
 * compressed indices, and the size of the compressed index range (equal to the
 * largest compressed index plus one).
 */
function compressCoordinates(
  values: number[],
): [BidirectionalMap<number, number>, number] {
  const uniqueValues = new Set(values);
  const sortedValues = Array.from(uniqueValues).sort((a, b) => a - b);
  const result = new BidirectionalMap<number, number>();
  let nextIndex = 0;
  let previousValue: number | undefined;
  for (const value of sortedValues) {
    if (previousValue !== undefined) {
      if (value - previousValue >= 2) {
        nextIndex += 2;
      } else {
        nextIndex += 1;
      }
    }
    result.set(value, nextIndex);
    previousValue = value;
  }
  return [result, nextIndex + 1];
}

Deno.test("compressCoordinates", () => {
  const input = [1, 5, 6, 10, 12, 13, 20];
  const expected = new BidirectionalMap<number, number>([
    [1, 0],
    [5, 2],
    [6, 3],
    [10, 5],
    [12, 7],
    [13, 8],
    [20, 10],
  ]);
  const actual = compressCoordinates(input);
  assertEquals(actual, [expected, 11]);
});

function part2(input: string): number {
  const redTiles = parse(input);

  const [compressedRowMap, compressedRowCount] = compressCoordinates(
    redTiles.map((loc) => loc.row),
  );
  const [compressedColumnMap, compressedColumnCount] = compressCoordinates(
    redTiles.map((loc) => loc.column),
  );

  function uncompress(loc: GridLocation): GridLocation {
    const originalRow = compressedRowMap.getReverse(loc.row);
    const originalColumn = compressedColumnMap.getReverse(loc.column);
    if (originalRow === undefined || originalColumn === undefined) {
      throw new Error(`GridLocation ${loc} cannot be uncompressed`);
    }
    return new GridLocation(originalRow, originalColumn);
  }

  const dimensions = new Vector(compressedRowCount, compressedColumnCount);

  /** true means the tile is red or green */
  const grid = ArrayGrid.createWithInitialValue(dimensions, false);

  const redTilesAsCompressed = redTiles.map((loc) =>
    new GridLocation(
      compressedRowMap.get(loc.row)!,
      compressedColumnMap.get(loc.column)!,
    )
  );

  // Fill in red tiles and green tiles along the paths.
  {
    if (redTilesAsCompressed.length === 0) {
      return 0;
    }

    let lastLocation: GridLocation = redTilesAsCompressed.at(-1)!;
    for (const loc of redTilesAsCompressed) {
      if (lastLocation) {
        if (
          lastLocation.row !== loc.row && lastLocation.column !== loc.column
        ) {
          throw new Error(
            `Invalid input: only horizontal and vertical moves are allowed (${lastLocation} -> ${loc})`,
          );
        }
        const stepVector = loc.subtract(lastLocation);
        const stepSignVector = new Vector(
          Math.sign(stepVector.rows),
          Math.sign(stepVector.columns),
        );
        let currentLocation = lastLocation.add(stepSignVector);
        while (!currentLocation.equals(loc)) {
          grid.set(currentLocation, true);
          currentLocation = currentLocation.add(stepSignVector);
        }
      }
      grid.set(loc, true);

      lastLocation = loc;
    }
  }

  // Now set all surrounded tiles to green.
  {
    const floodFilledLocations = ArrayGrid.createWithInitialValue(
      dimensions,
      false,
    );
    const loc = new GridLocation(0, 0);
    for (loc.row = 0; loc.row < dimensions.rows; loc.row++) {
      for (loc.column = 0; loc.column < dimensions.columns; loc.column++) {
        if (grid.get(loc) || floodFilledLocations.get(loc)) {
          continue;
        }
        // Flood fill from this location.
        let escapedToEdge = false;
        // Locations to check each neighbor and to fill if no escape happens.
        // Locations should be marked as a flood-filled location when added
        // here.
        const touched: GridLocation[] = [loc];
        floodFilledLocations.set(loc, true);
        // Use classic for-loop to allow pushing to the array while iterating.
        for (let i = 0; i < touched.length; i++) {
          const checkLoc = touched[i];
          for (const neighborVec of orthogonalNeighbors()) {
            const neighborLoc = checkLoc.add(neighborVec);
            const neighborFloodFilled = floodFilledLocations.get(neighborLoc);
            if (neighborFloodFilled === undefined) {
              // Reached the edge of the grid.
              escapedToEdge = true;
              continue;
            }
            if (neighborFloodFilled) {
              continue;
            }
            const neighborValue = grid.get(neighborLoc)!;
            if (!neighborValue) {
              floodFilledLocations.set(neighborLoc, true);
              touched.push(neighborLoc);
            }
          }
        }
        if (!escapedToEdge) {
          // Fill all touched locations as green.
          for (const fillLoc of touched) {
            grid.set(fillLoc, true);
          }
        }
      }
    }
  }

  // {
  //   console.log("Final grid:");
  //   const loc = new GridLocation(0, 0);
  //   for (loc.row = 0; loc.row < dimensions.rows; loc.row++) {
  //     let line = "";
  //     for (loc.column = 0; loc.column < dimensions.columns; loc.column++) {
  //       if (redTilesAsCompressed.some((redLoc) => redLoc.equals(loc))) {
  //         line += "#";
  //       } else {
  //         line += grid.get(loc) ? "X" : ".";
  //       }
  //     }
  //     console.log(line);
  //   }
  // }

  return combinationSet(redTilesAsCompressed, 2)
    // Check if all tiles in the rectangle defined by loc1 and loc2 are red or green.
    .filter(([loc1, loc2]) => {
      const minRow = Math.min(loc1.row, loc2.row);
      const maxRow = Math.max(loc1.row, loc2.row);
      const minColumn = Math.min(loc1.column, loc2.column);
      const maxColumn = Math.max(loc1.column, loc2.column);
      const loc = new GridLocation(0, 0);
      for (loc.row = minRow; loc.row <= maxRow; loc.row++) {
        for (loc.column = minColumn; loc.column <= maxColumn; loc.column++) {
          if (!grid.get(loc)) {
            return false;
          }
        }
      }
      return true;
    })
    // Transform to uncompressed locations for area calculation.
    .map(([loc1, loc2]) => [uncompress(loc1), uncompress(loc2)])
    // Calculate areas and find the maximum.
    .map(([loc1, loc2]) => rectangleArea(loc1, loc2))
    .reduce((maxArea, area) => Math.max(maxArea, area));
}

if (import.meta.main) {
  runPart(2025, 9, 1, part1);
  runPart(2025, 9, 2, part2);
}

const TEST_INPUT = `\
7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 50);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 24);
});
