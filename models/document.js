import { BaseModel, ClientModel, Property } from '@syncEngine/index'

@ClientModel('documents', { primaryKey: 'id' })
export class Document extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) docNumber = ''
  @Property({ type: String }) title = ''
  @Property({ type: String }) departmentId = ''
  @Property({ type: String }) documentTypeId = ''
  @Property({ type: String }) documentTemplateId = ''
  @Property({ type: String }) userId = ''
  @Property({ type: String }) siteId = ''
  @Property({ type: String }) companyId = ''
  @Property({ type: String }) statusId = 'ACTIVE'
  @Property({ type: String }) workflowVersionId = ''
  @Property({ type: String }) prefix = ''
  @Property({ type: String }) relatedStandardId = ''
  @Property({ type: Number }) periodicReviewMonths = 12
  @Property({ type: Boolean }) autoEffectiveOnApproval = true
  @Property({ type: Number }) updatedAt = 0
}
