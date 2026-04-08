import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "../constants";

interface SimulationPayload {
  nodes: { id: string; label: string; type: string; image: string }[];
  edges: { source: string; target: string }[];
}

export function useSimulation(payload: SimulationPayload) {
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [simVisible, setSimVisible] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  const simulate = useCallback(async () => {
    if (payload.nodes.length === 0) return;

    setDeployLogs([]);
    setSimulating(true);
    setSimVisible(true);

    try {
      const res = await fetch(`${config.API_ENDPOINT}/deploy/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const { jobId } = await res.json();
      const eventSource = new EventSource(
        `${config.API_ENDPOINT}/deploy/stream/${jobId}`,
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (e) => {
        setDeployLogs((prev) => [...prev, e.data]);
      };

      eventSource.addEventListener("done", () => {
        eventSource.close();
        eventSourceRef.current = null;
        setSimulating(false);
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        setSimulating(false);
      };
    } catch (err) {
      console.error("Simulation failed:", err);
      setSimulating(false);
    }
  }, [payload]);

  const close = useCallback(() => setSimVisible(false), []);

  return { deployLogs, simVisible, simulating, simulate, close, setSimVisible };
}
