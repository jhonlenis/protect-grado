import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2'; // Importamos el tipo específico de MySQL

// Definimos la estructura del usuario para que TypeScript no se queje
interface UsuarioRow extends RowDataPacket {
  id: number;
  nombres: string;
  apellidos: string;
  password_hash: string;
  rol: string;
  correo_personal: string;
}

export async function POST(request: Request) {
  try {
    const { tipo_documento, numero_documento, correo, password } = await request.json();

    // 1. Buscar al usuario. Especificamos que esperamos un arreglo de UsuarioRow
    const [rows] = await db.query<UsuarioRow[]>(
      'SELECT * FROM usuarios WHERE tipo_documento = ? AND numero_documento = ? AND correo_personal = ?',
      [tipo_documento, numero_documento, correo]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Datos incorrectos. Verifica tu documento y correo." }, 
        { status: 401 }
      );
    }

    const usuario = rows[0];

    // 2. Verificar la contraseña encriptada
    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
    }

    // 3. Login exitoso
    return NextResponse.json({ 
      message: "Login exitoso",
      user: { 
        nombre: usuario.nombres, 
        rol: usuario.rol 
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}