const registroForm = document.querySelector('form');
const nombreInput = document.getElementById('nombre');
const apellidosInput = document.getElementById('apellidos');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');

// Funciones de validación
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pass) => pass.length >= 8;
const validateNotEmpty = (text) => text.trim().length > 0;

// Función auxiliar para aplicar estilos y mensajes
const setStatus = (input, errorId, isValid, message) => {
    const errorSpan = document.getElementById(errorId);
    if (isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorSpan.textContent = '';
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        errorSpan.textContent = message;
    }
};

// Validación en tiempo real
nombreInput.addEventListener('input', () => {
    setStatus(nombreInput, 'error-nombre', validateNotEmpty(nombreInput.value), 'El nombre es obligatorio');
});

apellidosInput.addEventListener('input', () => {
    setStatus(apellidosInput, 'error-apellidos', validateNotEmpty(apellidosInput.value), 'Los apellidos son obligatorios');
});

emailInput.addEventListener('input', () => {
    setStatus(emailInput, 'error-email', validateEmail(emailInput.value), 'Introduce un email válido');
});

passwordInput.addEventListener('input', () => {
    setStatus(passwordInput, 'error-password', validatePassword(passwordInput.value), 'Mínimo 8 caracteres');
    // Validar confirmación también si ya se escribió algo en ella
    if (confirmInput.value !== '') {
        setStatus(confirmInput, 'error-confirm', confirmInput.value === passwordInput.value, 'Las contraseñas no coinciden');
    }
});

confirmInput.addEventListener('input', () => {
    setStatus(confirmInput, 'error-confirm', confirmInput.value === passwordInput.value && validatePassword(confirmInput.value), 'Las contraseñas no coinciden');
});

// Control del envío del formulario
registroForm.addEventListener('submit', (e) => {
    const isNombreValid = validateNotEmpty(nombreInput.value);
    const isApellidosValid = validateNotEmpty(apellidosInput.value);
    const isEmailValid = validateEmail(emailInput.value);
    const isPassValid = validatePassword(passwordInput.value);
    const isConfirmValid = confirmInput.value === passwordInput.value;

    if (isNombreValid && isApellidosValid && isEmailValid && isPassValid && isConfirmValid) {
        alert('¡Cuenta creada con éxito!');
        // Aquí iría tu fetch()
    } else {
        e.preventDefault(); // Evita el envío
        alert('Por favor, revisa que todos los campos sean correctos.');
        
        // Forzar la visualización de errores si intentan enviar vacío
        setStatus(nombreInput, 'error-nombre', isNombreValid, 'El nombre es obligatorio');
        setStatus(apellidosInput, 'error-apellidos', isApellidosValid, 'Los apellidos son obligatorios');
        setStatus(emailInput, 'error-email', isEmailValid, 'Introduce un email válido');
        setStatus(passwordInput, 'error-password', isPassValid, 'Mínimo 8 caracteres');
        setStatus(confirmInput, 'error-confirm', isConfirmValid, 'Las contraseñas no coinciden');
    }
});