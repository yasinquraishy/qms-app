import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('sites', { primaryKey: 'id', syncField: 'updatedAt' })
export class Site extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) code = ''
  @Property({ type: String }) address = ''
  @Property({ type: String }) timezone = 'UTC'
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
