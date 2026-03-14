// cspell:disable
"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Inscripcion {
  id: number;
  programa: string;
  fecha: string;
  usuario: string;
}

export default function DashboardPage() {
  const [busqueda, setBusqueda] = useState('');
  const [sectorActivo, setSectorActivo] = useState('Todos');
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string | null>(null);
  const [inscritoExitoso, setInscritoExitoso] = useState(false);
  const [misInscripciones, setMisInscripciones] = useState<Inscripcion[]>([]);
  
  // Rol del usuario para control de permisos
  const [rolUsuario] = useState('aprendiz'); 

  // Función para cargar los datos de la API (usando useCallback para estabilidad)
  const fetchEnrollments = useCallback(async () => {
    try {
      const res = await fetch('/api/inscripciones');
      if (res.ok) {
        const data = await res.json();
        setMisInscripciones(data);
      }
    } catch (error) {
      console.error("Error cargando base de datos", error);
    }
  }, []);

  // useEffect Corregido: Evita el renderizado en cascada
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchEnrollments();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchEnrollments]);

  const manejarInscripcion = async () => {
    if (!programaSeleccionado) return;
    try {
      const response = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programa: programaSeleccionado }),
      });

      const resultado = await response.json();

      if (response.ok) {
        setInscritoExitoso(true);
        // Recargamos los datos después de inscribirse
        await fetchEnrollments(); 
        
        setTimeout(() => {
          setInscritoExitoso(false);
          setProgramaSeleccionado(null);
        }, 2000);
      } else {
        alert(resultado.error || "Error al inscribirse");
        setProgramaSeleccionado(null);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const categorias = [
    { id: "01", nombre: "Tecnología", label: "Tecnología y Digital", cursos: ["Análisis y Desarrollo de Software", "Programación de Aplicaciones para Dispositivos Móviles", "Gestión de Redes de Datos", "Ciberseguridad", "Desarrollo de Videojuegos", "Animación Digital", "Programación de Software", "Mantenimiento de Cómputo", "Desarrollo PHP", "Python", "HTML5 y CSS3", "Bases de Datos MySQL", "Java"] },
    { id: "02", nombre: "Administrativo", label: "Adm. y Financiero", cursos: ["Gestión Administrativa", "Contabilización Comercial", "Talento Humano", "Gestión Logística", "Nómina", "Comercio Exterior", "Secretariado", "Servicio al Cliente", "Contabilidad", "Finanzas Personales"] },
    { id: "03", nombre: "Industrial", label: "Industrial y Construcción", cursos: ["Electricidad Industrial", "Soldadura", "Motores Diesel", "Motores Gasolina", "Construcción", "Instalaciones Eléctricas", "Topografía", "Carpintería", "Dibujo Técnico", "Automatización", "Joyeria"] },
    { id: "04", nombre: "Salud", label: "Salud y Servicios Sociales", cursos: ["Enfermería", "Servicios Farmacéuticos", "Salud Oral", "Primera Infancia", "SST", "Emergencias Médicas", "Estética", "Primeros Auxilios"] },
    { id: "05", nombre: "Agro / Ambiental", label: "Agropecuario y Ambiental", cursos: ["Producción Agropecuaria Ecológica", "Gestión de Empresas Agropecuarias", "Manejo Ambiental", "Cultivos Agrícolas", "Producción de Especies Menores", "Riego y Drenaje", "Manejo de Residuos Sólidos", "Conservación de Recursos Naturales", "Agricultura Urbana", "Cuidado y Manejo de Mascotas", "Floricultura", "Ganadería Bovina"] },
    { id: "06", nombre: "Gastronomía", label: "Gastronomía y Turismo", cursos: ["Cocina", "Panificación", "Repostería", "Guianza Turística", "Barismo", "Manipulación de Alimentos", "Coctelería", "Eventos"] },
    { id: "07", nombre: "Idiomas", label: "Idiomas y Educación", cursos: ["English Does Work Level 1", "English Does Work Level 2", "English Does Work Level 3", "English Does Work Level 4", "English Does Work Level 5", "English Does Work Level 6", "English Does Work Level 7", "English Does Work Level 8", "English Does Work Level 9", "English Does Work Level 10", "English Does Work Level 11", "English Does Work Level 12", "English Does Work Level 13", "Pedagogía Humana", "Formación de Formadores", "Estrategias de Aprendizaje", "Educación Inclusiva"] }
  ];

  const nombresSectores = ["Todos", ...categorias.map(c => c.nombre)];

  return (
    <div className="light relative min-h-screen w-full overflow-x-hidden bg-white">
      <div className="fixed inset-0 -z-10 w-full h-full" style={{ background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)' }} />

      <nav className="w-full bg-white/95 border-b border-green-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Image src="/Sena Logo.png" alt="Sena Logo" width={45} height={45} />
          <h1 className="text-xl font-black text-black uppercase italic tracking-tighter">SENA <span className="text-green-600">UN CLIC</span></h1>
        </div>
        <div className="hidden md:flex bg-gray-50 border border-green-200 rounded-full px-5 py-2 items-center gap-3">
          <span className="text-black font-bold text-sm">🔍</span>
          <input type="text" placeholder="Buscar programa..." className="bg-transparent outline-none text-sm font-bold w-64 text-black" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <Link href="/" className="text-[10px] font-black text-red-600 uppercase border-2 border-red-600 px-4 py-2 rounded-xl">Cerrar Sesión</Link>
      </nav>

      {/* TABS SECTORES */}
      <div className="w-full bg-white/50 border-b border-green-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex overflow-x-auto gap-2 pb-2 justify-start lg:justify-center no-scrollbar">
            {nombresSectores.map((n) => (
              <button key={n} onClick={() => setSectorActivo(n)} className={`whitespace-nowrap px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border-2 ${sectorActivo === n ? "bg-green-600 border-green-600 text-white shadow-md" : "bg-white border-green-100 text-black shadow-sm"}`}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-20">
        {/* SECCIÓN DE INSCRIPCIONES */}
        {misInscripciones.length > 0 && (
          <section className="pt-5">
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase italic mb-8">
              Mis <span className="text-green-600">Inscripciones Activas</span>
            </h2>
            <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-6 uppercase text-[10px] font-black tracking-widest">ID Registro</th>
                    <th className="p-6 uppercase text-[10px] font-black tracking-widest">Programa</th>
                    <th className="p-6 uppercase text-[10px] font-black tracking-widest text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-black">
                  {misInscripciones.map((ins) => (
                    <tr key={ins.id} className="hover:bg-green-50 transition-colors">
                      <td className="p-6 font-mono text-xs text-gray-500">#{ins.id}</td>
                      <td className="p-6 font-black uppercase text-sm italic">{ins.programa}</td>
                      <td className="p-6 text-center">
                        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[10px] font-black uppercase">
                          Registrado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* LISTADO DE PROGRAMAS */}
        {categorias.map((cat) => {
          const coincidencias = cat.cursos.filter(c => c.toLowerCase().includes(busqueda.toLowerCase()));
          const mostrar = (sectorActivo === "Todos" || sectorActivo === cat.nombre) && coincidencias.length > 0;
          if (!mostrar) return null;

          return (
            <section key={cat.id}>
              <div className="mb-10 border-l-[10px] border-green-600 pl-6">
                <h2 className="text-5xl font-black text-black tracking-tighter uppercase italic leading-none">Sector <span className="text-green-600">{cat.nombre}</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {coincidencias.map((programa, idx) => (
                  <div key={idx} onClick={() => setProgramaSeleccionado(programa)} className="bg-white border border-green-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group">
                    <div>
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-4 italic">{cat.label}</span>
                      <h3 className="text-xl font-black text-black leading-tight uppercase mb-6 group-hover:text-green-700">{programa}</h3>
                    </div>
                    <div className="pt-6 border-t border-green-50 flex justify-between items-center text-black font-black text-[10px] tracking-widest uppercase">
                      <span>Click para Inscribirse</span>
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-black group-hover:bg-green-600 group-hover:text-white transition-all">+</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* MODAL */}
      {programaSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border-4 border-green-600 rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl">
            {!inscritoExitoso ? (
              <>
                <h3 className="text-3xl font-black text-black uppercase italic mb-4 text-center leading-none">Inscripción</h3>
                <p className="text-black font-bold text-center mb-8 uppercase text-[10px] tracking-widest">
                  Vas a inscribirte a: <br/> <span className="text-green-600 text-lg">{programaSeleccionado}</span>
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setProgramaSeleccionado(null)} className="flex-1 py-4 border-2 border-black rounded-2xl font-black uppercase text-xs text-black hover:bg-black hover:text-white transition-all">Regresar</button>
                  <button onClick={manejarInscripcion} className="flex-1 py-4 bg-green-600 border-2 border-green-600 rounded-2xl font-black uppercase text-xs text-white shadow-lg hover:bg-green-700 transition-all">Confirmar</button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">✓</div>
                <h4 className="text-3xl font-black text-black uppercase italic">¡Inscripción Exitosa!</h4>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="w-full py-20 text-center border-t border-green-50 mt-20">
        <p className="text-[11px] font-black text-black opacity-30 uppercase tracking-[0.5em]">ADSO • 2026</p>
      </footer>
    </div>
  );
}