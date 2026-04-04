import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('task_kinds', { primaryKey: 'id', syncField: 'updatedAt' })
export class TaskKind extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) description = ''
  @Property({ type: Number }) displayOrder = 1000
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
