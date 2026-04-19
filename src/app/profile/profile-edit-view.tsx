"use client";

import { useEffect } from "react";
import Iconify from "@/components/iconify/iconify";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import type { Usuario } from "@/services/auth.service";

type ProfileEditViewProps = {
	open: boolean;
	onClose: () => void;
	user: Usuario;
	onSaved?: () => void;
};

export default function ProfileEditView({ open, onClose, user, onSaved }: ProfileEditViewProps) {
	const { correo, setCorreo, telefono, setTelefono, direccion, setDireccion, error, saving, handleSubmit } =
		useProfileEdit({
			user,
			open,
			onSuccess: () => {
				onSaved?.();
				onClose();
			},
		});

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open) return null;

	const inputClass =
		"w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
			<div
				className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl"
				onClick={event => event.stopPropagation()}
			>
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
					<div>
						<h3 className="text-lg font-bold text-slate-900">Editar informacion</h3>
						<p className="text-xs text-slate-500">
							Actualiza tu correo, telefono y direccion.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600"
						aria-label="Cerrar"
					>
						<Iconify icon="material-symbols:close-rounded" width={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
							{error}
						</div>
					)}

					<div>
						<label className="mb-2 block text-[14px] font-semibold text-slate-900">
							Correo electronico
						</label>
						<div className="relative">
							<Iconify
								icon="ic:outline-email"
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							/>
							<input
								type="email"
								value={correo}
								onChange={event => setCorreo(event.target.value)}
								placeholder="tucorreo@ejemplo.com"
								className={`${inputClass} pl-10`}
							/>
						</div>
					</div>

					<div>
						<label className="mb-2 block text-[14px] font-semibold text-slate-900">Telefono</label>
						<div className="relative">
							<Iconify
								icon="solar:phone-bold"
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							/>
							<input
								type="tel"
								value={telefono}
								onChange={event => setTelefono(event.target.value)}
								placeholder="3001234567"
								className={`${inputClass} pl-10`}
							/>
						</div>
					</div>

					<div>
						<label className="mb-2 block text-[14px] font-semibold text-slate-900">Direccion</label>
						<textarea
							value={direccion}
							onChange={event => setDireccion(event.target.value)}
							placeholder="Calle 123"
							rows={3}
							className={inputClass}
						/>
					</div>

					<div className="flex flex-wrap justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={saving}
							className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
						>
							{saving ? "Guardando..." : "Guardar cambios"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
