# OrganizaTe - Gestión de Tareas Kanban

Una aplicación web moderna y funcional para gestionar tareas utilizando el método Kanban.

## Características

- 📋 **Tres columnas Kanban**: Por Hacer, En Progreso y Completado
- ➕ **Crear tareas**: Añade tareas con título, descripción y prioridad (Baja, Media, Alta)
- ✏️ **Editar tareas**: Modifica cualquier tarea existente
- 🗑️ **Eliminar tareas**: Elimina tareas que ya no necesitas
- 🎨 **Interfaz moderna**: Diseño limpio y profesional con gradientes y sombras
- 📱 **Responsive**: Se adapta perfectamente a dispositivos móviles y tablets
- 🔄 **Drag & Drop**: Arrastra y suelta tareas entre columnas (funcionalidad implementada)
- 💾 **Persistencia**: Las tareas se guardan en localStorage del navegador
- 🎯 **Prioridades visuales**: Etiquetas de color según la prioridad de cada tarea
- 🔢 **Contadores**: Muestra el número de tareas en cada columna

## Cómo usar

1. Abre el archivo `index.html` en tu navegador web
2. Haz clic en "+ Nueva Tarea" en cualquier columna para crear una tarea
3. Completa el formulario con título, descripción y prioridad
4. Usa los botones "Editar" y "Eliminar" en cada tarea para gestionarlas
5. Las tareas se guardan automáticamente en tu navegador

## Estructura del proyecto

```
OrganizaTe-proyecto-entornos/
├── index.html      # Estructura HTML del tablero Kanban
├── styles.css      # Estilos y diseño responsive
├── script.js       # Lógica de interacción y gestión de tareas
└── README.md       # Documentación del proyecto
```

## Tecnologías utilizadas

- HTML5
- CSS3 (Grid, Flexbox, Variables CSS, Animaciones)
- JavaScript (Vanilla JS, LocalStorage, Drag & Drop API)

## Funcionalidades técnicas

- **LocalStorage**: Persistencia de datos entre sesiones
- **Drag and Drop**: API nativa de HTML5 para arrastrar tareas
- **Responsive Design**: Media queries para adaptación móvil
- **Modal dinámico**: Para crear y editar tareas
- **Validación de formularios**: Campos requeridos
- **Atajos de teclado**: ESC para cerrar modal, Ctrl/Cmd + Enter para guardar
- **Escape de HTML**: Prevención de XSS en contenido de tareas

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
