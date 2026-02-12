

## Changes Overview

Four fixes to improve page and field naming behavior.

---

### 1. Close "新增項目" panel when creating a new page

In `handleCreateGroup` (Index.tsx), add `setShowPanel(false)` so the add-field panel auto-closes when a new page is created.

### 2. Decouple page title from page sequence number

Currently `renameGroupsByOrder` overwrites group names to "第 N 頁" on every reorder/delete, causing the title input to "hang" (value gets overwritten while editing). Changes:

- Add a `pageCounter` (similar to `fieldCounter`) that increments persistently. New pages get named "未命名頁面 1", "未命名頁面 2", etc. This title is purely user-editable and never changes on reorder.
- Remove `renameGroupsByOrder` -- stop renaming groups on reorder/delete.
- Add a **page sequence indicator** (e.g., "P1", "P2") displayed as a small badge/tag in the GroupCard header, computed from the group's current index position. This updates automatically on reorder but is separate from the editable title.
- In `GroupCard.tsx`, render this indicator (passed as a prop like `pageIndex`) before the title, e.g., `<span class="xform-group-page-num">P1</span>`.

### 3. Change collapsed page summary from "個欄位" to "個項目"

In `GroupCard.tsx` line 130, change `{items.length} 個欄位` to `{items.length} 個項目`.

### 4. Rename default field label from "欄位 N" to "未命名欄位 N"

In `createField` (Index.tsx line 49), change the label from `` `欄位 ${num}` `` to `` `未命名欄位 ${num}` ``.

---

### Technical Details

**Files to modify:**

- **`src/pages/Index.tsx`**:
  - Add `let pageCounter = 1;` alongside `fieldCounter`
  - `handleCreateGroup`: use `未命名頁面 ${pageCounter++}` for name, add `setShowPanel(false)`
  - Remove `renameGroupsByOrder` usage from `deleteGroup` and `handleDragEnd` (keep group order logic, just stop renaming)
  - Delete `renameGroupsByOrder` function
  - Pass `pageIndex={idx + 1}` prop to each `GroupCard`
  - Change field label to `未命名欄位 ${num}`

- **`src/components/GroupCard.tsx`**:
  - Add `pageIndex?: number` prop
  - Render page indicator badge in header before the title
  - Change "個欄位" to "個項目"

- **`src/styles/form-builder.css`**:
  - Add `.xform-group-page-num` style for the page sequence badge (small, muted, rounded)

