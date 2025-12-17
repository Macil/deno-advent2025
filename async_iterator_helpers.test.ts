import { assertEquals } from "@std/assert";
import { filter, map, take } from "./async_iterator_helpers.ts";

async function* toAsyncIterable<T>(values: Iterable<T>): AsyncGenerator<T> {
  for (const value of values) {
    yield value;
  }
}

Deno.test("filter", async () => {
  const results = await Array.fromAsync(
    filter(
      toAsyncIterable([1, 2, 3, 4, 5]),
      (n) => n % 2 === 0,
    ),
  );
  assertEquals(results, [2, 4]);
});

Deno.test("map", async () => {
  const results = await Array.fromAsync(
    map(
      toAsyncIterable([1, 2, 3]),
      (n) => n * n,
    ),
  );
  assertEquals(results, [1, 4, 9]);
});

Deno.test("take", async () => {
  const results = await Array.fromAsync(
    take(
      toAsyncIterable([1, 2, 3, 4, 5]),
      3,
    ),
  );
  assertEquals(results, [1, 2, 3]);
});

Deno.test("take with count 0 consumes nothing", async () => {
  // deno-lint-ignore require-yield
  async function* poisonIterable() {
    throw new Error("should not be consumed");
  }
  const results = await Array.fromAsync(
    take(poisonIterable(), 0),
  );
  assertEquals(results, []);
});

Deno.test("take with count larger than iterable yields all", async () => {
  const results = await Array.fromAsync(
    take(
      toAsyncIterable([1, 2, 3]),
      5,
    ),
  );
  assertEquals(results, [1, 2, 3]);
});

Deno.test("take does not consume more than needed", async () => {
  let consumed = 0;
  async function* countingIterable() {
    for (let i = 0; i < 10; i++) {
      consumed++;
      yield i;
    }
  }
  const results = await Array.fromAsync(
    take(
      countingIterable(),
      4,
    ),
  );
  assertEquals(results, [0, 1, 2, 3]);
  assertEquals(consumed, 4);
});
