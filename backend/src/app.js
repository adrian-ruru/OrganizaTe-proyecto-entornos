BigInt.prototype.toJSON = function() { return this.toString() };

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Para poder leer el email y password que envíes

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
                user: {
                    id: persona.id,
                    nombre: persona.nombre
                }
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