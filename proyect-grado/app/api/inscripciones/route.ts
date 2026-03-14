import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

/* cSpell:disable */

// 1. CONFIGURACIÓN DE CONEXIÓN
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 2. INTERFACES
interface InscripcionRow extends RowDataPacket {
  id: number;
}

interface MySqlError {
  message: string;
  code?: string;
}

// 3. FUNCIÓN POST: Crear una nueva inscripción
export async function POST(request: Request) {
  let connection;
  try {
    const { programa, usuario_id } = await request.json();
    connection = await mysql.createConnection(dbConfig);

    // Validación: ¿Ya existe este usuario en este programa?
    const [rows] = await connection.execute<InscripcionRow[]>(
      'SELECT id FROM inscripciones WHERE id_usuario = ? AND programa = ?',
      [usuario_id || 1, programa]
    );

    if (rows.length > 0) {
      await connection.end();
      return NextResponse.json({ error: "Ya estás registrado en este programa" }, { status: 400 });
    }

    // Inserción en la tabla 'inscripciones'
    await connection.execute(
      'INSERT INTO inscripciones (id_usuario, programa, estado) VALUES (?, ?, ?)',
      [usuario_id || 1, programa, 'Inscrito']
    );

    await connection.end();
    return NextResponse.json({ message: "Inscripción exitosa en la base de datos" });

  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    console.error("DETALLE DEL ERROR POST:", dbError.message);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}

// 4. FUNCIÓN GET: Obtener las inscripciones realizadas
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Traemos los datos de la tabla 'inscripciones'
    const [rows] = await connection.execute('SELECT * FROM inscripciones ORDER BY fecha_inscripcion DESC');
    
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: unknown) {
    if (connection) await connection.end();
    const dbError = error as MySqlError;
    console.error("DETALLE DEL ERROR GET:", dbError.message);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
}