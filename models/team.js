import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('teams', { primaryKey: 'id', syncField: 'updatedAt' })
export class Team extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) name = ''
  @Property({ type: Boolean }) isLeadership = false
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) color = '#ffffff'
  @Property({ type: String }) avatar = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
