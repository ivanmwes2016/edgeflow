import { Handle, Position, type NodeProps } from "reactflow";
import type { ServiceType } from "../types/base";

interface ServiceNodeData {
  label: string;
  serviceType: ServiceType;
  port?: number;
  deploying?: boolean;
  deployed?: boolean;
  color: string;
  icon: string;
}

export default function ServiceNode({
  data,
  selected,
}: NodeProps<ServiceNodeData>) {
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
        backgroundColor: `${data.color}60`,
        border: `1.5px solid ${isDeployed ? "#22c55e" : selected ? data.color : data.color}`,
      }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center gap-2">
        <span className="text-lg">{data.icon}</span>
        <div>
          <div className="font-mono text-[13px] font-semibold text-slate-100">
            {data.label}
          </div>
          <div className="mt-0.5 font-mono text-xs text-emerald-400">
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
