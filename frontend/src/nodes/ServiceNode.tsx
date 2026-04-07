import { Handle, Position, type NodeProps } from "reactflow";
import type { ServiceType } from "../types/base";
import { SERVICE_CONFIGS } from "../static/data";

interface ServiceNodeData {
  label: string;
  serviceType: ServiceType;
  port?: number;
  deploying?: boolean;
  deployed?: boolean;
}

export default function ServiceNode({
  data,
  selected,
}: NodeProps<ServiceNodeData>) {
  const cfg = SERVICE_CONFIGS[data.serviceType] || SERVICE_CONFIGS.api;
  const isDeploying = data.deploying;
  const isDeployed = data.deployed;

  return (
    <div
      className={[
        "relative min-w-35 cursor-grab rounded-xl px-4 py-3 transition-[border-color,box-shadow] duration-200",
        isDeploying ? "node-deploying" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: cfg.color,
        border: `1.5px solid ${isDeployed ? "#22c55e" : selected ? cfg.border : cfg.border + "88"}`,
        boxShadow: selected
          ? `0 0 16px ${cfg.glow}`
          : isDeployed
            ? "0 0 12px rgba(34,197,94,0.4)"
            : "none",
      }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center gap-2">
        <span className="text-lg">{cfg.icon}</span>
        <div>
          <div className="font-mono text-[13px] font-semibold text-slate-100">
            {data.label}
          </div>
          <div
            className="mt-0.5 font-mono text-[10px]"
            style={{ color: cfg.border }}>
            {data.serviceType}
            {data.port ? `:${data.port}` : ""}
          </div>
        </div>
        {isDeployed && (
          <div className="ml-auto size-2 rounded-full bg-green-500" />
        )}
      </div>
    </div>
  );
}
