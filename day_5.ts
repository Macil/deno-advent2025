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

function countOfIntegersInRange(min: number, max: number): number {
  return max - min + 1;
}

function part2(input: string): number {
  const configuration = parse(input);

  // combine overlapping ranges
  while (true) {
    let mergedAny = false;
    for (let i = 0; i < configuration.freshIngredientRanges.length - 1; i++) {
      let rangeA = configuration.freshIngredientRanges[i];
      for (let j = i + 1; j < configuration.freshIngredientRanges.length; j++) {
        const rangeB = configuration.freshIngredientRanges[j];
        if (
          rangeA[0] <= rangeB[1] && rangeB[0] <= rangeA[1]
        ) {
          // ranges overlap, merge them
          rangeA = [
            Math.min(rangeA[0], rangeB[0]),
            Math.max(rangeA[1], rangeB[1]),
          ];
          configuration.freshIngredientRanges.splice(j--, 1);
          configuration.freshIngredientRanges[i] = rangeA;
          mergedAny = true;
        }
      }
    }
    if (!mergedAny) {
      break;
    }
  }

  return Iterator.from(configuration.freshIngredientRanges)
    .map(([min, max]) => countOfIntegersInRange(min, max))
    .reduce((sum, value) => sum + value, 0);
}

if (import.meta.main) {
  runPart(2025, 5, 1, part1);
  runPart(2025, 5, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 14);
});
