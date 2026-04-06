import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentLinks', { primaryKey: 'id', syncField: 'updatedAt' })
export class DocumentLink extends BaseModel {
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
  @Property({ type: String }) fromDocumentVersionId = ''
  @Property({ type: String }) toDocumentVersionId = ''
  @Property({ type: String }) relationshipType = ''
  @Property({ type: String }) createdBy = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
