export interface LibroAgotado {
  idLibro: string;
  titulo: string;
  isbn: string;
  autor: { id: number; nombre: string };
  editorial: { id: number; nombre: string };
  imagenPortada?: string | null;
  totalDisponible: number;
  totalBloqueada: number;
  tiendasAfectadas: number;
  ultimaActualizacion: string;
}

export interface InventarioAgotadoAdmin {
  idInventario: number;
  idTienda: number;
  nombreTienda: string;
  cantidadDisponible: number;
  cantidadBloqueada: number;
  fechaActualizacion: string;
}

export interface LibroAgotadoAdmin {
  idLibro: string;
  titulo: string;
  isbn: string;
  autor: { id: number; nombre: string };
  editorial: { id: number; nombre: string };
  totalDisponible: number;
  totalBloqueada: number;
  ultimaActualizacion: string;
  inventarios: InventarioAgotadoAdmin[];
}
