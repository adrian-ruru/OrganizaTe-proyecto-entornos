import { createUser } from '../services/user.service.js';

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