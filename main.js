(() => {
  const WHATS = '5511959436314';
  const EMAIL = 'alikmaker8@gmail.com';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;

  /* ---------- relógio de são paulo ---------- */
  const clockEl = $('[data-clock]');
  const tickClock = () => { if (clockEl) clockEl.textContent = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date()); };
  tickClock(); setInterval(tickClock, 15000);
  const yearEl = $('[data-year]'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  const heroVideo = $('[data-hero-video]');
  const fmtTC = t => {
    t = Math.max(0, t || 0);
    const h = String(0).padStart(2, '0');
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(Math.floor(t % 60)).padStart(2, '0');
    const f = String(Math.floor((t % 1) * 30)).padStart(2, '0');
    return `${h}:${m}:${s}:${f}`;
  };

  /* ---------- vídeos tocam só quando visíveis ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
  }), { rootMargin: '150px 0px', threshold: .1 });
  $$('video').forEach(v => { if (v !== heroVideo) vio.observe(v); });

  /* ---------- clipes: toca o youtube ao clicar ---------- */
  $$('.clipe__play').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-clipe]')?.dataset.clipe;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = btn.getAttribute('aria-label') || 'YouTube video';
      iframe.allow = 'accelerate; autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceChildren(iframe);
      btn.disabled = true;
      btn.style.cursor = 'default';
    }, { once: true });
  });

  /* ---------- cursor + magnético ---------- */
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('[data-cursor-label]');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const lab = e.target.closest('[data-cursor]');
      cur.classList.toggle('is-label', !!lab);
      if (lab && label) label.textContent = lab.dataset.cursor;
      cur.classList.toggle('is-hover', !lab && !!e.target.closest('a, button, label, input, select, textarea'));
    });
    const loop = () => { rx += (mx - rx) * .2; ry += (my - ry) * .2; ring.style.transform = `translate(${rx}px, ${ry}px)`; requestAnimationFrame(loop); };
    loop();
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .6s cubic-bezier(.2,.7,.1,1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 600); });
    });
  }

  /* ---------- faixa infinita ---------- */
  const tape = $('[data-tape]');
  let tk = 0, scrollVel = 0;
  const tapeLoop = () => {
    if (tape) {
      tk -= reduce ? 0 : .7;
      const w = tape.scrollWidth / 2;
      if (w && tk <= -w) tk += w;
      tape.style.transform = `translate3d(${tk}px,0,0)`;
    }
    requestAnimationFrame(tapeLoop);
  };
  tapeLoop();

  /* ---------- trilho do feed: infinito + arrastar ---------- */
  const rail = $('[data-rail]'), rtrack = $('[data-rail-track]');
  if (rail && rtrack) {
    const nOrig = rtrack.children.length;
    rtrack.insertAdjacentHTML('beforeend', rtrack.innerHTML);
    [...rtrack.children].slice(nOrig).forEach(c => { c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; });
    let tx = 0, vel = 0, dragging = false, lastX = 0, moved = 0, half = 0, railOn = false;
    const measure = () => { half = rtrack.scrollWidth / 2; };
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    new IntersectionObserver(([e]) => { railOn = e.isIntersecting; }).observe(rail);
    rail.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; rail.classList.add('is-drag'); rail.setPointerCapture(e.pointerId); });
    rail.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); tx += dx; vel = dx; });
    const endDrag = () => { dragging = false; rail.classList.remove('is-drag'); };
    rail.addEventListener('pointerup', endDrag); rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('dragstart', e => e.preventDefault());
    const railLoop = () => {
      if (railOn) {
        if (!dragging) { vel *= .92; tx += vel - (reduce ? 0 : .5); }
        if (half) { while (tx <= -half) tx += half; while (tx > 0) tx -= half; }
        rtrack.style.transform = `translate3d(${tx}px,0,0)`;
      }
      requestAnimationFrame(railLoop);
    };
    railLoop();
  }

  /* ---------- formulário: monta mensagem pro whatsapp ---------- */
  const form = $('[data-form]');
  const monTipo = $('[data-mon="tipo"]'), monMarca = $('[data-mon="marca"]'), monNome = $('[data-mon="nome"]'), monMsg = $('[data-mon="msg"]');
  const monTc = $('[data-mon-tc]');
  const err = $('[data-err]');
  const tipoLabel = v => { const o = form?.querySelector(`input[name="tipo"][value="${CSS.escape(v)}"]`); return o ? o.nextElementSibling.textContent : v; };
  const compose = () => {
    const f = new FormData(form);
    const nome = (f.get('nome') || '').trim();
    const marca = (f.get('marca') || '').trim();
    const tipo = f.get('tipo');
    const ideia = (f.get('ideia') || '').trim();
    const msg = `oi alik! aqui é ${nome || 'um cliente'}${marca ? ` (${marca})` : ''}. quero gravar ${tipo}.${ideia ? `\n\n${ideia}` : ''}`;
    return { nome, marca, tipo, ideia, msg };
  };
  const refreshMonitor = () => {
    if (!form) return;
    const { nome, marca, tipo, msg } = compose();
    if (monTipo) monTipo.textContent = tipoLabel(tipo);
    if (monMarca) monMarca.textContent = marca || '—';
    if (monNome) monNome.textContent = nome || '—';
    if (monMsg) monMsg.textContent = msg;
  };
  if (form) {
    form.addEventListener('input', refreshMonitor);
    form.addEventListener('change', refreshMonitor);
    refreshMonitor();
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(form);
      const nome = (f.get('nome') || '').trim();
      if (!nome) {
        form.nome.closest('.field')?.classList.add('is-bad');
        if (err) err.textContent = 'e o seu nome?';
        form.nome.focus();
        form.classList.remove('is-pulse'); void form.offsetWidth; form.classList.add('is-pulse');
        return;
      }
      form.nome.closest('.field')?.classList.remove('is-bad');
      if (err) err.textContent = '';
      const { msg } = compose();
      window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
    form.nome?.addEventListener('input', () => { form.nome.closest('.field')?.classList.remove('is-bad'); if (err) err.textContent = ''; });
  }
  const mailtoLink = $('[data-mailto]');
  if (mailtoLink) {
    mailtoLink.addEventListener('click', e => {
      const { marca, msg } = compose();
      const subject = `Proposta de vídeo${marca ? ` | ${marca}` : ''}`;
      e.currentTarget.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    });
  }
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const msgEl = $('[data-copy-msg]', b);
    try { await navigator.clipboard.writeText(b.dataset.copy); if (msgEl) msgEl.textContent = 'copiado ✓'; }
    catch (e) { location.href = 'mailto:' + b.dataset.copy; }
    setTimeout(() => { if (msgEl) msgEl.textContent = 'copiar'; }, 2200);
  }));
  if (monTc) setInterval(() => { monTc.textContent = fmtTC((Date.now() / 1000) % 60); }, 120);

  /* ---------- scroll suave pros links internos ---------- */
  let lenis = null;
  const scrollToEl = t => {
    if (t == null) return;
    if (lenis) lenis.scrollTo(t, { duration: 1.5 });
    else (t === 0 ? scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#' || !id) return;
    const t = id === '#top' ? 0 : $(id);
    if (t == null) return;
    e.preventDefault(); scrollToEl(t);
  }));

  /* ---------- nav: esconde ao descer, sólida depois do hero ---------- */
  const nav = $('.nav'), float = $('.float'), heroEl = $('.hero');
  let anchorY = 0, hidden = false, heroH = innerHeight;
  const onScroll = y => {
    heroH = heroEl ? heroEl.offsetHeight : innerHeight;
    const past = y > heroH - 80;
    nav?.classList.toggle('is-solid', past);
    if (!past) { hidden = false; anchorY = y; }
    else if (hidden ? y > anchorY : y < anchorY) anchorY = y;
    else if (!hidden && y - anchorY > 40) { hidden = true; anchorY = y; }
    else if (hidden && anchorY - y > 24) { hidden = false; anchorY = y; }
    nav?.classList.toggle('is-hidden', hidden);
    float?.classList.toggle('is-on', past);
  };

  /* ---------- sem GSAP / movimento reduzido ---------- */
  if (!motion) {
    $('.loader')?.remove();
    document.body.classList.remove('is-loading');
    $('.hero')?.classList.add('is-in');
    $$('.manifesto [data-scrub] .w, .manifesto__text').forEach(() => {});
    const mc = $('.manifesto__clip'); if (mc) mc.style.opacity = 1;
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    onScroll(scrollY);
    heroVideo?.play().catch(() => {});
    return;
  }

  /* ================= GSAP ================= */
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.stop();
    lenis.on('scroll', e => { ScrollTrigger.update(); scrollVel = clamp(e.velocity || 0, -60, 60); onScroll(e.scroll); });
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  }

  /* ---------- manifesto: palavras acendem com o scroll ---------- */
  $$('.manifesto__text').forEach(el => {
    const words = el.innerHTML.split(/(<mark>.*?<\/mark>)/).flatMap(part => part.startsWith('<mark>') ? [part] : part.split(' ').filter(Boolean));
    el.innerHTML = words.map(w => w.startsWith('<mark>') ? w.replace(/^<mark>(.*)<\/mark>$/, (_, inner) => `<mark>${inner.split(' ').map(x => `<span class="w">${x}</span>`).join(' ')}</mark>`) : `<span class="w">${w}</span>`).join(' ');
    const ws = $$('.w', el);
    ScrollTrigger.create({
      trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true,
      onUpdate: s => { const lit = Math.round(s.progress * ws.length); ws.forEach((w, k) => w.classList.toggle('on', k < lit)); }
    });
  });
  gsap.to('.manifesto__clip', { opacity: 1, duration: .3, scrollTrigger: { trigger: '.manifesto', start: 'top 60%' } });

  /* ---------- videoclipes ---------- */
  gsap.from('.clipes__head > *', { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.clipes', start: 'top 75%' } });
  gsap.from('.clipe', { y: 60, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.clipes__grid', start: 'top 82%' } });

  /* ---------- projeto: recayd mob ---------- */
  gsap.from('.projeto__copy > *', { y: 40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.projeto', start: 'top 60%' } });
  gsap.from('.projeto__crew', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.projeto', start: 'top 55%' } });

  /* ---------- filmo: track horizontal ---------- */
  const filmoPin = $('.filmo__pin'), ftrack = $('[data-track]'), fbar = $('[data-filmo-bar]');
  if (filmoPin && ftrack) {
    const dist = () => Math.max(0, ftrack.scrollWidth - innerWidth);
    gsap.to(ftrack, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.filmo', start: 'top top', end: () => '+=' + dist(), pin: filmoPin, scrub: 1, invalidateOnRefresh: true,
        onUpdate: s => { if (fbar) fbar.style.transform = `scaleX(${s.progress})`; }
      }
    });
  }

  /* ---------- estúdio: reels sobem ---------- */
  gsap.from('.reel', { y: 60, opacity: 0, stagger: .1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.estudio__grid', start: 'top 82%' } });

  /* ---------- sobre: entrada ---------- */
  gsap.from('.about__photo', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.about', start: 'top 75%' } });
  gsap.from('.about__facts li', { x: -20, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.about__facts', start: 'top 85%' } });

  /* ---------- rodapé ---------- */
  gsap.from('.foot__big span:first-child', { xPercent: -16, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.from('.foot__big span:last-child', { xPercent: 16, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* ================= ABERTURA ================= */
  const countEl = $('[data-load-count]'), loadBar = $('[data-load-bar]'), loader = $('.loader');
  const ready = new Promise(r => { if (!heroVideo) return r(); if (heroVideo.readyState >= 2) r(); else { heroVideo.addEventListener('loadeddata', r, { once: true }); heroVideo.addEventListener('error', r, { once: true }); } });
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const cap = new Promise(r => setTimeout(r, 3600));
  const counter = { v: 0 };
  const paint = () => { if (countEl) countEl.textContent = Math.round(counter.v); if (loadBar) loadBar.style.transform = `scaleX(${counter.v / 100})`; };
  const intro = gsap.timeline({ paused: true, onComplete: () => {
    heroEl?.classList.add('is-in');
    document.body.classList.remove('is-loading');
    loader?.remove();
    lenis?.start();
    heroVideo?.play().catch(() => {});
    ScrollTrigger.refresh();
  } });
  intro
    .to('.loader__name span', { y: '0%', duration: 1, stagger: .08, ease: 'expo.out' }, .1)
    .to('.loader__name span', { y: '-105%', duration: .6, stagger: .05, ease: 'expo.in' }, '+=.35')
    .to(loader, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.15');

  const countTween = gsap.to(counter, { v: 92, duration: 1.3, ease: 'power2.out', onUpdate: paint });
  Promise.race([Promise.all([ready, fontsReady, new Promise(r => setTimeout(r, 1200))]), cap]).then(() => {
    countTween.kill();
    gsap.to(counter, { v: 100, duration: .3, ease: 'power1.out', onUpdate: paint, onComplete: () => intro.play() });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
