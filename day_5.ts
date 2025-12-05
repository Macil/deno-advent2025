import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Configuration {
  freshIngredientRanges: Array<[number, number]>;
  availableIngredients: number[];
}

function parse(input: string): Configuration {
  const [ranges, items] = input.trimEnd().split("\n\n");
  return {
    freshIngredientRanges: ranges.split("\n").map((line) => {
      const lineParts = line.split("-");
      if (lineParts.length !== 2) {
        throw new Error(`Invalid range line: ${line}`);
      }
      const [min, max] = lineParts.map(Number);
      return [min, max] as [number, number];
    }),
    availableIngredients: items.split("\n").map(Number),
  };
}

function part1(input: string): number {
  const configuration = parse(input);
  return Iterator.from(configuration.availableIngredients)
    .filter((item) =>
      configuration.freshIngredientRanges
        .some(([min, max]) => item >= min && item <= max)
    )
    .reduce((count) => count + 1, 0);
}

// function part2(input: string): number {
//   const configuration = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 5, 1, part1);
  // runPart(2025, 5, 2, part2);
}

const TEST_INPUT = `\
3-5
10-14
16-20
12-18

1
5
8
11
17
32
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 3);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
