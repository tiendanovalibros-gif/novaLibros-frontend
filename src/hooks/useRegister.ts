import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  INITIAL_FORM,
  PASSWORD_ALLOWED_REGEX,
  PASSWORD_LOWER_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SYMBOL_REGEX,
} from "@/constants/register.constants";
import type { Step, RegisterFormData, RegisterFormErrors } from "@/types/register.types";

export function useRegister() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);

  const set = (field: keyof RegisterFormData, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const togglePreferencia = (pref: string) => {
    const next = form.preferencias.includes(pref)
      ? form.preferencias.filter(p => p !== pref)
      : [...form.preferencias, pref];
    set("preferencias", next);
  };

  const validateStep1 = (): boolean => {
    const e: RegisterFormErrors = {};

    const nombre = form.nombre.trim();
    if (!nombre) e.nombre = "Campo requerido";
    else if (nombre.length > 40) e.nombre = "Maximo 40 caracteres";
    else if (/\d/.test(nombre)) e.nombre = "El nombre no puede contener numeros";

    const apellido = form.apellido.trim();
    if (!apellido) e.apellido = "Campo requerido";
    else if (apellido.length > 40) e.apellido = "Maximo 40 caracteres";
    else if (/\d/.test(apellido)) e.apellido = "El apellido no puede contener numeros";

    const dni = form.dni.trim();
    if (!dni) e.dni = "Campo requerido";
    else if (!/^\d{1,15}$/.test(dni)) e.dni = "El DNI debe tener solo numeros (maximo 15 digitos)";
    else if (BigInt(dni) <= 0n) e.dni = "El DNI debe ser un numero positivo";

    if (!form.fechaNacimiento) {
      e.fechaNacimiento = "Campo requerido";
    } else {
      const nacimiento = new Date(`${form.fechaNacimiento}T00:00:00`);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const maxDate = new Date(hoy);
      maxDate.setFullYear(hoy.getFullYear() - 18);
      maxDate.setDate(maxDate.getDate() - 1);

      const minDate = new Date(hoy);
      minDate.setFullYear(hoy.getFullYear() - 70);

      if (Number.isNaN(nacimiento.getTime())) e.fechaNacimiento = "Fecha invalida";
      else if (nacimiento > maxDate) e.fechaNacimiento = "Debes tener al menos 18 años y 1 dia";
      else if (nacimiento < minDate) e.fechaNacimiento = "La edad maxima permitida es 70 años";
    }

    const lugarNacimiento = form.lugarNacimiento.trim();
    if (!lugarNacimiento) e.lugarNacimiento = "Campo requerido";
    else if (lugarNacimiento.length > 50) e.lugarNacimiento = "Maximo 50 caracteres";
    else if (/\d/.test(lugarNacimiento))
      e.lugarNacimiento = "El lugar de nacimiento no puede contener numeros";

    if (!form.genero) e.genero = "Selecciona un genero";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: RegisterFormErrors = {};

    if (!form.correo.trim() || !/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Correo invalido";
    if (!form.usuario.trim()) e.usuario = "Campo requerido";

    const password = form.contrasena;
    if (!password.trim()) e.contrasena = "La contrasena no puede ser solo espacios";
    else if (password.length < 8) e.contrasena = "Minimo 8 caracteres";
    else if (!PASSWORD_ALLOWED_REGEX.test(password))
      e.contrasena = "La contrasena contiene caracteres no permitidos";
    else if (!PASSWORD_LOWER_REGEX.test(password))
      e.contrasena = "Debe incluir al menos una letra minuscula";
    else if (!PASSWORD_NUMBER_REGEX.test(password))
      e.contrasena = "Debe incluir al menos un numero";
    else if (!PASSWORD_SYMBOL_REGEX.test(password))
      e.contrasena = "Debe incluir al menos un simbolo";

    if (form.contrasena !== form.confirmarContrasena)
      e.confirmarContrasena = "Las contrasenas no coinciden";
    if (!form.direccion.trim()) e.direccion = "Campo requerido";
    if (form.direccion.length > 100) e.direccion = "Maximo 100 caracteres";
    if (!/^\d{7,15}$/.test(form.telefono))
      e.telefono = "El telefono debe tener solo numeros (7 a 15 digitos)";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: RegisterFormErrors = {};
    if (form.preferencias.length === 0) e.general = "Selecciona al menos una preferencia";
    if (!form.aceptaTerminos) e.aceptaTerminos = "Debes aceptar los terminos y condiciones";
    if (!form.aceptaDatos) e.aceptaDatos = "Debes aceptar la politica de datos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => setStep((step - 1) as Step);

  const handleSubmit = async () => {
    setErrors({});
    if (!validateStep3()) return;
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: form.dni,
          nombre: form.nombre,
          apellido: form.apellido,
          fechaNacimiento: form.fechaNacimiento,
          correo: form.correo,
          contrasenaHash: form.contrasena,
          direccion: form.direccion || undefined,
          telefono: form.telefono || undefined,
          estadoCuenta: true,
        }),
      });

      if (!res.ok) {
        let message = "Error al registrar usuario";
        try {
          const data = await res.json();
          if (data && typeof data.message === "string") message = data.message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar usuario";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    nextStep,
    prevStep,
    form,
    set,
    togglePreferencia,
    errors,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  };
}
