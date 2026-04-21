 import Iconify from "@/components/iconify/iconify";
 import Link from "next/link";
 export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Iconify icon="solar:book-2-bold" className="text-white" width={24} />
          </div>
          <span className="text-white font-bold text-base">NovaLibros</span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            "Catálogo",
            "Sobre nosotros",
            "Términos y condiciones",
            "Política de datos",
            "Contacto",
          ].map(link => (
            <Link
              key={link}
              href="#"
              className="text-slate-400 text-sm hover:text-white transition-colors"
            >
              {link}
            </Link>
          ))}
        </div>

        <span className="text-slate-500 text-sm">© 2025 NovaLibros.</span>
      </div>
    </footer>
  );
}
