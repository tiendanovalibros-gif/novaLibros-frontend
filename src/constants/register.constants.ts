import type { RegisterFormData } from "@/types/register.types";

export const GENEROS_LITERARIOS = [
  "Ficcion",
  "No ficcion",
  "Ciencia ficcion",
  "Fantasy",
  "Romance",
  "Thriller",
  "Terror",
  "Historia",
  "Biografia",
  "Autoayuda",
  "Ciencia",
  "Filosofia",
  "Poesia",
  "Infantil",
  "Juvenil",
];

export const STEPS = [
  { num: 1, label: "Datos personales" },
  { num: 2, label: "Cuenta" },
  { num: 3, label: "Preferencias" },
];

export const INITIAL_FORM: RegisterFormData = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  lugarNacimiento: "",
  genero: "",
  correo: "",
  usuario: "",
  contrasena: "",
  confirmarContrasena: "",
  direccion: "",
  telefono: "+57 ",
  preferencias: [],
  aceptaTerminos: false,
  aceptaDatos: false,
};

export const PASSWORD_ALLOWED_REGEX = /^[a-z0-9 !"#$%&'()*+,\-./:;<=>?@\[\]\\\^_`{|}~]+$/;
export const PASSWORD_LOWER_REGEX = /[a-z]/;
export const PASSWORD_NUMBER_REGEX = /[0-9]/;
export const PASSWORD_SYMBOL_REGEX = /[ !"#$%&'()*+,\-./:;<=>?@\[\]\\\^_`{|}~]/;
