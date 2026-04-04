import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approvalWorkflowSteps', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflowStep extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) workflowVersionId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: Number }) stepOrder = 0
  @Property({ type: String }) approvalRule = 'ALL'
  @Property({ type: Number }) slaDays = null
  @Property({ type: Boolean }) requireComments = false
  @Property({ type: Boolean }) requireEsignature = false
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
