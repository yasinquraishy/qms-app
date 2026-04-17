import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('ncStatusTransitions', {
  primaryKey: 'id',
  syncField: 'updatedAt',
  customIndex: 'fromStatusId',
})
export class NcStatusTransition extends BaseModel {
  @Property({ type: String, uuid: true, required: true }) id = ''
  @Property({ type: String, required: true }) fromStatusId = ''
  @Property({ type: String, required: true }) toStatusId = ''
  @Property({ type: DateTime, required: true, timestamp: true })
  createdAt = /** @type {DateTime} */ (null)
  @Property({ type: DateTime, required: true, timestamp: true, autoUpdate: true })
  updatedAt = /** @type {DateTime} */ (null)
}
