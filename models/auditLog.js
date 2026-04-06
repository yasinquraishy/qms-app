import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('auditLogs', { primaryKey: 'id', syncField: 'createdAt' })
export class AuditLog extends BaseModel {
  constructor(...args) {
    super(...args)
    // Auto-assign companyId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }
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
}
