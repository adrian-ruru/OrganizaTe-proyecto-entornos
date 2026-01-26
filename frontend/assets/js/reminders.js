import { createId, formatDate, storage } from './utils.js';
import { validateReminder } from './validations/reminderValidation.js';

const REMINDERS_KEY = 'organizate_reminders';
const TASKS_KEY = 'organizate_tasks';

const remindersList = document.querySelector('[data-reminders-list]');
const reminderForm = document.querySelector('[data-reminder-form]');
const reminderTask = document.querySelector('[data-reminder-task]');
const reminderDate = document.querySelector('[data-reminder-date]');
const reminderNotes = document.querySelector('[data-reminder-notes]');
const reminderErrors = document.querySelector('[data-reminder-errors]');

let reminders = storage.get(REMINDERS_KEY, []);

function loadTasks() {
  const tasks = storage.get(TASKS_KEY, []);
  reminderTask.innerHTML = '<option value="">Selecciona una tarea</option>';
  tasks.forEach((task) => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = task.title;
    reminderTask.appendChild(option);
  });
}

function renderReminders() {
  if (!remindersList) {
    return;
  }
  remindersList.innerHTML = '';
  reminders.forEach((reminder) => {
    const item = document.createElement('article');
    item.className = 'list-item';
    item.innerHTML = `
      <strong>${reminder.taskTitle}</strong>
      <span>${formatDate(reminder.reminderDate)}</span>
      <p>${reminder.notes || 'Sin notas adicionales.'}</p>
      <button class="btn btn-danger" data-delete-reminder="${reminder.id}">Eliminar</button>
    `;
    remindersList.appendChild(item);
  });
}

function saveReminder(event) {
  event.preventDefault();
  const tasks = storage.get(TASKS_KEY, []);
  const task = tasks.find((entry) => entry.id === reminderTask.value);
  const payload = {
    id: createId('reminder'),
    taskId: reminderTask.value,
    taskTitle: task ? task.title : 'Tarea sin título',
    reminderDate: reminderDate.value,
    notes: reminderNotes.value.trim(),
  };
  const errors = validateReminder(payload);
  reminderErrors.innerHTML = '';
  if (errors.length) {
    errors.forEach((message) => {
      const li = document.createElement('li');
      li.textContent = message;
      reminderErrors.appendChild(li);
    });
    return;
  }
  reminders = [payload, ...reminders];
  storage.set(REMINDERS_KEY, reminders);
  reminderForm.reset();
  renderReminders();
}

if (reminderForm) {
  reminderForm.addEventListener('submit', saveReminder);
  remindersList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-reminder]');
    if (deleteButton) {
      reminders = reminders.filter((item) => item.id !== deleteButton.dataset.deleteReminder);
      storage.set(REMINDERS_KEY, reminders);
      renderReminders();
    }
  });
}

loadTasks();
renderReminders();
