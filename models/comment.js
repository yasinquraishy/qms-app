import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('comments', { primaryKey: 'id', syncField: 'updatedAt' })
export class Comment extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) body = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) objectId = ''
  @Property({ type: String }) objectType = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
