import { UI } from "./view/ui.ts";
import { Controller } from "./controller/todo.controller.ts";
import { TodoModel } from "./model/todo.model.ts";
import type { Todo } from "./model/types.ts";

async function main() {
  const ui = new UI();
  const model = new TodoModel();
  const controller = new Controller(ui, model);

  await model.init();
  // 订阅：Model 变更时重画列表/详情/状态
  model.subscribe((state) => {
    // 这里可以按 filter 派生；演示简单起见显示全部
    const todos = state.todos;
    ui.setTodos(todos);

    const id = ui.getSelectedId();
    const selected: Todo | null = id ? todos.find(t => t.id === id) || null : null;
    ui.setDetails(selected);

    ui.setStatus(`All: ${todos.length} | Active: ${todos.filter(t=>!t.completed).length} | Completed: ${todos.filter(t=>t.completed).length}`);
  });

  // 列表移动时更新详情
  ui.list.on("select", () => {
    const id = ui.getSelectedId();
    const todos = model.getTodos();
    const selected = id ? todos.find(t => t.id === id) || null : null;
    ui.setDetails(selected);
  });
  controller.bindKeys();
  ui.focus("list");
  ui.render();
}

main();