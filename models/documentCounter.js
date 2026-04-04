import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentCounters', { primaryKey: 'companyId', syncField: 'updatedAt' })
export class DocumentCounter extends BaseModel {
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) prefix = ''
  @Property({ type: Number }) currentValue = 1
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
