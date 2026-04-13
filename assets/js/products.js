document.addEventListener('DOMContentLoaded', function () {

  var grid = document.getElementById('products-grid');
  var countEl = document.getElementById('products-count');

  function formatPrice(n) {
    return '\u20a6' + n.toLocaleString('en-NG');
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function placeholderSVG() {
    return '<div class="prod-card-img-placeholder">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
    '</div>';
  }

  function makeCard(p, i) {
    var card = document.createElement('article');
    card.className = 'prod-card fade-up delay-' + ((i % 3) + 1);

    var imgHtml = '<div class="prod-card-img">' +
      '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" ' +
      'onerror="this.parentElement.innerHTML=\'' + placeholderSVG().replace(/'/g, "\\'") + '\'">' +
      '</div>';

    card.innerHTML =
      imgHtml +
      '<div class="prod-card-body">' +
        '<span class="prod-tag">' + cap(p.category) + '</span>' +
        '<h3>' + p.name + '</h3>' +
        '<p>' + p.description + '</p>' +
        '<div class="prod-card-divider"></div>' +
        '<div class="prod-card-footer">' +
          '<div class="prod-price">' + formatPrice(p.price) + '<small>/' + p.unit + '</small></div>' +
          '<a href="product.html?id=' + p.id + '" class="prod-btn">' +
            'Find Out More ' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>';

    return card;
  }

  function observeCards() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.prod-card').forEach(function (c) { c.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });

    document.querySelectorAll('.prod-card').forEach(function (c) { obs.observe(c); });
  }

  async function loadAll() {
    try {
      var res = await fetch('data/products.json');
      if (!res.ok) throw new Error('failed');
      var list = await res.json();

      grid.innerHTML = '';

      if (countEl) {
        countEl.innerHTML = 'Showing <strong>' + list.length + '</strong> products';
      }

      list.forEach(function (p, i) {
        grid.appendChild(makeCard(p, i));
      });

      observeCards();

    } catch (err) {
      grid.innerHTML =
        '<div class="loading-state">' +
          '<p>Unable to load products at this time. Please try again later.</p>' +
        '</div>';
    }
  }

  loadAll();

});
