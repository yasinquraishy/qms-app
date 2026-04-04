import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('risk_levels', { primaryKey: 'id', syncField: 'updatedAt' })
export class RiskLevel extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: String }) color = ''
  @Property({ type: Number }) order = 0
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
