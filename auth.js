// =========================================================================
// CLAVES DE CONEXIÓN A SUPABASE
// =========================================================================
const SUPABASE_URL = 'https://rfhmmkgmghqqhietcwgb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TqeGkrzld3HnD_kdkCT-sg_u2-jt9Bs';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirección automática cuando el usuario confirma el correo y vuelve a la web
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
        alert('¡Correo electrónico verificado correctamente! Bienvenido a C Telemetry AI.');
        window.location.href = 'dashboard.html';
    }
});

function abrirModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

// REGISTRO UNIFICADO CON ENVÍO DE CORREO DE VERIFICACIÓN
async function procesarRegistro(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellidos = document.getElementById('reg-apellidos').value.trim();
    const edad = document.getElementById('reg-edad').value;
    const email = document.getElementById('reg-email').value.trim();
    const pass1 = document.getElementById('reg-pass1').value;
    const pass2 = document.getElementById('reg-pass2').value;

    const errorEl = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');
    const btnSubmit = document.getElementById('btn-reg-submit');

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (pass1 !== pass2) {
        errorEl.textContent = 'Las contraseñas no coinciden.';
        errorEl.style.display = 'block';
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Creando cuenta y enviando correo...';

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: pass1,
        options: {
            emailRedirectTo: 'https://luccaa06.github.io/C-telemetry-ai/',
            data: {
                nombre: nombre,
                apellidos: apellidos,
                edad: parseInt(edad)
            }
        }
    });

    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Registrarse y Enviar Correo';

    if (error) {
        errorEl.textContent = 'Error al registrar: ' + error.message;
        errorEl.style.display = 'block';
        return;
    }

    document.getElementById('form-signup').reset();
    successEl.innerHTML = `<strong>¡Registro casi listo!</strong><br>Hemos enviado un enlace de verificación a <b>${email}</b>. Revisa tu bandeja de entrada (o Spam) y haz clic en el enlace para activar tu cuenta.`;
    successEl.style.display = 'block';
}

// INICIO DE SESIÓN CONTRA LA BASE DE DATOS
async function procesarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('login-error');
    const btnLogin = document.getElementById('btn-login-submit');

    errorEl.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando credenciales...';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: pass
    });

    btnLogin.disabled = false;
    btnLogin.textContent = 'Entrar al Panel';

    if (error) {
        if (error.message.includes('Email not confirmed')) {
            errorEl.textContent = 'Aún no has verificado tu correo. Haz clic en el enlace que enviamos a tu bandeja de entrada.';
        } else {
            errorEl.textContent = 'Correo o contraseña incorrectos.';
        }
        errorEl.style.display = 'block';
        return;
    }

    window.location.href = 'dashboard.html';
}