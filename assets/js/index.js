document.addEventListener('DOMContentLoaded', function () {

  var FEATURED_COUNT = 3;

  function formatPrice(n) {
    return '\u20a6' + n.toLocaleString('en-NG');
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function makeCard(p, i) {
    var el = document.createElement('article');
    el.className = 'product-card fade-up delay-' + (i + 1);
    el.innerHTML =
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
    return el;
  }

  async function loadProducts() {
    var grid = document.getElementById('featured-grid');
    if (!grid) return;
    try {
      var res = await fetch('data/products.json');
      var list = await res.json();
      list.slice(0, FEATURED_COUNT).forEach(function (p, i) {
        grid.appendChild(makeCard(p, i));
      });
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
        grid.querySelectorAll('.fade-up').forEach(function (c) { obs.observe(c); });
      }
    } catch (e) {
      grid.innerHTML = '<p style="color:var(--text-soft);grid-column:1/-1;text-align:center;padding:48px 0">Products unavailable right now.</p>';
    }
  }

  loadProducts();

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

});
