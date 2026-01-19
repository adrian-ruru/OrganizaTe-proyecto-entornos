let contacts = JSON.parse(localStorage.getItem('kanbanContacts')) || [];

document.addEventListener('DOMContentLoaded', renderContacts);

function openContactModal() {
    document.getElementById('contactModal').style.display = 'block';
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
    document.getElementById('contactForm').reset();
}

document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newContact = {
        id: Date.now(),
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value
    };

    contacts.push(newContact);
    localStorage.setItem('kanbanContacts', JSON.stringify(contacts));
    
    renderContacts();
    closeContactModal();
});

function renderContacts() {
    const container = document.getElementById('contactsContainer');
    container.innerHTML = '';

    contacts.forEach(contact => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        card.innerHTML = `
            <div class="contact-info">
                <h3>${contact.name}</h3>
                <p>📧 ${contact.email}</p>
                <p>📞 ${contact.phone || 'Sin teléfono'}</p>
            </div>
            <div class="task-actions" style="margin-top: 1rem;">
                <button class="task-btn btn-delete" onclick="deleteContact(${contact.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function deleteContact(id) {
    if(confirm('¿Eliminar este contacto?')) {
        contacts = contacts.filter(c => c.id !== id);
        localStorage.setItem('kanbanContacts', JSON.stringify(contacts));
        renderContacts();
    }
}