import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

function parse(input: string): number[] {
  return input.trimEnd().split("\n")
    .map((line) => Number(line.slice(1)) * (line[0] === "L" ? -1 : 1));
}

function part1(input: string): number {
  const items = parse(input);

  let timesAt0 = 0;
  let position = 50;
  for (const move of items) {
    position += move;
    position = (position + 100) % 100;

    if (position === 0) {
      timesAt0 += 1;
    }
  }
  return timesAt0;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2025, 1, 1, part1);
  // runPart(2025, 1, 2, part2);
}

const TEST_INPUT = `\
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 3);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
