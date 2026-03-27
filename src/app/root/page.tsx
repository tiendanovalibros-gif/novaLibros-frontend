'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/auth_token=([^;]+)/)
  return match ? match[1] : ''
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Error en el servidor')
  return data
}

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line
      x1="12"
      y1="5"
      x2="12"
      y2="19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const Input = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
    />
  </div>
)

const Select = ({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode
  }) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-1.5">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
    >
      {children}
    </select>
  </div>
)

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div
      className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
        <h3 className="text-slate-900 font-bold text-lg">{title}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

export default function AdminLibrosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [adminForm, setAdminForm] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    correo: '',
    contrasenaHash: '',
    direccion: '',
    telefono: '',
    estadoCuenta: true,
  })

  const closeDialog = () => {
    setDialogOpen(false)
    setFormError('')
  }

  const openDialog = () => {
    setAdminForm({
      dni: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      correo: '',
      contrasenaHash: '',
      direccion: '',
      telefono: '',
      estadoCuenta: true,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const setF = (key: string, value: string | boolean) =>
    setAdminForm(prev => ({ ...prev, [key]: value }))

  const validar = (): boolean => {
    if (!adminForm.dni.trim()) {
      setFormError('El DNI es requerido')
      return false
    }
    if (!adminForm.nombre.trim()) {
      setFormError('El nombre es requerido')
      return false
    }
    if (!adminForm.apellido.trim()) {
      setFormError('El apellido es requerido')
      return false
    }
    if (!adminForm.fechaNacimiento.trim()) {
      setFormError('La fecha de nacimiento es requerida')
      return false
    }
    if (!adminForm.correo.trim()) {
      setFormError('El correo es requerido')
      return false
    }
    if (!adminForm.contrasenaHash.trim()) {
      setFormError('La contraseña es requerida')
      return false
    }
    if (!adminForm.direccion.trim()) {
      setFormError('La dirección es requerida')
      return false
    }
    return true
  }

  const handleCrearAdmin = async () => {
    if (!validar()) return
    setSaving(true)
    try {
      await apiFetch('/users/register-admin', {
        method: 'POST',
        body: JSON.stringify(adminForm),
      })
      closeDialog()
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? 'Error al crear el administrador')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookIcon />
            </div>
            <div>
              <span className="text-slate-900 text-base font-bold">NovaLibros</span>
              <span className="ml-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                ROOT
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold">Administradores</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Gestiona usuarios con permisos administrativos
            </p>
          </div>
          <button
            onClick={openDialog}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <PlusIcon />
            Crear administrador
          </button>
        </div>
      </main>

      {dialogOpen && (
        <Modal title="Crear administrador" onClose={closeDialog}>
          <div className="flex flex-col gap-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
                {formError}
              </div>
            )}
            <Input
              label="DNI"
              value={adminForm.dni}
              onChange={e => setF('dni', e.target.value)}
              placeholder="1234567890"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={adminForm.nombre}
                onChange={e => setF('nombre', e.target.value)}
                placeholder="Juan"
              />
              <Input
                label="Apellido"
                value={adminForm.apellido}
                onChange={e => setF('apellido', e.target.value)}
                placeholder="Pérez"
              />
            </div>
            <Input
              label="Fecha de nacimiento"
              type="date"
              value={adminForm.fechaNacimiento}
              onChange={e => setF('fechaNacimiento', e.target.value)}
            />
            <Input
              label="Correo"
              type="email"
              value={adminForm.correo}
              onChange={e => setF('correo', e.target.value)}
              placeholder="juan@email.com"
            />
            <Input
              label="Contraseña"
              type="password"
              value={adminForm.contrasenaHash}
              onChange={e => setF('contrasenaHash', e.target.value)}
              placeholder="********"
            />
            <Input
              label="Dirección"
              value={adminForm.direccion}
              onChange={e => setF('direccion', e.target.value)}
              placeholder="Calle 123"
            />
            <Input
              label="Teléfono"
              value={adminForm.telefono}
              onChange={e => setF('telefono', e.target.value)}
              placeholder="3001234567"
            />
            <Select
              label="Estado de cuenta"
              value={adminForm.estadoCuenta ? 'true' : 'false'}
              onChange={e => setF('estadoCuenta', e.target.value === 'true')}
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={closeDialog}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearAdmin}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Creando...' : 'Crear administrador'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
