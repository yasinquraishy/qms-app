import { BaseModel, ClientModel, Computed, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('auditLogs', {
  primaryKey: 'id',
  syncField: 'createdAt',
  loadStrategy: 'lazy',
  customIndex: '[entityType+entityId], [companyId+createdAt], performedBy, moduleId',
  schemaVersion: 1,
})
export class AuditLog extends BaseModel {
  static paranoid = true

  @Property({ type: String, required: true }) id = ''
  @Property({ type: String }) entityType = ''
  @Property({ type: String }) entityId = ''
  @Property({ type: String }) action = ''
  @Property({ type: String }) moduleId = ''
  @Property({ type: Object }) oldValueJson = null
  @Property({ type: Object }) newValueJson = null
  @Property({ type: String }) performedBy = ''
  @Property({ type: DateTime }) performedAt = null
  @Property({ type: String }) ipAddress = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)

  @Computed
  get contextLabel() {
    const ctx = this.newValueJson?.__context || {}
    return ctx.title || ctx.name || ctx.code || this.entityId
  }

  @Computed
  get changes() {
    if (!this.oldValueJson || !this.newValueJson) return []
    const old = this.oldValueJson
    const neu = this.newValueJson
    return Object.keys(neu).filter((key) => !key.startsWith('__') && old[key] !== neu[key])
  }
}
