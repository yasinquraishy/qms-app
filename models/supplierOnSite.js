import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('suppliers_on_sites', { primaryKey: 'id', syncField: 'updatedAt' })
export class SupplierOnSite extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) supplierId = ''
  @Property({ type: String }) siteId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
