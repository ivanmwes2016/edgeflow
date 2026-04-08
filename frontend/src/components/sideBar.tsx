import { useQuery } from "@tanstack/react-query";
import type { IService } from "../types/base";
import { config } from "../constants";

interface Props {
  onAdd: (type: IService) => void;
  title: string;
  description: string;
}

export default function SideBar({ onAdd, title, description }: Props) {
  const { data, isLoading, isError } = useQuery<IService[]>({
    queryKey: ["services"],
    queryFn: () =>
      fetch(`${config.API_ENDPOINT}/services`).then((r) => r.json()),
  });

  if (!data)
    return (
      <div className="w-50 border-r border-r-gray-700 flex flex-col p-4">
        No data, check if the server is running
      </div>
    );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className=" text-white">Error loading services</p>;

  return (
    <div className="w-50 border-r border-r-gray-700 flex flex-col p-4">
      <div className=" py-4 border-b border-b-gray-700 ">
        <div className="text-sky-500 font-black text-xl">{title}</div>
        <div className="text-sm">{description}</div>
      </div>

      <div className="pt-4">
        <div className="text-xs py-4">SERVICES</div>

        {data.map((sv) => (
          <button
            onClick={() => onAdd(sv)}
            key={sv.id}
            style={{ borderColor: sv.color }}
            className={`w-full flex gap-2 text-left mb-2 p-2 cursor-pointer rounded-lg transition-all border hover:bg-white/20`}>
            <div>{sv.icon}</div>
            <div className="text-white">
              <div className="text-sm font-bold">{sv.label}</div>
              <div
                style={{
                  fontSize: 10,
                  color: sv.color,
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                {sv.image.split(":")[0]}
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
