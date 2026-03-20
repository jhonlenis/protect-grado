'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ChatBot() {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<{ yo: boolean, texto: string, conBoton?: boolean }[]>([
    { yo: false, texto: '¡Hola! Soy el asistente de SENA a un Clic. ¿En qué te ayudo hoy, parcer@?' }
  ]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false); // Para abrir/cerrar el chat

  const enviar = async () => {
    if (!msg || cargando) return;
    const nuevoChat = [...chat, { yo: true, texto: msg }];
    setChat(nuevoChat);
    setMsg('');
    setCargando(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ mensaje: msg }),
      });
      const data = await res.json();
      setChat([...nuevoChat, { yo: false, texto: data.respuesta, conBoton: data.mostrarBoton }]);
    } catch (e) {
      setChat([...nuevoChat, { yo: false, texto: 'Error de conexión.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* BOTÓN CIRCULAR PARA ABRIR EL CHAT */}
      <button 
        onClick={() => setAbierto(!abierto)}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all"
      >
        {abierto ? '✖' : '💬'}
      </button>

      {/* VENTANA DEL CHAT */}
      {abierto && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-green-600 text-white p-4 text-center font-bold">Asistente Virtual</div>
          <div className="h-80 p-4 overflow-y-auto text-sm space-y-4 bg-gray-50">
            {chat.map((c, i) => (
              <div key={i} className={c.yo ? 'text-right' : 'text-left'}>
                <div className={`inline-block p-3 rounded-2xl max-w-[90%] ${
                  c.yo ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {c.texto}
                  {!c.yo && c.conBoton && (
                    <Link href="/dashboard/programas" className="block mt-2 text-center bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700">
                      Inscribirme Ahora
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex bg-white">
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviar()} className="flex-1 outline-none text-sm p-2" placeholder="Escribe..." />
            <button onClick={enviar} className="text-green-600 font-bold px-2">Ir</button>
          </div>
        </div>
      )}
    </div>
  );
}