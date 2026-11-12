(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('siteHeader') || document.querySelector('header');

  // 0. Build Stylish Mobile Hamburger Button & Editorial Slide-Out Drawer
  if (header && !header.querySelector('.mobile-nav-btn')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'mobile-nav-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '<span class="bar bar-1"></span><span class="bar bar-2"></span>';
    header.appendChild(toggleBtn);

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-drawer-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    let activeWorkspace = '';
    try {
      activeWorkspace = sessionStorage.getItem('clearport.active') || '';
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const isLoggedInDesk = Boolean(
      activeWorkspace &&
      window.location.pathname.endsWith('dashboard.html') &&
      !params.has('case') &&
      !params.has('sample')
    );

    const actionHtml = isLoggedInDesk
      ? '<button type="button" class="button white" id="mobileNewShipment">New shipment +</button>' +
        '<button type="button" class="button ghost-light" id="mobileSignOut">Sign out</button>'
      : '<a class="button white" href="signup.html">Get started <span>↗</span></a>' +
        '<a class="button ghost-light" href="login.html">Sign in</a>';

    const drawer = document.createElement('aside');
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-label', 'Mobile navigation');
    drawer.innerHTML =
      '<div>' +
        '<div class="mobile-drawer-head">' +
          '<a class="brand" href="index.html">Clearport<span>.</span></a>' +
          '<button type="button" class="mobile-drawer-close" aria-label="Close navigation menu">✕</button>' +
        '</div>' +
        '<nav class="mobile-drawer-nav" aria-label="Mobile menu">' +
          '<a class="mobile-drawer-link" href="index.html#specimen"><span><small>01</small>Product</span><span>↗</span></a>' +
          '<a class="mobile-drawer-link" href="dashboard.html?case=CP-8849"><span><small>02</small>Case files</span><span>↗</span></a>' +
          '<a class="mobile-drawer-link" href="pricing.html"><span><small>03</small>Pricing</span><span>↗</span></a>' +
          '<a class="mobile-drawer-link" href="about.html"><span><small>04</small>Company</span><span>↗</span></a>' +
          '<a class="mobile-drawer-link" href="security.html"><span><small>05</small>Cloud &amp; Security</span><span>↗</span></a>' +
        '</nav>' +
      '</div>' +
      '<div class="mobile-drawer-foot">' +
        '<div class="mobile-drawer-actions">' + actionHtml + '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    function setMenuOpen(open) {
      document.body.classList.toggle('is-menu-open', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggleBtn.addEventListener('click', function () {
      const isOpen = document.body.classList.contains('is-menu-open');
      setMenuOpen(!isOpen);
    });

    backdrop.addEventListener('click', function () {
      setMenuOpen(false);
    });

    const closeBtn = drawer.querySelector('.mobile-drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        setMenuOpen(false);
      });
    }

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    const mobNew = drawer.querySelector('#mobileNewShipment');
    if (mobNew) {
      mobNew.addEventListener('click', function () {
        setMenuOpen(false);
        const deskNew = document.getElementById('new');
        if (deskNew) deskNew.click();
      });
    }

    const mobOut = drawer.querySelector('#mobileSignOut');
    if (mobOut) {
      mobOut.addEventListener('click', function () {
        setMenuOpen(false);
        const deskOut = document.getElementById('logout');
        if (deskOut) deskOut.click();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('is-menu-open')) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 920 && document.body.classList.contains('is-menu-open')) {
        setMenuOpen(false);
      }
    });
  }

  // 1. Collect all editorial blocks, cards, rows, and hero elements for bidirectional scroll reveal
  const revealGroups = [
    { selector: '.hero-copy > *', stagger: 95 },
    { selector: '.caption', stagger: 0 },
    { selector: '.spread > *', stagger: 110 },
    { selector: '.section-lead > *', stagger: 90 },
    { selector: '.ui-specimen', stagger: 0 },
    { selector: '.tri-col', stagger: 105 },
    { selector: '.bento-card', stagger: 85 },
    { selector: '.rc-row', stagger: 70 },
    { selector: '.editorial-banner-inner > *', stagger: 110 },
    { selector: '.plan', stagger: 80 },
    { selector: '.leader-card', stagger: 105 },
    { selector: '.footer-hero-content > *', stagger: 100 },
    { selector: '.footer-top > *', stagger: 75 },
    { selector: '.inner > *', stagger: 70 },
    { selector: '.access > *', stagger: 110 },
    { selector: '.desk-head', stagger: 0 }
  ];

  const allTargets = [];

  if (!prefersReduced && 'IntersectionObserver' in window) {
    revealGroups.forEach(function (group) {
      const nodes = document.querySelectorAll(group.selector);
      nodes.forEach(function (node, idx) {
        if (node.classList.contains('reveal-item')) return;
        node.classList.add('reveal-item');
        if (group.stagger > 0) {
          const delay = (idx % 4) * group.stagger;
          node.style.setProperty('--reveal-delay', delay + 'ms');
        }
        allTargets.push(node);
      });
    });

    // Bidirectional Observer: animates smoothly when scrolling top-to-bottom AND bottom-to-top
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add('is-inview');
            el.classList.remove('is-above');
          } else {
            el.classList.remove('is-inview');
            if (entry.boundingClientRect.top < 0) {
              el.classList.add('is-above');
            } else {
              el.classList.remove('is-above');
            }
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -6% 0px'
      }
    );

    allTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // 2. Smooth Scroll Progress Hairline & Subtle Image Parallax
  const parallaxContainers = document.querySelectorAll('.hero, .editorial-banner, .footer-hero-banner');
  let ticking = false;

  function updateScrollEffects() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 16);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      header.style.setProperty('--scroll-progress', pct.toFixed(2) + '%');
    }

    if (!prefersReduced) {
      const vh = window.innerHeight || 800;
      parallaxContainers.forEach(function (box) {
        const rect = box.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
        const shift = Math.max(-28, Math.min(28, -centerOffset * 34));
        box.style.setProperty('--parallax-y', shift.toFixed(1) + 'px');
      });
    }

    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScrollEffects();

  // 3. Microinteraction pulse when switching homepage specimen tabs or source documents
  const specimenPanes = document.querySelectorAll('.ui-specimen-pane');
  const sourceWin = document.querySelector('.source-window');

  document.querySelectorAll('[data-specimen]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      specimenPanes.forEach(function (pane) {
        pane.classList.add('is-switching');
        setTimeout(function () {
          pane.classList.remove('is-switching');
        }, 160);
      });
    });
  });

  document.querySelectorAll('[data-source]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!sourceWin) return;
      sourceWin.classList.add('is-switching');
      setTimeout(function () {
        sourceWin.classList.remove('is-switching');
      }, 150);
    });
  });
})();
