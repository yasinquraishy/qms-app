import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('supplierAssets', { primaryKey: 'id', syncField: 'updatedAt' })
export class SupplierAsset extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) supplierId = ''
  @Property({ type: String }) assetId = ''
  @Property({ type: String }) requestId = ''
  @Property({ type: String }) documentType = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
