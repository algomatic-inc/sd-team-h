import { Button } from "@/components/ui/button";
import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-full min-w-full">
      <nav className="bg-gray-800">
      </nav>
      <header className="border-b flex h-14 px-4">hoge</header>
      <Button onClick={() => setCount((count) => count + 1)}>Increment</Button>
      <div>{count}</div>
    </div>
  );
}

export default App;
