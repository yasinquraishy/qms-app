import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approval_workflow_instance_steps', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflowInstanceStep extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) workflowInstanceId = ''
  @Property({ type: Number }) stepNumber = 0
  @Property({ type: String }) stepId = ''
  @Property({ type: DateTime }) startedAt = null
  @Property({ type: DateTime }) completedAt = null
  @Property({ type: String }) statusId = 'PENDING'
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
