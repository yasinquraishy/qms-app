import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('users', { primaryKey: 'id', syncField: 'updatedAt' })
export class User extends BaseModel {
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
  @Property({ type: String }) firstName = ''
  @Property({ type: String }) lastName = ''
  @Property({ type: String }) email = ''
  @Property({ type: String }) userStatusId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) jobTitle = ''
  @Property({ type: String }) languageId = ''
  @Property({ type: String }) timeZone = ''
  @Property({ type: Boolean }) inviteSent = false
  @Property({ type: String }) color = '#2563eb'
  @Property({ type: String }) avatar = ''
  @Property({ type: Boolean }) isOwner = false
  @Property({ type: String }) siteId = ''
  @Property({ type: String }) departmentId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
