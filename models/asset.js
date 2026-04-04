import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('assets', { primaryKey: 'id', syncField: 'updatedAt' })
export class Asset extends BaseModel {
  @Property({ type: String }) id = ''
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
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
