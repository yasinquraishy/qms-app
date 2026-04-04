import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('asset_requests_on_contacts', { primaryKey: 'id', syncField: 'updatedAt' })
export class AssetRequestOnContact extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) assetRequestId = ''
  @Property({ type: String }) supplierContactId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
