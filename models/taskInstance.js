import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('taskInstances', { primaryKey: 'id', syncField: 'updatedAt' })
export class TaskInstance extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) assignedTo = ''
  @Property({ type: String }) taskKindId = ''
  @Property({ type: String }) statusId = 'ASSIGNED'
  @Property({ type: String }) priorityId = ''
  @Property({ type: String }) dueDate = ''
  @Property({ type: String }) entityType = ''
  @Property({ type: String }) entityId = ''
  @Property({ type: String }) sourceType = ''
  @Property({ type: String }) sourceId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
