import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('document_links', { primaryKey: 'id', syncField: 'updatedAt' })
export class DocumentLink extends BaseModel {
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
