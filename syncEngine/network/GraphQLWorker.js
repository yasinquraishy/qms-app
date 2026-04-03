import { GraphQLSchemaGenerator } from './GraphQLSchemaGenerator.js'

export class GraphQLWorker {
  #client
  #intervalMs
  #onError
  #onFlush
  #getPending
  #deleteEntry
  #rollback
  #timer
  #running
  #backoffMs
  #maxBackoffMs

  /**
   * @param {object} client - GraphQL client with request(doc, vars) method
   * @param {object} options
   * @param {number} [options.intervalMs=5000]
   * @param {Function} [options.onError]
   * @param {Function} [options.onFlush]
   * @param {() => Promise<object[]>} options.getPending - returns pending queue entries
   * @param {(id: string) => Promise<void>} options.deleteEntry - removes a queue entry by id
   * @param {(entry: object) => Promise<void>} options.rollback - rolls back a failed entry
   */
  constructor(
    client,
    { intervalMs = 5000, onError, onFlush, getPending, deleteEntry, rollback } = {},
  ) {
    this.#client = client
    this.#intervalMs = intervalMs
    this.#onError = onError
    this.#onFlush = onFlush
    this.#getPending = getPending
    this.#deleteEntry = deleteEntry
    this.#rollback = rollback
    this.#timer = null
    this.#running = false
    this.#backoffMs = intervalMs
    this.#maxBackoffMs = 60000
  }

  start() {
    if (this.#running) return
    this.#running = true
    this.#scheduleNext()
  }

  stop() {
    this.#running = false
    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
    }
  }

  #scheduleNext() {
    if (!this.#running) return
    this.#timer = setTimeout(() => this.#poll(), this.#backoffMs)
  }

  async #poll() {
    if (!this.#running) return

    try {
      const pending = await this.#getPending()
      if (pending.length > 0) {
        await this.#flush(pending)
      }
      this.#backoffMs = this.#intervalMs // reset backoff on success (including empty queue)
    } catch (err) {
      this.#onError?.(err)
      // Exponential backoff on failure
      this.#backoffMs = Math.min(this.#backoffMs * 2, this.#maxBackoffMs)
    } finally {
      this.#scheduleNext()
    }
  }

  /**
   * Flushes a list of pending transaction entries.
   * @param {TransactionQueue[]} entries
   */
  async #flush(entries) {
    for (const entry of entries) {
      try {
        const { mutation, variables } = GraphQLSchemaGenerator.generateMutation(entry)
        await this.#client.request(mutation, variables)
        await this.#deleteEntry(entry.id)
        this.#onFlush?.(entry)
      } catch (err) {
        // Check for permanent failures (400/409/422 status codes) — these will never succeed
        const status = err?.response?.status
        const isPermanent = status === 400 || status === 409 || status === 422
        if (isPermanent) {
          // Rollback IndexedDB directly — no model instantiation needed
          await this.#rollback(entry)
          // Remove queue entry
          await this.#deleteEntry(entry.id)
          this.#onError?.(
            Object.assign(err, {
              rollback: true,
              entry: {
                modelName: entry.modelName,
                modelId: entry.modelId,
                action: entry.action,
              },
            }),
          )
          continue
        }
        // Transient failure — re-throw to trigger backoff in #poll
        this.#onError?.(err)
        throw err
      }
    }
  }
}
