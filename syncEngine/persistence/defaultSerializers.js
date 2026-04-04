// defaultSerializers.js
import { DateTime } from 'luxon'

export const defaultSerializers = {
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
      return dt instanceof DateTime ? dt.toISO() : dt
    },
    /** @param {string|null} s */
    fromStore(s) {
      return s != null ? DateTime.fromISO(s) : null
    },
  },
}
