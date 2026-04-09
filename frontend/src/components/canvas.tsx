import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type OnNodesChange,
  type Node,
} from "reactflow";
import ToolBar from "./toolBar";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AISuggestion } from "../types/base";
import SimPanel from "./SimPanel";
import AIPanel from "./AiPanel";
import { config } from "../constants";
import ConfigModal from "./ConfigModal";
import { useSimulation } from "../hooks/useSimulation";
import useEdgeAndNode from "../hooks/useEdgeAndNode";
import ServiceNode from "../nodes/ServiceNode";

interface Props {
  onNodesChange: OnNodesChange;
  setNodes: React.Dispatch<
    React.SetStateAction<Node<any, string | undefined>[]>
  >;
  nodes: Node[];
}

const nodeTypes = { service: ServiceNode };

export default function Canvas({ onNodesChange, setNodes, nodes }: Props) {
  const [yamlConfig, setYamlConfig] = useState("");
  const [configVisible, setConfigVisible] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const {
    edges,
    setEdges,
    onConnect,
    onEdgeDoubleClick,
    onNodeContextMenu,
    onReconnect,
    onEdgesChange,
    onReconnectEnd,
    onReconnectStart,
  } = useEdgeAndNode({ setNodes });

  const getPayload = useCallback(
    () => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        type: n.data.serviceType,
        image: n.data.image,
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    }),
    [nodes, edges],
  );

  const { deployLogs, simVisible, simulating, simulate, setSimVisible } =
    useSimulation(getPayload());

  const handleGenerate = async () => {
    const payload = getPayload();
    try {
      const res = await fetch(`${config.API_ENDPOINT}/deploy/generate`, {
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
    const payload = getPayload();
    try {
      const res = await fetch(`${config.API_ENDPOINT}/ai/suggest`, {
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

  useEffect(() => () => eventSourceRef.current?.close(), []);

  return (
    <div className=" flex-1 flex flex-col h-full">
      <ToolBar
        onSimulate={simulate}
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
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-700">
              <div className="mb-3 text-[40px]">⬡</div>
              <div className="font-mono text-base text-slate-500">
                Add services from the left panel
              </div>
              <div className="mt-1.5 text-xs text-slate-700">
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
