import { ChangeEvent, FormEvent, KeyboardEvent, useState } from "react";
import { Todo } from "../model/todo";

export interface TodoItemProps {
  todo: Todo;

  onComplete: (todo: Todo) => void;

  onRename: (todo: Todo, title: string) => void;

  onDelete: (todo: Todo) => void;
}

export function TodoItem(props: TodoItemProps) {
  const { onComplete, onDelete, onRename, todo } = props;
  const [editTitle, setEditTitle] = useState("");
  const [editing, setEditing] = useState(false);

  const doStartEdit = () => {
    setEditTitle(todo.title);
    setEditing(true);
  };

  const doStopEdit = () => {
    setEditTitle("");
    setEditing(false);
  };

  const doCancel = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      doStopEdit();
    }
  };

  const doDelete = () => {
    onDelete(todo);
  };

  const doSetTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setEditTitle(event.target.value);
  };

  const doSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editTitle) {
      onRename(todo, editTitle);
    }

    doStopEdit();
  };

  return (
    <div className="border-[1px] border-gray-150 rounded-lg px-4 py-2 group">
      <div className="flex flex-column items-center gap-4">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onComplete(todo)}
          disabled={todo.isCompleted}
          className="checkbox"
        />

        <div
          className="h-12 flex grow items-center"
          onDoubleClick={doStartEdit}
        >
          {!editing ? (
            <>{todo.title}</>
          ) : (
            <form className="w-full" onSubmit={doSubmit}>
              <input
                type="text"
                placeholder="Todo"
                className="input input-bordered w-full"
                value={editTitle}
                onChange={doSetTitle}
                onBlur={doStopEdit}
                onKeyDown={doCancel}
                autoFocus
              />
            </form>
          )}
        </div>

        {!editing && (
          <button
            className="btn btn-error btn-sm btn-square text-white invisible group-hover:visible"
            onClick={doDelete}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-trash"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
