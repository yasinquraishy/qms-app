import { currentSession } from '@/utils/currentSession'
import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('suppliers', { primaryKey: 'id', syncField: 'updatedAt' })
export class Supplier extends BaseModel {
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
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) code = ''
  @Property({ type: String }) category = ''
  @Property({ type: String }) streetAddress = ''
  @Property({ type: String }) city = ''
  @Property({ type: String }) stateProvince = ''
  @Property({ type: String }) zipPostalCode = ''
  @Property({ type: String }) country = ''
  @Property({ type: String }) riskLevel = ''
  @Property({ type: String }) statusId = 'PENDING'
  @Property({ type: String }) lastEvaluationDate = ''
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
