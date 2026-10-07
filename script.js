(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const header = $('#siteHeader');
  const progress = $('#progress');
  const cursor = $('#cursor');
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 50);
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggleMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => toggleMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) toggleMenu(false); });

  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    document.body.classList.add('has-cursor');
    window.addEventListener('pointermove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    $$('a,button,.tilt-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  $$('[data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    revealObserver.observe(el);
  });

  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    $$('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * .08}px, ${y * .12}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  }

  const heroSound = $('#heroSound');
  heroSound?.addEventListener('click', () => heroSound.classList.toggle('is-paused'));

  const video = $('#salonVideo');
  const videoToggle = $('#videoToggle');
  const videoIconUse = $('#videoToggle use');
  const videoToggleText = $('#videoToggle span:last-child');
  const setVideoState = () => {
    if (!video || !videoToggle) return;
    const playing = !video.paused;
    videoIconUse?.setAttribute('href', playing ? '#i-pause' : '#i-play');
    if (videoToggleText) videoToggleText.textContent = playing ? 'Pause salon film' : 'Play salon film';
  };
  videoToggle?.addEventListener('click', async () => {
    if (!video) return;
    if (video.paused) {
      try { await video.play(); } catch (_) {}
    } else video.pause();
    setVideoState();
  });
  video?.addEventListener('play', setVideoState);
  video?.addEventListener('pause', setVideoState);

  const tabs = $$('.pricing-tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    $$('.pricing-list').forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
  }));

  const track = $('#galleryTrack');
  let dragging = false, startX = 0, scrollStart = 0;
  if (track) {
    track.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; scrollStart = track.scrollLeft;
      track.classList.add('is-dragging'); track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', e => { if (dragging) track.scrollLeft = scrollStart - (e.clientX - startX) * 1.25; });
    const endDrag = () => { dragging = false; track.classList.remove('is-dragging'); };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
  }

  const testimonials = $$('.testimonial');
  let reviewIndex = 0;
  const showReview = (index) => {
    reviewIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle('is-active', i === reviewIndex));
  };
  $('#nextReview')?.addEventListener('click', () => showReview(reviewIndex + 1));
  $('#prevReview')?.addEventListener('click', () => showReview(reviewIndex - 1));
  if (!reducedMotion && testimonials.length) setInterval(() => showReview(reviewIndex + 1), 6500);

  const modal = $('#serviceModal');
  const modalTitle = $('#serviceModalTitle');
  const modalLink = $('#serviceModalWhatsapp');
  $$('.service-open').forEach(btn => btn.addEventListener('click', () => {
    const service = btn.dataset.service;
    modalTitle.textContent = service;
    modalLink.href = `https://wa.me/6580578808?text=${encodeURIComponent(`Hello Bada Hair, I would like to enquire about ${service}.`)}`;
    modal.showModal();
  }));
  $('#serviceModalClose')?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', e => {
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  });

  $('#bookingForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#bookName').value.trim();
    const phone = $('#bookPhone').value.trim();
    const service = $('#bookService').value;
    const message = $('#bookMessage').value.trim();
    const text = `Hello Bada Hair, I would like to book an appointment.\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nMessage: ${message || '—'}`;
    window.open(`https://wa.me/6580578808?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });

  $('#year').textContent = new Date().getFullYear();
})();
