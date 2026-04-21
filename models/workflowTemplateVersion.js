import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('workflowTemplateVersions', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'workflowId',
})
export class WorkflowTemplateVersion extends BaseModel {
  constructor(...args) {
    super(...args)
    // Auto-assign companyId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }

    if (!this.createdBy) {
      this.createdBy = currentSession.value?.userId
    }
  }
  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) workflowId = ''
  @Property({ type: Number, required: true }) versionMajor = 1
  @Property({ type: Number, required: true }) versionMinor = 0
  @Property({ type: String }) versionLabel = ''
  @Property({ type: String }) changeSummary = ''
  @Property({ type: String }) statusId = 'DRAFT'
  @Property({ type: Boolean, required: true, default: false }) isCurrent = false
  @Property({ type: String, required: true }) createdBy = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
