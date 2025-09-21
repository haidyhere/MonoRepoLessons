import { useEffect, useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { TodoModel } from './model/todo.model';
import type {Todo} from './model/types';

const model = new TodoModel();

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState("") 
  const [filter, setFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  // initialize model and load todos
  useEffect(() => {
    model.init().then(() => {
      setTodos(model.getTodos())
    })
    model.subscribe((state) => {
      setTodos(state.todos)
    })
  }, [])

  // add a new todo
  const handleAdd = () => {
    if (title.trim()) {
      model.addTodo(title)
      setTitle("")
    }
  }
  const handleComplete = (id: string) => {
    model.toggleTodo(id)
  }

  const handleRemove = (id: string) => {
    model.deleteTodo(id)
  }

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      model.editTodo(id, { title: editTitle })
    }
    setEditingId(null)
    setEditTitle("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const filteredTodos = todos.filter((t) =>
    filter === "active" ? !t.completed : 
    filter === "completed" ? t.completed : true
  )

  return (
    <>
    <div className="App">
      <header className="App-header">
        <h1> Welcome to CS 5500!</h1>
        <p>This is my first React Vite TypeScript project.</p> 
      </header>

      <div style={ { padding: 20}}>
        <h2> Todo List</h2>
        <div className='row'>
         <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a todo title"
        />
        <button onClick={handleAdd} className='btn primary'>Add Todo</button>
        
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        </select>
        </div>
        <ul>
         {filteredTodos.map((todo) => (
            <li key={todo.id}>
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button onClick={() => handleSaveEdit(todo.id)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none"
                }}
              >
                {todo.title}
              </span>
              <button onClick={() =>  handleComplete(todo.id)}>
                {todo.completed ? "Undo" : "Done"}
              </button>
              <button onClick={() => handleStartEdit(todo.id, todo.title)}>Edit</button>
              <button onClick={() => handleRemove(todo.id)}>Delete</button>
              </>
              )}
              </li>
             
          ))}
        </ul> 
      </div>


    </div>
    
    </>
  )
}

export default App
