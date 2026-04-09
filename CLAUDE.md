# Qability — Claude Instructions

## Development Rules

1. **W\* Components**: Always use W\* components for lookups (reference `components.d.ts`)
2. **Component Reuse**: Always reuse existing components if possible
3. **Auto-Imports (Components)**: No need to import components; all components are auto-imported
4. **Auto-Imports (Composables)**: No need to import composables or functions from `vueuse`, `vue`, or `vue-router`; everything is auto-imported (reference `auto-imports.d.ts`)
5. **No Quasar Components**: Do NOT use any Quasar components (`QBtn`, `QInput`, `QSelect`, `QDialog`, `QCard`, etc.) or their `W*` wrappers (`WBtn`, `WInput`, etc.) in new code. Use plain HTML elements with Tailwind CSS (`tw:` prefix) and `Base*` components from `resource/js/shared/components/` instead. Replace existing Quasar usage when touching a file.
6. **Icons**: Always use `@tabler/icons-vue`. Do NOT use `@heroicons/vue`, `@material-design-icons`, or any other icon library. Icons are NOT auto-imported — always import explicitly (e.g. `import { IconTrash } from '@tabler/icons-vue'`).
7. **Functions**: Always define functions with the `function` keyword, not `const function`
8. **Component Name Casing**: Component usage should always be in PascalCase, not kebab-case
9. **Two-way Binding**: Always use `defineModel` for v-model binding, do not use computed getter/setter pattern
10. **Date Handling**: All date/time values must use `luxon.DateTime`. Values from the backend are already `luxon.DateTime` instances. Always format using `dt.formatDate()` — never `.toFormat()`, `.toISO()`, or other ad-hoc formatting.

### Component Naming Convention

Feature components use prefix pattern:

- `formTemplatesIndex.vue` — Provider wrapper
- `formTemplatesHome.vue` — Main page
- `formTemplatesTable.vue` — Display component
- `DocumentTypeSelectMenu.vue` — Reusable filter

### Select Component Props Pattern

```vue
<script setup>
const props = defineProps({
  required: { type: Boolean, default: false }, // Controls "All X" option
  multiple: { type: Boolean, default: false },
})
// When required=false, include "All X" option with null value
// When required=true, auto-select first item
</script>
```

### Auto-imports (no explicit imports needed)

- Vue APIs: `ref`, `computed`, `watch`, `onMounted`, `provide`, `inject`
- Vue Router: via `unplugin-vue-router`
- Components: auto-registered from `src/components/`

---

## Migration Guide 1 — Quasar → Plain HTML + Tailwind

This project is **actively migrating away from Quasar**. Follow these rules in all new and touched code.

### Core Rules

1. **No new Quasar components.** Never use `QBtn`, `QInput`, `QSelect`, `QDialog`, `QCard`, `QTable`, `QForm`, etc.
2. **No new `W*` wrappers** around Quasar components (`WBtn`, `WInput`, `WSelect`, etc.).
3. **Replace on touch.** When you edit any file that still uses Quasar components, migrate those components before committing.
4. **Tailwind prefix.** Use the `tw:` prefix for all Tailwind utility classes in `.vue` files (e.g. `tw:flex tw:gap-4 tw:rounded-lg`).

### Component Replacement Cheatsheet

| Quasar / W\*                     | Replace with                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `QBtn` / `WBtn`                  | `<button>` with Tailwind classes or `BaseButton`                                    |
| `QInput` / `WInput`              | `<input>` with Tailwind classes or `BaseInput`                                      |
| `QSelect` / `WSelect`            | `<select>` or `BaseSelect`, or a `W*` lookup component if one exists for the entity |
| `QDialog`                        | `BaseDialog`                                                                        |
| `QCard`                          | `<div>` with Tailwind classes or `BaseCard`                                         |
| `QTable`                         | `<table>` with Tailwind classes or `BaseTable`                                      |
| `QForm`                          | `<div>` with event handlers — avoid `<form>` entirely                               |
| `QBadge`                         | `<span>` with Tailwind classes                                                      |
| `QChip`                          | `<span>` or `BaseChip`                                                              |
| `QTooltip`                       | `BaseTooltip`                                                                       |
| `QSeparator`                     | `<hr>` with Tailwind or a plain `<div>` border                                      |
| `QSpinner` / `QCircularProgress` | `BaseSpinner` or a CSS Tailwind animation                                           |
| `QIcon` / `WIcon`                | `@tabler/icons-vue` — import and use explicitly                                     |

> Check `resource/js/shared/components/` for all available `Base*` components before building something new.

### Icons

Always use `@tabler/icons-vue`. Icons are **not** auto-imported — always import explicitly:

```javascript
import { IconTrash, IconPencil } from '@tabler/icons-vue'
```

### Forms

Never use `<form>` elements. Use `<div>` wrappers with `onClick` / `onChange` handlers.

```vue
<!-- ❌ Old -->
<QForm @submit="handleSubmit">
  <QInput v-model="name" />
  <QBtn type="submit">Save</QBtn>
</QForm>

<!-- ✅ New -->
<div class="tw:flex tw:flex-col tw:gap-4">
  <BaseInput v-model="name" />
  <button class="tw:btn-primary" @click="handleSubmit">Save</button>
</div>
```

### v-model Binding

Always use `defineModel`. Do not use the computed getter/setter pattern.

```javascript
// ❌ Old
const emit = defineEmits(['update:modelValue'])
const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ✅ New
const value = defineModel()
```

### Checklist Before Committing a Migrated File

- [ ] No `Q*` or `W*` Quasar wrapper component usages (entity lookup `W*` components are still allowed)
- [ ] All icons from `@tabler/icons-vue`, explicitly imported
- [ ] Tailwind classes use `tw:` prefix
- [ ] No `<form>` elements
- [ ] `defineModel` used for all v-model bindings
- [ ] `Base*` components used where available

---

## Migration Guide 2 — Axios Composables & Provide/Inject → SyncEngine

This project is **actively migrating away from** axios-based composables and Provide/Inject state management to the SyncEngine offline-first data layer. All new and touched code must use this pattern.

### Core Principle

> Components receive only an `id` prop. They query and mutate their own data directly via the SyncEngine. No data is fetched by a parent composable or passed down as props. There is no shared provided state.

### What's Being Replaced

| Old                                                             | New                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| `import { get, post, put, del } from '@/api'`                   | `useLiveQueryWithDeps`, `useLiveQuery`, `useLiveMutation` |
| Composable with `ref([])`, `loading`, manual `fetch*` functions | `useLiveQueryWithDeps` — reactive, auto-updating          |
| `provideX()` / `useX()` Provide/Inject state shared across tree | Live queries directly in each component — no shared state |
| Parent fetches data → passes as `:document="document"` prop     | Child receives `:documentId="id"` → queries itself        |
| `await fetchDocument(id)` + `loading.value = true/false`        | `db.Document.findByPk(id)` inside a live query            |
| `await fetchVersions(id)` → `versions.value = result.versions`  | `db.DocumentVersion.where('documentId', id).exec()`       |
| `await post('/v1/...')` → then manually call `fetchDocuments()` | `db.Model.create({...})` + `await instance.save()`        |
| `await put('/v1/...')` + refetch                                | `instance.field = value` + `await instance.save()`        |
| `await del('/v1/...')` + refetch                                | `await instance.delete()`                                 |
| Manual `watch(filters, () => fetchDocuments())`                 | Automatic — live queries re-run on syncBus events         |
| `companyId` guard at top of every function                      | Not needed — syncEngine handles company scoping           |

### Pattern Comparison

#### Reading data

```javascript
// ❌ Old — composable with manual fetch, provided to tree
async function fetchDocuments() {
  const data = await get('/v1/services/documents', { params: { companyId }, loader: loading })
  documents.value = data.documents || []
}
onMounted(() => fetchDocuments())

// ✅ New — live query directly in the component, auto-updating
const document = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.Document.findByPk(id)
})

const versions = useLiveQueryWithDeps(
  [() => props.id],
  async (db, [id]) => {
    return db.DocumentVersion.where('documentId', id).orderBy('createdAt', 'desc').exec()
  },
  { initial: [] },
)
```

#### Creating a record

```javascript
// ❌ Old
const result = await post('/v1/services/documents', { ...docData, companyId })
await fetchDocuments() // manual refetch

// ✅ New
const create = useLiveMutation(async (db) => {
  const doc = db.Document.create({ ...docData })
  await doc.save()
  return doc
})
const newDoc = await create()
// No refetch needed — syncBus fires → live queries update automatically
```

#### Updating a record

```javascript
// ❌ Old
await put(`/v1/services/documents/${id}`, { statusId: 'ARCHIVED' }, { params: { companyId } })
await fetchDocuments()

// ✅ New
document.value.statusId = 'ARCHIVED'
await document.value.save()
```

#### Deleting a record

```javascript
// ❌ Old
await del(`/v1/services/documents/${id}`, { params: { companyId } })
await fetchDocuments()
await fetchStats()

// ✅ New — paranoid models soft-delete automatically
await document.value.delete()
// Live queries auto-exclude soft-deleted records — no refetch needed
```

### Loading & Empty States

Live queries return `undefined` before their first result — use that as your loading signal.

```javascript
// ❌ Old
const loading = ref(false)
const documents = ref([])

// ✅ New
const document = useLiveQueryWithDeps([() => props.id], async (db, [id]) =>
  db.Document.findByPk(id),
)
const loading = computed(() => document.value === undefined)

// In template:
// v-if="!document"  → loading / not found
// v-else            → ready
```

For lists, pass `{ initial: [] }` to avoid `undefined` when a loading state isn't needed:

```javascript
const versions = useLiveQueryWithDeps(
  [() => props.id],
  async (db, [id]) => db.DocumentVersion.where('documentId', id).exec(),
  { initial: [] },
)
```

### Passing Data Between Components

Old code passed full objects as props from a shared provided composable. New code passes only IDs — each component queries what it needs itself.

```vue
<!-- ❌ Old — parent fetches and passes objects down -->
<DocumentsMainContent :document="document" :currentVersion="selectedVersion" :canEdit="canEdit" />

<!-- ✅ New — child receives IDs and queries itself -->
<DocumentsMainContent :documentId="props.id" :versionId="selectedVersion?.id" />
```

### Reactive Filters

```javascript
// ❌ Old
const filters = ref({ search: '', statusId: null })
watch(filters, () => fetchDocuments(), { deep: true })

// ✅ New — filters are deps; query re-runs automatically when they change
const search = ref('')
const statusId = ref(null)

const documents = useLiveQueryWithDeps(
  [() => search.value, () => statusId.value],
  async (db, [search, statusId]) => {
    const results = await db.Document.where('statusId', statusId).exec()
    // In-memory filter for non-indexed fields:
    return results.filter((d) => d.title.includes(search))
  },
  { initial: [] },
)
```

### Auto-selecting After Mutation

Watch the live list reactively instead of manually re-fetching and finding items.

```javascript
// ❌ Old
await loadData()
await nextTick()
const newVersion = versions.value.find((v) => v.id === result.version.id)
selectVersion(newVersion)

// ✅ New
watch(versions, (list) => {
  if (!list?.length) {
    selectedVersion.value = null
    return
  }
  const currentId = selectedVersion.value?.id
  const found = currentId ? list.find((v) => v.id === currentId) : null
  selectedVersion.value = found ?? list[0]
})
```

### Soft Deletes

Never manually filter `deletedAt` — the syncEngine excludes soft-deleted records from all queries automatically. Use `{ force: true }` only when explicitly needed.

```javascript
// ❌ Never do this
const versions = await db.DocumentVersion.where('documentId', id).exec()
const active = versions.filter((v) => !v.deletedAt)

// ✅ Soft-deleted records are already excluded automatically
const versions = await db.DocumentVersion.where('documentId', id).exec()

// ✅ force: true only when intentionally needed (e.g. calculating next version number)
const latest = await db.DocumentVersion.where('documentId', id, { force: true })
  .orderBy('createdAt', 'desc')
  .first()
```

### Checklist Before Committing a Migrated Composable/Component

- [ ] No imports from `@/api` (`get`, `post`, `put`, `del`)
- [ ] No `provideX()` / `useX()` Provide/Inject composable pattern for data fetching
- [ ] No manual `loading` refs wrapping API calls
- [ ] No `fetch*` functions that hit the network
- [ ] No `companyId` guards (the syncEngine handles scoping)
- [ ] Data read via `useLiveQuery` or `useLiveQueryWithDeps`
- [ ] Mutations use `useLiveMutation` + `instance.save()` / `instance.delete()`
- [ ] Components receive `id` props, not full object props
- [ ] No manual refetch calls after mutations
- [ ] No manual `deletedAt` filtering in queries

---

## SyncEngine Reference

### Architecture

```
Backend (PostgreSQL) ←→ Service Worker ←→ IndexedDB ←→ Vue components
                              ↑                              ↓
                         SyncWorkerBridge              useLiveQuery
                              ↑
                          syncBus (event bus per model)
```

### Defining a Model

```javascript
import { ClientModel, BaseModel, Property, Computed } from '@syncEngine/index.js'

@ClientModel('document_versions', {
  primaryKey: 'id',
  loadStrategy: 'instant', // 'instant' | 'lazy' | 'local'
  customIndex: 'documentId', // or '[documentId+statusId]' for compound
  schemaVersion: 1,
})
class DocumentVersion extends BaseModel {
  static paranoid = true // soft-delete via deletedAt field

  @Property({ type: String }) id = null
  @Property({ type: String }) documentId = null
  @Property({ type: String }) statusId = null
  @Property({ type: Number }) versionMajor = 0
  @Property({ type: DateTime, required: true, timestamp: true }) createdAt = null
  @Property({ type: DateTime }) deletedAt = null // required when paranoid = true

  get label() {
    return `${this.versionMajor}.${this.versionMinor}`
  }
}
```

- **`@Property({ type })`** — persisted field. `type` is required: `String`, `Number`, `Boolean`, `Date`, `DateTime`.
  - **`timestamp: true`** — auto-sets to "now" when created via `Model.create()`.
  - **`autoUpdate: true`** — auto-sets to "now" before every `save()`.
- **`@Computed`** — Vue computed getter, never persisted.
- **`static paranoid`** — `true` uses `deletedAt`; a string uses that field name instead.

### Querying (QueryBuilder)

```javascript
// Indexed lookup (fast)
const versions = await db.DocumentVersion.where('documentId', id).exec()

// Indexed lookup + filter + sort + limit
const drafts = await db.DocumentVersion.where('documentId', id)
  .where('statusId', 'DRAFT')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .exec()

// Compound index
const result = await db.Issue.where('[status+priority]', ['OPEN', 1]).exec()

// Full scan (no index — use sparingly)
const all = await db.DocumentVersion.where().exec()

// First result only
const latest = await db.DocumentVersion.where('documentId', id).orderBy('createdAt', 'desc').first()

// Include soft-deleted records
const withDeleted = await db.DocumentVersion.where('documentId', id, { force: true }).exec()

// findByPk
const doc = await db.Document.findByPk(id) // null if soft-deleted
const doc = await db.Document.findByPk(id, { force: true }) // includes soft-deleted
```

### Mutations

```javascript
// Create
const version = db.DocumentVersion.create({ documentId: id, statusId: 'DRAFT', versionMajor: 1 })
await version.save()

// Update
version.statusId = 'APPROVED'
await version.save()

// Soft delete (paranoid model)
await version.delete()

// Hard delete (bypasses paranoid)
await version.hardDelete()

// Restore soft-deleted
await version.restore()
```

### Vue Integration — Live Queries

```javascript
// Re-runs when deps change AND when syncBus fires for any model
const versions = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.DocumentVersion.where('documentId', id).orderBy('createdAt', 'desc').exec()
})

// No deps needed
const allDocs = useLiveQuery(async (db) => db.Document.where().exec())

// Options
useLiveQueryWithDeps(deps, fn, {
  models: 'DocumentVersion', // only re-run on DocumentVersion sync events (default: '*')
  initial: [], // value before first load (default: undefined)
  debounce: 50, // ms to coalesce burst syncs
})
```

### SyncEngine Files Reference

| File                                         | Purpose                                        |
| -------------------------------------------- | ---------------------------------------------- |
| `syncEngine/index.js`                        | Public exports                                 |
| `syncEngine/core/BaseModel.js`               | Base class — create/save/delete/findByPk/where |
| `syncEngine/decorators/ClientModel.js`       | `@ClientModel` class decorator                 |
| `syncEngine/decorators/Property.js`          | `@Property` field decorator                    |
| `syncEngine/decorators/Computed.js`          | `@Computed` getter decorator                   |
| `syncEngine/query/QueryBuilder.js`           | Chainable IDB query builder                    |
| `syncEngine/persistence/IndexedDB.js`        | Low-level IDB adapter                          |
| `syncEngine/persistence/TransactionQueue.js` | Queues mutations for SW                        |
| `syncEngine/core/syncBus.js`                 | Per-model event bus                            |
| `src/composables/useLiveQuery.js`            | Vue composables for live queries               |
| `frontend/app/models/`                       | All model definitions                          |
