import { registerFormComponent } from '../formComponentRegistry.js'
import RcaField from './RcaField.vue'
import RcaReadonly from './RcaReadonly.vue'
import RiskAssessmentField from './RiskAssessmentField.vue'
import RiskAssessmentReadonly from './RiskAssessmentReadonly.vue'

registerFormComponent('rca', { component: RcaField, readonlyComponent: RcaReadonly })
registerFormComponent('riskAssessment', {
  component: RiskAssessmentField,
  readonlyComponent: RiskAssessmentReadonly,
})
