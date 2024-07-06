import { EventBase, TodoCompleted, TodoCreated, TodoDeleted, TodoUpdated, isTodoCompleted, isTodoCreated, isTodoDeleted, isTodoUpdated } from "../api";
import { SyncModel, Update } from "./sync-model";

export interface TodoState {
  title: string;
  isCompleted: boolean;
  isDeleted: boolean;
}

export class Todo extends SyncModel<TodoState> {
  get title() {
    return this.values.title.value as string;
  }

  get isCompleted() {
    return this.values.isCompleted.value as boolean;
  }

  get isDeleted() {
    return this.values.isDeleted.value as boolean;
  }

  create(title: string, user: string): Update<Todo> {
    return this.apply({ metadata: this.metadata(user), $type: 'TodoCreated', title } as TodoCreated);
  }

  complete(user: string): Update<Todo> | 'NoChange' {
    if (this.isCompleted) {
      return 'NoChange';
    }

    return this.apply({ metadata: this.metadata(user), $type: 'TodoCompleted' } as TodoCompleted);
  }

  rename(title: string, user: string): Update<Todo> | 'NoChange' {
    if (this.title === title) {
      return 'NoChange';
    }

    return this.apply({ metadata: this.metadata(user), $type: 'TodoUpdated', title } as TodoUpdated);
  }

  delete(user: string): Update<Todo> | 'NoChange' {
    if (this.isDeleted) {
      return 'NoChange';
    }

    return this.apply({ metadata: this.metadata(user), $type: 'TodoDeleted' } as TodoDeleted);
  }

  apply(event: EventBase) {
    if (isTodoCreated(event)) {
      return this.update({
        title: event.title,
        isCompleted: false,
        isDeleted: false,
       }, event);
    } else if (isTodoUpdated(event)) {
      return this.update({ title: event.title }, event);
    } else if (isTodoCompleted(event)) {
      return this.update({ isCompleted: true }, event);
    } else if (isTodoDeleted(event)) {
      return this.update({ isDeleted: true }, event);
    } else {
      throw new Event('Unknown event.');
    }
  }
}