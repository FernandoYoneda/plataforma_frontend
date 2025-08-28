// src/components/StatusBadge.jsx
import React from "react";

export default function StatusBadge({ status = "aberto", className = "" }) {
  const map = {
    aberto: "bg-gray-100 text-gray-800",
    em_andamento: "bg-amber-100 text-amber-800",
    finalizado: "bg-emerald-100 text-emerald-800",
  };
  const label = String(status).replace("_", " ");
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        map[status] || map.aberto
      } ${className}`}
    >
      {label}
    </span>
  );
}
