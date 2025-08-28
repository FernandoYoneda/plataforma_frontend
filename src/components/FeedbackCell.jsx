import React from "react";

/**
 * Uso:
 * <FeedbackCell
 *   id={row.id}
 *   initialFeedback={row.response}
 *   onSave={(id, value) => ...} // deve retornar Promise
 * />
 */
export default function FeedbackCell({ id, initialFeedback, onSave }) {
  const [editing, setEditing] = React.useState(!initialFeedback);
  const [value, setValue] = React.useState(initialFeedback || "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSave = async () => {
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      await onSave(id, value.trim());
      setEditing(false);
    } catch (e) {
      setError(e?.message || "Falha ao salvar feedback");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-sm text-gray-700">
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Escreva um feedback/resposta para o solicitante…"
            rows={2}
          />
          <div className="flex items-center gap-2 self-end">
            {error && (
              <span className="text-red-600 text-xs mr-2">{error}</span>
            )}
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm"
              disabled={saving}
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm disabled:opacity-60"
              disabled={saving}
              type="button"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-gray-800">{value || "—"}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:underline"
            type="button"
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
