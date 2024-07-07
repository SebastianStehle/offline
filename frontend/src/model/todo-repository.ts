import { ApiClient, TodoDto, isTodoCreated, isTodoDeleted } from "../api";
import { EventBus } from "./event-bus";
import { Subscriptions } from "./subscriptions";
import { Update } from "./sync-model";
import { Todo } from "./todo";
import { TodoStore } from "./todo-store";
import { addOrReplaceById, guid, removeById } from "./utils";

export class TodoRepository {
  private readonly user = guid();
  private loadPromise?: Promise<Todo[]>;

  public todos: Todo[] = [];

  public readonly changes = new Subscriptions<void>();

  constructor(
    private readonly eventBus: EventBus,
    private readonly todoStore: TodoStore,
    private readonly client: ApiClient,
  ) {
    this.eventBus.subscribe(async event => {
      await this.load();
      
      if (event.metadata.user === this.user) {
        return;
      }

      const id = event.metadata.objectId;

      if (isTodoDeleted(event)) {
        this.deleteCore(id);
        return;
      }

      let todo: Todo | undefined;
      if (isTodoCreated(event)) {
        todo = new Todo(id);
      } else {
        todo = this.todos.find(x => x.id === id);
      }

      const update = todo?.apply(event);

      if (!update || update.isConflict) {
        return;
      }
    
      await this.upsertCore(update.newValue);
    });
  }

  load() {
    const loadCore = async () => {
      let dtos: TodoDto[];
      try {
        const response = await this.client.todos.getTodos();

        dtos = response.todos;
        await this.todoStore.reset(dtos);
      } catch {
        dtos =  await this.todoStore.getTodos()
      }

      this.todos = dtos.map(x => {
        const { id, ...values } = x;

        return new Todo(id, values);
      });

      return this.todos;
    }

    this.loadPromise ??= loadCore();
    return this.loadPromise;
  }

  async createTodo(title: string) {
    return this.updateTodo(guid(), true, todo => todo.create(title, this.user));
  }

  async renameTodo(id: string, title: string) {
    return this.updateTodo(id, false, todo => todo.rename(title, this.user));
  }

  async completeTodo(id: string) {
    return this.updateTodo(id, false, todo => todo.complete(this.user));
  }

  async deleteTodo(id: string) {
    await this.load();
  
    const todo = this.todos.find(x => x.id === id);

    if (!todo) {
      throw new Error(`Cannot find todo with ID '${id}'.`);
    }

    const update = todo.delete(this.user);

    if (update === 'NoChange') {
      return;
    }

    if (update.isConflict) {
      throw new Error(`Conflict for todo '${id}'.`);
    }

    await this.deleteCore(id);

    this.eventBus.publish(update.event);
  }

  private async updateTodo(id: string, create: boolean, updater: (todo: Todo) => (Update<Todo> | 'NoChange')) {
    await this.load();
  
    let todo = this.todos.find(x => x.id === id);

    if (!todo && create) {
      todo = new Todo(id);
    }

    if (!todo) {
      throw new Error(`Cannot find todo with ID '${id}'.`);
    }

    const update = updater(todo);

    if (update === 'NoChange') {
      return;
    }

    if (update.isConflict) {
      throw new Error(`Conflict for todo '${id}'.`);
    }

    await this.upsertCore(update.newValue);

    this.eventBus.publish(update.event);
  }

  private async upsertCore(todo: Todo) {
    this.todos = addOrReplaceById(this.todos, todo);

    await this.todoStore.upsert({ id: todo.id, ...todo.values });
    this.changes.publish();
  }

  private async deleteCore(id: string) {
    this.todos = removeById(this.todos, id);

    await this.todoStore.remove(id);
    this.changes.publish();
  }
}