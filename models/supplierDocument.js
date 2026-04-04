import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('supplierDocuments', { primaryKey: 'id', syncField: 'updatedAt' })
export class SupplierDocument extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) supplierId = ''
  @Property({ type: String }) documentVersionId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
