(() => {
  const button = document.querySelector('#install-app');
  const help = document.querySelector('#install-help');
  const status = document.querySelector('#offline-status');
  let installPrompt;
  let offlineState = 'Preparing offline access…';
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function refresh() {
    button.hidden = standalone() || (!installPrompt && !ios);
    status.hidden = false;
    status.textContent = navigator.onLine ? offlineState :
      (offlineState === 'Ready offline' ? 'Offline · your changes stay on this device' : 'Offline setup incomplete · reconnect to finish');
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    refresh();
  });
  button.addEventListener('click', async () => {
    if (!installPrompt) { help.showModal(); return; }
    const prompt = installPrompt;
    installPrompt = null;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { help.showModal(); }
    refresh();
  });
  document.querySelector('#install-close').onclick = () => help.close();
  window.addEventListener('appinstalled', () => { installPrompt = null; refresh(); });
  window.addEventListener('online', () => { refresh(); setupOffline(); });
  window.addEventListener('offline', refresh);
  matchMedia('(display-mode: standalone)').addEventListener('change', refresh);
  refresh();
  let checking = false;
  async function setupOffline() {
    if (checking) return;
    checking = true;
    try {
      if (!('serviceWorker' in navigator) || !window.isSecureContext) throw new Error('Unsupported');
      const registration = navigator.onLine
        ? await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        : await navigator.serviceWorker.getRegistration();
      if (!registration) throw new Error('Not installed');
      const updateStatus = () => {
        if (registration.waiting) {
          offlineState = 'Update ready · close all app windows and reopen online';
          refresh();
        }
      };
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', updateStatus);
      });
      if (registration.waiting) { updateStatus(); return; }
      const ready = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Offline setup timed out')), 15000))
      ]);
      const channel = new MessageChannel();
      const verified = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Cache verification timed out')); }, 15000);
        channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data.ready); };
        ready.active.postMessage({ type: 'PREPARE_OFFLINE' }, [channel.port2]);
      });
      if (!verified) throw new Error('Offline files unavailable');
      offlineState = 'Ready offline';
      if (registration.waiting) offlineState = 'Update ready · close all app windows and reopen online';
    } catch (error) {
      offlineState = 'Offline setup incomplete · reconnect and reopen';
      console.warn('Offline setup unavailable:', error);
    } finally { checking = false; refresh(); }
  }
  // Do not wait for window.load: slow external resources must not delay setup.
  setupOffline();
  window.addEventListener('pageshow', () => setupOffline());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setupOffline(); });
})();
