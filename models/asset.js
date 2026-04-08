import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('assets', { primaryKey: 'id', syncField: 'updatedAt' })
export class Asset extends BaseModel {
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
  @Property({ type: String }) filename = ''
  @Property({ type: String }) originalFilename = ''
  @Property({ type: String }) mimeType = ''
  @Property({ type: Number }) fileSize = 0
  @Property({ type: String }) url = ''
  @Property({ type: String }) storagePath = ''
  @Property({ type: String }) fileType = 'ASSET'
  @Property({ type: String }) uploadedBy = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) thumbnailUrl = ''
  @Property({ type: Boolean }) isExternal = false
  @Property({ type: String }) bucket = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
