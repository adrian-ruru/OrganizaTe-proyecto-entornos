import { createId, storage } from './utils.js';

const CONTACTS_KEY = 'organizate_contacts';

const contactsList = document.querySelector('[data-contacts-list]');
const contactsForm = document.querySelector('[data-contacts-form]');
const contactName = document.querySelector('[data-contact-name]');
const contactRole = document.querySelector('[data-contact-role]');
const contactEmail = document.querySelector('[data-contact-email]');

let contacts = storage.get(CONTACTS_KEY, []);

function renderContacts() {
  contactsList.innerHTML = '';
  contacts.forEach((contact) => {
    const item = document.createElement('article');
    item.className = 'list-item';
    item.innerHTML = `
      <strong>${contact.name}</strong>
      <span>${contact.role}</span>
      <a href="mailto:${contact.email}">${contact.email}</a>
      <button class="btn btn-danger" data-delete-contact="${contact.id}">Eliminar</button>
    `;
    contactsList.appendChild(item);
  });
}

function saveContact(event) {
  event.preventDefault();
  const payload = {
    id: createId('contact'),
    name: contactName.value.trim(),
    role: contactRole.value.trim(),
    email: contactEmail.value.trim(),
  };
  if (!payload.name || !payload.email) {
    contactName.focus();
    return;
  }
  contacts = [payload, ...contacts];
  storage.set(CONTACTS_KEY, contacts);
  contactsForm.reset();
  renderContacts();
}

if (contactsForm) {
  contactsForm.addEventListener('submit', saveContact);
  contactsList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-contact]');
    if (deleteButton) {
      contacts = contacts.filter((contact) => contact.id !== deleteButton.dataset.deleteContact);
      storage.set(CONTACTS_KEY, contacts);
      renderContacts();
    }
  });
}

renderContacts();
