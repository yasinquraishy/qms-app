# Phase 2B: FormTemplates Migration Plan

## Overview

Migrate FormTemplates feature from Quasar + axios/provide-inject to plain HTML + Tailwind + SyncEngine. Follows the same patterns established in Phase 1 (Users/Departments/OptionSets) and Phase 2A (DocumentTemplates).

---

## Files to Migrate

### Model

- `models/formTemplate.js` — Add `customIndex: 'documentTypeId'` + `static paranoid = true`

### Composables (to be deleted after migration)

- `src/composables/useFormTemplates.js` — provide/inject + axios (`get`, `put`, `del`). 157 lines. Provides: `templates`, `loading`, `error`, `filters`, `fetchTemplates`, `updateTemplate`, `deleteTemplate`, `templateRecords`, `recordsLoading`, `fetchTemplateRecords`, `updateRecord`
- `src/composables/useTemplateForm.js` — axios (`get`, `post`, `put`). 201 lines. Provides: `templateForm`, `documentTypeOptions`, `statusOptions`, `createTemplate`, `checkTemplateCode`, `resetForm`. Some API calls must stay (e.g., `checkTemplateCode` uses `PUT /v1/services/formTemplates/checkcode`)

### Badge/Select Components (triad pattern)

- `src/components/badges/FormTemplateStatusBadge.vue` — Currently uses `QBadge` + receives `status` object. Rewrite as enum pattern with `STATUS_MAP` + `BaseBadge`
- `src/components/badges/FormTemplateStatusBadgeById.vue` — Currently just wraps `FormTemplateStatusBadge` with a fake `status` computed. Update to use `useLiveQueryWithDeps` if FormTemplateStatus becomes a SyncEngine model, or keep as simple lookup if it stays enum
- `src/components/menus/FormTemplateStatusSelectMenu.vue` — NEW. Create with enum pattern (static items + `BaseSelectMenu`)
- `src/components/menus/FormTemplateSelectMenu.vue` — NEW. Create with full triad pattern (`useLiveQuery` + `BaseSelectMenu` + `FormTemplateBadgeById`)
- `src/components/badges/FormTemplateBadge.vue` — NEW. Display component with `BaseBadge`
- `src/components/badges/FormTemplateBadgeById.vue` — NEW. Lookup wrapper with `useLiveQueryWithDeps`

### Feature Components (16 files)

1. `formTemplatesIndex.vue` — Provider wrapper. Remove `provideFormTemplates()`
2. `formTemplatesHome.vue` — Main page. Remove `useFormTemplates()`/`useQuasar`; `WIcon`/`WBtn` → `@tabler/icons-vue` + `BaseButton`; `WSwitcher` → `BaseSwitcher`
3. `formTemplatesFilterToolbar.vue` — `WInput` → `BaseTextInput`; `WIcon` → `@tabler/icons-vue`; `formTemplatesSiteSelect` → `SiteSelectMenu`; `formTemplatesStatusSelect` → `FormTemplateStatusSelectMenu`; `formTemplatesDocumentTypeSelect` → `DocumentTypeSelectMenu` (already exists)
4. `formTemplatesTable.vue` — Full rewrite: `QCard`/`WTable`/`QTd`/`WStatusBadge`/`WSelect`/`QMenu`/`QList`/`QItem`/`WBtn`/`WInput`/`WIcon` → `BaseTable` + `BaseMenu` + `FormTemplateStatusBadgeById` + `FormTemplateStatusSelectMenu` + `BaseButton` + `BaseTextInput` + `@tabler/icons-vue`; inline editing → direct model mutation + `save()`; `useQuasar` dialog/notify → `BaseDialog`/native; preview dialog → `BaseDialog`; delete → `instance.delete()`
5. `FormTemplatesList.vue` — Remove `useFormTemplates()`/`useQuasar`; `QSpinner` → `BaseSpinner`; `WEmptyState` → keep or replace; `WStatusBadge` → `FormTemplateStatusBadgeById`; preview dialog `QDialog` → `BaseDialog`; delete → `instance.delete()`
6. `FormTemplateListingRow.vue` — `WIcon` → `@tabler/icons-vue`; `WStatusBadge` → `FormTemplateStatusBadgeById`; `WBtn`/`QMenu`/`QList`/`QItem`/`QSeparator` → `BaseMenu` + `@tabler/icons-vue`
7. `formTemplatePageId.vue` — Remove `get` from `@/api`; `WBreadcrumbs` → `BaseBreadcrumbs`; `useLiveQueryWithDeps` for template; pass `:id` prop instead of `:template` object to children; remove manual `fetchTemplate()`
8. `formTemplatePageIdDetails.vue` — Major rewrite: remove `useFormTemplates()`/`useTemplateForm()`/`useQuasar`; inline edit + auto-save with `useDebounceFn` + deep watcher; `WInput`/`WSelect`/`WStatusBadge`/`WIcon`/`WBtn`/`QSpinner` → `BaseTextInput`/`FormTemplateStatusSelectMenu`/`FormTemplateStatusBadgeById`/`@tabler/icons-vue`/`BaseButton`/`BaseSpinner`; `FormTemplatesSiteSelect` → `SiteSelectMenu`; delete → `instance.delete()`; `$q.dialog` → `BaseDialog`; `$q.notify` → inline `saveError` display
9. `formTemplateSchemaBuilder.vue` — Remove `get` from `@/api`/`useQuasar`; `useLiveQueryWithDeps` for template; `WInput`/`WIcon`/`WBtn`/`QSpinner`/`QInnerLoading` → `BaseTextInput`/`@tabler/icons-vue`/`BaseButton`/`BaseSpinner`; save schema → direct model mutation + `save()`; title edit → auto-save
10. `formTemplateCreateTemplate.vue` — Remove `useTemplateForm()`/`useSites()`/`@vuelidate`; `WDialog` → `BaseDialog`; `WInput`/`WBtn`/`WIcon`/`QToggle`/`QCheckbox` → `BaseTextInput`/`BaseButton`/`@tabler/icons-vue`/`BaseCheckbox`/`SiteSelectMenu`; `DocumentTypeSelectMenu` already exists; create → `useLiveMutation`; keep API-based `checkTemplateCode` (no SyncEngine equivalent)
11. `formTemplateRecords.vue` — 854 lines, largest file. Remove `useFormTemplates()`/`useQuasar`; `WTable`/`QTd`/`QTh`/`WBtn`/`WInput`/`WIcon`/`WEmptyState`/`QMenu`/`QList`/`QItem`/`QCheckbox`/`QBadge`/`QBtn`/`QTooltip`/`QSeparator` → `BaseTable` + `BaseMenu` + `BaseButton` + `BaseTextInput` + `@tabler/icons-vue` + `BaseSpinner` + `BaseBadge`; records → `useLiveQueryWithDeps`; update record → `instance.save()`; delete → `instance.delete()`
12. `FormTemplateRecordsAdvancedFilter.vue` — `WSelect`/`WInput`/`WBtn`/`QTooltip` → `BaseSelectMenu`/`BaseTextInput`/`BaseButton`/`BaseTooltip`
13. `FormTemplatePreview.vue` — `QCard`/`QCardSection`/`QSpace`/`WBtn`/`QSpinner`/`WIcon` → div+Tailwind + `BaseButton`/`BaseSpinner`/`@tabler/icons-vue`
14. `formTemplatesSiteSelect.vue` — DELETE. Replaced by `SiteSelectMenu` (already exists)
15. `formTemplatesStatusSelect.vue` — DELETE. Replaced by `FormTemplateStatusSelectMenu`
16. `formTemplatesDocumentTypeSelect.vue` — DELETE. Replaced by `DocumentTypeSelectMenu` (already exists)

---

## Step-by-Step Execution Order

### Step 1: Model Update

- Update `models/formTemplate.js`: add `customIndex: 'documentTypeId'` and `static paranoid = true`
- Check if `FormTemplateStatus` needs a SyncEngine model (currently enum-like: DRAFT, ACTIVE, ARCHIVED, INACTIVE). If purely enum, use enum pattern for badges/selects.

### Step 2: Create Triad Components

1. **FormTemplateStatusBadge.vue** — Rewrite: enum pattern with `STATUS_MAP` + `<BaseBadge>` + dot indicator
2. **FormTemplateStatusSelectMenu.vue** — NEW: enum pattern with static items + `BaseSelectMenu`
3. **FormTemplateBadge.vue** — NEW: `<BaseBadge>{{ formTemplate.title }}</BaseBadge>`
4. **FormTemplateBadgeById.vue** — NEW: `useLiveQueryWithDeps` + `db.FormTemplate.findByPk(id)`
5. **FormTemplateSelectMenu.vue** — NEW: full triad with `useLiveQuery` + `BaseSelectMenu` + `FormTemplateBadgeById`

### Step 3: Migrate Index + Home

- `formTemplatesIndex.vue` — Remove `provideFormTemplates()`
- `formTemplatesHome.vue` — Remove `useFormTemplates()`/`useQuasar`; replace Quasar components; use `useLiveQuery` for templates list with reactive filters; `WSwitcher` → `BaseSwitcher`; archive/unarchive via direct model mutation

### Step 4: Migrate Filter Toolbar

- `formTemplatesFilterToolbar.vue` — `WInput` → `BaseTextInput`; `WIcon` → `@tabler/icons-vue`; `formTemplatesSiteSelect` → `SiteSelectMenu`; `formTemplatesStatusSelect` → `FormTemplateStatusSelectMenu`; `formTemplatesDocumentTypeSelect` → `DocumentTypeSelectMenu`

### Step 5: Migrate Table View

- `formTemplatesTable.vue` — Full rewrite: `BaseTable` + `BaseMenu` + `FormTemplateStatusBadgeById` + `FormTemplateStatusSelectMenu` + inline editing via direct model mutation + `save()`; preview dialog → `BaseDialog`; delete → `instance.delete()`; `useLiveQueryWithDeps` for template list

### Step 6: Migrate List View

- `FormTemplateListingRow.vue` — `@tabler/icons-vue` + `BaseMenu` + `FormTemplateStatusBadgeById`
- `FormTemplatesList.vue` — Remove `useFormTemplates()`/`useQuasar`; `BaseSpinner`; preview → `BaseDialog`; delete → `instance.delete()`

### Step 7: Migrate Detail Page

- `formTemplatePageId.vue` — `useLiveQueryWithDeps` for template; `BaseBreadcrumbs`; pass `:id` instead of `:template`
- `formTemplatePageIdDetails.vue` — Major rewrite: inline edit + auto-save with `useDebounceFn` + deep watcher; remove `useFormTemplates()`/`useTemplateForm()`/`useQuasar`; `FormTemplateStatusSelectMenu` for status; `SiteSelectMenu` for sites; `BaseSpinner`; delete → `instance.delete()` + `BaseDialog` confirm; `saveError` display

### Step 8: Migrate Schema Builder

- `formTemplateSchemaBuilder.vue` — `useLiveQueryWithDeps` for template; `BaseTextInput` for title edit; `BaseSpinner`; schema save → direct model mutation + `save()`

### Step 9: Migrate Create Template Dialog

- `formTemplateCreateTemplate.vue` — `BaseDialog`; `BaseTextInput`/`BaseButton`/`@tabler/icons-vue`/`BaseCheckbox`; `SiteSelectMenu` for site selection; `useLiveMutation` for create; keep API-based `checkTemplateCode` (uses `PUT /v1/services/formTemplates/checkcode` — no SyncEngine equivalent); `DocumentTypeSelectMenu` already exists

### Step 10: Migrate Records View

- `formTemplateRecords.vue` — 854 lines, most complex. Split into sub-components:
  - Extract column visibility logic into `FormTemplateRecordsColumnVisibility.vue`
  - Extract advanced filter into existing `FormTemplateRecordsAdvancedFilter.vue`
  - Main table: `BaseTable` + `BaseMenu` + `BaseButton` + `BaseTextInput` + `@tabler/icons-vue`; records → `useLiveQueryWithDeps`; update record → `instance.save()`; `BaseBadge` instead of `QBadge`
- `FormTemplateRecordsAdvancedFilter.vue` — `BaseSelectMenu`/`BaseTextInput`/`BaseButton`/`BaseTooltip`
- `FormTemplatePreview.vue` — div+Tailwind + `BaseButton`/`BaseSpinner`/`@tabler/icons-vue`

### Step 11: Delete Obsolete Files

- Delete `formTemplatesSiteSelect.vue` — replaced by `SiteSelectMenu`
- Delete `formTemplatesStatusSelect.vue` — replaced by `FormTemplateStatusSelectMenu`
- Delete `formTemplatesDocumentTypeSelect.vue` — replaced by `DocumentTypeSelectMenu`
- Delete `composables/useFormTemplates.js`
- Delete `composables/useTemplateForm.js`
- Update `eslint-auto-import.js` to remove FormTemplates entries

---

## Key Migration Patterns

### Data Reading (replaces provide/inject + axios)

```javascript
// ❌ Old
const { templates, loading, fetchTemplates } = useFormTemplates()

// ✅ New
const templates = useLiveQueryWithDeps(
  [() => search.value, () => documentTypeId.value, () => siteId.value, () => statusId.value],
  async (db, [search, documentTypeId, siteId, statusId]) => {
    let results = await db.FormTemplate.where().exec()
    if (documentTypeId) results = results.filter((t) => t.documentTypeId === documentTypeId)
    if (siteId) results = results.filter((t) => t.siteIds?.includes(siteId))
    if (statusId) results = results.filter((t) => t.statusId === statusId)
    if (search)
      results = results.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    return results
  },
  { initial: [] },
)
const loading = computed(() => templates.value === undefined)
```

### Data Mutation (replaces axios put/post/del)

```javascript
// ❌ Old
const { updateTemplate } = useFormTemplates()
await updateTemplate(id, { title: 'New' })

// ✅ New
template.value.title = 'New'
await template.value.save()
```

### Delete (replaces axios del + $q.dialog)

```javascript
// ❌ Old
const { deleteTemplate } = useFormTemplates()
$q.dialog({...}).onOk(async () => { await deleteTemplate(id) })

// ✅ New
showDeleteConfirm.value = true
// In confirm handler:
await template.value.delete()
```

### Create (replaces axios post)

```javascript
// ❌ Old
const { createTemplate } = useTemplateForm()
const result = await createTemplate()

// ✅ New
const createFormTemplate = useLiveMutation(async (db, data) => {
  const template = db.FormTemplate.create(data)
  await template.save()
  return template
})
const newTemplate = await createFormTemplate({ title, code, documentTypeId, schema, ... })
```

---

## Notes

- **FormTemplateStatus is enum-like** (DRAFT, ACTIVE, ARCHIVED, INACTIVE) — no SyncEngine model exists. Use enum pattern for badge + select.
- **`checkTemplateCode` API call must stay** — uses `PUT /v1/services/formTemplates/checkcode` which has no SyncEngine equivalent.
- **Records** (`formTemplateRecords.vue`) are the most complex component at 854 lines. Consider splitting into sub-components.
- **`template.sites`** in `formTemplatePageIdDetails.vue` — currently uses populated `sites` array from API. Need to query `Site` model via SyncEngine for site badges.
- **`template.user`** in records — currently populated from API. Need to query `User` model via SyncEngine for user display.
- **QMS_TEMPLATES** constant (`src/constants/formTemplates.js`) — preset schemas for create wizard. Keep as-is.
- **Export functions** (CSV, Excel, PDF) in `formTemplateRecords.vue` — keep as-is, these are utility functions.
