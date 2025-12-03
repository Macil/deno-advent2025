import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import rangeIterator from "@hugoalh/range-iterator";

function parse(input: string): string[] {
  return input.trimEnd().split("\n");
}

function highestJoltageFromBank(bank: string, digits: number): number {
  for (const i of rangeIterator(9, 0)) {
    const idx = bank.indexOf(i.toString());
    if (idx === -1) continue;
    const maxValueLength = bank.length - idx;
    if (maxValueLength < digits) continue;
    if (digits === 1) {
      return i;
    }
    return i * 10 ** (digits - 1) +
      highestJoltageFromBank(bank.slice(idx + 1), digits - 1);
  }
  throw new Error(
    `No valid joltage found for bank ${bank} with digits ${digits}`,
  );
}

function part1(input: string): number {
  const banks = parse(input);
  return banks
    .map((bank) => highestJoltageFromBank(bank, 2))
    .reduce((sum, value) => sum + value, 0);
}

function part2(input: string): number {
  const banks = parse(input);
  return banks
    .map((bank) => highestJoltageFromBank(bank, 12))
    .reduce((sum, value) => sum + value, 0);
}

if (import.meta.main) {
  runPart(2025, 3, 1, part1);
  runPart(2025, 3, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 3121910778619);
});
