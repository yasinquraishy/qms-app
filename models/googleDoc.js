import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('google_docs', { primaryKey: 'id', syncField: 'updatedAt' })
export class GoogleDoc extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) googleDocId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) mimeType = ''
  @Property({ type: String }) webViewLink = ''
  @Property({ type: String }) webContentLink = ''
  @Property({ type: String }) iconLink = ''
  @Property({ type: String }) thumbnailLink = ''
  @Property({ type: Number }) size = null
  @Property({ type: String }) parentFolderId = ''
  @Property({ type: DateTime }) googleCreatedTime = null
  @Property({ type: DateTime }) googleModifiedTime = null
  @Property({ type: Object }) metadata = null
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) userId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
