export async function createReminderAPI(reminder) {

  return fetch('/api/reminders', {

    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminder)
    
  });

}