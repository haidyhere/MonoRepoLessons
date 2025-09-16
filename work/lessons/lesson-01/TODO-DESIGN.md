# TODO-DESIGN.md — Blessed Todo Manager

## 1. System Architecture Overview

### 1.1 MVC Explanation and Rationale
- **Model**: Manages todo data (create, update, delete, validate, persist).
- **View**: Renders terminal UI panels using `blessed`.
- **Controller**: Handles user input, updates Model, and refreshes View.

**Why MVC?**
- Clear separation of concerns.
- Easier testing and maintenance.
- Scales well for new features (e.g., tags, filters).

### 1.2 Component Interaction Diagram
```mermaid
flowchart TD
  User --> View
  View --> Controller
  Controller --> Model
  Model --> View

### 1.3 High-Level Data Flow

User presses a key / types a command in the View.

View emits an intent → Controller handler (e.g., addTodo, toggleTodo, setFilter).

Controller validates/coerces → calls Model.

Model mutates state + persists → notifies subscribers.

View re-renders affected panels.

2. User Interface Design
2.1 Layout (Multipanel Terminal UI)
+--------------------------- Todo List (Scrollable) ----------------------------+
| [ ] Buy milk                                                                  |
| [x] Finish homework                                                           |
| [ ] Call Alice                                                                |
| …                                                                             |
+------------------ Details ------------------+----------- Help ---------------+
| ID: 2                                       | a Add     e Edit               |
| Title: Finish homework                      | d Delete  c Toggle complete    |
| Status: Completed                           | / Search  f Filter             |
| Created: 2025-09-14 19:05                   | ↑↓ Move   Tab Switch panel     |
| Notes: …                                    | Enter Confirm   q Quit         |
+---------------------------------------------+--------------------------------+
| Input / Command Line: >                                                         |
+-------------------------------------------------------------------------------+

Panels & Responsibilities

Todo List Panel: Scrollable list, shows status icons, supports selection.

Details Panel: Read-only view of the selected item (id, title, status, timestamps, notes).

Help Panel: Keyboard shortcuts and hints; collapsible to save space.

Input / Command Panel: Line editor for adding/editing/searching; shows validation errors.

2.2 Navigation & Interaction Patterns

Focus switching: Tab/Shift+Tab cycles panels (List → Details → Help → Input).

List navigation: ↑/k, ↓/j, PgUp/PgDn, Home/End.

Selection: Move highlight; actions apply to the highlighted todo.

Inline prompts: Input panel becomes active for add/edit/search; Enter confirms, Esc cancels.

Error/display feedback: Inline red message in Input panel; transient toast line above footer.
2.3 Keyboard Shortcuts & Commands

a Add — opens Input: Add: <title>

e Edit — opens Input with current title

d Delete — confirm prompt: Delete "<title>"? (y/N)

c Toggle complete on selected

f Cycle filter: ALL → ACTIVE → COMPLETED

/ Search — opens Input: Search: <text>; list filters live

r Rename (alias for e)

q Quit

General: Enter confirm, Esc cancel, Tab/Shift+Tab switch focus

Accessibility/UX notes:

Keep all actions keyboard-first.

Maintain visible focus and selection indicators.

Never lose unsaved input on panel switch—stash draft state.

3. Data Model Specification
3.1 Todo Structure
type TodoId = string;
type Filter = 'ALL' | 'ACTIVE' | 'COMPLETED';

interface Todo {
  id: TodoId;
  title: string;            // 1..200 chars (trimmed)
  completed: boolean;       // default: false
  notes?: string;           // optional, up to 1000 chars
  createdAt: number;        // epoch ms
  updatedAt: number;        // epoch ms
}
3.2 Validation Rules
title.trim().length in [1, 200]

notes?.length ≤ 1000

id unique; updates must target an existing id.

No-op updates (same values) should not bump updatedAt.
3.3 Storage Format & Persistence Strategy

Phase 1 (local file JSON, simplest):

File: ~/.blessed-todo/todos.json

Shape:

{
  "todos": [
    {
      "id": "t_8f1c",
      "title": "Buy milk",
      "completed": false,
      "createdAt": 1737062400000,
      "updatedAt": 1737062400000
    }
  ],
  "meta": { "version": 1 }
}


Atomic writes: write to temp file then rename.

Autoload on start; autosave on every mutation (debounced 200ms).
4. Technical Requirements
4.1 Dependencies & Libraries

Runtime: Node.js ≥ 18

UI: blessed (or neo-blessed) for terminal widgets

Lang/Build: TypeScript, ts-node or esbuild/tsup for bundling

Lint/Test: ESLint, Jest (unit tests), @types/node, @types/blessed

4.2 Project Structure
/src
  /model
    todo.model.ts        // state, validation, persistence calls
    storage.fs.ts        // JSON file storage implementation
    types.ts
  /controller
    todo.controller.ts   // key handlers, intents → model ops
  /view
    ui.ts                // blessed screen + layout + panel factories
    panels/
      list.panel.ts
      details.panel.ts
      help.panel.ts
      input.panel.ts
  app.ts                 // wiring: bootstrap MVC, subscriptions
tests/
  model.test.ts
  controller.test.ts

4.3 Performance Considerations

Partial re-render: Update only the panel that changed (e.g., list rows on toggle).

Debounce disk writes: 200–300ms to batch rapid edits.

Virtualized list (if needed): For very large datasets, render visible window only.

4.4 Cross-Platform

Works on macOS/Linux/Windows terminals that support ANSI; test on iTerm2, Terminal.app, Windows Terminal.

Avoid non-portable key bindings; provide fallbacks (e.g., both ↑/↓ and j/k).
5. MVC Interaction Details
5.1 Subscriptions

Model exposes subscribe(listener); View (or a store adapter) subscribes.

Controller does not hold UI state; it calls Model and triggers redraw via subscription.

