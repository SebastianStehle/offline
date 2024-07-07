import { ChangeEvent, FormEvent, useState } from "react";

export interface AddTodoProps {
  onAdd: (title: string) => void;
}

export function AddTodo(props: AddTodoProps) {
  const { onAdd } = props;
  const [title, setTitle] = useState('');

  const doSetTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const doSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title) {
      onAdd(title);
      setTitle('');
    }
  };

  return (
    <div>
      <form className="flex flex-column gap-4" onSubmit={doSubmit}>
        <div className="grow">
          <input type="text" placeholder="Todo" className="input input-bordered w-full"
            value={title} onChange={doSetTitle} />
        </div>
  
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
    </div>
  );
}