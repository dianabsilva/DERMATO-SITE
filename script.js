/* Clínica Janaina Seabra — menu, animações de rolagem, formulário e carrosséis */

// ===== NAVBAR (na home começa transparente; nas demais páginas já nasce sólida) =====
const navbar = document.getElementById('navbar');
if (navbar && !navbar.classList.contains('is-solid')) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ===== MENU MOBILE =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navCta = document.getElementById('navCta');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navCta.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  const spans = hamburger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
}
hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ===== ANIMAÇÕES DE ENTRADA (ao rolar) =====
const animated = document.querySelectorAll('[data-aos]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('aos-animate'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  animated.forEach(el => io.observe(el));
  document.querySelectorAll('.hero [data-aos]').forEach(el => setTimeout(() => el.classList.add('aos-animate'), 200));
} else {
  animated.forEach(el => el.classList.add('aos-animate'));
}

// ===== FORMULÁRIO: monta a mensagem e abre o WhatsApp =====
function handleFormSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const nome = f.nome.value.trim();
  const servico = f.servico.value;
  const msg = f.mensagem.value.trim();
  let texto = 'Olá! Vim do site e quero agendar uma consulta.\nNome: ' + nome + '\nÁrea de interesse: ' + servico;
  if (msg) texto += '\nMensagem: ' + msg;
  window.open('https://api.whatsapp.com/send?phone=5581997106629&text=' + encodeURIComponent(texto), '_blank', 'noopener');
  f.style.display = 'none';
  const ok = document.getElementById('formSuccess');
  ok.style.display = 'flex'; ok.style.flexDirection = 'column'; ok.style.alignItems = 'center';
}
window.handleFormSubmit = handleFormSubmit;


// Carrossel das galerias (página de lesões): setas, bolinhas e arraste com o mouse
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduce ? 'auto' : 'smooth';

  document.querySelectorAll('.lesion-gallery').forEach(gallery => {
    const imgs = [...gallery.querySelectorAll('img')];
    if (imgs.length < 2) return;

    const stage = document.createElement('div');
    stage.className = 'carousel-stage';
    const track = document.createElement('div');
    track.className = 'carousel-track';
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    track.setAttribute('aria-roledescription', 'carrossel');
    track.setAttribute('aria-label', 'Fotos de ' + (imgs[0].alt || 'lesão'));
    imgs.forEach(img => { img.draggable = false; track.appendChild(img); });

    const mkArrow = (dir, icon, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-arrow carousel-arrow--' + dir;
      b.setAttribute('aria-label', label);
      b.innerHTML = '<i class="fa-solid ' + icon + '" aria-hidden="true"></i>';
      return b;
    };
    const prev = mkArrow('prev', 'fa-chevron-left', 'Foto anterior');
    const next = mkArrow('next', 'fa-chevron-right', 'Próxima foto');

    const dotsBox = document.createElement('div');
    dotsBox.className = 'carousel-dots';
    const dots = imgs.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'carousel-dot';
      d.setAttribute('aria-label', 'Ir para a foto ' + (i + 1) + ' de ' + imgs.length);
      d.addEventListener('click', () => goTo(i));
      dotsBox.appendChild(d);
      return d;
    });

    stage.append(track, prev, next);
    gallery.append(stage, dotsBox);
    gallery.classList.add('is-carousel');

    let index = 0;
    const width = () => track.clientWidth;
    const goTo = i => {
      index = (i + imgs.length) % imgs.length;      // volta ao início/fim
      track.scrollTo({ left: index * width(), behavior });
    };
    const update = () => {
      const i = Math.max(0, Math.min(imgs.length - 1, Math.round(track.scrollLeft / width())));
      index = i;
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === i);
        d.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
    };

    prev.addEventListener('click', () => goTo(index - 1));
    next.addEventListener('click', () => goTo(index + 1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', () => track.scrollTo({ left: index * width(), behavior: 'auto' }));

    // Arrastar com o mouse (toque e caneta já rolam nativamente)
    let startX = 0, startLeft = 0, dragging = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', e => {
      if (!dragging) return;
      track.scrollLeft = startLeft - (e.clientX - startX);
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      const moved = startLeft - track.scrollLeft;   // >0 = arrastou para a direita
      let target = Math.round(track.scrollLeft / width());
      if (Math.abs(moved) > width() * 0.12) target = moved > 0 ? Math.floor(track.scrollLeft / width()) : Math.ceil(track.scrollLeft / width());
      index = Math.max(0, Math.min(imgs.length - 1, target));
      track.scrollTo({ left: index * width(), behavior });
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('dragstart', e => e.preventDefault());

    update();
  });
})();


// ===== CARROSSEL DE TRATAMENTOS (home): movimento contínuo, setas e arraste =====
(() => {
  const viewport = document.getElementById('servicesViewport');
  if (!viewport) return;
  const list = document.getElementById('servicesList');
  const originals = [...list.children];
  originals.forEach(card => {                       // cópias para o loop sem emendas
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
    list.appendChild(copy);
  });
  list.querySelectorAll('a').forEach(a => { a.draggable = false; });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 40;                                 // px por segundo
  let loop = 0, step = 0, pos = 0, last = performance.now();
  let hover = false, focus = false, dragging = false, moved = false, tween = null;

  const measure = () => {
    loop = list.children[originals.length].offsetLeft - list.children[0].offsetLeft;
    step = loop / originals.length;
  };
  const render = () => {
    pos = ((pos % loop) + loop) % loop;
    list.style.transform = 'translate3d(' + (-pos) + 'px,0,0)';
  };
  const frame = t => {
    const dt = Math.min(64, t - last) / 1000;
    last = t;
    if (tween) {
      const p = Math.min(1, (t - tween.t0) / tween.dur);
      pos = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - p, 3));
      if (p >= 1) tween = null;
    } else if (!reduce && !hover && !focus && !dragging) {
      pos += SPEED * dt;
    }
    render();
    requestAnimationFrame(frame);
  };
  const go = dir => { tween = { from: pos, to: pos + dir * step, t0: performance.now(), dur: 550 }; };

  document.getElementById('servicesPrev').addEventListener('click', () => go(-1));
  document.getElementById('servicesNext').addEventListener('click', () => go(1));

  viewport.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  viewport.addEventListener('pointerleave', () => { hover = false; });
  viewport.addEventListener('focusin', () => { focus = true; });
  viewport.addEventListener('focusout', () => { focus = false; });

  // Arrastar (mouse, toque ou caneta); os links continuam clicáveis quando não houve arraste
  let startX = 0, startPos = 0;
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; moved = false; tween = null;
    startX = e.clientX; startPos = pos;
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) { moved = true; viewport.classList.add('is-dragging'); }
    if (moved) pos = startPos - dx;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  viewport.addEventListener('dragstart', e => e.preventDefault());

  window.addEventListener('resize', () => { measure(); render(); });
  window.addEventListener('load', measure);
  measure();
  requestAnimationFrame(frame);
})();
