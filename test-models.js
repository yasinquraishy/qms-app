const { db } = require('./models/index.js')
const expected = [
  'Workflow',
  'WorkflowVersion',
  'WorkflowVersionStatus',
  'WorkflowStep',
  'WorkflowStepRole',
  'WorkflowStepUser',
  'WorkflowStatus',
]
const missing = expected.filter((name) => !db[name])
if (missing.length === 0) {
  console.log('✅ All refactored models import successfully')
  process.exit(0)
} else {
  console.error('❌ Missing models:', missing)
  process.exit(1)
}
