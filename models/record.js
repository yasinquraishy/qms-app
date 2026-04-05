import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('records', { primaryKey: 'id', syncField: 'updatedAt' })
export class Record extends BaseModel {
  constructor(...args) {
    super(...args)
    // Auto-assign companyId and userId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.userId) {
      this.userId = currentSession.value?.userId || ''
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) templateId = ''
  @Property({ type: String }) documentTypeId = ''
  @Property({ type: String }) recordNumber = ''
  @Property({ type: String }) statusId = 'DRAFT'
  @Property({ type: Object }) payload = null
  @Property({ type: String }) submissionIp = ''
  @Property({ type: String }) userId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
