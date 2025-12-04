import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { allNeighbors, CharacterGrid } from "@macil/grid";

function part1(input: string): number {
  const grid = CharacterGrid.fromString(input);
  return grid.valuesWithLocations()
    .filter(({ location }) => grid.get(location) === "@")
    .filter(({ location }) =>
      Iterator.from(allNeighbors())
        .map((neighborVec) => location.add(neighborVec))
        .filter((neighbor) => grid.get(neighbor) === "@")
        .take(4)
        .reduce((count) => count + 1, 0) < 4
    )
    .reduce((count) => count + 1, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 4, 1, part1);
  // runPart(2025, 4, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
