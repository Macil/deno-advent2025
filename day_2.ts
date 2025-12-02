import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { rangeIterator } from "@hugoalh/range-iterator";

function parse(input: string): Array<[number, number]> {
  return input.trimEnd().split(",")
    .map((rangeStr) =>
      rangeStr.split("-")
        .map((s) => Number(s.trim())) as [number, number]
    );
}

function isInvalidId(id: number): boolean {
  const idStr = id.toString();
  const len = idStr.length;
  if (len % 2 === 1) return false;
  return idStr.slice(0, len / 2) === idStr.slice(len / 2);
}

Deno.test("isInvalidId", () => {
  assertEquals(isInvalidId(9), false);
  assertEquals(isInvalidId(10), false);
  assertEquals(isInvalidId(11), true);
  assertEquals(isInvalidId(55), true);
  assertEquals(isInvalidId(555), false);
  assertEquals(isInvalidId(5555), true);
  assertEquals(isInvalidId(6464), true);
  assertEquals(isInvalidId(646), false);
  assertEquals(isInvalidId(123123), true);
  assertEquals(isInvalidId(123124), false);
  assertEquals(isInvalidId(123321), false);
});

function part1(input: string): number {
  const ranges = parse(input);
  return Iterator.from(ranges)
    .flatMap(([start, end]) => rangeIterator(start, end))
    .filter(isInvalidId)
    .reduce((sum, value) => sum + value, 0);
}

function isInvalidIdPart2(id: number): boolean {
  const idStr = id.toString();
  const len = idStr.length;

  if (len < 2) return false;

  return rangeIterator(1, len / 2)
    .filter((subLen) => len % subLen === 0)
    .some((subLen) => {
      const firstSlice = idStr.slice(0, subLen);
      return rangeIterator(1, len / subLen, { excludeEnd: true })
        .every((i) => idStr.slice(i * subLen, (i + 1) * subLen) === firstSlice);
    });
}

Deno.test("isInvalidIdPart2 part 1 examples", () => {
  assertEquals(isInvalidIdPart2(9), false);
  assertEquals(isInvalidIdPart2(10), false);
  assertEquals(isInvalidIdPart2(11), true);
  assertEquals(isInvalidIdPart2(55), true);
  assertEquals(isInvalidIdPart2(555), true); // different from part 1
  assertEquals(isInvalidIdPart2(5555), true);
  assertEquals(isInvalidIdPart2(6464), true);
  assertEquals(isInvalidIdPart2(646), false);
  assertEquals(isInvalidIdPart2(123123), true);
  assertEquals(isInvalidIdPart2(123124), false);
  assertEquals(isInvalidIdPart2(123321), false);
});

Deno.test("isInvalidIdPart2 new examples", () => {
  assertEquals(isInvalidIdPart2(123123123), true);
  assertEquals(isInvalidIdPart2(12312312), false);
  assertEquals(isInvalidIdPart2(1231231234), false);

  assertEquals(isInvalidIdPart2(1212121212), true);

  assertEquals(isInvalidIdPart2(1111111), true);
});

function part2(input: string): number {
  const ranges = parse(input);
  return Iterator.from(ranges)
    .flatMap(([start, end]) => rangeIterator(start, end))
    .filter(isInvalidIdPart2)
    .reduce((sum, value) => sum + value, 0);
}

if (import.meta.main) {
  runPart(2025, 2, 1, part1);
  runPart(2025, 2, 2, part2);
}

const TEST_INPUT = `\
11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
1698522-1698528,446443-446449,38593856-38593862,565653-565659,
824824821-824824827,2121212118-2121212124
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 1227775554);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 4174379265);
});
