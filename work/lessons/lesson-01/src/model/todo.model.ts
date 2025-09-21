import type { Todo, TodoId, AppState } from "./types.ts";
import { saveState, loadState } from "./storage.fs.ts";
import { v4 as uuidv4 } from "uuid";

type Listener = (state: AppState) => void;

export class TodoModel {
  private state: AppState = { todos: [], filter: "ALL" };
  private listeners: Listener[] = [];

  // initial load from storage  
  async init() {
    const loaded = await loadState();
    if (loaded) {
      this.state = loaded;
    }
    this.notify();
  }

  // subscribe to state changes
  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  // notify all listeners of state changes
  private notify() {
    this.listeners.forEach((l) => l(this.state));
    void saveState(this.state); // persist state on every change
  }

  // validations
  private validateTitle(title: string) {
    if (!title.trim()) throw new Error("Title cannot be empty");
    if (title.length > 200) throw new Error("Title too long (max 200)");
  }
// add a new todo
  addTodo(title: string) {
    this.validateTitle(title);
    //const now = Date.now();
    const todo: Todo = {
      id: uuidv4(),         // 唯一 ID
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.todos.push(todo);
    this.notify(); // 通知订阅者 & 保存
    return todo;
  }

  // edit a todo
  editTodo(id: TodoId, updates: Partial<Omit<Todo, "id" | "createdAt">>) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (!todo) throw new Error("Todo not found");
    if (updates.title !== undefined) {
    this.validateTitle(updates.title);
    todo.title = updates.title.trim();
    }
    if (updates.notes !== undefined) {
    todo.notes = updates.notes.trim();
  }
  if (updates.completed !== undefined) {
    todo.completed = updates.completed;
  }
  todo.updatedAt = Date.now(); // 每次修改都更新更新时间
  this.notify();
  return todo;
  }

  // toggle todo completed status
  toggleTodo(id: TodoId) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (!todo) throw new Error("Todo not found");
    todo.completed = !todo.completed;
    todo.updatedAt = Date.now();
    this.notify();
  }

  // delete a todo
  deleteTodo(id: TodoId) {
    const before = this.state.todos.length;
    this.state.todos = this.state.todos.filter(t => t.id !== id);
    if (this.state.todos.length === before) throw new Error("Todo not found");
    this.notify();
  }
  getTodos() {
    return this.state.todos;
  }
   getState() { return this.state; }
}

  