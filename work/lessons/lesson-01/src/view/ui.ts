import blessed from "blessed";
import type { Widgets } from "blessed";
import type { Todo } from "../model/types";

type Widgets = typeof blessed.Widgets;
export type FocusTarget = "list" | "input";

export class UI {
  
  screen: Widgets.Screen;
  list: Widgets.ListElement;
  details: Widgets.BoxElement;
  input: Widgets.TextboxElement;
  status: Widgets.BoxElement;

  private idByIndex: string[] = []; // list 索引 → todo.id
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Blessed Todo Manager",
    });

    // 左侧：Todo 列表
    this.list = blessed.list({
      parent: this.screen,
      label: " Todos ",
      keys: true,
      mouse: true,
      vi: true,
      width: "60%",
      height: "80%",
      top: 0,
      left: 0,
      border: "line",
      style: { selected: { inverse: true } },
      scrollbar: { ch: " ", style : {inverse: true} },
    });

// 右上：详情
    this.details = blessed.box({
      parent: this.screen,
      label: " Details ",
      width: "40%",
      height: "80%",
      top: 0,
      left: "60%",
      border: "line",
      tags: true,
      scrollable: true,
      keys: true,
      mouse: true,
      vi: true,
    });
    // 底部输入（命令行）
    this.input = blessed.textbox({
      parent: this.screen,
      label: " Command ",
      width: "80%",
      height: 3,
      bottom: 1,
      left: 0,
      border: "line",
      inputOnFocus: true,
      keys: true,
      mouse: true,
    });
    // 底部状态栏
    this.status = blessed.box({
      parent: this.screen,
      height: 1,
      bottom: 0,
      left: 0,
      width: "100%",
      tags: true,
      style: { bg: "gray", fg: "black" },
    });
    // 全局快捷键：退出
    this.screen.key(["C-c", "q"], () => process.exit(0));
  }

  render() { this.screen.render(); }

  focus(target: FocusTarget) {
    if (target === "list") this.list.focus();
    if (target === "input") this.input.focus();
    this.render();
  }

  cycleFocus() {
    if (this.screen.focused === this.list) return this.focus("input");
    return this.focus("list");
  }

  setStatus(text: string) {
    this.status.setContent(` ${text}`);
    this.render();
  }
  setTodos(todos: Todo[]) {
    // 渲染列表项 + 建立索引映射
    this.idByIndex = todos.map(t => t.id);
    this.list.setItems(
      todos.map(t => `${t.completed ? "[x]" : "[ ]"} ${t.title}`)
    );
    // 如果没有选中项且有数据，默认选第一项
    const currentIndex = (this.list as any).selected;
    if (currentIndex == null && todos.length > 0) this.list.select(0);
    this.render();
  }

  getSelectedId(): string | null {
    const idx = (this.list as any).selected ?? 0;
    return this.idByIndex[idx] || null;
  }

  setDetails(todo: Todo | null) {
    if (!todo) {
      this.details.setContent("No selection");
    } else {
      this.details.setContent(
        `{bold}ID:{/bold} ${todo.id}\n` +
        `{bold}Title:{/bold} ${todo.title}\n` +
        `{bold}Status:{/bold} ${todo.completed ? "Completed" : "Active"}\n` +
        `{bold}Created:{/bold} ${new Date(todo.createdAt).toLocaleString()}\n` +
        `{bold}Updated:{/bold} ${new Date(todo.updatedAt).toLocaleString()}\n` +
        (todo.notes ? `{bold}Notes:{/bold} ${todo.notes}\n` : "")
      );
    }
    this.render();
  }

  prompt(prefill: string, onSubmit: (text: string) => void) {
    this.input.setValue(prefill);
    this.focus("input");
    this.input.readInput((err, value) => {
      if (!err && value != null) onSubmit(value.trim());
      this.focus("list");
    });
  }
}