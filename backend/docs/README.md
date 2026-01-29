********** INTRODUCCIÓN **********

Se define la estructura base del backend en Node.js + Express siguiendo una separación por capas 
(routes, controllers, services, repositories) y carpetas de configuración, middlewares y utilidades. 
Se añaden archivos de arranque (app/server), ejemplo de variables de entorno (.env.example) y un README 
inicial con comandos de ejecución. Esta organización permite escalar el proyecto y repartir trabajo 
sin conflictos entre los miembros del equipo.

********** QUÉ ES CADA ARCHIVO / CARPETA CLAVE **********

src/app.js  
Crea la aplicación Express y configura middlewares (JSON, CORS, rutas y gestión de errores).

src/server.js  
Arranca el servidor utilizando app.listen(PORT).

src/config/env.js  
Carga y centraliza las variables de entorno (PORT, DATABASE_URL, JWT_SECRET, etc.).

src/config/db.js  
Gestiona la conexión con la base de datos mediante Prisma.

routes/  
Define los endpoints de la API (auth, tareas, contactos, recordatorios, etc.).

routes/index.routes.js  
Agrupa y monta todas las rutas principales del backend.

controllers/  
Reciben las peticiones HTTP (req/res), realizan validaciones básicas y delegan la lógica en los servicios.

services/  
Contienen la lógica de negocio del sistema (validaciones, reglas, procesos).

repositories/  
Capa de acceso a datos mediante Prisma (find, create, update, delete).

middlewares/  
Middlewares de autenticación (JWT), validación y gestión centralizada de errores.

utils/  
Funciones auxiliares (respuestas estándar, logs, helpers).

prisma/  
Definición del esquema de base de datos (schema.prisma) y migraciones.

tests/  
Carpeta reservada para pruebas automáticas del backend.

docs/  
Documentación técnica adicional del backend.

********** VARIABLES DE ENTORNO **********

Se incluye el archivo .env.example con las variables necesarias para ejecutar el backend.
El archivo .env real no debe subirse al repositorio.

********** EJECUCIÓN **********

npm install  
npm run dev