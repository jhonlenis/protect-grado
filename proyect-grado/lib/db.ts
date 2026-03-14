import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Tu usuario de XAMPP/MySQL
  password: '',      // Tu contraseña de XAMPP (por defecto vacía)
  database: 'senaunclic' // Nombre actualizado
});