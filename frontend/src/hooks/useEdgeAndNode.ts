import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  type Edge,
  type Node,
  type Connection,
  type OnEdgesChange,
  addEdge,
  reconnectEdge,
  applyEdgeChanges,
} from "reactflow";

interface Props {
  setNodes: React.Dispatch<
    React.SetStateAction<Node<any, string | undefined>[]>
  >;
}

export default function useEdgeAndNode({ setNodes }: Props) {
  const edgeReconnectSuccessful = useRef(true);

  const [edges, setEdges] = useState<Edge[]>(() => {
    try {
      const stored = localStorage.getItem("flow_edges");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("flow_edges", JSON.stringify(edges));
  }, [edges]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onEdgeDoubleClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, []);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [],
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [],
  );

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [],
  );

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) =>
        eds.filter((ed) => ed.source !== node.id && ed.target !== node.id),
      );
    },
    [setNodes],
  );

  return {
    onConnect,
    onNodeContextMenu,
    onReconnect,
    onReconnectEnd,
    onReconnectStart,
    onEdgeDoubleClick,
    onEdgesChange,
    setEdges,
    edges,
  };
}
