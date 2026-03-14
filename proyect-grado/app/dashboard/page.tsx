// cspell:disable
"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Inscripcion {
  id: number;
  programa: string;
  fecha: string;
  id_usuario: number;
}

export default function DashboardPage() {
  const [busqueda, setBusqueda] = useState('');
  const [sectorActivo, setSectorActivo] = useState('Todos');
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string | null>(null);
  const [inscritoExitoso, setInscritoExitoso] = useState(false);
  const [misInscripciones, setMisInscripciones] = useState<Inscripcion[]>([]);
  
  const [nombreUsuario, setNombreUsuario] = useState('Aprendiz');
  const [accesoEspecial, setAccesoEspecial] = useState(false); // Para Admin y Coordinador
  const [userId, setUserId] = useState<number | null>(null);

  // 1. CARGA DE INSCRIPCIONES (Filtradas por usuario para evitar el Error 400)
  const refrescarInscripciones = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/inscripciones?usuario_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMisInscripciones(data);
      }
    } catch (e) { 
      console.error("Error al refrescar inscripciones", e); 
    }
  }, []);

  // 2. INICIALIZACIÓN DE SESIÓN
  useEffect(() => {
    let montado = true;
    const inicializarSesion = async () => {
      const userString = localStorage.getItem('usuario');
      if (userString && montado) {
        const user = JSON.parse(userString);
        setNombreUsuario(user.nombre);
        setUserId(user.id);
        
        // El botón de control sale para Admin o Coordinador
        if (user.rol === 'Administrador' || user.rol === 'Coordinador') {
          setAccesoEspecial(true);
        }
        
        await refrescarInscripciones(user.id);
      }
    };
    inicializarSesion();
    return () => { montado = false; };
  }, [refrescarInscripciones]);

  // 3. PROCESO DE INSCRIPCIÓN
  const manejarInscripcion = async () => {
    if (!programaSeleccionado || !userId) return;
    try {
      const response = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          programa: programaSeleccionado,
          usuario_id: userId 
        }),
      });

      if (response.ok) {
        setInscritoExitoso(true);
        await refrescarInscripciones(userId); 
        setTimeout(() => {
          setInscritoExitoso(false);
          setProgramaSeleccionado(null);
        }, 2000);
      } else {
        const data = await response.json();
        alert(data.error || "Error al inscribirse");
        setProgramaSeleccionado(null);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const categorias = [
    { id: "01", nombre: "Tecnología", label: "Tecnología y Digital", cursos: ["Análisis y Desarrollo de Software", "Ciberseguridad", "Gestión de Redes de Datos", "Desarrollo de Videojuegos", "Python", "Java", "Cloud Computing"] },
    { id: "02", nombre: "Administrativo", label: "Adm. y Financiero", cursos: ["Gestión Administrativa", "Talento Humano", "Gestión Logística", "Contabilidad", "Negociación Internacional"] },
    { id: "03", nombre: "Industrial", label: "Industrial y Construcción", cursos: ["Electricidad Industrial", "Soldadura", "Motores Diesel", "Construcción", "Automatización"] },
    { id: "04", nombre: "Salud", label: "Salud y Servicios Sociales", cursos: ["Enfermería", "Servicios Farmacéuticos", "Salud Oral", "SST", "Primera Infancia"] },
    { id: "05", nombre: "Agro / Ambiental", label: "Agropecuario y Ambiental", cursos: ["Manejo Ambiental", "Producción Agropecuaria", "Agricultura Urbana", "Control Ambiental"] },
    { id: "06", nombre: "Gastronomía", label: "Gastronomía y Turismo", cursos: ["Cocina", "Panificación", "Barismo", "Guianza Turística", "Eventos"] },
    { id: "07", nombre: "Idiomas", label: "Idiomas y Educación", cursos: ["English Does Work Level 1", "English Does Work Level 2", "Pedagogía Humana", "Estrategias de Aprendizaje"] }
  ];

  const nombresSectores = ["Todos", ...categorias.map(c => c.nombre)];

  return (
    <div className="light relative min-h-screen w-full overflow-x-hidden bg-white font-sans text-black">
      <div className="fixed inset-0 -z-10 w-full h-full" style={{ background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)' }} />

      {/* BOTÓN FLOTANTE DINÁMICO */}
      {accesoEspecial && (
        <div className="fixed bottom-10 right-10 z-[100] animate-bounce">
          <Link 
            href="/admin" 
            className="bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-2xl hover:bg-green-600 transition-all flex items-center gap-3 border-2 border-green-500/30"
          >
            <span className="text-xl">🛠️</span> Panel de Control
          </Link>
        </div>
      )}

      <nav className="w-full bg-white/95 border-b border-green-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Image src="/Sena Logo.png" alt="Sena Logo" width={45} height={45} />
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">SENA <span className="text-green-600">UN CLIC</span></h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Sesión de: {nombreUsuario}</p>
          </div>
        </div>

        <div className="hidden md:flex bg-gray-50 border border-green-200 rounded-full px-5 py-2 items-center gap-3">
          <span className="font-bold text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar programa..." 
            className="bg-transparent outline-none text-sm font-bold w-64 text-black" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>

        <Link 
          href="/" 
          onClick={() => localStorage.removeItem('usuario')} 
          className="text-[10px] font-black text-red-600 uppercase border-2 border-red-600 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all"
        >
          Cerrar Sesión
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-16">
        
        {/* TABLA DE INSCRIPCIONES PERSONALES */}
        {misInscripciones.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase italic mb-8">Mis <span className="text-green-600">Programas</span></h2>
            <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-6 uppercase text-[10px] font-black tracking-widest">ID Registro</th>
                    <th className="p-6 uppercase text-[10px] font-black tracking-widest">Programa Académico</th>
                    <th className="p-6 uppercase text-[10px] font-black tracking-widest text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-black font-bold">
                  {misInscripciones.map((ins) => (
                    <tr key={ins.id} className="hover:bg-green-50 transition-colors">
                      <td className="p-6 font-mono text-xs text-gray-400">#00{ins.id}</td>
                      <td className="p-6 uppercase text-sm italic">{ins.programa}</td>
                      <td className="p-6 text-center">
                        <span className="bg-green-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase">Matriculado</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SELECTOR DE SECTORES */}
        <div className="text-center">
           <div className="flex overflow-x-auto gap-2 pb-4 justify-start lg:justify-center no-scrollbar">
            {nombresSectores.map((n) => (
              <button 
                key={n} 
                onClick={() => setSectorActivo(n)} 
                className={`whitespace-nowrap px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border-2 ${sectorActivo === n ? "bg-green-600 border-green-600 text-white shadow-md" : "bg-white border-green-100 text-black hover:border-green-400"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* CATÁLOGO DINÁMICO */}
        {categorias.map((cat) => {
          const coincidencias = cat.cursos.filter(c => c.toLowerCase().includes(busqueda.toLowerCase()));
          const mostrar = (sectorActivo === "Todos" || sectorActivo === cat.nombre) && coincidencias.length > 0;
          if (!mostrar) return null;

          return (
            <section key={cat.id} className="animate-in fade-in duration-700">
              <div className="mb-8 border-l-[10px] border-green-600 pl-6">
                <h2 className="text-4xl font-black text-black tracking-tighter uppercase italic leading-none">{cat.nombre}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coincidencias.map((programa, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setProgramaSeleccionado(programa)} 
                    className="bg-white border border-green-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-4 italic">{cat.label}</span>
                      <h3 className="text-xl font-black text-black leading-tight uppercase mb-6 group-hover:text-green-700 transition-colors">{programa}</h3>
                    </div>
                    <div className="pt-6 border-t border-green-50 flex justify-between items-center text-black font-black text-[9px] tracking-widest uppercase">
                      <span>Inscribirme</span>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">→</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* MODAL DE INSCRIPCIÓN */}
      {programaSeleccionado && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white border-4 border-green-600 rounded-[3.5rem] p-10 max-w-lg w-full shadow-2xl scale-in-center">
            {!inscritoExitoso ? (
              <>
                <h3 className="text-4xl font-black text-black uppercase italic mb-6 text-center leading-none">Confirmar</h3>
                <div className="bg-gray-100 p-6 rounded-2xl mb-8 border border-dashed border-gray-400">
                  <p className="text-green-600 text-xl font-black text-center uppercase italic">{programaSeleccionado}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setProgramaSeleccionado(null)} className="flex-1 py-4 border-2 border-black rounded-2xl font-black uppercase text-xs text-black">Cerrar</button>
                  <button onClick={manejarInscripcion} className="flex-1 py-4 bg-green-600 border-2 border-green-600 rounded-2xl font-black uppercase text-xs text-white shadow-lg">Inscribirme</button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg animate-bounce">✓</div>
                <h4 className="text-3xl font-black text-black uppercase italic leading-none">¡Éxito!</h4>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-4">Actualizando tu perfil académico...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}