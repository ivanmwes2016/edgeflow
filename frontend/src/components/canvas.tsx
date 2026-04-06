import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  type Edge,
  type OnNodesChange,
  type Node,
  type Connection,
  addEdge,
  reconnectEdge,
} from "reactflow";
import ToolBar from "./toolBar";
import { useCallback, useRef, useState } from "react";
import type { AISuggestion, ServiceType } from "../types/base";
import ServiceNode from "../nodes/ServiceNode";
import { SERVICE_CONFIGS } from "../static/data";
import SimPanel from "./SimPanel";
import ConfigModal from "./configModal";
import AIPanel from "./AiPanel";
import { config } from "../constants";

const nodeTypes = { service: ServiceNode };

interface Props {
  onNodesChange: OnNodesChange;
  setNodes: React.Dispatch<
    React.SetStateAction<Node<any, string | undefined>[]>
  >;
  nodes: Node[];
}

export default function Canvas({ onNodesChange, setNodes, nodes }: Props) {
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deploying, setDeploying] = useState<boolean>();
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [simVisible, setSimVisible] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [yamlConfig, setYamlConfig] = useState("");
  const [configVisible, setConfigVisible] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const edgeReconnectSuccessful = useRef(true);

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      console.log("heloor");
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges],
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) =>
        eds.filter((ed) => ed.source !== node.id && ed.target !== node.id),
      );
    },
    [setNodes, setEdges],
  );

  const handleSimulate = async () => {
    if (nodes.length === 0) return;
    setSimulating(true);
    setSimVisible(true);

    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        type: n.data.serviceType,
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    };

    try {
      const res = await fetch(`${config.API_ENDPOINT}/deploy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { jobId } = await res.json();

      const eventSource = new EventSource(
        `${config.API_ENDPOINT}/deploy/stream/${jobId}`,
      );

      eventSource.onmessage = (e) => {
        setDeployLogs((prev) => [...prev, e.data]);
      };

      eventSource.addEventListener("done", () => {
        eventSource.close();
        setDeploying(false);
      });

      eventSource.onerror = () => {
        eventSource.close();
        setDeploying(false);
      };
    } catch {
      throw new Error("Server not running");
    }
    setSimulating(false);
  };

  const handleGenerate = async () => {
    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.serviceType,
        label: n.data.label,
        port: n.data.port,
        image: SERVICE_CONFIGS[n.data.serviceType as ServiceType]?.defaultImage,
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    };
    try {
      const res = await fetch("/api/config/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const yaml = await res.text();
      setYamlConfig(yaml);
    } catch {
      console.error("Cant create config due a network error");
    }
    setConfigVisible(true);
  };

  const handleAnalyse = async () => {
    setAiVisible(true);
    setAiLoading(true);
    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.serviceType,
        label: n.data.label,
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    };
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions);
    } catch {
      setAiSuggestions([
        {
          type: "info",
          message: "Start the FastAPI backend to enable live AI analysis.",
        },
      ]);
    }
    setAiLoading(false);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSimVisible(false);
    setAiVisible(false);
    setConfigVisible(false);
  };

  return (
    <div className=" flex-1 flex flex-col h-full">
      <ToolBar
        onSimulate={handleSimulate}
        onGenerate={handleGenerate}
        onAnalyse={handleAnalyse}
        onClear={handleClear}
        nodeCount={nodes.length}
        simulating={simulating}
      />

      <div ref={reactFlowWrapper} className="flex-1 relative h-full">
        <ReactFlow
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          edgesUpdatable={true}
          edgesFocusable={true}
          selectNodesOnDrag={false}
          fitView
          deleteKeyCode="Delete">
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1e293b"
          />
          <Controls />
        </ReactFlow>
        {nodes.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}>
            <div style={{ textAlign: "center", color: "#334155" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
              <div
                style={{
                  fontSize: 16,
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#475569",
                }}>
                Add services from the left panel
              </div>
              <div style={{ fontSize: 12, marginTop: 6, color: "#334155" }}>
                Connect them by dragging between handles
              </div>
            </div>
          </div>
        )}

        <SimPanel
          steps={deployLogs}
          visible={simVisible}
          onClose={() => setSimVisible(false)}
        />

        <ConfigModal
          yaml={yamlConfig}
          visible={configVisible}
          onClose={() => setConfigVisible(false)}
        />

        <AIPanel
          suggestions={aiSuggestions}
          visible={aiVisible}
          loading={aiLoading}
          onClose={() => setAiVisible(false)}
        />
      </div>
    </div>
  );
}
