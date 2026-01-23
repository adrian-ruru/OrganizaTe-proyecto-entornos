                        **********INTRODUCCIÓN**********
Se define la estructura base del backend en Node.js + Express siguiendo una separación por capas (routes, controllers, services, repositories) y carpetas de configuración, middlewares y utilidades. Se añaden archivos de arranque (app/server), ejemplo de variables de entorno (.env.example) y README inicial con comandos de ejecución. Esta organización permite escalar el proyecto y repartir trabajo sin conflictos.

                        **********Qué es cada archivo clave**********
#src/app.js => Crea la app de Express, configura middlewares (JSON, CORS, rutas, errores).

#src/server.js => Arranca el servidor (app.listen(PORT)).

#src/config/env.js => Lee variables de entorno (PORT, DB_URL, JWT_SECRET,...).

#src/config/db.js => Exporta el cliente Prisma y la conexión.

#routes/ => Define endpoints: /api/tareas, /api/auth, etc.

#controllers/ => Reciben req/res, validan lo básico y llaman a services.

#services/ => Reglas de negocio, por ejemplo: "no más de 10 recordatorios", "cambiar estado", etc.

#repositories/ => Acceso a datos (Prisma). Aquí van los findMany, create, etc.

#middlewares/ => Auth (JWT), validaciones y manejo centralizado de errores.

#utils/ => Helpers: respuestas estándar, logs.

#prisma/ => schema.prisma + migraciones.