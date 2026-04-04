import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeChange,
  type OnEdgesChange,
  type OnNodesChange,
  type Node,
  type Connection,
  addEdge,
} from "reactflow";
import ToolBar from "./toolBar";
import { useCallback, useRef, useState } from "react";
import type { AISuggestion, SimStep } from "../types/base";
import ServiceNode from "../nodes/ServiceNode";

const nodeTypes = { service: ServiceNode };

interface Props {
  onNodesChange: OnNodesChange;
  setNodes: React.Dispatch<
    React.SetStateAction<Node<any, string | undefined>[]>
  >;
  nodes: Node[];
}

export default function Canvas({ onNodesChange, setNodes, nodes }: Props) {
  const [simSteps, setSimSteps] = useState<SimStep[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [simVisible, setSimVisible] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [yamlConfig, setYamlConfig] = useState("");
  const [configVisible, setConfigVisible] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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

  return (
    <div className=" flex-1 flex flex-col h-full">
      <ToolBar
        onSimulate={function (): void {
          throw new Error("Function not implemented.");
        }}
        onGenerate={function (): void {
          throw new Error("Function not implemented.");
        }}
        onAnalyse={function (): void {
          throw new Error("Function not implemented.");
        }}
        onClear={function (): void {
          throw new Error("Function not implemented.");
        }}
        nodeCount={0}
        simulating={false}
      />

      <div ref={reactFlowWrapper} className="flex-1 relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
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
      </div>
    </div>
  );
}
