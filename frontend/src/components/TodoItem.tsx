import { Todo } from "../model/todo";

export interface TodoItemProps {
  todo: Todo;

  onComplete: (todo: Todo) => void;
}

export function TodoItem(props: TodoItemProps) {
  const { onComplete, todo } = props;

  return (
    <div className="border-[1px] border-gray-150 rounded-lg p-4">
      <div className="flex flex-column gap-4">
        <input type="checkbox" checked={todo.isCompleted} onChange={() => onComplete(todo)} disabled={todo.isCompleted} className="checkbox" />

        {todo.title}
      </div>
    </div>
  )
}