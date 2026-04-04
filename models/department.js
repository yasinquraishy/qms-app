import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('departments', { primaryKey: 'id', syncField: 'updatedAt' })
export class Department extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) code = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: String }) siteId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
