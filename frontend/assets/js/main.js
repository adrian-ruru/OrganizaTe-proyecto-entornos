const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav]');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

const page = document.body.dataset.page;
if (page) {
  const activeLink = document.querySelector(`[data-page-link="${page}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

const userNameTarget = document.querySelector('[data-user-name]');
if (userNameTarget) {
  const storedName = localStorage.getItem('organizate_user');
  if (storedName) {
    userNameTarget.textContent = storedName;
  }
}
