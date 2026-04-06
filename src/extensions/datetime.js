import { DateTime } from 'luxon'

DateTime.prototype.formatDate = function (mode = 'datetime') {
  if (!this.isValid) return 'N/A'
  return mode === 'datetime'
    ? this.toLocaleString(DateTime.DATETIME_MED)
    : this.toLocaleString(DateTime.DATE_MED)
}
