(() => {
  const host = document.getElementById('surprise-host');
  const curtain = document.getElementById('surprise-curtain');
  if (!host || !curtain) return;

  let active = null;
  let launching = false;
  let savedScrollY = 0;
  let cssReadyPromise = null;
  let modPromise = null;

  function ensureStyles() {
    if (!cssReadyPromise) {
      cssReadyPromise = new Promise((resolve) => {
        if (document.getElementById('surprise-engine-css')) return resolve();
        const link = document.createElement('link');
        link.id = 'surprise-engine-css';
        link.rel = 'stylesheet';
        link.href = 'surprise/surprise.css?v=2';
        link.onload = () => resolve();
        link.onerror = () => resolve();
        document.head.appendChild(link);
      });
    }
    return cssReadyPromise;
  }

  function ensureModule() {
    if (!modPromise) modPromise = import('./surprise/surprise.js?v=2');
    return modPromise;
  }

  function unlockGestureAudio() {
    if (window.__SURPRISE_AUDIO_CTX__ && window.__SURPRISE_AUDIO_CTX__.state !== 'closed') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC({ latencyHint: 'interactive' });
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      const b = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.connect(ctx.destination);
      s.start(0);
      window.__SURPRISE_AUDIO_CTX__ = ctx;
    } catch (_) {}
  }

  function fadeOutSiteMedia() {
    const music = document.getElementById('music');
    const soundBtn = document.getElementById('sound');
    if (music && !music.paused) {
      const startVol = music.volume || 0.35;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 480);
        music.volume = Math.max(0, startVol * (1 - k));
        if (k < 1) requestAnimationFrame(step);
        else {
          music.pause();
          music.volume = 0.35;
        }
      };
      requestAnimationFrame(step);
    }
    if (soundBtn) {
      soundBtn.innerHTML = '♫ <span>Un peu de musique</span>';
      soundBtn.setAttribute('aria-pressed', 'false');
    }

    const bgVideo = document.getElementById('background');
    const motionBtn = document.getElementById('motion');
    if (bgVideo && !bgVideo.paused) {
      bgVideo.pause();
      bgVideo.classList.remove('playing');
    }
    if (motionBtn) {
      motionBtn.textContent = '▶ Animer le fond';
      motionBtn.setAttribute('aria-pressed', 'false');
    }
  }

  async function launch(ev, opts = {}) {
    if (launching || active) return;
    launching = true;
    savedScrollY = window.scrollY || window.pageYOffset || 0;

    if (!opts.skipGestureAudio) unlockGestureAudio();
    fadeOutSiteMedia();

    // Close any open modal before morphing
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());

    const rect = ev?.currentTarget?.getBoundingClientRect?.();
    const cx = ev && typeof ev.clientX === 'number' && ev.clientX > 0 ? ev.clientX : rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = ev && typeof ev.clientY === 'number' && ev.clientY > 0 ? ev.clientY : rect ? rect.top + rect.height / 2 : window.innerHeight * 0.6;
    curtain.style.setProperty('--cx', Math.round(cx) + 'px');
    curtain.style.setProperty('--cy', Math.round(cy) + 'px');
    curtain.classList.remove('fade');

    const morphDuration = opts.instant ? 80 : 880;
    document.body.classList.add('site-morph-out');
    requestAnimationFrame(() => curtain.classList.add('open'));

    const [, mod] = await Promise.all([
      ensureStyles(),
      ensureModule(),
      new Promise((r) => setTimeout(r, morphDuration)),
    ]);

    document.body.classList.add('site-hidden');
    host.classList.add('active');

    active = await mod.mountSurprise({
      container: host,
      assetBase: 'surprise/',
      sceneId: opts.sceneId || null,
      autoStart: Boolean(opts.autoStart),
      fromGesture: !opts.skipGestureAudio,
      onExit: (destroyFn) => exitBack(destroyFn),
    });

    curtain.classList.add('fade');
    setTimeout(() => {
      curtain.classList.remove('open', 'fade');
      launching = false;
    }, 620);
  }

  function exitBack(destroyFn) {
    if (launching) return;
    launching = true;
    curtain.style.setProperty('--cx', '50%');
    curtain.style.setProperty('--cy', '50%');
    curtain.classList.remove('fade');
    curtain.classList.add('open');

    setTimeout(() => {
      try {
        (destroyFn || active?.destroy)?.();
      } finally {
        active = null;
        host.classList.remove('active');
        document.body.classList.remove('site-hidden', 'site-morph-out');
        try {
          window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        } catch (_) {
          window.scrollTo(0, savedScrollY);
        }
        requestAnimationFrame(() => {
          curtain.classList.add('fade');
          setTimeout(() => {
            curtain.classList.remove('open', 'fade');
            launching = false;
          }, 600);
        });
      }
    }, 450);
  }

  // Subtle hover/touch warm-up so assets & module start fetching before click completes
  const warm = () => {
    ensureStyles();
    ensureModule();
  };

  document.querySelectorAll('.js-surprise-trigger').forEach((btn) => {
    btn.addEventListener('pointerenter', warm, { once: true });
    btn.addEventListener('touchstart', warm, { once: true, passive: true });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      launch(e);
    });
  });

  // Optional direct-scene preview parameter (?surprise=1&scene=...)
  const params = new URLSearchParams(location.search);
  if (params.has('surprise') || params.get('scene')) {
    launch(null, {
      instant: true,
      sceneId: params.get('scene'),
      autoStart: params.has('auto'),
      skipGestureAudio: !params.has('auto'),
    });
  }
})();
