import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approval_workflow_instance_step_statuses', {
  primaryKey: 'id',
  syncField: 'updatedAt',
})
export class ApprovalWorkflowInstanceStepStatus extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: Number }) displayOrder = 1000
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
