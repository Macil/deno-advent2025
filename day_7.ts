import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { CharacterGrid, GridLocation } from "@macil/grid";
import rangeIterator from "@hugoalh/range-iterator";
import { BinaryHeap } from "@std/data-structures/binary-heap";
import { ascend } from "@std/data-structures/comparators";

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
      .map((row) => new GridLocation(row, beamPosition.column))
      .find((loc) => grid.get(loc) === "^");
    if (hitSplitter) {
      const hitSplitterKey = hitSplitter.toString();
      if (!activatedSplitters.has(hitSplitterKey)) {
        activatedSplitters.add(hitSplitterKey);
        beamQueue.push(...[
          new GridLocation(hitSplitter.row, hitSplitter.column - 1),
          new GridLocation(hitSplitter.row, hitSplitter.column + 1),
        ].filter((loc) => grid.isInBounds(loc)));
      }
    }
  }
  return activatedSplitters.size;
}

function part2(input: string): number {
  const grid = CharacterGrid.fromString(input);
  const startPosition = grid.valuesWithLocations()
    .find(({ value }) => value === "S")?.location;
  if (!startPosition) {
    throw new Error("Start position not found");
  }
  const activationsBySplitter = new Map<string, number>();
  const beamQueue = BinaryHeap.from<
    { location: GridLocation; sourceSplitter?: GridLocation }
  >(
    [{ location: startPosition, sourceSplitter: undefined }],
    { compare: (a, b) => ascend(a.location.row, b.location.row) },
  );
  let beamsThatReachedBottom = 0;
  while (true) {
    const entry = beamQueue.pop();
    if (!entry) {
      break;
    }
    const sourceSplitterActivations = entry.sourceSplitter
      ? activationsBySplitter.get(entry.sourceSplitter.toString())!
      : 1;
    const hitSplitter = rangeIterator(
      entry.location.row,
      grid.dimensions.rows - 1,
    )
      .map((row) => new GridLocation(row, entry.location.column))
      .find((loc) => grid.get(loc) === "^");
    if (hitSplitter) {
      const hitSplitterKey = hitSplitter.toString();

      const splitterActivations = activationsBySplitter.get(hitSplitterKey);
      if (splitterActivations === undefined) {
        beamQueue.push(...[
          {
            location: new GridLocation(hitSplitter.row, hitSplitter.column - 1),
            sourceSplitter: hitSplitter,
          },
          {
            location: new GridLocation(hitSplitter.row, hitSplitter.column + 1),
            sourceSplitter: hitSplitter,
          },
        ].filter((entry) => grid.isInBounds(entry.location)));
      }
      activationsBySplitter.set(
        hitSplitterKey,
        (splitterActivations ?? 0) + sourceSplitterActivations,
      );
    } else {
      beamsThatReachedBottom += sourceSplitterActivations;
    }
  }
  return beamsThatReachedBottom;
}

if (import.meta.main) {
  runPart(2025, 7, 1, part1);
  runPart(2025, 7, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 40);
});

Deno.test("part2 no splitters", () => {
  assertEquals(
    part2(`\
...S...
`),
    1,
  );
});

Deno.test("part2 one splitter input", () => {
  assertEquals(
    part2(`\
...S...
...^...
`),
    2,
  );
});

Deno.test("part2 simple input", () => {
  assertEquals(
    part2(`\
...S...
...^...
..^.^..
`),
    4,
  );
});

Deno.test("part2 overlapping paths", () => {
  assertEquals(
    part2(`\
...S...
...^...
..^.^..
...^...
`),
    6,
  );
});

Deno.test("part2 multiple overlapping paths", () => {
  assertEquals(
    part2(`\
...S...
...^...
..^.^..
...^...
..^....
`),
    8,
  );
});
