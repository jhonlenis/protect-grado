"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importante para movernos de página
import { CustomInput } from '@/components/CustomInput';
import { DocumentSelect } from '@/components/DocumentSelect';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tipo_documento: '',
    numero_documento: '',
    correo: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Llamamos a la API que creamos en app/api/login/route.ts
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ¡Éxito! Guardamos el nombre en el navegador (opcional por ahora) y redirigimos
        router.push('/dashboard');
      } else {
        // Mostramos el error que viene de la API (ej: "Contraseña incorrecta")
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-20"></div>

      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-md w-full border border-green-100 relative z-10">
        <h2 className="text-3xl font-extrabold text-black mb-2 text-center">Iniciar Sesión</h2>
        <p className="text-black/70 mb-8 font-medium text-center">Valida tus datos de Aprendiz</p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-3 rounded mb-4 text-sm font-bold animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <DocumentSelect 
            value={formData.tipo_documento}
            onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
          />

          <CustomInput 
            label="Número de Documento" 
            type="text" 
            placeholder="Ej: 1023456789"
            value={formData.numero_documento}
            onKeyPress={onlyNumbers}
            onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
          />

          <CustomInput 
            label="Correo Personal" 
            type="email" 
            placeholder="ejemplo@correo.com"
            value={formData.correo}
            onChange={(e) => setFormData({...formData, correo: e.target.value})}
          />

          <CustomInput 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <PrimaryButton text={cargando ? "Validando..." : "Entrar al Sistema"} />
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-black font-medium">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="text-green-700 font-extrabold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}