import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('notifications', { primaryKey: 'id', syncField: 'updatedAt' })
export class Notification extends BaseModel {
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
  @Property({ type: String }) userId = ''
  @Property({ type: String }) notificationTypeId = ''
  @Property({ type: String }) title = ''
  @Property({ type: String }) message = ''
  @Property({ type: String }) resourceType = ''
  @Property({ type: String }) resourceId = ''
  @Property({ type: Boolean }) isRead = false
  @Property({ type: DateTime }) readAt = null
  @Property({ type: String }) createdBy = ''
  @Property({ type: Array }) channels = null
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
