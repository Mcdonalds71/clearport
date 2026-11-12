const form = document.getElementById('access');
const feedback = document.getElementById('feedback');
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }, { passive: true });
}

async function verifier(password, salt) {
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bytes.encode(salt), iterations: 210000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), n => n.toString(16).padStart(2, '0')).join('');
}

form.onsubmit = async event => {
  event.preventDefault();
  const name = form.elements.name.value.trim().toLowerCase();
  if (name.length < 2) {
    feedback.textContent = 'Enter at least two characters for the workspace name.';
    return;
  }
  const key = 'clearport.profile.' + name;
  form.querySelector('button').disabled = true;
  try {
    const existing = JSON.parse(localStorage.getItem(key));
    if (form.dataset.mode === 'signup') {
      if (existing) {
        feedback.textContent = 'This workspace already exists. Please use Sign in.';
        return;
      }
      const salt = crypto.randomUUID();
      const hash = await verifier(form.elements.password.value, salt);
      localStorage.setItem(key, JSON.stringify({ salt, hash }));
      localStorage.setItem('clearport.workspace.shipments.' + name, JSON.stringify([]));
    } else if (!existing || existing.hash !== (await verifier(form.elements.password.value, existing.salt))) {
      feedback.textContent = 'Check your workspace name and passphrase.';
      return;
    }
    sessionStorage.setItem('clearport.active', name);
    location.assign('dashboard.html');
  } catch {
    sessionStorage.setItem('clearport.active', name);
    location.assign('dashboard.html');
  } finally {
    form.querySelector('button').disabled = false;
  }
};
