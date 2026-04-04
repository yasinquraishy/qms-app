import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('sitesOnTemplates', { primaryKey: 'id', syncField: 'updatedAt' })
export class SiteOnTemplate extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) siteId = ''
  @Property({ type: String }) templateId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
