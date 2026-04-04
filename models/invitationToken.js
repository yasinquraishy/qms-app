import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('invitation_tokens', { primaryKey: 'id', syncField: 'updatedAt' })
export class InvitationToken extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) tokenHash = ''
  @Property({ type: DateTime }) expiresAt = null
  @Property({ type: DateTime }) usedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
