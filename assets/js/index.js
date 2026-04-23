document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────────────────
     SLIDER ENGINE
     Works on desktop (click arrows) and mobile (touch/drag)
     Each slider is independent — pass its config object.
  ───────────────────────────────────────────────── */
  function initSlider(config) {
    var track     = document.getElementById(config.trackId);
    var prevBtn   = document.getElementById(config.prevId);
    var nextBtn   = document.getElementById(config.nextId);
    var dotsWrap  = document.getElementById(config.dotsId);
    var counter   = document.getElementById(config.counterId);

    if (!track) return;

    var current   = 0;
    var isDragging = false;
    var startX    = 0;
    var dragDelta = 0;
    var visibleCount = getVisible();

    function getVisible() {
      var w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return config.visible || 3;
    }

    function totalItems() {
      return track.children.length;
    }

    function maxIndex() {
      return Math.max(0, totalItems() - visibleCount);
    }

    function cardWidth() {
      if (totalItems() === 0) return 0;
      var gap = parseInt(getComputedStyle(track).gap) || 20;
      var vpWidth = track.parentElement.offsetWidth;
      return (vpWidth - gap * (visibleCount - 1)) / visibleCount;
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      var cw   = cardWidth();
      var gap  = parseInt(getComputedStyle(track).gap) || 20;
      var offset = current * (cw + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateUI();
    }

    function updateUI() {
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= maxIndex();

      if (counter) {
        counter.innerHTML = '<span>' + (current + 1) + '</span> / ' + (maxIndex() + 1);
      }

      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll('.slider-dot');
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = maxIndex() + 1;
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          goTo(parseInt(this.dataset.index));
        });
        dotsWrap.appendChild(dot);
      }
    }

    function resize() {
      var newVisible = getVisible();
      if (newVisible !== visibleCount) {
        visibleCount = newVisible;
        current = 0;
        buildDots();
      }
      goTo(current);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

    track.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX;
      dragDelta = 0;
      track.classList.add('dragging');
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      dragDelta = e.clientX - startX;
    });

    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('dragging');
      if (dragDelta < -60) goTo(current + 1);
      else if (dragDelta > 60) goTo(current - 1);
      else goTo(current);
      dragDelta = 0;
    });

    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      dragDelta = 0;
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      dragDelta = e.touches[0].clientX - startX;
    }, { passive: true });

    track.addEventListener('touchend', function () {
      if (dragDelta < -60) goTo(current + 1);
      else if (dragDelta > 60) goTo(current - 1);
      else goTo(current);
      dragDelta = 0;
    });

    window.addEventListener('resize', resize);

    buildDots();
    goTo(0);
  }

  /* ─────────────────────────────────────────────────
     SERVICES SLIDER
  ───────────────────────────────────────────────── */
  initSlider({
    trackId:   'services-track',
    prevId:    'services-prev',
    nextId:    'services-next',
    dotsId:    'services-dots',
    counterId: 'services-counter',
    visible:   3
  });

  /* ─────────────────────────────────────────────────
     PRODUCTS SLIDER — loads from JSON then inits
  ───────────────────────────────────────────────── */
  function formatPrice(n) {
    return '\u20a6' + n.toLocaleString('en-NG');
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  async function loadProducts() {
    var track = document.getElementById('products-track');
    if (!track) return;

    try {
      var res  = await fetch('data/products.json');
      var list = await res.json();

      list.slice(0, 5).forEach(function (p) {
        var card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML =
          '<div class="product-card-img">' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.remove()">' +
          '</div>' +
          '<div class="product-card-body">' +
            '<span class="product-tag">' + cap(p.category) + '</span>' +
            '<h3>' + p.name + '</h3>' +
            '<p>' + p.description + '</p>' +
            '<div class="product-card-footer">' +
              '<div class="product-price">' + formatPrice(p.price) + '<small>/' + p.unit + '</small></div>' +
              '<a href="product.html?id=' + p.id + '" class="product-link">Find Out More ' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
              '</a>' +
            '</div>' +
          '</div>';
        track.appendChild(card);
      });

      initSlider({
        trackId:   'products-track',
        prevId:    'products-prev',
        nextId:    'products-next',
        dotsId:    'products-dots',
        counterId: 'products-counter',
        visible:   3
      });

    } catch (e) {
      if (track.parentElement) {
        track.parentElement.innerHTML = '<p style="color:var(--text-soft);padding:40px 0;text-align:center">Products unavailable right now.</p>';
      }
    }
  }

  loadProducts();

  /* ─────────────────────────────────────────────────
     TESTIMONIALS SLIDER
  ───────────────────────────────────────────────── */
  initSlider({
    trackId:   'testi-track',
    prevId:    'testi-prev',
    nextId:    'testi-next',
    dotsId:    'testi-dots',
    counterId: null,
    visible:   3
  });

  /* ─────────────────────────────────────────────────
     FAQ ACCORDION
  ───────────────────────────────────────────────── */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ─────────────────────────────────────────────────
     SCROLL ANIMATIONS
  ───────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(function (el) {
      obs.observe(el);
    });
  }

});
