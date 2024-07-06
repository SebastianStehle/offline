import { Todos } from "./components/Todos";

export function App() {
  return (
    <div className="py-12">
      <div className="card bg-base-100 w-[1000px] mx-auto shadow-xl">
        <div className="card-body">
          <Todos />
        </div>
      </div>
    </div>
  );
}