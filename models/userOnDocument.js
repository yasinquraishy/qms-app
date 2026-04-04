import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('usersOnDocuments', { primaryKey: 'id', syncField: 'updatedAt' })
export class UserOnDocument extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) documentId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
