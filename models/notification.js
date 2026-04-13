import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('notifications', { primaryKey: 'id', syncField: 'updatedAt' })
export class Notification extends BaseModel {
  static paranoid = true // Enable soft deletes using deletedAt field
  constructor(...args) {
    super(...args)
    // Auto-assign companyId and userId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.userId) {
      this.userId = currentSession.value?.userId || ''
    }

    if (!this.createdBy) {
      this.createdBy = currentSession.value?.userId
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }
  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: String, required: true }) userId = ''
  @Property({ type: String, required: true }) notificationTypeId = ''
  @Property({ type: String, required: true }) title = ''
  @Property({ type: String }) message = ''
  @Property({ type: String, required: true }) resourceType = ''
  @Property({ type: String, required: true }) resourceId = ''
  @Property({ type: Boolean }) isRead = false
  @Property({ type: DateTime }) readAt = null
  @Property({ type: String }) createdBy = ''
  @Property({ type: Array }) channels = null
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
