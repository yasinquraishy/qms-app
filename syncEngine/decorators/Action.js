/**
 * @Action — method decorator.
 *
 * Vue batches reactive writes automatically within the same tick, so no
 * explicit action wrapper is needed. The method is returned as-is.
 *
 * Any save() call inside the method delegates to the installed save strategy.
 *
 * Usage:
 *   @Action
 *   moveToTeam(team) { ... }
 */
export function Action(fn, context) {
  if (context.kind !== 'method') {
    throw new Error('@Action must be applied to a class method')
  }
  return fn
}
