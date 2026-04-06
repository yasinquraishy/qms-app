/**
 * Predefined QMS Form Templates
 */

export const QMS_TEMPLATES = [
  {
    title: 'Deviation Report',
    code: 'DEV-TMP',
    description: 'Report process or quality deviations.',
    documentTypeId: 'DEVIATION',
    schema: [
      {
        type: 'section',
        label: 'General Information',
        name: 'generalInfo',
        children: [
          {
            type: 'row',
            name: 'row1',
            children: [
              {
                type: 'input',
                label: 'Deviation Title',
                name: 'title',
                required: true,
                readonly: false,
                disabled: false,
                class: 'tw:flex-1',
              },
              {
                type: 'datetime',
                label: 'Date of Occurrence',
                name: 'occurrenceDate',
                required: true,
                readonly: false,
                disabled: false,
                class: 'tw:flex-1',
                mode: 'date',
              },
            ],
            colClass: 'tw:flex-1',
          },
          {
            type: 'select',
            label: 'Department',
            name: 'department',
            required: true,
            readonly: false,
            disabled: false,
            options: [
              'Production',
              'Quality Control',
              'Quality Assurance',
              'Maintenance',
              'Warehouse',
              'HR',
            ],
          },
        ],
      },
      {
        type: 'section',
        label: 'Deviation Details',
        name: 'details',
        children: [
          {
            type: 'textarea',
            label: 'Description of Deviation',
            name: 'description',
            required: true,
            readonly: false,
            disabled: false,
            placeholder: 'Provide a detailed description of what happened...',
          },
          {
            type: 'optionGroup',
            label: 'Impact Level',
            name: 'impactLevel',
            groupType: 'radio',
            inline: true,
            required: true,
            readonly: false,
            disabled: false,
            options: ['Critical', 'Major', 'Minor'],
          },
        ],
      },
      {
        type: 'section',
        label: 'Immediate Actions',
        name: 'immediateActionsSection',
        children: [
          {
            type: 'repeater',
            label: 'Action Items',
            name: 'actions',
            addLabel: 'Add Action',
            itemLabel: 'Action',
            minItems: 1,
            template: [
              {
                type: 'row',
                name: 'actionRow',
                children: [
                  { type: 'input', label: 'Action Taken', name: 'actionTaken', class: 'tw:flex-1' },
                  { type: 'input', label: 'By Whom', name: 'performedBy', class: 'tw:flex-1' },
                  {
                    type: 'datetime',
                    label: 'Date',
                    name: 'actionDate',
                    class: 'tw:flex-1',
                    mode: 'date',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Internal Audit Checklist',
    code: 'AUD-TMP',
    description: 'Standard checklist for internal quality audits.',
    documentTypeId: 'AUDIT',
    schema: [
      {
        type: 'section',
        label: 'Audit Info',
        name: 'auditInfo',
        children: [
          {
            type: 'row',
            name: 'r1',
            colClass: 'tw:flex-1',
            children: [
              { type: 'input', label: 'Lead Auditor', name: 'leadAuditor', class: 'tw:flex-1' },
              {
                type: 'datetime',
                label: 'Audit Date',
                name: 'auditDate',
                class: 'tw:flex-1',
                mode: 'date',
              },
            ],
          },
        ],
      },
      {
        type: 'section',
        label: 'Audit Findings',
        name: 'findings',
        children: [
          {
            type: 'checklist',
            label: 'Quality Requirements',
            name: 'qualityChecklist',
            rows: [
              'Are SOPs followed correctly?',
              'Is equipment calibrated and tagged?',
              'Are training records up to date?',
              'Is the workspace clean and organized?',
              'Are records signed and dated according to GDP?',
            ],
            columns: [
              { label: 'Compliant', value: 'compliant', inputType: 'radio' },
              { label: 'Non-Compliant', value: 'nonCompliant', inputType: 'radio' },
              { label: 'N/A', value: 'na', inputType: 'radio' },
            ],
          },
          {
            type: 'textarea',
            label: 'Audit Comments/Observations',
            name: 'auditComments',
          },
        ],
      },
    ],
  },
  {
    title: 'CAPA Form',
    code: 'CAPA-TMP',
    description: 'Corrective and Preventive Action management.',
    documentTypeId: 'CAPA',
    schema: [
      {
        type: 'section',
        label: 'Problem Statement',
        name: 'problemSection',
        children: [
          {
            type: 'input',
            label: 'CAPA Source',
            name: 'source',
            placeholder: 'Audit, Deviation, Complaint...',
            required: true,
            readonly: false,
            disabled: false,
          },
          {
            type: 'textarea',
            label: 'Root Cause Analysis',
            name: 'rootCause',
            required: true,
            readonly: false,
            disabled: false,
          },
        ],
      },
      {
        type: 'section',
        label: 'Action Plan',
        name: 'actionPlan',
        children: [
          {
            type: 'checklist',
            label: 'Proposed Actions',
            name: 'actionList',
            rows: ['Corrective Action', 'Preventive Action', 'Verification of Effectiveness'],
            columns: [
              { label: 'Assigned To', value: 'assignedTo', inputType: 'text' },
              { label: 'Due Date', value: 'dueDate', inputType: 'date' },
              {
                label: 'Status',
                value: 'status',
                inputType: 'select',
                options: ['Pending', 'In-Progress', 'Completed'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Change Control Request',
    code: 'CC-TMP',
    description: 'Propose and track changes to established systems.',
    documentTypeId: 'CHANGE_CONTROL',
    schema: [
      {
        type: 'section',
        label: 'Change Description',
        name: 'descSection',
        children: [
          {
            type: 'input',
            label: 'Proposed Change',
            name: 'changeTitle',
            required: true,
            readonly: false,
            disabled: false,
          },
          {
            type: 'textarea',
            label: 'Reason for Change',
            name: 'reason',
            required: true,
            readonly: false,
            disabled: false,
          },
          {
            type: 'optionGroup',
            label: 'Type of Change',
            name: 'changeType',
            groupType: 'checkbox',
            options: ['Equipment', 'Software', 'Process', 'Document', 'Raw Material'],
            required: false,
            readonly: false,
            disabled: false,
            inline: true,
          },
        ],
      },
      {
        type: 'section',
        label: 'Impact Assessment',
        name: 'impactSection',
        children: [
          {
            type: 'optionGroup',
            label: 'Regulatory Impact?',
            name: 'regImpact',
            groupType: 'radio',
            inline: true,
            required: false,
            readonly: false,
            disabled: false,
            options: ['Yes', 'No'],
          },
          {
            type: 'textarea',
            label: 'Justification',
            name: 'justification',
            required: false,
            readonly: false,
            disabled: false,
          },
        ],
      },
    ],
  },
]
