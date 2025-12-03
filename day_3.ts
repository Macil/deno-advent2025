import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import rangeIterator from "@hugoalh/range-iterator";

function parse(input: string): string[] {
  return input.trimEnd().split("\n");
}

function highestJoltageFromBank(bank: string): number {
  return Math.max(
    ...rangeIterator(0, 9)
      .map((i) => {
        const idx = bank.indexOf(i.toString());
        if (idx === -1) return -Infinity;
        return i * 10 +
          Math.max(...Array.from(bank.slice(idx + 1)).map(Number));
      }),
  );
}

function part1(input: string): number {
  const banks = parse(input);
  return banks
    .map(highestJoltageFromBank)
    .reduce((sum, value) => sum + value, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 3, 1, part1);
  // runPart(2025, 3, 2, part2);
}

const TEST_INPUT = `\
987654321111111
811111111111119
234234234234278
818181911112111
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 357);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
