import { useCallback } from "react";
import { useTodos } from "../hooks";
import { TodoItem } from "./TodoItem";
import { Todo } from "../model/todo";
import { AddTodo } from "./AddTodo";

export function Todos() {
  const [todos, mutate] = useTodos();

  const doADd = useCallback(
    (title: string) => {
      mutate((repository) => repository.createTodo(title));
    },
    [mutate]
  );

  const doComplete = useCallback(
    (todo: Todo) => {
      mutate((repository) => repository.completeTodo(todo.id));
    },
    [mutate]
  );

  const doRename = useCallback(
    (todo: Todo, title: string) => {
      mutate((repository) => repository.renameTodo(todo.id, title));
    },
    [mutate]
  );

  const doDelete = useCallback(
    (todo: Todo) => {
      mutate((repository) => repository.deleteTodo(todo.id));
    },
    [mutate]
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl">Todos</h1>

      {todos.length > 0 && (
        <div className="flex flex-col gap-2">
          {todos.map((x) => (
            <TodoItem
              key={x.id}
              onComplete={doComplete}
              onDelete={doDelete}
              onRename={doRename}
              todo={x}
            />
          ))}
        </div>
      )}

      <AddTodo onAdd={doADd} />
    </div>
  );
}
