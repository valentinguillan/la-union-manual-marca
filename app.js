(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.chapter-nav');
  const navLinks = [...nav.querySelectorAll('a')];
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (menu.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
  });
  const chapters = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (!visible.length) return;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${visible[0].target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin: '-100px 0px -65% 0px', threshold: 0});
    chapters.forEach(section => observer.observe(section));
  }
  let scrollQueued = false;
  const progress = document.querySelector('.reading-progress');
  function updateProgress() {
    const max = document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, window.scrollY/max*100)) : 0}%`;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, {passive:true});
  window.addEventListener('resize', updateProgress);
  updateProgress();
  const combinations = {
    'red-white': {logo:'red', name:'Rojo sobre blanco', use:'Firma y aperturas limpias.', alt:'Firma roja de La Unión sobre blanco'},
    'white-red': {logo:'white', name:'Blanco sobre rojo', use:'Negativo principal.', alt:'Firma blanca de La Unión sobre rojo'},
    'red-beige': {logo:'red', name:'Rojo sobre beige', use:'Marca y mensajes grandes.', alt:'Firma roja de La Unión sobre beige'},
    'beige-red': {logo:'beige', name:'Beige sobre rojo', use:'Símbolos y recursos amplios.', alt:'Firma beige de La Unión sobre rojo'}
  };
  const preview = document.querySelector('.combination-preview');
  const previewLogo = document.querySelector('#combination-logo');
  document.querySelectorAll('input[name="pair"]').forEach(input => input.addEventListener('change', () => {
    const pair = combinations[input.value];
    if (!pair) return;
    preview.dataset.pair = input.value;
    previewLogo.src = `assets/logo-${pair.logo}.svg`;
    previewLogo.alt = pair.alt;
    document.querySelector('#combination-name').textContent = pair.name;
    document.querySelector('#combination-use').textContent = pair.use;
  }));
  const toast = document.querySelector('.toast');
  let toastTimer;
  function announce(message) {
    clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  }
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(button.dataset.copy);
      announce(`${button.dataset.copy} copiado.`);
    } catch (_) {
      announce(`Código: ${button.dataset.copy}. Podés seleccionarlo y copiarlo.`);
    }
  }));
  const dialog = document.querySelector('.image-dialog');
  const dialogImage = dialog.querySelector('.dialog-image');
  const dialogCaption = document.querySelector('#image-dialog-caption');
  let imageTrigger = null;
  document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
    if (typeof dialog.showModal !== 'function') {
      window.open(button.dataset.full, '_blank', 'noopener'); return;
    }
    imageTrigger = button;
    dialogImage.src = button.dataset.full;
    dialogImage.alt = button.querySelector('img').alt;
    dialogCaption.textContent = button.dataset.caption || '';
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { imageTrigger?.focus(); });
})();
