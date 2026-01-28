const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
BigInt.prototype.toJSON = function() { return this.toString() };

const express = require('express');
const cors = require('cors'); // <--- 1. Importa CORS
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors()); // <--- 2. ¡OBLIGATORIO! Esto permite que el frontend se conecte
app.use(express.json());

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Ahora usamos prisma.persona (el nombre del modelo en tu nuevo schema)
        const persona = await prisma.persona.findUnique({
            where: { email: email }
        });

        // IMPORTANTE: el campo ahora se llama password_hash
        if (persona && persona.password_hash === password) {
            // Si coincide, enviamos los datos (el BigInt ya no dará error gracias al parche de arriba)
            res.json({ 
                success: true, 
                message: "Bienvenido",
                nombre: persona.nombre, // Sacamos el nombre fuera
                id: persona.id          // Sacamos el ID fuera
            });
        } else {
            res.status(401).json({ success: false, error: "Usuario o clave incorrectos" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));