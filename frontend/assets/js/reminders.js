import { validateReminder } from './validations/reminderValidation.js';
import { createReminderAPI } from './api.js';

export function initReminders() {

  console.log("Módulo de recordatorios inicializado");

}

/*
Ejemplo de estructura de datos de un recordatorio:

{
  taskId: number,
  reminderDate: string (ISO),
  notes: string
}
*/