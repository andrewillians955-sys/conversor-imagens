(function () {
  'use strict';

  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  var selectBtn = document.getElementById('selectBtn');
  var progressSection = document.getElementById('progressSection');
  var progressLabel = document.getElementById('progressLabel');
  var progressFill = document.getElementById('progressFill');
  var progressTrack = document.querySelector('.progress-track');
  var resultEl = document.getElementById('result');
  var resultInfo = document.getElementById('resultInfo');
  var downloadBtn = document.getElementById('downloadBtn');
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAcceptAllBtn = document.getElementById('cookieAcceptAll');
  var cookieRejectBtn = document.getElementById('cookieReject');
  var cookiePreferencesBtn = document.getElementById('cookiePreferences');
  var cookieManageLink = document.getElementById('cookieManageLink');

  var convertedFiles = [];
  var progressAnimationFrameId = null;
  var currentOutputFormat = 'jpg';
  var PROGRESS_DURATION_MS = 7000;
  var COOKIE_CONSENT_KEY = 'cookieConsent';
  var uiLang = getUiLanguage();
  var uiCopy = getUiCopy(uiLang);

  function getUiLanguage() {
    var raw = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    if (raw.indexOf('pt') === 0) return 'pt';
    if (raw.indexOf('es') === 0) return 'es';
    return 'en';
  }

  function getUiCopy(lang) {
    var map = {
      pt: {
        processing: 'Processando imagem... {percent}%',
        downloadSingle: 'Baixar {format}',
        downloadMultiple: 'Baixar todos os {format}s',
        homeButton: 'Início',
        homeAria: 'Voltar para a página inicial',
        resultSingle: '1 imagem convertida para {format}.',
        resultMultiple: '{count} imagens convertidas para {format}.',
        invalidImage: 'Nenhum arquivo de imagem válido. Selecione arquivos WebP ou HEIC/HEIF.',
        formatNotSupported: 'Formato não suportado. Use WebP ou HEIC/HEIF.',
        heicLibraryMissing: 'Biblioteca heic2any não carregada.',
        webpLoadFailed: 'Não foi possível carregar a imagem WebP.',
        webpGenerateFailed: 'Falha ao gerar {format} a partir do WebP.',
        heicGenerateFailed: 'Falha ao converter HEIC para {format}.',
        conversionFailed: 'Erro ao converter. Tente novamente.'
      },
      en: {
        processing: 'Processing image... {percent}%',
        downloadSingle: 'Download {format}',
        downloadMultiple: 'Download all {format}s',
        homeButton: 'Home',
        homeAria: 'Back to the home page',
        resultSingle: '1 image converted to {format}.',
        resultMultiple: '{count} images converted to {format}.',
        invalidImage: 'No valid image files. Please select WebP or HEIC/HEIF files.',
        formatNotSupported: 'Unsupported format. Use WebP or HEIC/HEIF.',
        heicLibraryMissing: 'heic2any library was not loaded.',
        webpLoadFailed: 'Could not load the WebP image.',
        webpGenerateFailed: 'Failed to generate {format} from WebP.',
        heicGenerateFailed: 'Failed to convert HEIC to {format}.',
        conversionFailed: 'Conversion failed. Please try again.'
      },
      es: {
        processing: 'Procesando imagen... {percent}%',
        downloadSingle: 'Descargar {format}',
        downloadMultiple: 'Descargar todos los {format}s',
        homeButton: 'Inicio',
        homeAria: 'Volver a la página principal',
        resultSingle: '1 imagen convertida a {format}.',
        resultMultiple: '{count} imágenes convertidas a {format}.',
        invalidImage: 'No hay archivos de imagen válidos. Selecciona archivos WebP o HEIC/HEIF.',
        formatNotSupported: 'Formato no compatible. Usa WebP o HEIC/HEIF.',
        heicLibraryMissing: 'La biblioteca heic2any no se cargó.',
        webpLoadFailed: 'No se pudo cargar la imagen WebP.',
        webpGenerateFailed: 'Error al generar {format} a partir de WebP.',
        heicGenerateFailed: 'Error al convertir HEIC a {format}.',
        conversionFailed: 'La conversión falló. Inténtalo de nuevo.'
      }
    };

    return map[lang] || map.en;
  }

  function t(key, params) {
    var template = uiCopy[key] || '';
    return template.replace(/\{(\w+)\}/g, function (_, token) {
      return params && Object.prototype.hasOwnProperty.call(params, token) ? params[token] : '';
    });
  }

  function getLocalizedCookiesHref() {
    if (uiLang === 'es') return 'cookies-es.html#preferencias-cookies';
    if (uiLang === 'en') return 'cookies-en.html#preferencias-cookies';
    return 'cookies.html#preferencias-cookies';
  }

  function getHomeHref() {
    if (uiLang === 'es') return 'es.html';
    if (uiLang === 'en') return 'en.html';
    return 'index.html';
  }

  function createHomeButton() {
    var existing = document.getElementById('homeButton');
    if (existing) return;

    var homeButton = document.createElement('a');
    homeButton.id = 'homeButton';
    homeButton.className = 'home-button';
    homeButton.href = getHomeHref();
    homeButton.textContent = t('homeButton');
    homeButton.setAttribute('aria-label', t('homeAria'));
    homeButton.setAttribute('title', t('homeAria'));
    homeButton.setAttribute('rel', 'home');
    document.body.appendChild(homeButton);
  }

  function getCookieConsent() {
    try {
      return window.localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setCookieConsent(value) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch (e) {
      // ignorar falhas de storage
    }
  }

  function hideCookieBanner() {
    if (cookieBanner) {
      cookieBanner.hidden = true;
    }
  }

  function showCookieBannerIfNeeded() {
    if (!cookieBanner) return;
    var stored = getCookieConsent();
    if (!stored) {
      cookieBanner.hidden = false;
    } else {
      cookieBanner.hidden = true;
    }
  }

  function getOutputFormat() {
    var checked = document.querySelector('input[name="outputFormat"]:checked');
    return (checked && checked.value === 'png') ? 'png' : 'jpg';
  }

  function getFormatLabel() {
    return currentOutputFormat === 'png' ? 'PNG' : 'JPG';
  }

  function setProgress(percent) {
    var p = Math.min(100, Math.max(0, Math.round(percent)));
    progressLabel.textContent = t('processing', { percent: p });
    progressFill.style.width = p + '%';
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', p);
  }

  function showProgressAndHideUpload() {
    dropZone.hidden = true;
    resultEl.hidden = true;
    setProgress(0);
    progressSection.hidden = false;
  }

  function hideProgressAndShowUpload() {
    if (progressAnimationFrameId) {
      cancelAnimationFrame(progressAnimationFrameId);
      progressAnimationFrameId = null;
    }
    progressSection.hidden = true;
    dropZone.hidden = false;
  }

  function showResult(info, blobs) {
    convertedFiles = blobs;
    resultInfo.textContent = info;
    hideProgressAndShowUpload();
    resultEl.hidden = false;
    updateDownloadButton();
  }

  function updateDownloadButton() {
    downloadBtn.innerHTML = '';
    downloadBtn.disabled = convertedFiles.length === 0;
    if (convertedFiles.length === 0) return;
    var label = getFormatLabel();
    if (convertedFiles.length === 1) {
      downloadBtn.textContent = t('downloadSingle', { format: label });
      downloadBtn.onclick = function () {
        downloadOne(convertedFiles[0]);
      };
    } else {
      downloadBtn.textContent = t('downloadMultiple', { format: label });
      downloadBtn.onclick = function () {
        convertedFiles.forEach(function (item, i) {
          setTimeout(function () {
            downloadOne(item);
          }, i * 300);
        });
      };
    }
  }

  function downloadOne(item) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(item.blob);
    a.download = item.name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return i >= 0 ? filename.slice(i).toLowerCase() : '';
  }

  function isHeic(file) {
    var ext = getExtension(file.name);
    var type = (file.type || '').toLowerCase();
    return ext === '.heic' || ext === '.heif' || type === 'image/heic' || type === 'image/heif';
  }

  function isWebp(file) {
    var ext = getExtension(file.name);
    var type = (file.type || '').toLowerCase();
    return ext === '.webp' || type === 'image/webp';
  }

  function webpToFormat(file, format) {
    var mime = format === 'png' ? 'image/png' : 'image/jpeg';
    var ext = format === 'png' ? '.png' : '.jpg';
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);

      img.onload = function () {
        URL.revokeObjectURL(url);
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var options = format === 'png' ? undefined : 0.92;
        canvas.toBlob(
          function (blob) {
            if (blob) {
              var baseName = file.name.replace(/\.webp$/i, '');
              resolve({ name: baseName + ext, blob: blob });
            } else {
              reject(new Error(t('webpGenerateFailed', { format: format === 'png' ? 'PNG' : 'JPG' })));
            }
          },
          mime,
          options
        );
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error(t('webpLoadFailed')));
      };

      img.src = url;
    });
  }

  function heicToFormat(file, format) {
    var toType = format === 'png' ? 'image/png' : 'image/jpeg';
    var ext = format === 'png' ? '.png' : '.jpg';
    return new Promise(function (resolve, reject) {
      if (typeof heic2any !== 'function') {
        reject(new Error(t('heicLibraryMissing')));
        return;
      }
      var opts = { blob: file, toType: toType };
      if (format !== 'png') opts.quality = 0.92;
      heic2any(opts)
        .then(function (result) {
          var blob = Array.isArray(result) ? result[0] : result;
          var baseName = file.name.replace(/\.(heic|heif)$/i, '');
          resolve({ name: baseName + ext, blob: blob });
        })
        .catch(function (err) {
          reject(err || new Error(t('heicGenerateFailed', { format: format === 'png' ? 'PNG' : 'JPG' })));
        });
    });
  }

  function processFile(file, format) {
    if (isWebp(file)) {
      return webpToFormat(file, format);
    }
    if (isHeic(file)) {
      return heicToFormat(file, format);
    }
    return Promise.reject(new Error(t('formatNotSupported')));
  }

  function getPsychologicalProgress(elapsedMs) {
    if (elapsedMs <= 0) return 0;
    if (elapsedMs < 1000) {
      return 40 * (elapsedMs / 1000);
    }

    if (elapsedMs < 5000) {
      var phaseMs = elapsedMs - 1000;
      var segment = Math.floor(phaseMs / 500);
      if (segment > 7) segment = 7;
      var segmentStart = segment * 5;
      var withinSegment = phaseMs % 500;
      if (withinSegment < 350) {
        return 40 + segmentStart + (withinSegment / 350) * 4;
      }
      return 40 + segmentStart + 4;
    }

    if (elapsedMs < 7000) {
      return 80 + ((elapsedMs - 5000) / 2000) * 20;
    }

    return 100;
  }

  function runProgressBar(onComplete) {
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var percent = getPsychologicalProgress(elapsed);
      setProgress(percent);

      if (elapsed < PROGRESS_DURATION_MS) {
        progressAnimationFrameId = requestAnimationFrame(tick);
        return;
      }

      progressAnimationFrameId = null;
      setProgress(100);
      if (typeof onComplete === 'function') onComplete();
    }

    progressAnimationFrameId = requestAnimationFrame(tick);
  }

  function processFiles(files) {
    var list = Array.from(files).filter(function (f) {
      return f && f.type && f.type.startsWith('image/');
    });

    if (list.length === 0) {
      alert(t('invalidImage'));
      return;
    }

    showProgressAndHideUpload();
    convertedFiles = [];

    var conversionDone = false;
    var progressDone = false;

    currentOutputFormat = getOutputFormat();
    var formatLabel = getFormatLabel();

    function tryShowResult() {
      if (!conversionDone || !progressDone) return;
      if (conversionError) return;
      var msg = conversionResults.length === 1
        ? t('resultSingle', { format: formatLabel })
        : t('resultMultiple', { count: conversionResults.length, format: formatLabel });
      showResult(msg, conversionResults);
    }

    var conversionResults = [];
    var conversionError = null;

    var promises = list.map(function (file) {
      return processFile(file, currentOutputFormat);
    });

    Promise.all(promises)
      .then(function (results) {
        conversionResults = results;
        conversionDone = true;
        tryShowResult();
      })
      .catch(function (err) {
        conversionError = err;
        hideProgressAndShowUpload();
        resultEl.hidden = true;
        alert(err && err.message ? err.message : t('conversionFailed'));
      });

    runProgressBar(function () {
      progressDone = true;
      tryShowResult();
    });
  }

  showCookieBannerIfNeeded();
  createHomeButton();

  if (cookieAcceptAllBtn) {
    cookieAcceptAllBtn.addEventListener('click', function () {
      setCookieConsent('accepted');
      hideCookieBanner();
    });
  }

  if (cookieRejectBtn) {
    cookieRejectBtn.addEventListener('click', function () {
      setCookieConsent('rejected');
      hideCookieBanner();
    });
  }

  if (cookiePreferencesBtn) {
    cookiePreferencesBtn.addEventListener('click', function () {
      try {
        window.location.href = getLocalizedCookiesHref();
      } catch (e) {
        // fallback silencioso
      }
    });
  }

  if (cookieManageLink && cookieBanner) {
    cookieManageLink.addEventListener('click', function () {
      try {
        cookieBanner.hidden = false;
      } catch (e) {
        // fallback silencioso
      }
    });
  }

  if (selectBtn && fileInput && dropZone) {
    selectBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length) {
        processFiles(fileInput.files);
      }
      fileInput.value = '';
    });

    dropZone.addEventListener('click', function (e) {
      if (e.target === selectBtn || selectBtn.contains(e.target)) return;
      fileInput.click();
    });

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        processFiles(e.dataTransfer.files);
      }
    });

    dropZone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
  }
})();
