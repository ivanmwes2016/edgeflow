import { SERVICE_CONFIGS } from "../static/data";
import type { ServiceType } from "../types/base";

interface Props {
  onAdd: (type: ServiceType) => void;
  title: string;
  description: string;
}

export default function SideBar({ onAdd, title, description }: Props) {
  return (
    <div className="w-50 border-r border-r-gray-700 flex flex-col p-4">
      <div className=" py-4 border-b border-b-gray-700 ">
        <div className="text-sky-500 font-black text-xl">{title}</div>
        <div className="text-sm">{description}</div>
      </div>

      <div className="pt-4">
        <div className="text-xs py-4">SERVICES</div>

        {Object.entries(SERVICE_CONFIGS).map(([type, cfg], idx) => (
          <button
            onClick={() => onAdd(type as ServiceType)}
            key={idx}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                cfg.color;
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                cfg.border;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                `${cfg.border}22`;
            }}
            className={`w-full flex gap-2 text-left mb-2 p-2 cursor-pointer rounded-lg transition-all border border-[${cfg.border}]`}>
            <div>{cfg.icon}</div>
            <div className="text-white">
              <div className="text-sm font-bold">{cfg.label}</div>
              <div
                style={{
                  fontSize: 10,
                  color: cfg.border,
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                {cfg.defaultImage.split(":")[0]}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className=" border-t border-t-gray-700 mt-auto">
        <div className=" text-xs leading-5 text-gray-600">
          ==== To improve ====
          <br />
          Click to add services.
          <br />
          Drag to connect.
          <br />
          Right-click to delete.
        </div>
      </div>
    </div>
  );
}
