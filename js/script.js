document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Navbar solid background on scroll */
  const nav = document.getElementById('mainNav');
  const onNavScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  /* Smooth-close mobile nav on link click */
  document.querySelectorAll('#navMenu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('navMenu');
      if (collapse.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    });
  });

  /* Cursor glow follows pointer */
  const glow = document.getElementById('cursorGlow');
  if (glow && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`;
    });
  }

  /* Parallax layers (hero + process section blobs) */
  const layers = document.querySelectorAll('.parallax-layer');
  if (!prefersReducedMotion && layers.length) {
    let ticking = false;
    const updateParallax = () => {
      const scrollY = window.scrollY;
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed) || 0.2;
        layer.style.transform = `translateY(${scrollY * speed}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  /* Scroll-triggered reveal via IntersectionObserver */
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* Animated stat counters, triggered once visible */
  const statEls = document.querySelectorAll('.stat-number');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && statEls.length) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach(el => statIO.observe(el));
  }

  /* Journey progress bar tied to scroll through experience section */
  const journeyFill = document.getElementById('journeyFill');
  const experienceSection = document.getElementById('experience');
  if (journeyFill && experienceSection && !prefersReducedMotion) {
    const updateJourneyFill = () => {
      const rect = experienceSection.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      let progress = total > 0 ? scrolled / total : 0;
      progress = Math.min(Math.max(progress, 0), 1);
      journeyFill.style.width = `${6 + progress * 94}%`;
    };
    window.addEventListener('scroll', updateJourneyFill, { passive: true });
    updateJourneyFill();
  }

  /* Featured Projects slider */
  const track = document.getElementById('projectsTrack');
  const dotsWrap = document.getElementById('projectsDots');
  const prevBtn = document.getElementById('projectsPrev');
  const nextBtn = document.getElementById('projectsNext');

  if (track && dotsWrap && prevBtn && nextBtn) {
    const slides = Array.from(track.children);
    let perView = 3;
    let index = 0;
    let pageCount = 1;

    const getPerView = () => {
      const w = window.innerWidth;
      if (w <= 575.98) return 1;
      return 2;
    };

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    };

    const updateDots = () => {
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    };

    const updateArrows = () => {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === pageCount - 1;
    };

    const render = () => {
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const offset = index * perView * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
      updateArrows();
    };

    const setup = () => {
      perView = getPerView();
      pageCount = Math.ceil(slides.length / perView);
      index = Math.min(index, pageCount - 1);
      buildDots();
      render();
    };

    const goTo = (i) => {
      index = Math.max(0, Math.min(i, pageCount - 1));
      render();
    };

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 150);
    });

    /* Basic swipe support on touch devices */
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff > 50) goTo(index - 1);
      else if (diff < -50) goTo(index + 1);
    }, { passive: true });

    setup();
  }

});

/* Text animation on scroll */
gsap.registerPlugin(ScrollTrigger);

const heading = document.getElementById("brand");
const text = heading.textContent.trim();

heading.innerHTML = "";

text.split("").forEach(letter => {
  const span = document.createElement("span");
  span.innerHTML = letter === " " ? "&nbsp;" : letter;
  heading.appendChild(span);
});

const tl = gsap.from("#brand span", {
  yPercent: 100,          // Niche se upar aayega
  opacity: 0,
  duration: 1,
  stagger: 0.05,
  ease: "expo.out",       // Premium smooth easing
  paused: true
});

ScrollTrigger.create({
  trigger: "#brand",
  start: "top 80%",
  end: "bottom top",

  onEnter: () => tl.restart(),
  onEnterBack: () => tl.restart()
});

const sideTl = gsap.from(".side-nav-link", {
    x: -60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power4.out",
    paused: true
});

ScrollTrigger.create({
    trigger: "#sideNav",
    start: "top 80%",

    onEnter: () => sideTl.restart(),
    onEnterBack: () => sideTl.restart()
});