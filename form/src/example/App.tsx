import { useState } from "react";
import { Minimal } from "./Minimal";

const exampleComponents: Record<string, () => JSX.Element> = { Minimal };
const examples = Object.keys(exampleComponents);

export function App() {
  const [example, setExample] = useState("Minimal");
  const Component = exampleComponents[example];
  if (!Component) throw new Error("Invalid Component");
  return (
    <div>
      Select an example:
      <select value={examples[0]} onChange={(e) => setExample(e.target.value)}>
        {examples.map((example) => (
          <option value={example}>{example}</option>
        ))}
      </select>
      <div className="rounded-lg p-2 border shadow mt-4">
        <Component />
      </div>
    </div>
  );
}
