import React from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardSection,
  PageHeader,
  Input,
  TextArea,
  PrimaryButton,
  EmptyState,
} from "../../components/ui";

export default function OrderForm() {
  const settings = useSelector((s) => s.settings);
  const [item, setItem] = React.useState("");
  const [qty, setQty] = React.useState(1);
  const [obs, setObs] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const ready = settings?.sector && settings?.nameOrStore;

  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: settings.sector,
          nameOrStore: settings.nameOrStore,
          item: item.trim(),
          quantity: Number(qty) || 1,
          note: obs.trim(),
        }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => null))?.error || "Falha ao enviar"
        );
      setItem("");
      setQty(1);
      setObs("");
      alert("Pedido enviado!");
    } catch (e) {
      alert(e.message || "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Novo Pedido de Materiais"
        subtitle="Informe o item, quantidade e observações. Seu setor e nome são preenchidos automaticamente."
      />

      {!ready ? (
        <Card>
          <CardSection>
            <EmptyState
              title="Configure seu perfil"
              subtitle="Vá em Configurações e informe Setor e Nome."
            />
          </CardSection>
        </Card>
      ) : (
        <Card>
          <CardSection title="Dados do solicitante">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Setor" value={settings.sector} disabled />
              <Input
                label="Nome / Loja"
                value={settings.nameOrStore}
                disabled
              />
            </div>
          </CardSection>

          <div className="border-t border-gray-200" />

          <CardSection title="Detalhes do pedido">
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Item"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  required
                />
                <Input
                  label="Quantidade"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
              <TextArea
                label="Observações"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar pedido"}
                </PrimaryButton>
              </div>
            </form>
          </CardSection>
        </Card>
      )}
    </div>
  );
}
