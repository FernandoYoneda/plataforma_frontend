import React from "react";

export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
      <div className="relative px-5 sm:px-8 py-8 text-white flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-white/90">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardSection({ title, children, right }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        )}
        {right}
      </div>
      {children}
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      <input
        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      <select
        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function TextArea({ label, rows = 3, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      <textarea
        rows={rows}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        {...props}
      />
    </label>
  );
}

export function StatusBadge({ status }) {
  const map = {
    aberto: "bg-gray-100 text-gray-800",
    em_andamento: "bg-amber-100 text-amber-800",
    finalizado: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {(status || "—").replace("_", " ")}
    </span>
  );
}

export function EmptyState({ title = "Nada por aqui", subtitle }) {
  return (
    <div className="text-center py-10">
      <div className="mx-auto h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
        <div className="h-5 w-5 rounded-full bg-gray-300" />
      </div>
      <p className="font-medium text-gray-900">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
