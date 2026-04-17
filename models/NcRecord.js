import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('ncRecords', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: '[companyId+statusId]',
})
export class NcRecord extends BaseModel {
  static paranoid = true

  constructor(...args) {
    super(...args)
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }
    if (!this.id) {
      this.id = crypto.randomUUID()
    }
    if (!this.createdBy) {
      this.createdBy = currentSession.value?.userId || ''
    }
    if (!this.updatedBy) {
      this.updatedBy = currentSession.value?.userId || ''
    }
    if (!this.ownerId) {
      this.ownerId = currentSession.value?.userId || ''
    }
  }

  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: String, required: true }) ncNumber = ''
  @Property({ type: String, required: true }) title = ''
  @Property({ type: String }) description = ''
  // Classification
  @Property({ type: String, required: true }) ncTypeId = ''
  @Property({ type: String, required: true }) sourceId = ''
  @Property({ type: String, required: true }) severityId = ''
  @Property({ type: String }) productId = null
  @Property({ type: String, required: true }) siteId = ''
  @Property({ type: String, required: true }) departmentId = ''
  @Property({ type: DateTime, required: true }) detectedDate = ''
  @Property({ type: String }) lotBatchRef = null
  @Property({ type: String }) supplierRef = null
  @Property({ type: Number }) quantityAffected = null
  @Property({ type: String }) uom = null
  // Workflow
  @Property({ type: String, required: true }) statusId = 'DRAFT'
  @Property({ type: String, required: true }) ownerId = ''
  @Property({ type: String }) assignedToId = null
  @Property({ type: String }) reviewerId = null
  @Property({ type: String }) investigatorId = null
  // Review
  @Property({ type: String }) reviewDecision = null
  @Property({ type: String }) reviewComments = null
  @Property({ type: DateTime }) reviewedAt = null
  // Investigation
  @Property({ type: String }) rootCause = null
  @Property({ type: String }) rootCauseCategoryId = null
  @Property({ type: String }) immediateAction = null
  @Property({ type: String }) investigationNotes = null
  // Disposition
  @Property({ type: String }) dispositionId = null
  @Property({ type: String }) dispositionNotes = null
  @Property({ type: String }) dispositionById = null
  @Property({ type: DateTime }) dispositionDate = null
  // CAPA
  @Property({ type: Boolean }) capaRequired = null
  @Property({ type: String }) capaId = null
  @Property({ type: String }) capaStatus = null
  // SLA
  @Property({ type: DateTime }) dueDate = /** @type {DateTime} */ (null)
  // Closure
  @Property({ type: DateTime }) closedAt = null
  @Property({ type: String }) closedById = null
  @Property({ type: String }) closureNotes = null
  // Void
  @Property({ type: Boolean }) isVoid = false
  @Property({ type: String }) voidReason = null
  @Property({ type: String }) voidById = null
  @Property({ type: DateTime }) voidAt = null
  // Audit
  @Property({ type: String, required: true }) createdBy = ''
  @Property({ type: String, required: true }) updatedBy = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)

  get isOverdue() {
    if (!this.dueDate || this.statusId === 'CLOSED' || this.statusId === 'VOID') return false
    return this.dueDate.diffNow('days').as('days') < 0
  }
}
