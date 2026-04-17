import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('ncAttachments', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  loadStrategy: 'lazy',
  customIndex: 'ncId',
})
export class NcAttachment extends BaseModel {
  static paranoid = true

  constructor(...args) {
    super(...args)
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }
    if (!this.id) {
      this.id = crypto.randomUUID()
    }
    if (!this.uploadedBy) {
      this.uploadedBy = currentSession.value?.userId || ''
    }
  }

  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: String, required: true }) ncId = ''
  @Property({ type: String, required: true }) fileName = ''
  @Property({ type: Number }) fileSizeBytes = null
  @Property({ type: String }) mimeType = null
  @Property({ type: String }) storageKey = null
  @Property({ type: String, required: true }) uploadedBy = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
