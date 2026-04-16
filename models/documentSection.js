import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentSections', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  loadStrategy: 'instant',
  customIndex: 'documentVersionId, documentId, [documentId+documentVersionId]',
  schemaVersion: 1,
})
export class DocumentSection extends BaseModel {
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
      this.createdBy = currentSession.value?.userId || null
    }
    if (!this.updatedBy) {
      this.updatedBy = currentSession.value?.userId || null
    }
  }

  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) companyId = ''
  @Property({ type: String, required: true }) documentId = ''
  @Property({ type: String, required: true }) documentVersionId = ''
  @Property({ type: String, required: true }) title = ''
  @Property({ type: String }) sectionType = 'text'
  @Property({ type: String }) content = /** @type {string|null} */ (null)
  @Property({ type: Array }) attachments = /** @type {Array|null} */ (null)
  @Property({ type: Number }) order = 0
  @Property({ type: String }) createdBy = /** @type {string|null} */ (null)
  @Property({ type: String }) updatedBy = /** @type {string|null} */ (null)
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
