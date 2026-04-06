import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('formTemplates', { primaryKey: 'id', syncField: 'updatedAt' })
export class FormTemplate extends BaseModel {
  constructor(...args) {
    super(...args)
    // Auto-assign companyId from current session on creation
    if (!this.companyId) {
      this.companyId = currentSession.value?.companyId || ''
    }

    if (!this.id) {
      this.id = crypto.randomUUID()
    }
  }
  @Property({ type: String }) id = ''
  @Property({ type: String }) title = ''
  @Property({ type: String }) code = ''
  @Property({ type: Object }) schema = null
  @Property({ type: String }) documentTypeId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) statusId = 'DRAFT'
  @Property({ type: Number }) version = 1
  @Property({ type: Object }) config = null
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
