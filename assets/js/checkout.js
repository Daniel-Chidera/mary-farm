document.addEventListener('DOMContentLoaded', function () {

  /*
    HOW THIS FILE WORKS (for learning):

    1. We read the URL parameters (?id=fish-001&qty=2) using URLSearchParams
    2. We fetch products.json and find the matching product by ID
    3. We render the product summary in the right column
    4. When the user clicks "Pay Now", we call Paystack's popup
    5. On successful payment, we show a success modal (no page redirect needed)

    KEY CONCEPTS USED:
    - URLSearchParams       → reads data from the URL
    - fetch + async/await   → loads JSON data asynchronously
    - DOM manipulation      → builds HTML dynamically
    - Paystack inline JS    → payment popup from Paystack CDN
    - Modal control         → show/hide overlay with CSS class toggling
  */

  var params = new URLSearchParams(window.location.search);
  var productId = params.get('id');
  var qty = parseInt(params.get('qty')) || 1;

  var currentProduct = null;

  function formatPrice(n) {
    return '\u20a6' + n.toLocaleString('en-NG');
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function generateRef() {
    return 'MF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,5).toUpperCase();
  }

  function renderSummary(product) {
    currentProduct = product;

    var wrap = document.getElementById('summary-product-wrap');
    var linesWrap = document.getElementById('summary-lines');
    var payBtn = document.getElementById('pay-btn');

    if (!wrap || !linesWrap) return;

    var unitPrice = product.price;
    var subtotal = unitPrice * qty;
    var delivery = 0;
    var total = subtotal + delivery;

    wrap.innerHTML =
      '<div class="summary-product">' +
        '<div class="summary-product-img">' +
          '<img src="' + product.image + '" alt="' + product.name + '" ' +
          'onerror="this.parentElement.innerHTML=\'<div class=\\\"summary-product-img-placeholder\\\"><svg xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" stroke-width=\\\"1.5\\\"><rect x=\\\"3\\\" y=\\\"3\\\" width=\\\"18\\\" height=\\\"18\\\" rx=\\\"2\\\"/></svg></div>\'">' +
        '</div>' +
        '<div class="summary-product-info">' +
          '<span class="summary-tag">' + cap(product.category) + '</span>' +
          '<h4>' + product.name + '</h4>' +
          '<p>Qty: ' + qty + ' ' + product.unit + '(s)</p>' +
        '</div>' +
      '</div>';

    linesWrap.innerHTML =
      '<div class="summary-line"><span>Unit Price</span><span>' + formatPrice(unitPrice) + '</span></div>' +
      '<div class="summary-line"><span>Quantity</span><span>' + qty + '</span></div>' +
      '<div class="summary-line"><span>Delivery</span><span>To be confirmed</span></div>' +
      '<div class="summary-line total"><span>Total</span><span>' + formatPrice(total) + '</span></div>';

    if (payBtn) {
      payBtn.dataset.amount = total * 100;
      payBtn.dataset.productName = product.name;
    }

    document.title = 'Checkout — ' + product.name + ' | Mary\'s Farm';
  }

  function renderEmpty() {
    var wrap = document.getElementById('summary-product-wrap');
    if (wrap) {
      wrap.innerHTML =
        '<div class="summary-empty">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
          '<p>No product selected.<br><a href="products.html" style="color:var(--green-mid);font-weight:600">Browse products</a></p>' +
        '</div>';
    }
  }

  async function loadProduct() {
    if (!productId) { renderEmpty(); return; }
    try {
      var res = await fetch('data/products.json');
      if (!res.ok) throw new Error('fail');
      var list = await res.json();
      var product = list.find(function (p) { return p.id === productId; });
      if (!product) { renderEmpty(); return; }
      renderSummary(product);
    } catch (e) {
      renderEmpty();
    }
  }

  loadProduct();

  function openModal(ref) {
    var overlay = document.getElementById('success-modal');
    var refEl = document.getElementById('modal-ref');
    if (refEl) refEl.textContent = ref;
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    var overlay = document.getElementById('success-modal');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.getElementById('modal-close-btn') && document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-browse-btn') && document.getElementById('modal-browse-btn').addEventListener('click', function () {
    window.location.href = 'products.html';
  });

  var successModal = document.getElementById('success-modal');
  if (successModal) {
    successModal.addEventListener('click', function (e) {
      if (e.target === successModal) closeModal();
    });
  }

  var form = document.getElementById('checkout-form');
  var payBtn = document.getElementById('pay-btn');

  if (payBtn) {
    payBtn.addEventListener('click', function () {
      if (!form) return;

      var fullname = document.getElementById('fullname');
      var email = document.getElementById('email');
      var phone = document.getElementById('phone');
      var address = document.getElementById('address');

      var valid = true;

      [fullname, email, phone, address].forEach(function (field) {
        if (!field) return;
        if (!field.value.trim()) {
          field.style.borderColor = '#e53935';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) {
        var firstInvalid = form.querySelector('input[style*="e53935"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var amount = parseInt(payBtn.dataset.amount) || 0;
      var ref = generateRef();

      if (typeof PaystackPop === 'undefined') {
        payBtn.classList.add('loading');
        payBtn.disabled = true;

        setTimeout(function () {
          payBtn.classList.remove('loading');
          payBtn.disabled = false;
          openModal(ref);
        }, 1800);
        return;
      }

      payBtn.classList.add('loading');
      payBtn.disabled = true;

      var handler = PaystackPop.setup({
        key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY',
        email: email.value.trim(),
        amount: amount,
        currency: 'NGN',
        ref: ref,
        metadata: {
          custom_fields: [
            { display_name: 'Full Name', variable_name: 'full_name', value: fullname.value.trim() },
            { display_name: 'Phone', variable_name: 'phone', value: phone.value.trim() },
            { display_name: 'Address', variable_name: 'address', value: address.value.trim() },
            { display_name: 'Product', variable_name: 'product', value: payBtn.dataset.productName || '' },
            { display_name: 'Quantity', variable_name: 'qty', value: qty }
          ]
        },
        callback: function (response) {
          payBtn.classList.remove('loading');
          payBtn.disabled = false;
          openModal(response.reference || ref);
        },
        onClose: function () {
          payBtn.classList.remove('loading');
          payBtn.disabled = false;
        }
      });

      handler.openIframe();
    });
  }

  if (form) {
    form.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        if (this.value.trim()) this.style.borderColor = '';
      });
    });
  }

});
