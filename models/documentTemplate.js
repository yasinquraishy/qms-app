import { BaseModel, ClientModel, Property } from '@syncEngine/index'
import { DateTime } from 'luxon'

@ClientModel('documentTemplates', { primaryKey: 'id', syncField: 'updatedAt' })
export class DocumentTemplate extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) departmentId = ''
  @Property({ type: String }) name = ''
  @Property({ type: String }) prefix = ''
  @Property({ type: Boolean }) trainingAvailable = true
  @Property({ type: Boolean }) retrainingOnVersion = true
  @Property({ type: Number }) periodicReviewMonths = 12
  @Property({ type: Number }) reviewLimitDays = 14
  @Property({ type: Number }) approvalLimitDays = 7
  @Property({ type: Boolean }) autoEffectiveOnApproval = true
  @Property({ type: Boolean }) showSectionTitles = true
  @Property({ type: Object }) sections = null
  @Property({ type: String }) relatedStandardId = ''
  @Property({ type: String }) statusId = 'ACTIVE'
  @Property({ type: DateTime }) deletedAt = null
  @Property({ type: DateTime }) createdAt = DateTime.now()
  @Property({ type: DateTime }) updatedAt = DateTime.now()
}
