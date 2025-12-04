import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { allNeighbors, ArrayGrid, CharacterGrid } from "@macil/grid";

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  return grid.valuesWithLocations()
    .filter(({ value }) => value === "@")
    .filter(({ location }) =>
      Iterator.from(allNeighbors())
        .map((neighborVec) => location.add(neighborVec))
        .filter((neighbor) => grid.get(neighbor) === "@")
        .take(4)
        .reduce((count) => count + 1, 0) < 4
    )
    .reduce((count) => count + 1, 0);
}

function part2(input: string): number {
  const grid = CharacterGrid.fromString(input);
  const paperRollNeighborCounts = ArrayGrid.createWithInitialValue<
    number | undefined
  >(grid.dimensions, undefined);

  for (const { value, location } of grid.valuesWithLocations()) {
    if (value !== "@") continue;
    const neighborCount = Iterator.from(allNeighbors())
      .map((neighborVec) => location.add(neighborVec))
      .filter((neighbor) => grid.get(neighbor) === "@")
      .reduce((count) => count + 1, 0);
    paperRollNeighborCounts.set(location, neighborCount);
  }

  let removedCount = 0;

  while (true) {
    let removedThisRound = 0;
    for (
      const { value, location } of paperRollNeighborCounts.valuesWithLocations()
    ) {
      if (value === undefined || value >= 4) continue;
      removedThisRound++;
      paperRollNeighborCounts.set(location, undefined);
      Iterator.from(allNeighbors())
        .map((neighborVec) => location.add(neighborVec))
        .forEach((neighbor) => {
          const neighborCount = paperRollNeighborCounts.get(neighbor);
          if (neighborCount === undefined) return;
          paperRollNeighborCounts.set(neighbor, neighborCount - 1);
        });
    }
    if (removedThisRound === 0) break;
    removedCount += removedThisRound;
  }

  return removedCount;
}

if (import.meta.main) {
  runPart(2025, 4, 1, part1);
  runPart(2025, 4, 2, part2);
}

const TEST_INPUT = `\
..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 13);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 43);
});
