"use client";

import dynamic from "next/dynamic";
import { UbicacionPickerMapFallback } from "./ubicacion-picker-map";

const UbicacionPickerMap = dynamic(() => import("./ubicacion-picker-map"), {
  ssr: false,
  loading: () => <UbicacionPickerMapFallback />,
});

export default UbicacionPickerMap;
