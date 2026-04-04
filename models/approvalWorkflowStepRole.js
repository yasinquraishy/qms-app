import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approvalWorkflowStepRoles', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflowStepRole extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) stepId = ''
  @Property({ type: String }) roleId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
