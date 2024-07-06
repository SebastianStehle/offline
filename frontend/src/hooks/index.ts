import { useCallback, useEffect, useState } from "react";
import { EventBus } from "../model/event-bus";
import { Todo } from "../model/todo";
import { TodoRepository } from "../model/todo-repository";
import { TodoStore } from "../model/todo-store";
import { API_CLIENT } from "../api";

const EVENT_BUS = new EventBus(API_CLIENT);
const TODO_STORE = new TodoStore();
const TODO_REPOSITORY = new TodoRepository(EVENT_BUS, TODO_STORE, API_CLIENT);

export function useTodos(): [Todo[], (callback: (repository: TodoRepository) => Promise<void>) => void] {
  const [todos, setTodos] = useState<Todo[]>(TODO_REPOSITORY.todos);

  useEffect(() => {
    async function load() {
      await TODO_REPOSITORY.load();
      setTodos(TODO_REPOSITORY.todos);
    }

    load();

    return TODO_REPOSITORY.changes.subscribe(() => {
      setTodos(TODO_REPOSITORY.todos);
    });
  }, []);

  const mutate = useCallback((callback: (repository: TodoRepository) => Promise<void>) => {
    async function mutate() {
      await callback(TODO_REPOSITORY);
    }

    mutate();
  }, []);

  return [todos, mutate]
}