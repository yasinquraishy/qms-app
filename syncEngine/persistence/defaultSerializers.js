// defaultSerializers.js
import { DateTime } from 'luxon'

export const defaultSerializers = {
  Array: {
    /** @param {Array} a */
    toStore(a) {
      return Array.isArray(a) ? JSON.parse(JSON.stringify(a)) : a
    },
    /** @param {Array|null} a */
    fromStore(a) {
      return a
    },
  },
  Object: {
    /** @param {Object} o */
    toStore(o) {
      return o && typeof o === 'object' ? JSON.parse(JSON.stringify(o)) : o
    },
    /** @param {Object|null} o */
    fromStore(o) {
      return o
    },
  },
  Date: {
    /** @param {Date} d */
    toStore(d) {
      return d instanceof Date ? d.toISOString() : d
    },
    /** @param {string|null} s */
    fromStore(s) {
      return s != null ? new Date(s) : null
    },
  },
  Map: {
    /** @param {Map} m */
    toStore(m) {
      return m instanceof Map ? Object.fromEntries(m) : m
    },
    /** @param {object|null} o */
    fromStore(o) {
      return o != null ? new Map(Object.entries(o)) : null
    },
  },
  Set: {
    /** @param {Set} s */
    toStore(s) {
      return s instanceof Set ? [...s] : s
    },
    /** @param {any[]|null} a */
    fromStore(a) {
      return a != null ? new Set(a) : null
    },
  },
  DateTime: {
    /** @param {DateTime} dt */
    toStore(dt) {
      return DateTime.isDateTime(dt) || typeof dt?.toISO === 'function' ? dt.toISO() : dt
    },
    /** @param {string|null} s */
    fromStore(s) {
      return s != null ? DateTime.fromISO(s) : null
    },
  },
  // dynamic setting name from DateTime.name to avoid hard dependency on luxon
  // DateTime.name changes on build
  get [DateTime.name]() {
    return this.DateTime
  },
}
