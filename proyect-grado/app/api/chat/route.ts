// cspell:disable
import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
};

interface ProgramaRow extends RowDataPacket {
  id: number;
  nombre: string;
  sector: string;
}

export async function POST(request: Request) {
  let connection;
  try {
    const { mensaje } = await request.json();
    const input = mensaje.toLowerCase().trim();

    // 1. RESPUESTA A SALUDOS
    const saludos = ["hola", "buenos dias", "buenas tardes", "hey", "ayuda"];
    if (saludos.some(s => input.includes(s))) {
      return NextResponse.json({ 
        respuesta: "👋 **¡Hola, Alexander!**\n\nBienvenido al asistente de **SENA a un Clic**. Puedes buscar programas por áreas como:\n\n💻 **Tecnología**\n📊 **Administrativo**\n🏗️ **Industrial**\n🏥 **Salud**\n🌿 **Agropecuario**\n🍳 **Gastronomía**\n🗣️ **Idiomas**",
        mostrarBoton: false 
      });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // 2. BUSCADOR QUE IGNORA TILDES (Usando COLLATE)
    // Buscamos en 'sector' o en 'nombre' para que sea más flexible
    const [rows] = await connection.execute<ProgramaRow[]>(
      `SELECT nombre, sector FROM programas 
       WHERE sector COLLATE utf8mb4_general_ci LIKE ? 
       OR nombre COLLATE utf8mb4_general_ci LIKE ?`,
      [`%${input}%`, `%${input}%`]
    );

    if (rows.length > 0) {
      // Tomamos el nombre del sector del primer resultado para el encabezado
      const sectorTitulo = rows[0].sector;
      
      let texto = `✨ **Sector: ${sectorTitulo}**\n`;
      texto += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      rows.forEach((p) => {
        texto += `✅ **${p.nombre}**\n`;
      });
      
      return NextResponse.json({ 
        respuesta: texto + `\n━━━━━━━━━━━━━━━━━━━━\n¿Te interesa **inscribirte** en alguno de estos programas?`,
        mostrarBoton: true 
      });
    }

    // 3. SI NO HAY COINCIDENCIAS
    return NextResponse.json({ 
      respuesta: `😅 No encontré programas relacionados con "**${mensaje}**".\n\nPrueba con palabras clave como: **Tecnología, Salud, Industrial, Agro o Cocina**.`,
      mostrarBoton: false 
    });

  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ respuesta: "❌ Error de conexión con la base de datos local." });
  } finally {
    if (connection) await connection.end();
  }
}