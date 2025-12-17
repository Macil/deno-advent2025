import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Location } from "@macil/grid";
import { combinationSet } from "@hugoalh/setation/set";

function parse(input: string): Location[] {
  return input.trimEnd().split("\n").map((line) => Location.fromString(line));
}

function rectangleArea(corner1: Location, corner2: Location): number {
  const width = Math.abs(corner1.column - corner2.column) + 1;
  const height = Math.abs(corner1.row - corner2.row) + 1;
  return width * height;
}

function part1(input: string): number {
  const locations = parse(input);
  return combinationSet(locations, 2)
    .map(([loc1, loc2]) => rectangleArea(loc1, loc2))
    .reduce((maxArea, area) => Math.max(maxArea, area));
}

// function part2(input: string): number {
//   const locations = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 9, 1, part1);
  // runPart(2025, 9, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
