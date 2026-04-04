import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('roles', { primaryKey: 'id', syncField: 'updatedAt' })
export class Role extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: String }) statusId = 'ACTIVE'
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
