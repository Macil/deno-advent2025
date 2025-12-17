import type { Bool, Context, Expr, Model, Solver } from "@macil/z3-solver";

function generateConstraint<Name extends string>(
  z3: Context<Name>,
  model: Model<Name>,
  variables: ReadonlyArray<Expr<Name>>,
): Bool<Name> {
  // TODO could this function be made to work without the variables parameter?
  return variables
    .map((expr) => {
      const value = model.get(expr);
      return expr.neq(value);
    })
    .reduce(
      (acc, curr) => acc.or(curr),
      z3.Bool.val(false),
    );
}

/**
 * Creates an AsyncIterable that yields all solutions to the given solver.
 *
 * If there could be infinitely many solutions, the iterable will never end.
 * Consider using it with `take` or similar to limit the number of solutions.
 */
export async function* getSolutions<Name extends string>(
  z3: Context<Name>,
  solver: Solver<Name>,
  variables: ReadonlyArray<Expr<Name>>,
): AsyncGenerator<Model<Name>> {
  while (await solver.check() === "sat") {
    const model = solver.model();
    const counterExample = generateConstraint(z3, model, variables);
    yield model;
    solver.add(counterExample);
  }
}
