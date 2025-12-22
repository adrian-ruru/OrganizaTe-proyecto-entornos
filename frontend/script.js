// Variables globales
let tasks = {
    todo: [],
    inprogress: [],
    done: []
};

let currentColumn = '';
let taskIdCounter = 0;
let editingTaskId = null;

// Cargar tareas del localStorage al iniciar
window.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderAllTasks();
});

// Función para agregar nueva tarea
function addTask(column) {
    currentColumn = column;
    editingTaskId = null;
    document.getElementById('taskForm').reset();
    document.querySelector('.modal-content h2').textContent = 'Nueva Tarea';
    openModal();
}

// Función para abrir el modal
function openModal() {
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskTitle').focus();
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    document.getElementById('taskForm').reset();
    editingTaskId = null;
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Manejar el submit del formulario
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    
    if (!title) {
        alert('Por favor, ingresa un título para la tarea');
        return;
    }
    
    if (editingTaskId !== null) {
        // Editar tarea existente
        updateTask(editingTaskId, title, description, priority);
    } else {
        // Crear nueva tarea
        const task = {
            id: taskIdCounter++,
            title: title,
            description: description,
            priority: priority,
            createdAt: new Date().toISOString()
        };
        
        tasks[currentColumn].push(task);
        saveTasksToStorage();
        renderTasks(currentColumn);
    }
    
    closeModal();
});

// Función para actualizar tarea existente
function updateTask(taskId, title, description, priority) {
    for (let column in tasks) {
        const taskIndex = tasks[column].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[column][taskIndex].title = title;
            tasks[column][taskIndex].description = description;
            tasks[column][taskIndex].priority = priority;
            saveTasksToStorage();
            renderTasks(column);
            break;
        }
    }
}

// Función para editar tarea
function editTask(taskId) {
    let task = null;
    let taskColumn = '';
    
    for (let column in tasks) {
        task = tasks[column].find(t => t.id === taskId);
        if (task) {
            taskColumn = column;
            break;
        }
    }
    
    if (task) {
        currentColumn = taskColumn;
        editingTaskId = taskId;
        
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.querySelector('.modal-content h2').textContent = 'Editar Tarea';
        
        openModal();
    }
}

// Función para eliminar tarea
function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        return;
    }
    
    for (let column in tasks) {
        const taskIndex = tasks[column].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[column].splice(taskIndex, 1);
            saveTasksToStorage();
            renderTasks(column);
            break;
        }
    }
}

// Función para renderizar tareas de una columna
function renderTasks(column) {
    const container = document.getElementById(`${column}-tasks`);
    const columnTasks = tasks[column];
    
    container.innerHTML = '';
    
    columnTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        container.appendChild(taskCard);
    });
    
    updateTaskCount(column);
}

// Función para renderizar todas las tareas
function renderAllTasks() {
    renderTasks('todo');
    renderTasks('inprogress');
    renderTasks('done');
}

// Función para crear un elemento de tarjeta de tarea
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    card.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <span class="task-priority priority-${task.priority}">${getPriorityText(task.priority)}</span>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-actions">
            <button class="task-btn btn-edit" onclick="editTask(${task.id})">Editar</button>
            <button class="task-btn btn-delete" onclick="deleteTask(${task.id})">Eliminar</button>
        </div>
    `;
    
    // Eventos de drag and drop
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
    
    return card;
}

// Función para obtener texto de prioridad
function getPriorityText(priority) {
    const priorities = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta'
    };
    return priorities[priority] || 'Media';
}

// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para actualizar contador de tareas
function updateTaskCount(column) {
    const count = tasks[column].length;
    const countElement = document.querySelector(`#${column}-column .task-count`);
    countElement.textContent = count;
}

// Funciones de Drag and Drop
let draggedTask = null;

function dragStart(e) {
    draggedTask = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function drop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedTask) return;
    
    const targetContainer = e.currentTarget;
    const targetColumn = targetContainer.id.replace('-tasks', '');
    const taskId = parseInt(draggedTask.dataset.taskId);
    
    // Encontrar y mover la tarea
    let sourceColumn = null;
    let taskToMove = null;
    
    for (let column in tasks) {
        const taskIndex = tasks[column].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            sourceColumn = column;
            taskToMove = tasks[column][taskIndex];
            tasks[column].splice(taskIndex, 1);
            break;
        }
    }
    
    if (taskToMove && sourceColumn !== targetColumn) {
        tasks[targetColumn].push(taskToMove);
        saveTasksToStorage();
        renderAllTasks();
    }
    
    draggedTask = null;
}



// Funciones de localStorage
function saveTasksToStorage() {
    try {
        localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        localStorage.setItem('kanbanTaskIdCounter', taskIdCounter.toString());
    } catch (e) {
        console.error('Error al guardar tareas:', e);
    }
}

function loadTasksFromStorage() {
    try {
        const savedTasks = localStorage.getItem('kanbanTasks');
        const savedCounter = localStorage.getItem('kanbanTaskIdCounter');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        if (savedCounter) {
            taskIdCounter = parseInt(savedCounter);
        }
        
        // Asegurar que todas las columnas existan
        if (!tasks.todo) tasks.todo = [];
        if (!tasks.inprogress) tasks.inprogress = [];
        if (!tasks.done) tasks.done = [];
        
    } catch (e) {
        console.error('Error al cargar tareas:', e);
        tasks = { todo: [], inprogress: [], done: [] };
        taskIdCounter = 0;
    }
}

// Atajos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para cerrar modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + Enter para guardar en el modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const modal = document.getElementById('taskModal');
        if (modal.style.display === 'block') {
            const form = document.getElementById('taskForm');
            // Usar requestSubmit si está disponible, o submit como fallback
            if (form.requestSubmit) {
                form.requestSubmit();
            } else {
                // Fallback para navegadores antiguos
                if (form.checkValidity()) {
                    form.dispatchEvent(new Event('submit'));
                } else {
                    form.reportValidity();
                }
            }
        }
    }
});
