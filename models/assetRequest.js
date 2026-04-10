import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('assetRequests', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'supplierId, [supplierId+statusId]',
})
export class AssetRequest extends BaseModel {
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
  }
  @Property({ type: String, uuid: true }) id = ''
  @Property({ type: String }) supplierId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) requestTypeId = ''
  @Property({ type: String }) title = ''
  @Property({ type: String }) description = ''
  @Property({ type: String }) dueDate = ''
  @Property({ type: String }) expiryDate = ''
  @Property({ type: String }) statusId = 'PENDING'
  @Property({ type: String }) createdBy = ''
  @Property({ type: String }) token = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
