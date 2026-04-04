import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('users_on_approval_workflow_instance_steps', {
  primaryKey: 'id',
  syncField: 'updatedAt',
})
export class UserOnApprovalWorkflowInstanceStep extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) approvalWorkflowInstanceStepId = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) statusId = 'PENDING'
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
