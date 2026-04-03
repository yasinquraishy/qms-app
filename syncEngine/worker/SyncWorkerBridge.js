import { ObjectPool } from "../core/ObjectPool.js";
import { hydrate } from "../persistence/hydration.js";
import { MSG } from "../shared/messageTypes.js";

export class SyncWorkerBridge {
  #registration = null;
  #onFlush = null;
  #onError = null;

  constructor({ onFlush, onError } = {}) {
    this.#onFlush = onFlush;
    this.#onError = onError;
  }

  /**
   * Register the Service Worker and start listening for messages.
   * @param {string} swUrl - Path to the built SW file (e.g. "/sync-worker.js")
   */
  async register(swUrl) {
    this.#registration = await navigator.serviceWorker.register(swUrl, {
      type: "module",
    });
    await navigator.serviceWorker.ready;

    navigator.serviceWorker.addEventListener("message", (event) => {
      this.#handleMessage(event.data);
    });
  }

  /**
   * Post a message to the active Service Worker.
   * @param {object} msg
   */
  sendMessage(msg) {
    const sw = this.#registration?.active;
    if (sw) sw.postMessage(msg);
  }

  /**
   * Tell the SW to stop polling and disconnect socket.
   */
  stop() {
    this.sendMessage({ type: MSG.STOP });
  }

  // ── private ──────────────────────────────────────────────────────────────

  #handleMessage(msg) {
    switch (msg.type) {
      case MSG.SYNC:
      case MSG.ROLLBACK:
        this.#handleNotification(msg).catch((err) => this.#onError?.(err));
        break;
      case MSG.FLUSH:
        this.#onFlush?.(msg.entry);
        break;
      case MSG.ERROR:
        this.#onError?.(msg.error);
        break;
    }
  }

  /**
   * Handle a SYNC or ROLLBACK notification from the SW.
   *
   * Removal cases (unregister from pool):
   *   - Any type with action "delete" — authoritative delete.
   *   - ROLLBACK + action "create" — optimistic create that never committed.
   *
   * Hydration cases:
   *   - Everything else (SYNC create/update, ROLLBACK update/delete that needs reload).
   *
   * @param {{ type: string, modelName: string, modelId: string, action: string }} msg
   */
  async #handleNotification({ type, modelName, modelId, action }) {
    const shouldRemove =
      action === "delete" || (type === MSG.ROLLBACK && action === "create");

    if (shouldRemove) {
      ObjectPool.unregister(modelName, modelId);
      return;
    }
    await hydrate(modelName, modelId);
  }
}
