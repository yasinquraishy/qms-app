import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approval_workflow_step_users', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflowStepUser extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) stepId = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
