(() => {
  const video = document.querySelector('#hero-video');
  const button = document.querySelector('#video-toggle');
  const label = document.querySelector('#video-label');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData;
  let userPaused = false;
  let resumeOnVisible = false;
  let heroVisible = true;
  let resumeWhenInView = false;
  function loadVideo() {
    if (!video.getAttribute('src')) {
      video.src = window.matchMedia('(max-width: 760px)').matches ? './assets/florist-mobile.mp4' : './assets/florist.mp4';
      video.load();
    }
  }
  function updateButton() {
    const playing = !video.paused && !video.ended;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Приостановить фоновое видео' : 'Воспроизвести фоновое видео');
    label.textContent = playing ? 'Пауза' : 'Смотреть';
  }
  async function play() {
    loadVideo(); video.muted = true;
    try { await video.play(); } catch { updateButton(); }
  }
  button.hidden = false;
  button.addEventListener('click', () => {
    if (video.paused) { userPaused = false; play(); }
    else { userPaused = true; video.pause(); }
  });
  video.addEventListener('playing', () => { video.classList.add('has-frame'); updateButton(); });
  video.addEventListener('pause', updateButton);
  video.addEventListener('error', () => { video.classList.remove('has-frame'); button.hidden = true; });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { video.pause(); video.classList.remove('has-frame'); }
    else if (!userPaused && !saveData && !document.hidden) { play(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeOnVisible = !video.paused; video.pause(); }
    else if (resumeOnVisible && heroVisible && !userPaused && !reducedMotion.matches) { play(); }
  });
  if (!reducedMotion.matches && !saveData) play();

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const heroObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        heroVisible = entry.isIntersecting;
        if (!heroVisible) { resumeWhenInView = !video.paused; video.pause(); }
        else if (resumeWhenInView && !userPaused && !reducedMotion.matches && !document.hidden) { play(); }
      }
    }, { threshold: 0.05 });
    heroObserver.observe(document.querySelector('.hero'));

    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    if (!reducedMotion.matches) {
      document.querySelectorAll('[data-reveal]').forEach(element => {
        if (element.getBoundingClientRect().top > window.innerHeight * 0.95) {
          element.classList.add('reveal-pending');
          revealObserver.observe(element);
        }
      });
    }
  }

  const mobileMenu = document.querySelector('.mobile-menu');
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileMenu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.open) {
      mobileMenu.open = false;
      mobileMenu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
  });
})();
