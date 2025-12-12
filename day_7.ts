import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid, Location } from "@macil/grid";
import rangeIterator from "@hugoalh/range-iterator";

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  const startPosition = grid.valuesWithLocations()
    .find(({ value }) => value === "S")?.location;
  if (!startPosition) {
    throw new Error("Start position not found");
  }
  const activatedSplitters = new Set<string>();
  const beamQueue = [startPosition];
  while (beamQueue.length > 0) {
    const beamPosition = beamQueue.pop()!;
    const hitSplitter = rangeIterator(
      beamPosition.row,
      grid.dimensions.rows - 1,
    )
      .map((row) => new Location(row, beamPosition.column))
      .find((loc) => grid.get(loc) === "^");
    if (hitSplitter) {
      const hitSplitterKey = hitSplitter.toString();
      if (!activatedSplitters.has(hitSplitterKey)) {
        activatedSplitters.add(hitSplitterKey);
        beamQueue.push(...[
          new Location(hitSplitter.row, hitSplitter.column - 1),
          new Location(hitSplitter.row, hitSplitter.column + 1),
        ].filter((loc) => grid.isInBounds(loc)));
      }
    }
  }
  return activatedSplitters.size;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 7, 1, part1);
  // runPart(2025, 7, 2, part2);
}

const TEST_INPUT = `\
.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 21);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
