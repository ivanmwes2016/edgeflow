import { useCallback, useRef } from "react";
import Canvas from "./canvas";
import SideBar from "./sideBar";
import type { ServiceType } from "../types/base";
import { SERVICE_CONFIGS } from "../static/data";
import { useNodesState, type Node } from "reactflow";

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const nodeId = useRef(0);
  const buildId = () => `node_${++nodeId.current}`;

  const addService = useCallback(
    (type: ServiceType) => {
      const cfg = SERVICE_CONFIGS[type];
      const newNode: Node = {
        id: buildId(),
        type: "service",
        position: { x: 220 + Math.random() * 300, y: 80 + Math.random() * 200 },
        data: { label: cfg.label, serviceType: type, port: cfg.defaultPort },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <SideBar
        title="EDGE FLOW"
        description="DEPLOYMENT DESIGNER"
        onAdd={addService}
      />
      <Canvas nodes={nodes} onNodesChange={onNodesChange} setNodes={setNodes} />
    </div>
  );
}
