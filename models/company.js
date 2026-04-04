import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('companies', { primaryKey: 'id', syncField: 'updatedAt' })
export class Company extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) code = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) companyIconUrl = ''
  @Property({ type: String }) companyDarkIconUrl = ''
  @Property({ type: Number }) defaultFirstDayOfWeek = null
  @Property({ type: String }) defaultTimeZone = ''
  @Property({ type: String }) subscriptionState = ''
  @Property({ type: String }) previousCode = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
