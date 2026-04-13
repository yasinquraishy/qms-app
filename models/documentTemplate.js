import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentTemplates', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'departmentId',
})
export class DocumentTemplate extends BaseModel {
  static paranoid = true
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
  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: String }) departmentId = ''
  @Property({ type: String, required: true }) name = ''
  @Property({ type: String, required: true }) prefix = ''
  @Property({ type: Boolean }) trainingAvailable = true
  @Property({ type: Boolean }) retrainingOnVersion = true
  @Property({ type: Number }) periodicReviewMonths = 12
  @Property({ type: Number }) reviewLimitDays = 14
  @Property({ type: Number }) approvalLimitDays = 7
  @Property({ type: Boolean }) autoEffectiveOnApproval = true
  @Property({ type: Boolean }) showSectionTitles = true
  @Property({ type: Array }) sections = []
  @Property({ type: String }) relatedStandardId = ''
  @Property({ type: String }) statusId = 'ACTIVE'
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
