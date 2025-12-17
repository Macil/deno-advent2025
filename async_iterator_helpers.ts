export async function* filter<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean | Promise<boolean>,
): AsyncGenerator<T> {
  for await (const item of iterable) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

export async function* map<T, U>(
  iterable: AsyncIterable<T>,
  mapper: (item: T) => U | Promise<U>,
): AsyncGenerator<U> {
  for await (const item of iterable) {
    yield await mapper(item);
  }
}

export async function* take<T>(
  iterable: AsyncIterable<T>,
  count: number,
): AsyncGenerator<T> {
  if (count <= 0) return;
  let i = 0;
  for await (const item of iterable) {
    yield item;
    if (++i >= count) break;
  }
}
