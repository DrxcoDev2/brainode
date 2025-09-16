"use client";
import { SidebarDemo } from "@/components/slidebar-demo";
import { useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  const handlerFunc = async () => {
    try {
      const res = await fetch("http://localhost:2000/conversations", {
        cache: "no-store",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Error al obtener conversaciones");

      const json = await res.json();

      // Soportar dos tipos de respuesta
      const conversations = Array.isArray(json)
        ? json
        : json.conversations || [];

      setData(conversations);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <SidebarDemo>
        <div className="flex flex-1">
          <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
            <button
              className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              onClick={handlerFunc}
            >
              Get Conversations
            </button>

            <div className="mt-4 space-y-2">
              {data.length > 0 ? (
                data.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2 rounded border border-neutral-300 dark:border-neutral-600"
                  >
                    {item.name}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay conversaciones aún.</p>
              )}
            </div>
          </div>
        </div>
      </SidebarDemo>
    </div>
  );
}
