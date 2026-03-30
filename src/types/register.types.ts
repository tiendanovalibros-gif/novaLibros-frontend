export type Step = 1 | 2 | 3;

export interface RegisterFormData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  genero: string;
  correo: string;
  usuario: string;
  contrasena: string;
  confirmarContrasena: string;
  direccion: string;
  telefono: string;
  preferencias: string[];
  aceptaTerminos: boolean;
  aceptaDatos: boolean;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormData | "general", string>>;
