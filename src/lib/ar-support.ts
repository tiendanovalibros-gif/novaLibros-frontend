export interface ArSupportResult {
  supported: boolean;
  reason: string;
}

function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/** Comprueba si el dispositivo/navegador puede usar la vista AR (cámara + WebGL). */
export function checkArSupport(): ArSupportResult {
  if (typeof window === "undefined") {
    return {
      supported: false,
      reason: "La comprobación de compatibilidad solo está disponible en el navegador.",
    };
  }

  if (!window.isSecureContext) {
    return {
      supported: false,
      reason:
        "La realidad aumentada requiere una conexión segura (HTTPS). Abre el sitio con https:// o desde localhost.",
    };
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      supported: false,
      reason:
        "Tu navegador o dispositivo no permite acceder a la cámara. Prueba con Chrome o Safari en un teléfono o tablet.",
    };
  }

  if (!hasWebGL()) {
    return {
      supported: false,
      reason:
        "Tu dispositivo no soporta gráficos 3D (WebGL), necesarios para mostrar el libro en realidad aumentada.",
    };
  }

  return { supported: true, reason: "" };
}
