/**
 * Represents a set of pending changes to be committed or rolled back.
 *
 * Created by BaseModel#save() and passed to the sync layer.
 */
export class UpdateTransaction {
  constructor(model, changes) {
    this.model = model;
    this.changes = changes;
    this.committed = false;
  }

  /**
   * Placeholder: send changes to the sync server / persist to IndexedDB.
   * Consumers should override or replace this with their transport logic.
   */
  async commit() {
    this.committed = true;
    return this;
  }

  /**
   * Undo the changes by restoring old values on the model.
   * Restores property values to their state when the transaction was created,
   * not to the state before the most recent modification.
   */
  async rollback() {
    for (const [key, oldVal] of Object.entries(this.changes)) {
      this.model[key] = oldVal;
    }
    await this.model._clearModified();
    await this.model.save(); // re-persist the rolled-back state
    return this;
  }
}
