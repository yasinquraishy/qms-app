import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('api_keys', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApiKey extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) label = ''
  @Property({ type: String }) keyHash = ''
  @Property({ type: Boolean }) revoked = false
  @Property({ type: DateTime }) lastUsedAt = null
  @Property({ type: DateTime }) expiresAt = null
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
