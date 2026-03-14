import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

/* cSpell:disable */

// Configuración de conexión directa desde .env.local
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Interfaz para el usuario
interface UsuarioRow extends RowDataPacket {
  id: number;
  nombres: string;
  apellidos: string;
  password_hash: string;
  rol: string;
  correo_personal: string;
}

export async function POST(request: Request) {
  let connection;
  try {
    const { tipo_documento, numero_documento, correo, password } = await request.json();

    // Creamos la conexión usando los datos del .env.local
    connection = await mysql.createConnection(dbConfig);

    // 1. Buscar al usuario en la base de datos
    const [rows] = await connection.execute<UsuarioRow[]>(
      'SELECT * FROM usuarios WHERE tipo_documento = ? AND numero_documento = ? AND correo_personal = ?',
      [tipo_documento, numero_documento, correo]
    );

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Datos incorrectos. Verifica tu documento y correo." }, 
        { status: 401 }
      );
    }

    const usuario = rows[0];

    // 2. Verificar la contraseña encriptada
    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      await connection.end();
      return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
    }

    // Cerramos conexión antes del éxito
    await connection.end();

    // 3. Login exitoso
    return NextResponse.json({ 
      message: "Login exitoso",
      user: { 
        id: usuario.id, // Es importante enviar el ID para usarlo en las inscripciones
        nombre: usuario.nombres, 
        rol: usuario.rol 
      }
    }, { status: 200 });

  } catch (error) {
    if (connection) await connection.end();
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}