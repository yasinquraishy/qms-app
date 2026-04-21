import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('workflowInstanceSteps', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: '[workflowInstanceId+statusId], workflowInstanceId',
})
export class WorkflowInstanceStep extends BaseModel {
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
  @Property({ type: String, required: true }) workflowInstanceId = ''
  @Property({ type: Number, required: true }) stepNumber = 0
  @Property({ type: String, required: true }) stepId = ''
  @Property({ type: DateTime }) startedAt = null
  @Property({ type: DateTime }) completedAt = null
  @Property({ type: String, required: true }) statusId = 'PENDING'
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
