import { assert, assertEquals } from "@std/assert";
import { init } from "@macil/z3-solver";
import { getSolutions } from "./z3_helpers.ts";
import { map } from "./async_iterator_helpers.ts";
const { Context } = await init();
const Z3 = new Context("test");

Deno.test("getSolutions finds multiple solutions", async () => {
  const x = Z3.Int.const("x");
  const solver = new Z3.Solver();
  solver.add(x.mul(x).eq(Z3.Int.val(4))); // x^2 = 4
  assertEquals(await solver.check(), "sat");
  const xSolutions = await Array.fromAsync(
    map(
      getSolutions(Z3, solver, [x]),
      (model) => {
        const vx = model.get(x);
        assert(Z3.isIntVal(vx));
        return vx.value();
      },
    ),
  );
  assertEquals(xSolutions.sort(), [-2n, 2n]);
});
