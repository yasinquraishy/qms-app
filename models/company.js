import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('companies', { primaryKey: 'id', syncField: 'updatedAt' })
export class Company extends BaseModel {
  static paranoid = true

  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) name = ''
  @Property({ type: String, required: true }) code = ''
  @Property({ type: String }) previousCode = ''
  @Property({ type: String }) companyIconUrl = ''
  @Property({ type: String }) companyDarkIconUrl = ''
  @Property({ type: String }) defaultTimeZone = 'UTC'
  @Property({ type: Number }) defaultFirstDayOfWeek = 1
  @Property({ type: String }) subscriptionState = ''
  @Property({ type: Object }) settings = {}
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
