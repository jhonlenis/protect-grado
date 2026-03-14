"use client";
import { useState } from 'react';
import Link from 'next/link';
import { CustomInput } from '@/components/CustomInput';
import { DocumentSelect } from '@/components/DocumentSelect';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function RegistroPage() {
  const [password, setPassword] = useState('');
  const [enviado, setEnviado] = useState(false);
  
  // Validaciones (Se mantienen igual)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6 py-12">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-lg w-full border border-green-100">
        {!enviado ? (
          <>
            <Link href="/" className="text-black text-sm font-bold flex items-center mb-6 hover:text-green-700">
              ← Volver al inicio
            </Link>

            <h2 className="text-3xl font-extrabold text-black mb-6 text-center">Crear Cuenta</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput label="Nombres" type="text" placeholder="Tus nombres" />
                <CustomInput label="Apellidos" type="text" placeholder="Tus apellidos" />
              </div>

              <DocumentSelect />
              
              <div>
                <CustomInput 
                  label="Número de Documento" 
                  type="text" 
                  placeholder="Ej: 1023456789" 
                  onKeyPress={onlyNumbers} 
                />
                <p className="mt-1 text-[10px] font-bold text-black italic">
                  * Ingresa solo números, sin puntos ni espacios.
                </p>
              </div>

              <CustomInput label="Correo Personal" type="email" placeholder="ejemplo@correo.com" />

              <div>
                <CustomInput 
                  label="Contraseña" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* CORRECCIÓN DEL ERROR DE CLASES */}
                <div className="mt-3 grid grid-cols-1 gap-1 text-xs font-bold">
                  <p className={hasUpperCase ? "text-green-700" : "text-red-600"}>
                    {hasUpperCase ? "✓" : "✗"} Mayúscula
                  </p>
                  <p className={hasNumber ? "text-green-700" : "text-red-600"}>
                    {hasNumber ? "✓" : "✗"} Número
                  </p>
                  <p className={hasSpecialChar ? "text-green-700" : "text-red-600"}>
                    {hasSpecialChar ? "✓" : "✗"} Especial (@, #, $)
                  </p>
                </div>
              </div>

              <PrimaryButton text="Registrarse" />
            </form>
          </>
        ) : (
          <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
             <h2 className="text-3xl font-extrabold text-black mb-4">¡Cuenta creada! [cite: 523]</h2>
             <p className="text-black font-medium mb-8">Tu registro ha sido completado exitosamente. [cite: 524]</p>
          </div>
        )}
      </div>
    </main>
  );
}