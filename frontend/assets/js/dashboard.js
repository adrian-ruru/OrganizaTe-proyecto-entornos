import { storage } from './utils.js';

const TASKS_KEY = 'organizate_tasks';
const REMINDERS_KEY = 'organizate_reminders';

const taskCount = document.querySelector('[data-task-count]');
const reminderCount = document.querySelector('[data-reminder-count]');
const workspaceName = document.querySelector('[data-workspace-name]');

const tasks = storage.get(TASKS_KEY, []);
const reminders = storage.get(REMINDERS_KEY, []);

if (taskCount) {
  taskCount.textContent = tasks.length;
}

if (reminderCount) {
  reminderCount.textContent = reminders.length;
}

if (workspaceName) {
  const storedWorkspace = localStorage.getItem('organizate_workspace') || 'Equipo central';
  workspaceName.textContent = storedWorkspace;
}
