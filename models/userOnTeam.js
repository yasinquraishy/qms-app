import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('users_on_teams', { primaryKey: 'id', syncField: 'updatedAt' })
export class UserOnTeam extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) teamId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
