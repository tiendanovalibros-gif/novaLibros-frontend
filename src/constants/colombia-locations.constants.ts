export const DEPARTAMENTOS_CIUDADES: Record<string, string[]> = {
  Amazonas: ["Leticia"],
  Antioquia: ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro"],
  Arauca: ["Arauca"],
  Atlantico: ["Barranquilla", "Soledad", "Malambo"],
  "Bogota D.C.": ["Bogota"],
  Bolivar: ["Cartagena", "Magangue", "Turbaco"],
  Boyaca: ["Tunja", "Duitama", "Sogamoso", "Chiquinquira"],
  Caldas: ["Manizales", "La Dorada", "Chinchina"],
  Caqueta: ["Florencia"],
  Casanare: ["Yopal"],
  Cauca: ["Popayan", "Santander de Quilichao"],
  Cesar: ["Valledupar", "Aguachica"],
  Choco: ["Quibdo"],
  Cordoba: ["Monteria", "Cerete", "Sahagun"],
  Cundinamarca: ["Soacha", "Facatativa", "Chia", "Zipaquira", "Girardot", "Fusagasuga"],
  Guainia: ["Inirida"],
  Guaviare: ["San Jose del Guaviare"],
  Huila: ["Neiva", "Pitalito"],
  "La Guajira": ["Riohacha", "Maicao"],
  Magdalena: ["Santa Marta", "Cienaga"],
  Meta: ["Villavicencio", "Acacias", "Granada"],
  Narino: ["Pasto", "Ipiales", "Tumaco"],
  "Norte de Santander": ["Cucuta", "Ocana", "Pamplona"],
  Putumayo: ["Mocoa"],
  Quindio: ["Armenia", "Montenegro", "La Tebaida"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andres y Providencia": ["San Andres"],
  Santander: ["Bucaramanga", "Floridablanca", "Giron", "Piedecuesta", "Barrancabermeja"],
  Sucre: ["Sincelejo"],
  Tolima: ["Ibague", "Espinal", "Melgar"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tulua", "Buga", "Yumbo"],
  Vaupes: ["Mitu"],
  Vichada: ["Puerto Carreno"],
};

export const DEPARTAMENTO_OTROS = "Otros";

export function normalizeUbicacionTexto(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function encontrarDepartamentoPorCiudad(ciudad: string): string | null {
  const ciudadNormalizada = normalizeUbicacionTexto(ciudad);

  for (const [departamento, ciudades] of Object.entries(DEPARTAMENTOS_CIUDADES)) {
    const coincide = ciudades.some(
      ciudadCatalogo => normalizeUbicacionTexto(ciudadCatalogo) === ciudadNormalizada
    );

    if (coincide) {
      return departamento;
    }
  }

  return null;
}
