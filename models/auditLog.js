import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('auditLogs', { primaryKey: 'id', syncField: 'updatedAt' })
export class AuditLog extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) entityType = ''
  @Property({ type: String }) entityId = ''
  @Property({ type: String }) action = ''
  @Property({ type: Object }) oldValueJson = null
  @Property({ type: Object }) newValueJson = null
  @Property({ type: String }) performedBy = ''
  @Property({ type: DateTime }) performedAt = null
  @Property({ type: String }) ipAddress = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
