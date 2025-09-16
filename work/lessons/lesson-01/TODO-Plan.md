# TODO-PLAN.md — Phase 2: Implementation Plan (blessed + TypeScript, MVC)

> This plan is based on the previously delivered `TODO-DESIGN.md`. It breaks the build into phases, defines structure and conventions, outlines testing & integration milestones, and identifies risks with mitigations.

---

## 1 Development Phases

### Phase 0 — Project Bootstrap (0.5–1h, Low)
**Goals**
- Initialize Node + TypeScript project with blessed.
- Set up ESLint + Jest.
- Verify hello-world blessed screen.

**Deliverable / Exit**
- `npm run dev` shows a blank blessed screen; press `q` to exit.
- CI (optional): run `npm test` on push.

**Dependencies**: none.

---

### Phase 1 — Model (Core Data & Validation) (2–3h, Medium)
**Goals**
- **First component to build.**
- Define `Todo`, `Filter` types.
- Implement CRUD (create, read, update, delete).
- Add validation (title length, notes length).
- Add subscription mechanism (`subscribe(listener)`).

**Testing:** Pure Jest unit tests for CRUD and validation.  
**Deliverable:** In-memory model fully tested and reliable.

---

### Phase 2 — Persistence (File Storage Adapter) (2–3h, Medium)
**Goals**
- Implement JSON file storage with debounced atomic writes.

**Tasks**
- `src/model/storage.fs.ts`:
  - `load(): Promise<State>` loads from `~/.blessed-todo/todos.json` (create if missing).
  - `save(state): Promise<void>` writes to temp file, then rename.
  - Debounce writes (200–300ms) to batch rapid updates.
- Wire storage into `todo.model.ts` (injectable storage interface).

**Testing**
- Mock fs (e.g., `memfs` or manual mocks) to test `load/save` behavior and atomicity.

**Deliverable / Exit**
- App starts with persisted data and saves on mutations (behind an interface).

**Dependencies**: Phase 1.

---

### Phase 3 — View Skeleton (Panels & Layout) (2–4h, Medium)
**Goals**
- Build blessed screen + layout containers for panels (List, Details, Help, Input).
- No business logic yet; just render placeholders and focus switching.

**Tasks**
- `src/view/ui.ts`: screen creation, key handling for focus cycle (Tab/Shift+Tab), root layout.
- `src/view/panels/list.panel.ts`: list box placeholder.
- `src/view/panels/details.panel.ts`: box showing static fields.
- `src/view/panels/help.panel.ts`: shortcuts legend.
- `src/view/panels/input.panel.ts`: line editor widget in footer.

**Testing**
- Light tests on pure helper functions (e.g., formatting, mapping state to strings).
- Manual smoke run for layout and focus.

**Deliverable / Exit**
- Panels are visible and focus can be switched via Tab; no data yet.

**Dependencies**: Phase 0.

---

### Phase 4 — Controller (Intents → Model Ops) (2–4h, Medium)
**Goals**
- Map keys/commands to controller actions; integrate with Model and View.

**Tasks**
- `src/controller/todo.controller.ts`: handlers
  - `addTodo(title)`, `renameTodo(id, title)`, `toggleTodo(id)`, `deleteTodo(id)`, `setFilter(filter)`, `search(text)`
- Wire keybindings in `ui.ts`: `a`, `e/r`, `c`, `d`, `f`, `/`, `Enter`, `Esc`, `↑/↓/j/k`.
- Subscribe View to Model state; re-render only affected panel(s).

**Testing**
- Controller unit tests: ensure correct model calls for given inputs/intents.
- Simulate simple scenarios: add → list updates; toggle → list & details update.

**Deliverable / Exit**
- You can add/rename/toggle/delete via keyboard; panels reflect changes.

**Dependencies**: Phases 1–3.

---

### Phase 5 — Integration Milestones & Polish (2–4h, Medium)
**Goals**
- Smooth UX, error messages, input drafts, and search/filter cohesion.
- Add error handling (e.g., invalid input).
- Keep draft input state.
- Search/filter coherence.
- Collapsible Help panel.

**Testing:** Limited integration tests (Add → Edit → Delete sequence).  
**Deliverable:** Stable MVP, smooth UX.

**Dependencies**: Phases 1–4.

---

### Phase 6 — Stretch (Optional) (time varies)
- Virtualized list for large data sets.
- Undo/redo, bulk actions, tags/priority/due dates.
- Pluggable storage backends (REST/SQLite).

---

## 2 Dependencies Between Phases
- **Model first** → everything else depends on it.
- **Persistence** builds on Model.
- **View skeleton** can proceed in parallel with Persistence.
- **Controller** requires Model + View.
- **Integration** requires all.

---

## 3 Estimated Complexity & Time
| Phase | Scope                                   | Complexity | Time (est.) |
|------:|-----------------------------------------|------------|-------------|
| 0     | Bootstrap                               | Low        | 0.5–1h      |
| 1     | Model                                   | Medium     | 2–3h        |
| 2     | Persistence (fs)                        | Medium     | 2–3h        |
| 3     | View skeleton (blessed)                 | Medium     | 2–4h        |
| 4     | Controller + keybindings                | Medium     | 2–4h        |
| 5     | Integration polish                      | Medium     | 2–4h        |
| 6     | Stretch                                 | High       | —           |

## 4. Implementation Strategy

- **Order of development:**
  1. Model (tested in isolation)
  2. Persistence (add persistence layer)
  3. View skeleton (panels + layout)
  4. Controller (wire keys to model)
  5. Integration polish

- **Testing strategy:**
  - Model/Controller: heavy Jest unit tests.
  - View: test helpers only, manual verification of UI.
  - Integration: small “happy path” sequences.

- **Integration milestones:**
  - A: Model passes unit tests.
  - B: Persistence works, todos survive restart.
  - C: Panels visible, focus switching works.
  - D: Add/toggle/delete via keyboard.
  - E: Search/filter + error handling.

---
## 5. Risk Assessment

### Technical Challenges
- Blessed key handling differences across terminals.
- Data corruption from partial writes.
- Performance slowdown with large lists.
- Fragile UI tests.

### Mitigation
- Stick to standard blessed widgets; test on macOS/Linux/Windows.
- Use atomic write strategy + manual save command.
- Consider windowed rendering if list >1000 items.
- Limit automated UI tests; rely on Jest for logic + manual TUI testing.

### Alternatives
- Swap blessed for Ink if needed.
- Use SQLite instead of JSON if performance demands.

---