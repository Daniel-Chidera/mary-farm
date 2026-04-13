document.addEventListener('DOMContentLoaded', function () {

  var params = new URLSearchParams(window.location.search);
  var productId = params.get('id');

  function formatPrice(n) {
    return '\u20a6' + n.toLocaleString('en-NG');
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function waMessage(product, qty) {
    var msg = 'Hello, I am interested in ordering ' + qty + ' ' + product.unit + '(s) of ' + product.name + ' from Mary\'s Farm. Please let me know if it\'s available.';
    return 'https://wa.me/2348000000000?text=' + encodeURIComponent(msg);
  }

  function renderProduct(product) {
    document.title = product.name + ' | Mary\'s Farm';

    var breadcrumbName = document.getElementById('breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = product.name;

    var imgWrap = document.getElementById('product-img-wrap');
    if (imgWrap) {
      imgWrap.innerHTML =
        '<img src="' + product.image + '" alt="' + product.name + '" ' +
        'onerror="this.parentElement.innerHTML=\'<div class=\\\"product-img-placeholder\\\"><svg xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" stroke-width=\\\"1.2\\\"><rect x=\\\"3\\\" y=\\\"3\\\" width=\\\"18\\\" height=\\\"18\\\" rx=\\\"2\\\"/><circle cx=\\\"8.5\\\" cy=\\\"8.5\\\" r=\\\"1.5\\\"/><polyline points=\\\"21 15 16 10 5 21\\\"/></svg></div>\'">' +
        '<span class="product-img-badge">' + cap(product.category) + '</span>';
    }

    var catTag = document.getElementById('product-category');
    if (catTag) catTag.textContent = cap(product.category);

    var nameEl = document.getElementById('product-name');
    if (nameEl) nameEl.textContent = product.name;

    var priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = formatPrice(product.price);

    var unitEl = document.getElementById('product-unit');
    if (unitEl) unitEl.textContent = 'per ' + product.unit;

    var descEl = document.getElementById('product-desc');
    if (descEl) descEl.textContent = product.description;

    var stockEl = document.getElementById('product-stock');
    if (stockEl && product.stock) {
      stockEl.textContent = product.stock + ' units available';
    }

    var unitMeta = document.getElementById('product-unit-meta');
    if (unitMeta) unitMeta.textContent = product.unit;

    var qtyInput = document.getElementById('qty-input');
    var qtyMinus = document.getElementById('qty-minus');
    var qtyPlus = document.getElementById('qty-plus');

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener('click', function () {
        var v = parseInt(qtyInput.value) || 1;
        if (v > 1) qtyInput.value = v - 1;
      });
      qtyPlus.addEventListener('click', function () {
        var v = parseInt(qtyInput.value) || 1;
        qtyInput.value = v + 1;
      });
      qtyInput.addEventListener('change', function () {
        var v = parseInt(this.value);
        if (!v || v < 1) this.value = 1;
      });
    }

    var buyBtn = document.getElementById('buy-now-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', function () {
        var qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
        var params = new URLSearchParams({
          id: product.id,
          qty: qty
        });
        window.location.href = 'checkout.html?' + params.toString();
      });
    }

    var waBtn = document.getElementById('wa-btn');
    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
        window.open(waMessage(product, qty), '_blank', 'noopener,noreferrer');
      });
    }
  }

  function renderRelated(products, currentId) {
    var grid = document.getElementById('related-grid');
    if (!grid) return;

    var related = products.filter(function (p) { return p.id !== currentId; }).slice(0, 3);

    if (related.length === 0) {
      document.querySelector('.related-products').style.display = 'none';
      return;
    }

    related.forEach(function (p, i) {
      var card = document.createElement('article');
      card.className = 'prod-card fade-up delay-' + (i + 1);
      card.innerHTML =
        '<div class="prod-card-img">' +
          '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.remove()">' +
        '</div>' +
        '<div class="prod-card-body">' +
          '<span class="prod-tag">' + cap(p.category) + '</span>' +
          '<h3>' + p.name + '</h3>' +
          '<div class="prod-card-footer">' +
            '<div class="prod-price">' + formatPrice(p.price) + '<small>/' + p.unit + '</small></div>' +
            '<a href="product.html?id=' + p.id + '" class="prod-btn">View ' +
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.07 });
      grid.querySelectorAll('.prod-card').forEach(function (c) { obs.observe(c); });
    }
  }

  function showNotFound() {
    var detail = document.getElementById('product-detail-section');
    var related = document.querySelector('.related-products');
    if (detail) {
      detail.innerHTML =
        '<div class="container">' +
          '<div class="not-found">' +
            '<h2>Product Not Found</h2>' +
            '<p>The product you\'re looking for doesn\'t exist or has been removed.</p>' +
            '<a href="products.html" class="btn-buy" style="display:inline-flex;text-decoration:none">Back to Products</a>' +
          '</div>' +
        '</div>';
    }
    if (related) related.style.display = 'none';
  }

  async function init() {
    if (!productId) { showNotFound(); return; }

    try {
      var res = await fetch('data/products.json');
      if (!res.ok) throw new Error('failed');
      var products = await res.json();
      var product = products.find(function (p) { return p.id === productId; });

      if (!product) { showNotFound(); return; }

      renderProduct(product);
      renderRelated(products, productId);

    } catch (e) {
      showNotFound();
    }
  }

  init();

});
