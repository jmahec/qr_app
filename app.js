/* ══════════════════════════════════════════
   CARNÉ DIGITAL CIANDCO — app.js
   ══════════════════════════════════════════ */

/* ── ESTADO GLOBAL ── */
let currentRole = 'estudiante';
let qrTimer     = null;
let qrSeconds   = 30;
let scanState   = 0;

const CIRCUMFERENCE = 2 * Math.PI * 36; // radio 36 del SVG timer

/* ══════════════════════════════════════════
   NAVEGACIÓN
   ══════════════════════════════════════════ */

/**
 * Muestra una pantalla y oculta las demás.
 * Si la pantalla es qr-screen, inicializa el QR automáticamente.
 * @param {string} id - ID de la pantalla a mostrar
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  if (id === 'qr-screen') initQR();
}

/**
 * Selecciona el rol en el login.
 * @param {HTMLElement} el  - Chip clickeado
 * @param {string}      rol - 'estudiante' | 'vigilante' | 'admin'
 */
function selectRole(el, rol) {
  document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentRole = rol;
}

/**
 * Ejecuta el login: redirige según el rol seleccionado.
 */
function doLogin() {
  if (currentRole === 'vigilante') { showScreen('vigilante'); return; }
  if (currentRole === 'admin')     { showScreen('admin');     return; }
  showScreen('dashboard');
}

/* ══════════════════════════════════════════
   SPLASH AUTO-AVANCE
   ══════════════════════════════════════════ */
setTimeout(() => showScreen('login'), 2600);

/* ══════════════════════════════════════════
   QR DINÁMICO
   ══════════════════════════════════════════ */

/**
 * Inicializa (o reinicia) el QR y su temporizador.
 */
function initQR() {
  clearInterval(qrTimer);
  qrSeconds = 30;

  const container = document.getElementById('qr-container');
  const overlay   = document.getElementById('qr-expired-overlay');

  container.classList.remove('expiring', 'expired');
  overlay.classList.remove('show');

  renderQR();
  updateTimerUI();

  qrTimer = setInterval(() => {
    qrSeconds--;
    updateTimerUI();

    if (qrSeconds <= 8)  container.classList.add('expiring');
    if (qrSeconds <= 0) {
      clearInterval(qrTimer);
      container.classList.remove('expiring');
      container.classList.add('expired');
      overlay.classList.add('show');
    }
  }, 1000);
}

/**
 * Actualiza el contador visual y el anillo SVG del temporizador.
 */
function updateTimerUI() {
  const secsEl   = document.getElementById('qr-seconds');
  const progress = document.getElementById('qr-progress');

  secsEl.textContent = Math.max(0, qrSeconds);

  const offset = CIRCUMFERENCE * (1 - qrSeconds / 30);
  progress.style.strokeDashoffset = offset;
  progress.style.stroke = qrSeconds <= 8 ? '#F59E0B' : '#10B981';
}

/**
 * Genera y renderiza un nuevo código QR con un token único.
 */
function renderQR() {
  const container = document.getElementById('qrcode');
  container.innerHTML = '';

  const token = 'CIANDCO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();

  try {
    new QRCode(container, {
      text: token,
      width: 184,
      height: 184,
      colorDark:  '#0A1628',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (e) {
    // Fallback si QRCode.js no carga
    container.innerHTML = `
      <div style="width:184px;height:184px;display:flex;align-items:center;justify-content:center;
                  background:#f3f4f6;border-radius:8px;font-size:11px;color:#6b7280;text-align:center;padding:16px;">
        QR generado<br><strong>${token.substr(0, 20)}</strong>
      </div>`;
  }
}

/**
 * Botón "Regenerar QR": reinicia el temporizador y genera un nuevo código.
 */
function regenQR() {
  initQR();
}

/* ══════════════════════════════════════════
   SIMULADOR DE ESCANEO (Panel Vigilante)
   ══════════════════════════════════════════ */

const SCAN_RESULTS = [
  { cls: 'success', titulo: 'Acceso Permitido ✓', sub: 'Julian Mahecha · #2025-00847 · QR válido'       },
  { cls: 'danger',  titulo: 'Acceso Denegado ✗',  sub: 'QR expirado — Solicitar nuevo código'           },
  { cls: 'success', titulo: 'Acceso Permitido ✓', sub: 'Ana Torres · #2025-00612 · QR válido'           },
  { cls: 'danger',  titulo: 'Acceso Denegado ✗',  sub: 'Estudiante suspendido — Contactar administrador'},
];

/**
 * Simula el escaneo de un QR, alternando entre resultados predefinidos.
 */
function simulateScan() {
  const box   = document.getElementById('scan-result-box');
  const title = document.getElementById('scan-title');
  const sub   = document.getElementById('scan-sub');

  const result = SCAN_RESULTS[scanState % SCAN_RESULTS.length];
  scanState++;

  box.className = 'scan-result ' + result.cls;
  title.textContent = result.titulo;
  sub.textContent   = result.sub;
}
