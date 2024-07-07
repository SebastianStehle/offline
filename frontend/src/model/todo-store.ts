import { TodoDto } from "../api";
import { addOrReplaceById, removeById } from "./utils";

export class TodoStore {
  async getTodos(): Promise<TodoDto[]> {
    const stored = await this.loadTodos();

    return stored;
  }

  async reset(todos: TodoDto[]) {
    await this.storeTodos(todos);
  }

  async upsert(todo: TodoDto) {
    let stored = await this.loadTodos();

    stored = addOrReplaceById(stored, todo);

    await this.storeTodos(stored);
  }

  async remove(id: string) {
    let stored = await this.loadTodos();

    stored = removeById(stored, id);
    
    await this.storeTodos(stored);
  }

  private async storeTodos(todos: TodoDto[]) {
    const serialized = JSON.stringify(todos, undefined, 2);

    localStorage.setItem('todos', serialized);
  }

  private async loadTodos() {
    const stored = localStorage.getItem('todos');

    if (!stored) {
      return [];
    }

    const serialized = JSON.parse(stored) as TodoDto[];
    return serialized;
  }
}