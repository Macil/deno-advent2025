import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { KDTree } from "mnemonist";
import { UnionFind } from "@easy-data-structure-js/union-find";
import { BinaryHeap } from "@std/data-structures/binary-heap";
import { ascend } from "@std/data-structures/comparators";

type Vec3 = [number, number, number];

function parse(input: string): Vec3[] {
  return input.trimEnd().split("\n")
    .map((line) => {
      const parts = line.split(",");
      if (parts.length !== 3) {
        throw new Error(`Invalid line: ${line}`);
      }
      return parts.map(Number) as Vec3;
    });
}

function vec3Distance(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function* getNearestNeighbors(
  tree: KDTree<number>,
  point: Vec3,
  initialK = 1,
): Generator<number> {
  // Ideally we would use a KDTree implementation that supports an iterator for
  // getting nearest neighbors, but because it doesn't, we will use exponential
  // backoff to yield neighbors one by one.
  let i = 0;
  let k = initialK;
  let neighbors = tree.kNearestNeighbors(k, point);
  while (true) {
    const result = neighbors[i];
    if (result === undefined) {
      return;
    }
    yield result;
    i++;
    if (i >= k) {
      k *= 2;
      neighbors = tree.kNearestNeighbors(k, point);
    }
  }
}

function* closestPairs(
  tree: KDTree<number>,
  points: ReadonlyArray<Vec3>,
): Generator<[number, number]> {
  const iterators = points.map((point) => {
    const keysToSkip = new Set<number>();
    const nearestNeighbors = getNearestNeighbors(tree, point, 3)
      .filter((key) => {
        if (points[key] === point) {
          return false;
        }
        if (keysToSkip.has(key)) {
          keysToSkip.delete(key);
          return false;
        }
        return true;
      });
    return { keysToSkip, nearestNeighbors };
  });

  const heap = new BinaryHeap<
    { key: number; nearestKey: number; distance: number }
  >((a, b) => ascend(a.distance, b.distance));
  for (let i = 0; i < points.length; i++) {
    const r = iterators[i].nearestNeighbors.next();
    if (!r.done) {
      iterators[r.value].keysToSkip.add(i);
      heap.push({
        key: i,
        nearestKey: r.value,
        distance: vec3Distance(points[i], points[r.value]),
      });
    }
  }
  while (true) {
    const entry = heap.pop();
    if (entry === undefined) {
      break;
    }
    yield [entry.key, entry.nearestKey];
    const r = iterators[entry.key].nearestNeighbors.next();
    if (!r.done) {
      iterators[r.value].keysToSkip.add(entry.key);
      heap.push({
        key: entry.key,
        nearestKey: r.value,
        distance: vec3Distance(points[entry.key], points[r.value]),
      });
    }
  }
}

function getSetSizesByRoot(
  uf: UnionFind,
  pointCount: number,
): Map<number, number> {
  const sizesByRoot = new Map<number, number>();
  for (let i = 0; i < pointCount; i++) {
    const root = uf.find(i);
    sizesByRoot.set(root, (sizesByRoot.get(root) ?? 0) + 1);
  }
  return sizesByRoot;
}

function part1(input: string, connectionCount = 1000): number {
  const points = parse(input);
  const kdTree = KDTree.from(points.map((p, index) => [index, p]), 3);
  const uf = new UnionFind(points.length);
  for (const [a, b] of closestPairs(kdTree, points).take(connectionCount)) {
    uf.union(a, b);
  }
  const sizesByRoot = getSetSizesByRoot(uf, points.length);
  const sizesHeap = BinaryHeap.from(sizesByRoot.values());
  return Iterator.from(sizesHeap.drain())
    .take(3)
    .reduce((product, value) => product * value);
}

function part2(input: string): number {
  const points = parse(input);
  const kdTree = KDTree.from(points.map((p, index) => [index, p]), 3);
  const uf = new UnionFind(points.length);
  for (const [a, b] of closestPairs(kdTree, points)) {
    uf.union(a, b);
    if (uf.getCount() === 1) {
      return points[a][0] * points[b][0];
    }
  }
  throw new Error("Failed to connect all junction boxes");
}

if (import.meta.main) {
  runPart(2025, 8, 1, part1);
  runPart(2025, 8, 2, part2);
}

const TEST_INPUT = `\
162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT, 10), 40);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 25272);
});
