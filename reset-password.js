    // Reemplazar por los mismos valores de src/js/supabaseClient.js en la
    // app de escritorio (Project URL + clave anon — ninguna de las dos es
    // secreta, están hechas para vivir en código del lado del cliente).
    const SUPABASE_URL = 'https://mxgvaspztajgzxfgtxfq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Z3Zhc3B6dGFqZ3p4Zmd0eGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODE5NzcsImV4cCI6MjEwNTI1Nzk3N30.JWk7cBOR-K4adeHcokcZY0B2WcmTDLmEpIsBMQqtFjY';

    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const $ = (id) => document.getElementById(id);
    function mostrar(id) {
      ['estadoCargando','estadoFormulario','estadoListo','estadoError'].forEach(x => $(x).classList.add('hidden'));
      $(id).classList.remove('hidden');
    }
    function msg(texto, tipo) {
      $('msgBox').innerHTML = `<div class="msg msg-${tipo}">${texto}</div>`;
    }

    // Supabase-js detecta automáticamente el token de recuperación que viene
    // en la URL del link del correo y, si es válido, deja una sesión
    // temporal activa (SOLO sirve para cambiar la contraseña, no da acceso
    // a nada más). Si no hay sesión, el link ya no sirve.
    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        mostrar('estadoFormulario');
      }
    });

    // Por si el evento ya disparó antes de que este script terminara de
    // engancharse, chequeamos también la sesión directamente.
    setTimeout(async () => {
      if (!$('estadoFormulario').classList.contains('hidden')) return;
      const { data } = await sb.auth.getSession();
      if (data.session) mostrar('estadoFormulario');
      else mostrar('estadoError');
    }, 2500);

    $('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const p1 = $('pass1').value, p2 = $('pass2').value;
      if (p1 !== p2) { msg('Las dos contraseñas no coinciden.', 'error'); return; }
      $('btnGuardar').disabled = true;
      const { error } = await sb.auth.updateUser({ password: p1 });
      if (error) {
        msg('No se pudo guardar: ' + error.message, 'error');
        $('btnGuardar').disabled = false;
        return;
      }
      mostrar('estadoListo');
    });
