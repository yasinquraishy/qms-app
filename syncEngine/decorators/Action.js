import { action as mobxAction } from "mobx";

/**
 * @Action — method decorator.
 *
 * Wraps the method in a MobX action so all observable mutations inside it
 * are batched into a single reaction flush (one re-render, not N).
 *
 * The decorator does NOT create an UpdateTransaction — any save() call inside
 * the method handles that.
 *
 * Usage:
 *   @Action
 *   moveToTeam(team) { ... }
 */
export function Action(fn, context) {
  if (context.kind !== "method") {
    throw new Error("@Action must be applied to a class method");
  }
  return mobxAction(context.name, fn);
}
