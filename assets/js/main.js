(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const background = document.querySelector('.background');
  const bgPath = document.body.dataset.bg;
  if (background && bgPath) background.style.backgroundImage = `url("${bgPath}")`;

  document.querySelectorAll('.artwork-wrap img').forEach((image) => {
    image.addEventListener('error', () => image.parentElement.classList.add('image-missing'));
  });

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  const panels = [...document.querySelectorAll('.track-toggle')];
  const setPanel = (button, open, animate = true) => {
    const lyrics = button.nextElementSibling;
    button.setAttribute('aria-expanded', String(open));
    if (!animate || reducedMotion) {
      lyrics.hidden = !open;
      lyrics.style.height = '';
      return Promise.resolve();
    }
    lyrics.hidden = false;
    const from = open ? 0 : lyrics.scrollHeight;
    const to = open ? lyrics.scrollHeight : 0;
    lyrics.style.height = `${from}px`;
    lyrics.offsetHeight;
    lyrics.style.transition = 'height 420ms cubic-bezier(.2,.75,.25,1)';
    lyrics.style.height = `${to}px`;
    return new Promise((resolve) => {
      const finish = () => {
        lyrics.style.transition = '';
        lyrics.style.height = '';
        if (!open) lyrics.hidden = true;
        resolve();
      };
      lyrics.addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 500);
    });
  };
  panels.forEach((button) => button.addEventListener('click', async () => {
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    const current = panels.find((item) => item !== button && item.getAttribute('aria-expanded') === 'true');
    if (current) await setPanel(current, false);
    await setPanel(button, shouldOpen);
  }));

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || target.pathname === location.pathname && target.hash) return;
    if (reducedMotion) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => { location.href = target.href; }, 300);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
})();
