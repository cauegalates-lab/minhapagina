const body = document.body;
const preloader = document.querySelector('.preloader');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.main-nav a');
const track = document.querySelector('[data-carousel]');
const prevButton = document.querySelector('.carousel-control.prev');
const nextButton = document.querySelector('.carousel-control.next');
const dotsWrap = document.querySelector('.carousel-dots');

window.addEventListener('load', () => {
  window.setTimeout(() => preloader?.classList.add('is-hidden'), 520);
});

navToggle?.addEventListener('click', () => {
  const isOpen = body.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`;
  revealObserver.observe(item);
});

if (track && dotsWrap) {
  const cards = Array.from(track.children);
  let dots = [];

  const getGap = () => Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
  const getStep = () => {
    const firstCard = cards[0];
    if (!firstCard) return 0;
    return firstCard.getBoundingClientRect().width + getGap();
  };

  const getVisibleCount = () => {
    const step = getStep();
    if (!step) return 1;
    return Math.max(1, Math.floor((track.clientWidth + getGap()) / step));
  };

  const getMaxIndex = () => Math.max(cards.length - getVisibleCount(), 0);

  const rebuildDots = () => {
    dotsWrap.innerHTML = '';
    const total = getMaxIndex() + 1;
    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir para grupo de modelos ${index + 1}`);
      dot.addEventListener('click', () => {
        track.scrollTo({ left: getStep() * index, behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
    }
    dots = Array.from(dotsWrap.children);
  };

  const setActiveState = () => {
    const step = getStep() || 1;
    const max = getMaxIndex();
    const index = Math.min(Math.round(track.scrollLeft / step), max);
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    if (prevButton) prevButton.disabled = index <= 0;
    if (nextButton) nextButton.disabled = index >= max;
  };

  const goToIndex = (direction) => {
    const step = getStep();
    const currentIndex = Math.round(track.scrollLeft / (step || 1));
    const nextIndex = Math.max(0, Math.min(currentIndex + direction, getMaxIndex()));
    track.scrollTo({ left: nextIndex * step, behavior: 'smooth' });
  };

  prevButton?.addEventListener('click', () => goToIndex(-1));
  nextButton?.addEventListener('click', () => goToIndex(1));

  track.addEventListener('scroll', () => window.requestAnimationFrame(setActiveState), { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      rebuildDots();
      setActiveState();
    }, 120);
  });

  rebuildDots();
  setActiveState();
}

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

const heroVideo = document.querySelector('.hero-background-video');
const heroVideoToggle = document.querySelector('[data-hero-video-toggle]');
const heroVideoMute = document.querySelector('[data-hero-video-mute]');

const syncHeroVideoButtons = () => {
  if (heroVideoToggle && heroVideo) {
    heroVideoToggle.classList.toggle('is-paused', heroVideo.paused);
    heroVideoToggle.setAttribute('aria-label', heroVideo.paused ? 'Reproduzir vídeo de fundo' : 'Pausar vídeo de fundo');
  }
  if (heroVideoMute && heroVideo) {
    heroVideoMute.classList.toggle('is-muted', heroVideo.muted);
    heroVideoMute.setAttribute('aria-label', heroVideo.muted ? 'Ativar som do vídeo de fundo' : 'Desativar som do vídeo de fundo');
  }
};

heroVideo?.play?.().catch(() => {
  syncHeroVideoButtons();
});

heroVideoToggle?.addEventListener('click', () => {
  if (!heroVideo) return;
  if (heroVideo.paused) {
    heroVideo.play?.();
  } else {
    heroVideo.pause();
  }
  syncHeroVideoButtons();
});

heroVideoMute?.addEventListener('click', () => {
  if (!heroVideo) return;
  heroVideo.muted = !heroVideo.muted;
  syncHeroVideoButtons();
});

heroVideo?.addEventListener('play', syncHeroVideoButtons);
heroVideo?.addEventListener('pause', syncHeroVideoButtons);
syncHeroVideoButtons();



// Centraliza o plano do meio no mobile e mantém arraste lateral natural
(() => {
  const pricingGrid = document.querySelector('.pricing-grid');
  const featuredCard = document.querySelector('.price-card--featured');

  if (!pricingGrid || !featuredCard) return;

  const centerFeaturedPlan = () => {
    if (!window.matchMedia('(max-width: 800px)').matches) {
      pricingGrid.scrollLeft = 0;
      return;
    }

    const target =
      featuredCard.offsetLeft -
      (pricingGrid.clientWidth - featuredCard.clientWidth) / 2;

    pricingGrid.scrollTo({
      left: Math.max(0, target),
      behavior: 'auto'
    });
  };

  window.addEventListener('load', centerFeaturedPlan);
  window.addEventListener('resize', centerFeaturedPlan);

  // Garante o centro depois que fontes/layout terminarem de ajustar.
  setTimeout(centerFeaturedPlan, 250);
})();
