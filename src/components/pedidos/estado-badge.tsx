interface Props {
  estado: string;
}

const config: Record<string, { label: string; color: string }> = {
  en_preparacion: { label: "En preparación", color: "bg-amber-100 text-amber-700" },
  enviado: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
  entregado: { label: "Entregado", color: "bg-green-100 text-green-700" },
  solicitada: { label: "Devolución solicitada", color: "bg-orange-100 text-orange-700" },
  aprobada: { label: "Devolución aprobada", color: "bg-purple-100 text-purple-700" },
  rechazada: { label: "Devolución rechazada", color: "bg-red-100 text-red-700" },
};

export default function EstadoBadge({ estado }: Props) {
  const { label, color } = config[estado] ?? {
    label: estado,
    color: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
