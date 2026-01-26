import { createId, escapeHTML, storage } from './utils.js';

const TASKS_KEY = 'organizate_tasks';

const columns = [
  { id: 'todo', label: 'Por hacer' },
  { id: 'progress', label: 'En progreso' },
  { id: 'done', label: 'Completado' },
];

const tasksContainer = document.querySelector('[data-kanban]');
const modal = document.querySelector('[data-modal]');
const modalTitle = document.querySelector('[data-modal-title]');
const taskForm = document.querySelector('[data-task-form]');
const taskTitle = document.querySelector('[data-task-title]');
const taskDescription = document.querySelector('[data-task-description]');
const taskPriority = document.querySelector('[data-task-priority]');
const taskStatus = document.querySelector('[data-task-status]');
const taskIdInput = document.querySelector('[data-task-id]');

let tasks = storage.get(TASKS_KEY, []);

function render() {
  if (!tasksContainer) {
    return;
  }
  tasksContainer.innerHTML = '';
  columns.forEach((column) => {
    const columnTasks = tasks.filter((task) => task.status === column.label);
    const columnEl = document.createElement('section');
    columnEl.className = 'column';
    columnEl.innerHTML = `
      <header>
        <span class="column-title">${column.label}</span>
        <span class="badge" data-status="${column.label}">${columnTasks.length}</span>
      </header>
      <div class="column-body" data-column="${column.label}"></div>
      <button class="btn btn-ghost" data-add-task="${column.label}">+ Nueva tarea</button>
    `;
    const body = columnEl.querySelector('.column-body');
    columnTasks.forEach((task) => {
      const card = document.createElement('article');
      card.className = 'task-card';
      card.dataset.priority = task.priority.toLowerCase();
      card.innerHTML = `
        <div>
          <strong>${escapeHTML(task.title)}</strong>
          <p>${escapeHTML(task.description)}</p>
        </div>
        <span class="badge">Prioridad ${escapeHTML(task.priority)}</span>
        <div class="task-actions">
          <button class="btn btn-secondary" data-open-board="${task.id}">Abrir pizarra</button>
          <button class="btn btn-secondary" data-edit-task="${task.id}">Editar</button>
          <button class="btn btn-danger" data-delete-task="${task.id}">Eliminar</button>
        </div>
      `;
      body.appendChild(card);
    });
    tasksContainer.appendChild(columnEl);
  });
}

function openModal(status = 'Por hacer', task = null) {
  if (!modal) {
    return;
  }
  modal.classList.add('show');
  modalTitle.textContent = task ? 'Editar tarea' : 'Nueva tarea';
  taskIdInput.value = task?.id ?? '';
  taskTitle.value = task?.title ?? '';
  taskDescription.value = task?.description ?? '';
  taskPriority.value = task?.priority ?? 'Media';
  taskStatus.value = task?.status ?? status;
}

function closeModal() {
  if (modal) {
    modal.classList.remove('show');
  }
}

function saveTask(event) {
  event.preventDefault();
  const payload = {
    id: taskIdInput.value || createId('task'),
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    priority: taskPriority.value,
    status: taskStatus.value,
  };
  if (!payload.title) {
    taskTitle.focus();
    return;
  }
  if (taskIdInput.value) {
    tasks = tasks.map((task) => (task.id === payload.id ? payload : task));
  } else {
    tasks.push(payload);
  }
  storage.set(TASKS_KEY, tasks);
  closeModal();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  storage.set(TASKS_KEY, tasks);
  render();
}

if (tasksContainer) {
  render();

  tasksContainer.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-task]');
    if (addButton) {
      openModal(addButton.dataset.addTask);
      return;
    }

    const editButton = event.target.closest('[data-edit-task]');
    if (editButton) {
      const task = tasks.find((item) => item.id === editButton.dataset.editTask);
      if (task) {
        openModal(task.status, task);
      }
      return;
    }

    const deleteButton = event.target.closest('[data-delete-task]');
    if (deleteButton) {
      deleteTask(deleteButton.dataset.deleteTask);
      return;
    }

    const openBoardButton = event.target.closest('[data-open-board]');
    if (openBoardButton) {
      window.open(`board.html?task=${openBoardButton.dataset.openBoard}`, '_blank');
    }
  });
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-modal-close]')) {
      closeModal();
    }
  });
}

if (taskForm) {
  taskForm.addEventListener('submit', saveTask);
}
