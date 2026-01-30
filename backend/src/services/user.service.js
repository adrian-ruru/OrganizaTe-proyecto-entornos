import { db } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

export async function createUser({ nombre, email, password }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Comprobar email duplicado
    const [existing] = await connection.query(
      'SELECT id FROM persona WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      throw new Error('EMAIL_DUPLICADO');
    }

    // 2. Hash de contraseña
    const passwordHash = await hashPassword(password);

    // 3. Insertar persona
    const [personaResult] = await connection.query(
      `INSERT INTO persona (nombre, email, password_hash)
       VALUES (?, ?, ?)`,
      [nombre, email, passwordHash]
    );

    const personaId = personaResult.insertId;

    // 4. Insertar usuario
    await connection.query(
      `INSERT INTO usuario (persona_id)
       VALUES (?)`,
      [personaId]
    );

    await connection.commit();
    return personaId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}