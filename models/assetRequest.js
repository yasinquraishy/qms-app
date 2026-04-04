import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('assetRequests', { primaryKey: 'id', syncField: 'updatedAt' })
export class AssetRequest extends BaseModel {
  @Property({ type: String }) id = ''
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
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
