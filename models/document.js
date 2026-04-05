import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documents', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'docNumber',
})
export class Document extends BaseModel {
  constructor(...args) {
    super(...args)
    // Auto-assign companyId and userId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.userId) {
      this.userId = currentSession.value?.userId || ''
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }

  @Property({ type: String }) id = ''
  @Property({ type: String }) docNumber = ''
  @Property({ type: String }) title = ''
  @Property({ type: String }) departmentId = ''
  @Property({ type: String }) documentTypeId = ''
  @Property({ type: String }) documentTemplateId = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) siteId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) workflowVersionId = ''
  @Property({ type: String }) prefix = ''
  @Property({ type: String }) relatedStandardId = ''
  @Property({ type: Number }) periodicReviewMonths = 12
  @Property({ type: Boolean }) autoEffectiveOnApproval = true
  @Property({ type: DateTime }) updatedAt = DateTime.now()
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) deletedAt = DateTime.now()
}
