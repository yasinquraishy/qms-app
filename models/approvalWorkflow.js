import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approval_workflows', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflow extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: String }) moduleId = ''
  @Property({ type: String }) documentTypeId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) statusId = 'ACTIVE'
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
