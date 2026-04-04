import { ReactFlowProvider } from "reactflow";
import "./App.css";
import Flow from "./components/flow";
import "reactflow/dist/style.css";

function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default App;
