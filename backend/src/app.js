const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Para poder leer el email y password que envíes

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (user && user.password === password) {
            res.json({ message: "¡Entraste!", user: user.name });
        } else {
            res.status(401).json({ error: "Email o clave incorrectos" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));