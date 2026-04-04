import { BaseModel, ClientModel, Property } from '@syncEngine/index'

@ClientModel('documents', { primaryKey: 'id' })
export class Document extends BaseModel {
  @Property({ type: String }) id = ''
  @Property({ type: String }) title = ''
  @Property({ type: String }) content = ''
  @Property({ type: Number }) updatedAt = 0
}
