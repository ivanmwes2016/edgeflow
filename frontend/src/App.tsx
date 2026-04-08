import { ReactFlowProvider } from "reactflow";
import "./App.css";
import Flow from "./components/flow";
import "reactflow/dist/style.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </QueryClientProvider>
  );
}

export default App;
