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
loginForm.addEventListener('submit', async (e) => { // Añadimos 'async' para usar await
    e.preventDefault(); 

    if (validateEmail(emailInput.value) && validatePassword(passwordInput.value)) {
        
        // --- NUEVA LÓGICA DE ENVÍO ---
        const loginData = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos datos importantes para usarlos en el Dashboard
                localStorage.setItem('usuarioNombre', data.nombre);
                localStorage.setItem('usuarioId', data.id);
                
                alert('¡Bienvenido/a ' + data.nombre + '!');
                window.location.href = '../frontend/views/dashboard.html'; // Ajusta esta ruta a tu proyecto
            } else {
                alert('Error al iniciar sesión: ' + data.error);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor. Asegúrate de que el Backend esté corriendo.');
        }
        // ------------------------------

    } else {
        alert('Por favor, revisa los campos en rojo antes de continuar.');
    }
});