import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('comments', { primaryKey: 'id', syncField: 'updatedAt' })
export class Comment extends BaseModel {
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

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }
  @Property({ type: String }) id = ''
  @Property({ type: String }) body = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) objectId = ''
  @Property({ type: String }) objectType = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = null
  @Property({ type: DateTime }) updatedAt = null
}
