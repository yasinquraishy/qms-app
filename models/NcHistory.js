import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('ncHistory', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  loadStrategy: 'lazy',
  customIndex: 'ncId',
})
export class NcHistory extends BaseModel {
  // NOT paranoid — nc_history is append-only; never deleted

  constructor(...args) {
    super(...args)
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }
    if (!this.id) {
      this.id = crypto.randomUUID()
    }
    if (!this.performedBy) {
      this.performedBy = currentSession.value?.userId || ''
    }
  }

  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: String, required: true }) ncId = ''
  @Property({ type: String, required: true }) eventTypeId = ''
  @Property({ type: String }) fromStatusId = null
  @Property({ type: String }) toStatusId = null
  @Property({ type: String }) changedFields = null
  @Property({ type: String }) comment = null
  @Property({ type: String, required: true }) performedBy = ''
  @Property({ type: DateTime, required: true, timestamp: true }) performedAt =
    /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
