import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('supplierContacts', { primaryKey: 'id', syncField: 'updatedAt' })
export class SupplierContact extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) supplierId = ''
  @Property({ type: String }) email = ''
  @Property({ type: String }) phoneNumber = ''
  @Property({ type: Boolean }) isPrimary = false
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
