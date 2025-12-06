import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { ArrayGrid, Location } from "@macil/grid";
import rangeIterator from "@hugoalh/range-iterator";

type Operation = "+" | "*";

interface Problem {
  numbers: number[];
  operation: Operation;
}

function parse(input: string): Problem[] {
  const grid = ArrayGrid.fromRows<string | number>(
    input.trimEnd().split("\n").map((line) =>
      line.trim().split(/\s+/).map((token) => {
        const n = Number(token);
        return isNaN(n) ? token : n;
      })
    ),
  );
  return rangeIterator(0, grid.dimensions.columns - 1)
    .map((col): Problem => ({
      numbers: rangeIterator(0, grid.dimensions.rows - 2)
        .map((row) => grid.get(new Location(row, col)) as number)
        .toArray(),
      operation: grid.get(
        new Location(grid.dimensions.rows - 1, col),
      ) as Operation,
    }))
    .toArray();
}

function part1(input: string): number {
  const problems = parse(input);
  return problems
    .map((problem) =>
      problem.numbers.reduce(
        problem.operation === "+" ? (a, b) => a + b : (a, b) => a * b,
        problem.operation === "+" ? 0 : 1,
      )
    ).reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const problems = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 6, 1, part1);
  // runPart(2025, 6, 2, part2);
}

const TEST_INPUT = `\
123 328  51 64
 45 64  387 23
  6 98  215 314
*   +   *   +
`;

Deno.test("parse", () => {
  assertEquals(parse(TEST_INPUT), [
    { numbers: [123, 45, 6], operation: "*" },
    { numbers: [328, 64, 98], operation: "+" },
    { numbers: [51, 387, 215], operation: "*" },
    { numbers: [64, 23, 314], operation: "+" },
  ]);
});

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 4277556);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
