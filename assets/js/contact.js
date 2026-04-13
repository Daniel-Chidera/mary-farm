document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('contact-form');
  var formBody = document.getElementById('form-body');
  var formSuccess = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = form.querySelector('.form-submit');
    var btnText = btn.querySelector('.btn-text');
    var originalText = btnText ? btnText.textContent : 'Send Message';

    btn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';

    setTimeout(function () {
      if (formBody) formBody.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
      btn.disabled = false;
      if (btnText) btnText.textContent = originalText;
      form.reset();
    }, 1200);
  });

});
