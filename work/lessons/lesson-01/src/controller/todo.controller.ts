//import type { Todo } from "../model/types";
import type { UI } from "../view/ui";
import type { TodoModel } from "../model/todo.model";

export class Controller {
  private ui: UI;
  private model: TodoModel;
  constructor(ui: UI, model: TodoModel) {
    this.ui = ui;
    this.model = model;
  }
  

  bindKeys() {
    const s = this.ui.screen;

    // Tab 在 list/input 间切换
    s.key(["tab", "S-tab"], () => this.ui.cycleFocus());

    // 快捷键：a=add, e=edit, c=toggle, d=delete, f=filter, /=command
    s.key("a", () => this.ui.prompt("add ", (text) => this.parseAndRun(text)));
    s.key("e", () => {
      const id = this.ui.getSelectedId();
      if (!id) return;
      const todo = this.model.getTodos().find(t => t.id === id);
      const current = todo ? todo.title : "";
      this.ui.prompt(`edit ${id} ${current}`, (text) => this.parseAndRun(text));
    });
    s.key("c", () => {
      const id = this.ui.getSelectedId();
      if (!id) return;
      try {
        this.model.toggleTodo(id);
        this.ui.setStatus(`Toggled ${id}`);
      } catch (e: any) { this.ui.setStatus(e.message); }
    });
    s.key("d", () => {
      const id = this.ui.getSelectedId();
      if (!id) return;
      this.ui.prompt(`remove ${id}`, (text) => this.parseAndRun(text));
    });
    s.key("f", () => {
      // 简易循环过滤：all→active→completed
      const state = this.model.getState();
      const next = state.filter === "ALL" ? "ACTIVE" : state.filter === "ACTIVE" ? "COMPLETED" : "ALL";
      // 这里把过滤当成 UI 行为：仅影响右下状态与列表派生
      this.ui.setStatus(`Filter: ${next}`);
      // 直接靠订阅重绘即可（我们在 app 里按 filter 显示派生）
    });
    s.key("/", () => this.ui.prompt("", (text) => this.parseAndRun(text)));
    // 帮助
    s.key("h", () => this.ui.setStatus("Keys: a add | e edit | c toggle | d delete | / cmd | q quit"));

    // 退出
    s.key("q", () => process.exit(0));
    // 绑定 Command 输入框 submit
    this.ui.input.on("submit", (value: string) => {
      if (value.trim()) {
        this.parseAndRun(value.trim());
      }
      this.ui.input.clearValue();
      this.ui.focus("list"); // 回到列表
      this.ui.render();
    });
  }

  // 命令解析：add, list, complete/toggle, remove, edit
  parseAndRun(line: string) {
    const [cmd, ...rest] = line.trim().split(/\s+/);
    try {
      switch (cmd) {
        case "add": {
          const title = rest.join(" ");
          if (!title) throw new Error("Title cannot be empty");
          this.model.addTodo(title);
          this.ui.setStatus(`Added: ${title}`);
          break;
        }
        case "list": {
          // 这里只提示；实际列表由订阅自动刷新
          const f = rest[0] || "all";
          this.ui.setStatus(`List filter requested: ${f}`);
          break;
        }
        case "complete":
        case "toggle": {
          const id = rest[0];
          if (!id) throw new Error("Missing id");
          this.model.toggleTodo(id);
          this.ui.setStatus(`Toggled ${id}`);
          break;
        }
        case "remove":
        case "rm": {
          const id = rest[0];
          if (!id) throw new Error("Missing id");
          this.model.deleteTodo(id);
          this.ui.setStatus(`Removed ${id}`);
          break;
        }
        case "edit": {
          const id = rest[0];
          if (!id) throw new Error("Missing id");
          const newTitle = rest.slice(1).join(" ");
          if (!newTitle) throw new Error("New title required");
          this.model.editTodo(id, { title: newTitle });
          this.ui.setStatus(`Edited ${id}`);
          break;
        }
        case "help":
        default:
          this.ui.setStatus("Commands: add <title> | list [all|active|completed] | complete <id> | remove <id> | edit <id> <title>");
      }
    } catch (e: any) {
      this.ui.setStatus(`Error: ${e.message}`);
    }
  }
}