import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('signatures', { primaryKey: 'id', syncField: 'updatedAt' })
export class Signature extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) taskInstanceId = ''
  @Property({ type: String }) meaning = ''
  @Property({ type: String }) comments = ''
  @Property({ type: String }) payloadHash = ''
  @Property({ type: String }) ipAddress = ''
  @Property({ type: String }) userAgent = ''
  @Property({ type: DateTime }) signedAt = null
  @Property({ type: Boolean }) isRevoked = false
  @Property({ type: DateTime }) revokedAt = null
  @Property({ type: String }) revokedReason = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
