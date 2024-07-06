import { TodoDto } from "../api";

export class TodoStore {
  async getTodos(): Promise<TodoDto[]> {
    const stored = await this.loadTodos();

    return stored;
  }

  async reset(todos: TodoDto[]) {
    await this.storeTodos(todos);
  }

  async upsert(todo: TodoDto) {
    const stored = await this.loadTodos();

    const indexOfExisting = stored.findIndex(x => x.id === todo.id);

    if (indexOfExisting >= 0) {
      stored[indexOfExisting] = todo;
    } else {
      stored.push(todo);
    }

    await this.storeTodos(stored);
  }

  async remove(id: string) {
    const stored = await this.loadTodos();

    if (stored.splice(stored.findIndex(x => x.id !== id), 1).length === 0) {
      return;
    }
    
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