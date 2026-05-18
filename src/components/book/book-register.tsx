"use client";

import { useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { apiFetch } from "@/services/api.client";

type SelectOption = {
  id: number;
  nombre: string;
};

type BookRegisterProps = {
  autores: SelectOption[];
  generos: SelectOption[];
  editoriales: SelectOption[];
  idiomaOptions: string[];
  estadoOptions: string[];
  onCreated?: () => void;
};

type BookForm = {
  titulo: string;
  idAutor: string;
  idGenero: string;
  idEditorial: string;
  anoPublicacion: string;
  precio: string;
  isbn: string;
  idioma: string;
  descripcion: string;
  imagenPortada: string;
  estado: string;
};

const requiredFields: Array<{ key: keyof BookForm; message: string }> = [
  { key: "titulo", message: "El título es requerido" },
  { key: "idAutor", message: "Selecciona un autor" },
  { key: "idGenero", message: "Selecciona un género" },
  { key: "idEditorial", message: "Selecciona una editorial" },
  { key: "isbn", message: "El ISBN es requerido" },
  { key: "precio", message: "El precio es requerido" },
];

const getValidationError = (form: BookForm): string => {
  for (const field of requiredFields) {
    const value = form[field.key];
    if (!value.trim()) {
      return field.message;
    }
  }
  const price = Number(form.precio);
  if (Number.isNaN(price) || price < 10000) {
    return "El precio minimo es 10000";
  }

  const year = Number(form.anoPublicacion);
  const currentYear = new Date().getFullYear();
  if (Number.isNaN(year) || year > currentYear) {
    return "El año de publicacion debe ser menor o igual al año actual";
  }
  return "";
};

const payloadCrear = (form: BookForm) => ({
  titulo: form.titulo,
  idAutor: Number(form.idAutor),
  idGeneros: [Number(form.idGenero)],
  idEditorial: Number(form.idEditorial),
  anoPublicacion: Number(form.anoPublicacion || new Date().getFullYear()),
  precio: Number(form.precio),
  isbn: form.isbn,
  idioma: form.idioma,
  descripcion: form.descripcion,
  imagenPortada: form.imagenPortada,
  estado: form.estado,
});

const getInitialBookForm = (idiomaOptions: string[], estadoOptions: string[]): BookForm => ({
  titulo: "",
  idAutor: "",
  idGenero: "",
  idEditorial: "",
  anoPublicacion: String(new Date().getFullYear()),
  precio: "",
  isbn: "",
  idioma: idiomaOptions[0] ?? "",
  descripcion: "",
  imagenPortada: "",
  estado: estadoOptions[0] ?? "",
});

export default function BookRegister({
  autores,
  generos,
  editoriales,
  idiomaOptions,
  estadoOptions,
  onCreated,
}: BookRegisterProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [bookForm, setBookForm] = useState<BookForm>(() =>
    getInitialBookForm(idiomaOptions, estadoOptions)
  );

  const openDialog = () => {
    setBookForm(getInitialBookForm(idiomaOptions, estadoOptions));
    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormError("");
  };

  const setF = (key: keyof BookForm, value: string) =>
    setBookForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const validationError = getValidationError(bookForm);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await apiFetch("/libros", {
        method: "POST",
        body: JSON.stringify(payloadCrear(bookForm)),
      });
      closeDialog();
      onCreated?.();
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={openDialog}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <Iconify icon="ic:baseline-plus" />
        Agregar libro
      </button>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeDialog}
          />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-slate-900 font-bold text-lg">Agregar nuevo libro</h3>
              <button
                onClick={closeDialog}
                className="inline-flex h-8 w-8 items-center justify-center text-slate-400 leading-none transition-colors hover:text-slate-600"
              >
                <Iconify icon="material-symbols:close" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-4">
                {formError && (
                  <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Título *
                  </label>
                  <input
                    value={bookForm.titulo}
                    onChange={e => setF("titulo", e.target.value)}
                    placeholder="Nombre del libro"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Autor *
                    </label>
                    <select
                      value={bookForm.idAutor}
                      onChange={e => setF("idAutor", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                    >
                      <option value="">Seleccionar autor...</option>
                      {autores.map(autor => (
                        <option key={autor.id} value={String(autor.id)}>
                          {autor.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Género *
                    </label>
                    <select
                      value={bookForm.idGenero}
                      onChange={e => setF("idGenero", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                    >
                      <option value="">Seleccionar género...</option>
                      {generos.map(genero => (
                        <option key={genero.id} value={String(genero.id)}>
                          {genero.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Editorial *
                    </label>
                    <select
                      value={bookForm.idEditorial}
                      onChange={e => setF("idEditorial", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                    >
                      <option value="">Seleccionar editorial...</option>
                      {editoriales.map(editorial => (
                        <option key={editorial.id} value={String(editorial.id)}>
                          {editorial.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Idioma
                    </label>
                    <select
                      value={bookForm.idioma}
                      onChange={e => setF("idioma", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                    >
                      {idiomaOptions.map(idioma => (
                        <option key={idioma} value={idioma}>
                          {idioma}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Año publicación
                    </label>
                    <input
                      type="number"
                      value={bookForm.anoPublicacion}
                      onChange={e => setF("anoPublicacion", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Precio (COP) *
                    </label>
                    <input
                      type="number"
                      value={bookForm.precio}
                      onChange={e => setF("precio", e.target.value)}
                      placeholder="45000"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Estado
                    </label>
                    <select
                      value={bookForm.estado}
                      onChange={e => setF("estado", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                    >
                      {estadoOptions.map(estado => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    ISBN *
                  </label>
                  <input
                    value={bookForm.isbn}
                    onChange={e => setF("isbn", e.target.value)}
                    placeholder="978-0000000000"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    URL imagen portada
                  </label>
                  <input
                    value={bookForm.imagenPortada}
                    onChange={e => setF("imagenPortada", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={bookForm.descripcion}
                    onChange={e => setF("descripcion", e.target.value)}
                    rows={3}
                    placeholder="Sinopsis del libro..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Guardando..." : "Guardar libro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
