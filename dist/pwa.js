(() => {
  const button = document.querySelector('#install-app');
  const help = document.querySelector('#install-help');
  const status = document.querySelector('#offline-status');
  let installPrompt;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function refresh() {
    button.hidden = standalone() || (!installPrompt && !ios);
    status.hidden = navigator.onLine;
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
  window.addEventListener('online', refresh);
  window.addEventListener('offline', refresh);
  matchMedia('(display-mode: standalone)').addEventListener('change', refresh);
  refresh();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .catch(error => console.warn('Offline setup unavailable:', error));
    });
  }
})();
