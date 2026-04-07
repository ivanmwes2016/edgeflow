import React, { useCallback, useRef } from "react";
import {
  useEdgesState,
  type Edge,
  type Node,
  type Connection,
  addEdge,
  reconnectEdge,
} from "reactflow";

interface Props {
  setNodes: React.Dispatch<
    React.SetStateAction<Node<any, string | undefined>[]>
  >;
}

export default function useEdgeAndNode({ setNodes }: Props) {
  const edgeReconnectSuccessful = useRef(true);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
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
