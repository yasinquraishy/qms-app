import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('approval_workflow_versions', { primaryKey: 'id', syncField: 'updatedAt' })
export class ApprovalWorkflowVersion extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) workflowId = ''
  @Property({ type: Number }) versionMajor = 1
  @Property({ type: Number }) versionMinor = 0
  @Property({ type: String }) versionLabel = ''
  @Property({ type: String }) changeSummary = ''
  @Property({ type: String }) statusId = 'DRAFT'
  @Property({ type: String }) createdBy = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: Boolean }) isCurrent = false
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
