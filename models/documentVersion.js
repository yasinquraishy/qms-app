import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentVersions', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'documentId, [documentId+statusId], versionMajor, versionMinor',
})
export class DocumentVersion extends BaseModel {
  static paranoid = true // Enable soft deletes using deletedAt field
  constructor(...args) {
    super(...args)
    // Auto-assign companyId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }

    if (!this.createdBy) {
      this.createdBy = currentSession.value?.userId
    }
  }
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) documentId = ''
  @Property({ type: Number }) versionMajor = 1
  @Property({ type: Number }) versionMinor = 0
  @Property({ type: String }) versionLabel = ''
  @Property({ type: Array }) sections = null
  @Property({ type: String }) changeSummary = ''
  @Property({ type: String }) createdBy = null
  @Property({ type: DateTime }) lockedAt = null
  @Property({ type: DateTime }) approvedAt = null
  @Property({ type: String }) statusId = 'DRAFT'
  @Property({ type: String }) workflowInstanceId = /** @type {String|null} */ (null)
  @Property({ type: Boolean }) isLatest = true
  @Property({ type: DateTime }) effectiveDate = DateTime.now()
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
