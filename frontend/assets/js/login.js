const loginForm = document.querySelector('[data-login-form]');
const nameInput = document.querySelector('[data-login-name]');
const workspaceInput = document.querySelector('[data-login-workspace]');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const workspace = workspaceInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    localStorage.setItem('organizate_user', name);
    localStorage.setItem('organizate_workspace', workspace || 'Equipo central');
    window.location.href = 'dashboard.html';
  });
}
