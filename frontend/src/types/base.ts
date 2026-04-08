export type ServiceType =
  | "web"
  | "api"
  | "database"
  | "cache"
  | "gateway"
  | "worker";

export interface ServiceNode {
  id: string;
  type: ServiceType;
  label: string;
  port?: number;
  image?: string;
  env?: Record<string, string>;
}

export interface SimStep {
  nodeId: string;
  nodeLabel: string;
  message: string;
  status: "running" | "success" | "error";
  stepIndex: number;
}

export interface AISuggestion {
  type: "info" | "warning" | "success";
  message: string;
}

export interface IServiceConfig {
  label: string;
  color: string;
  border: string;
  glow: string;
  defaultPort?: number;
  defaultImage: string;
  icon: string;
}

export interface IService {
  id: number;
  type: string;
  label: string;
  port: number;
  image: string;
  icon: string;
  color: string;
}
