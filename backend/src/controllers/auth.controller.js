import { PrismaClient } from '@prisma/client';
import { createUser } from '../services/user.service.js';

const prisma = new PrismaClient();

// Parche para BigInt → JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

/**
 * REGISTRO DE USUARIO
 */
export async function register(req, res) {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      error: 'Nombre, email y contraseña son obligatorios'
    });
  }

  try {
    await createUser({ nombre, email, password });

    res.status(201).json({
      message: 'Usuario registrado correctamente'
    });

  } catch (error) {
    if (error.message === 'EMAIL_DUPLICADO') {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
}

/**
 * LOGIN DE USUARIO
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email y contraseña son obligatorios'
    });
  }

  try {
    const persona = await prisma.persona.findUnique({
      where: { email }
    });

    if (!persona || persona.password_hash !== password) {
      return res.status(401).json({
        success: false,
        error: 'Usuario o contraseña incorrectos'
      });
    }

    res.json({
      success: true,
      message: 'Bienvenido',
      id: persona.id,
      nombre: persona.nombre
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
}