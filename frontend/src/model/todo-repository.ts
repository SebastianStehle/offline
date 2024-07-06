import { ApiClient, TodoDto, isTodoCreated } from "../api";
import { EventBus } from "./event-bus";
import { Subscriptions } from "./subscriptions";
import { Update } from "./sync-model";
import { Todo } from "./todo";
import { TodoStore } from "./todo-store";
import { guid } from "./utils";

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
    
      await this.upsert(update.newValue);
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
        const { id, isCompleted, isDeleted, title } = x;

        return new Todo(id, { isCompleted, isDeleted, title });
      });

      return this.todos;
    }

    this.loadPromise ??= loadCore();
    return this.loadPromise;
  }

  async createTodo(title: string) {
    await this.load();

    const update = new Todo(guid()).create(title, this.user);

    await this.upsert(update.newValue);
    
    this.eventBus.publish(update.event);
  }

  async renameTodo(id: string, title: string) {
    return this.updateTodo(id, todo => todo.rename(title, this.user));
  }

  async completeTodo(id: string) {
    return this.updateTodo(id, todo => todo.complete(this.user));
  }

  async deleteTodo(id: string) {
    await this.load();

    const todo = this.todos.find(x => x.id === id);
    if (!todo || todo.isDeleted) {
      return;
    }

    const update = todo.delete(this.user);

    if (update === 'NoChange') {
      return;
    }

    if (update.isConflict) {
      throw new Error(`Conflict for todo '${id}'.`);
    }

    await this.upsert(update.newValue);
    
    this.eventBus.publish(update.event);
  }

  private async updateTodo(id: string, updater: (todo: Todo) => (Update<Todo> | 'NoChange')) {
    await this.load();
  
    const todo = this.todos.find(x => x.id === id);

    if (!todo) {
      throw new Error(`Cannot find todo with ID '${id}'.`);
    }

    if (todo.isDeleted) {
      throw new Error(`Conflict for todo '${id}'. Todo has been deleted.`);
    }

    const update = updater(todo);

    if (update === 'NoChange') {
      return;
    }

    if (update.isConflict) {
      throw new Error(`Conflict for todo '${id}'.`);
    }

    await this.upsert(update.newValue);

    this.eventBus.publish(update.event);
  }

  private async upsert(todo: Todo) {
    if (this.todos.find(x => x.id === todo.id)) {
      this.todos = this.todos.map(x => x.id === todo.id ? todo : x);
    } else {
      this.todos = [...this.todos, todo];
    }

    await this.todoStore.upsert({ id: todo.id, ...todo.values });
    this.changes.publish();
  }
}