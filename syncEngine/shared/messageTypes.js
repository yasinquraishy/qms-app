/**
 * Message types for SW ↔ main-thread communication.
 * Used by syncServiceWorker.js and SyncWorkerBridge.js.
 */
export const MSG = Object.freeze({
  // Main thread → SW
  INIT: 'init',
  REINIT: 'reinit',
  STOP: 'stop',
  REFRESH_METAS: 'refreshMetas',
  GET_STATUS: 'getStatus',

  // SW → Main thread
  SYNC: 'sync',
  ROLLBACK: 'rollback',
  FLUSH: 'flush',
  ERROR: 'error',
  BOOTSTRAP: 'bootstrap',
  BOOTSTRAP_COMPLETE: 'bootstrapComplete',
  STATUS: 'status',
})
