import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentVersions', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'documentId, versionMajor, versionMinor',
})
export class DocumentVersion extends BaseModel {
  constructor(...args) {
    super(...args)
    // Auto-assign companyId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) documentId = ''
  @Property({ type: Number }) versionMajor = 1
  @Property({ type: Number }) versionMinor = 0
  @Property({ type: String }) versionLabel = ''
  @Property({ type: Object }) sections = null
  @Property({ type: String }) changeSummary = ''
  @Property({ type: String }) effectiveDate = ''
  @Property({ type: String }) createdBy = ''
  @Property({ type: DateTime }) lockedAt = null
  @Property({ type: DateTime }) approvedAt = null
  @Property({ type: String }) statusId = 'DRAFT'
  @Property({ type: String }) workflowInstanceId = ''
  @Property({ type: Boolean }) isLatest = false
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
