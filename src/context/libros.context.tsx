"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface Libro {
  id: string;
  titulo: string;
  idAutor: number;
  idGenero: number;
  idEditorial: number;
  anoPublicacion: number;
  precio: number;
  isbn: string;
  idioma: string;
  descripcion?: string;
  imagenPortada?: string;
  estado: string;
}

interface Autor {
  id: number;
  nombre: string;
}

interface Genero {
  id: number;
  nombre: string;
}

interface Editorial {
  id: number;
  nombre: string;
}

interface LibrosContextType {
  libros: Libro[];
  autores: Autor[];
  generos: Genero[];
  editoriales: Editorial[];
  getNombreAutor: (id: number) => string;
  getNombreGenero: (id: number) => string;
  getNombreEditorial: (id: number) => string;
}

const LibrosContext = createContext<LibrosContextType | undefined>(undefined);

export const LibrosProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: LibrosContextType;
}) => {
  return <LibrosContext.Provider value={value}>{children}</LibrosContext.Provider>;
};

export const useLibros = () => {
  const context = useContext(LibrosContext);
  if (!context) {
    return {
      libros: [],
      autores: [],
      generos: [],
      editoriales: [],
      getNombreAutor: () => "",
      getNombreGenero: () => "",
      getNombreEditorial: () => "",
    };
  }
  return context;
};
