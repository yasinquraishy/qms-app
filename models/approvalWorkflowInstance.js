import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approvalWorkflowInstances', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflowInstance extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) resourceType = ''
  @Property({ type: String }) resourceId = ''
  @Property({ type: String }) workflowVersionId = ''
  @Property({ type: String }) statusId = 'IN_PROGRESS'
  @Property({ type: Number }) currentStep = 1
  @Property({ type: DateTime }) startedAt = null
  @Property({ type: DateTime }) completedAt = null
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) comment = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
