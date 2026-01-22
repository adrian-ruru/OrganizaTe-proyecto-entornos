export function validateReminder(data) {

  const errors = [];

  if (!data.taskId) {

    errors.push("El recordatorio debe estar asociado a una tarea");

  }

  if (!data.reminderDate) {

    errors.push("La fecha del recordatorio es obligatoria");

  }

  if (new Date(data.reminderDate) < new Date()) {

    errors.push("La fecha del recordatorio no puede ser pasada");
    
  }

  return errors;

}