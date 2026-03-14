import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt'; // Para encriptar la contraseña

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombres, apellidos, tipo_documento, numero_documento, correo_personal, password, rol } = body;

    // 1. Encriptar la contraseña (Requerimiento de seguridad)
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Insertar en la base de datos senaunclic
    const [result] = await db.query(
      'INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, correo_personal, password_hash, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombres, apellidos, tipo_documento, numero_documento, correo_personal, passwordHash, rol]
    );

    return NextResponse.json({ message: "Usuario creado con éxito" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}