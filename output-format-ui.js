(function () {
  'use strict';

  function initOutputFormatUI() {
    var selectEl = document.getElementById('outputFormatSelect');
    if (!selectEl) return;

    var radios = document.querySelectorAll('input[name="outputFormat"]');
    if (!radios || !radios.length) return;

    function applyValue(value) {
      radios.forEach(function (r) {
        r.checked = r.value === value;
      });
    }

    // sync initial state
    applyValue(selectEl.value);

    selectEl.addEventListener('change', function () {
      applyValue(selectEl.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOutputFormatUI);
  } else {
    initOutputFormatUI();
  }
})();

