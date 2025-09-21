export type TodoId = string;
export type filter = "ALL" | "ACTIVE" | "COMPLETED";
export interface Todo {
  id: TodoId;          
  title: string;       
  completed: boolean;  
  notes?: string;      
  createdAt: number;   // created timestamp
  updatedAt: number;   // updated timestamp
}
export interface AppState {
  todos: Todo[];  // list of todos
  filter: filter; // current filter
}