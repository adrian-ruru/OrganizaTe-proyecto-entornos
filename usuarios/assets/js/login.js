const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Funciones de validación
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (pass) => {
    return pass.length >= 8; // Mínimo 8 caracteres
};

// Validación en tiempo real
emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value)) {
        emailInput.classList.replace('invalid', 'valid') || emailInput.classList.add('valid');
        document.getElementById('emailError').textContent = '';
    } else {
        emailInput.classList.add('invalid');
        document.getElementById('emailError').textContent = 'Introduce un email válido';
    }
});

passwordInput.addEventListener('input', () => {
    if (validatePassword(passwordInput.value)) {
        passwordInput.classList.replace('invalid', 'valid') || passwordInput.classList.add('valid');
        document.getElementById('passwordError').textContent = '';
    } else {
        passwordInput.classList.add('invalid');
        document.getElementById('passwordError').textContent = 'Mínimo 8 caracteres';
    }
});

// Control del envío del formulario
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que se envíe si hay errores

    if (validateEmail(emailInput.value) && validatePassword(passwordInput.value)) {
        alert('¡Formulario correcto! Enviando datos...');
        // Aquí podrías usar fetch() para enviar los datos a tu servidor
    } else {
        alert('Por favor, revisa los campos en rojo antes de continuar.');
    }
});