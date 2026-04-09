import { useCallback, useRef, useState, useEffect } from "react";
import Canvas from "./canvas";
import SideBar from "./sideBar";
import type { IService } from "../types/base";
import { applyNodeChanges, type Node, type OnNodesChange } from "reactflow";

export default function Flow() {
  const [nodes, setNodes] = useState<Node[]>(() => {
    try {
      const stored = localStorage.getItem("flow_nodes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Here we seed noded id so we dong have any id's clushing
  const nodeId = useRef(
    nodes.reduce((max, n) => {
      const num = parseInt(n.id.replace("node_", ""));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0),
  );

  useEffect(() => {
    localStorage.setItem("flow_nodes", JSON.stringify(nodes));
  }, [nodes]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const buildId = () => `node_${++nodeId.current}`;

  const getAvailablePort = (basePort: number, nodes: Node[]) => {
    let port = basePort;
    while (nodes.some((i) => i.data.port === port)) {
      port++;
    }
    return port;
  };

  const addService = useCallback(
    (service: IService) => {
      setNodes((currentNodes) => {
        const availablePort = getAvailablePort(service.port, currentNodes);
        const newNode: Node = {
          id: buildId(),
          type: "service",
          position: {
            x: 220 + Math.random() * 300,
            y: 80 + Math.random() * 200,
          },
          data: {
            label: service.label,
            serviceType: service.type,
            port: availablePort,
            image: service.image,
            color: service.color,
            icon: service.icon,
          },
        };
        return [...currentNodes, newNode];
      });
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
