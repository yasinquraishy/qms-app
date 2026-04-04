import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('permissions_on_roles', { primaryKey: 'id', syncField: 'updatedAt' })
export class PermissionOnRole extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) roleId = ''
  @Property({ type: String }) permissionId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
