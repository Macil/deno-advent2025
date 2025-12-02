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
    position = (position % 100 + 100) % 100;

    if (position === 0) {
      timesAt0 += 1;
    }
  }
  return timesAt0;
}

function part2(input: string): number {
  const items = parse(input);

  let timesAt0 = 0;
  let position = 50;
  for (const move of items) {
    const prevPosition = position;
    position += move;

    if (position === 0) {
      timesAt0 += 1;
    } else if (position < 0) {
      if (prevPosition === 0) {
        timesAt0 -= 1;
      }
      while (position < 0) {
        position += 100;
        timesAt0 += 1;
      }
      if (position === 0) {
        timesAt0 += 1;
      }
    } else if (position >= 100) {
      while (position >= 100) {
        position -= 100;
        timesAt0 += 1;
      }
    }
  }
  return timesAt0;
}

if (import.meta.main) {
  runPart(2025, 1, 1, part1);
  runPart(2025, 1, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 6);
});

Deno.test("part2: turn to 0", () => {
  assertEquals(part2("L50"), 1);
  assertEquals(part2("L50\nL1"), 1);
  assertEquals(part2("R50"), 1);
  assertEquals(part2("R50\nR1"), 1);
});

Deno.test("part2: turn past 0 to next 0", () => {
  assertEquals(part2("L150"), 2);
  assertEquals(part2("R150"), 2);
});

Deno.test("part2: turn to 0 and then 99 more", () => {
  assertEquals(part2("L50\nL99"), 1);
  assertEquals(part2("L50\nL199"), 2);
  assertEquals(part2("R50\nR99"), 1);
  assertEquals(part2("R50\nR199"), 2);
});

Deno.test("part2: turn to 0 twice", () => {
  assertEquals(part2("L50\nL100"), 2);
  assertEquals(part2("L50\nL200"), 3);
  assertEquals(part2("R50\nR100"), 2);
  assertEquals(part2("R50\nR200"), 3);
});
