'use strict';

// ================================================================
//  DADOS DAS MARCAS
//  ▸ Edite aqui: nome, frase, vídeo, site e coleção de cada marca.
//  ▸ A ordem deve corresponder ao targetIndex do targets.mind.
//  ▸ O nome e a frase exibidos em AR estão no index.html (a-text).
//    Atualize ambos os lugares ao renomear uma marca.
// ================================================================
const brandsData = [
  {
    name: 'Marca 01',                            // ← Nome exibido no modal de coleção
    phrase: 'Moda urbana com identidade e atitude.',
    introTop: 'Tecnologia, estilo e presença',
    introBottom: 'Detalhes que fortalecem a marca',
    keywords: ['INOVAÇÃO', 'PRESENÇA', 'IDENTIDADE', 'ESTILO', 'TECNOLOGIA', 'DESIGN'],
    video: 'videos/video_01.mp4',                // ← Vídeo do botão "Vídeo"
    site: 'https://exemplo.com/marca-01',        // ← Link do botão "Site"
    collection: [                                // ← Imagens do carrossel "Coleção"
      {
        name: 'Camisa TSA',
        image: 'assets/collections/marca_01/item_03.png',
        model: 'assets/models/marca_01/camisa.glb'
      },
      {
        name: 'Boné TSA',
        image: 'assets/collections/marca_01/item_01.png',
        model: 'assets/models/marca_01/bone.glb'
      },
      {
        name: 'Chaveiro TSA',
        image: 'assets/collections/marca_01/item_02.png',
        model: 'assets/models/marca_01/chaveiro.glb'
      }
    ]
  },
  {
    name: 'Marca 02',
    phrase: 'Design autoral para todos os momentos.',
    introTop: 'Design autoral em movimento',
    introBottom: 'Peças que conectam atitude e conforto',
    keywords: ['CRIATIVIDADE', 'CONFORTO', 'MOVIMENTO', 'AUTORALIDADE', 'CONEXÃO', 'EXPRESSÃO'],
    video: 'videos/video_02.mp4',
    site: 'https://exemplo.com/marca-02',
    collection: [
      { name: 'Item 01', image: 'assets/collections/marca_02/item_01.jpg', model: '' },
      { name: 'Item 02', image: 'assets/collections/marca_02/item_02.jpg', model: '' },
      { name: 'Item 03', image: 'assets/collections/marca_02/item_03.jpg', model: '' }
    ]
  },
  {
    name: 'Marca 03',
    phrase: 'Estilo, conforto e presença.',
    introTop: 'Conforto, estilo e presença',
    introBottom: 'Experiência urbana em cada detalhe',
    keywords: ['CONFORTO', 'URBANO', 'DETALHE', 'ENERGIA', 'ESTILO', 'PRESENÇA'],
    video: 'videos/video_03.mp4',
    site: 'https://exemplo.com/marca-03',
    collection: [
      { name: 'Item 01', image: 'assets/collections/marca_03/item_01.jpg', model: '' },
      { name: 'Item 02', image: 'assets/collections/marca_03/item_02.jpg', model: '' },
      { name: 'Item 03', image: 'assets/collections/marca_03/item_03.jpg', model: '' }
    ]
  },
  {
    name: 'Marca 04',
    phrase: 'Novas formas de vestir o futuro.',
    introTop: 'O futuro ganha forma',
    introBottom: 'Inovação visual para vestir ideias',
    keywords: ['FUTURO', 'FORMA', 'DESIGN', 'INOVAÇÃO', 'VISÃO', 'TECNOLOGIA'],
    video: 'videos/video_04.mp4',
    site: 'https://exemplo.com/marca-04',
    collection: [
      { name: 'Item 01', image: 'assets/collections/marca_04/item_01.jpg', model: '' },
      { name: 'Item 02', image: 'assets/collections/marca_04/item_02.jpg', model: '' },
      { name: 'Item 03', image: 'assets/collections/marca_04/item_03.jpg', model: '' }
    ]
  }
  /*
    ── COMO ADICIONAR MAIS MARCAS ──────────────────────────────────
    1. Copie e cole um objeto { name, phrase, introTop, introBottom, keywords, video, site, collection }
       aqui e preencha com os dados da nova marca.
    2. Em index.html, copie um bloco <a-entity mindar-image-target>
       e incremente o targetIndex e data-index dos botões.
    3. Adicione a nova imagem ao recompilar o targets.mind.
    ──────────────────────────────────────────────────────────────
  */
];

// ================================================================
//  ESTADO INTERNO
// ================================================================
var isModalOpen      = false;   // verdadeiro enquanto qualquer modal estiver aberto
var arStarted        = false;   // garante que startMindar() rode apenas uma vez
var lastClickTime    = 0;       // usado para debounce dos botões AR

// estado do carrossel
var currentBrandIdx  = 0;
var currentImageIdx  = 0;

// estado da vitrine 3D
var activeModelBrandIdx = null;
var activeModelItemIdx  = null;

// ================================================================
//  REGISTRO DOS BOTÕES AR
//  Chamado ao carregar a página — registra o evento "click" nos
//  <a-plane class="clickable"> dentro dos targets A-Frame.
//  A-Frame despacha eventos DOM nativos via cursor+raycaster.
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
  // data-brand é o atributo usado no HTML para identificar qual marca
  document.querySelectorAll('.clickable[data-action]').forEach(function (el) {
    el.addEventListener('click', function () {
      var action = el.getAttribute('data-action');
      var index  = parseInt(el.getAttribute('data-brand'), 10);
      handleARButtonClick(action, index);
    });
  });
});

// ================================================================
//  TELA INICIAL → INICIAR TOUR
// ================================================================
function startExperience() {
  document.getElementById('splash-screen').classList.add('hidden');

  var hint = document.getElementById('ar-hint');
  hint.querySelector('span').textContent = '⏳ Iniciando câmera...';
  hint.classList.remove('hidden');

  startMindar();
}

// ================================================================
//  INICIALIZAR MINDAR (polling para evitar condição de corrida)
// ================================================================
function startMindar() {
  if (arStarted) return;
  arStarted = true;

  var sceneEl = document.getElementById('ar-scene');

  sceneEl.addEventListener('arReady', function () {
    document.getElementById('ar-hint').querySelector('span').textContent =
      'Aponte para um adesivo ou imagem de produto';
    showWelcome(); // instrução inicial ao abrir a câmera
  });

  sceneEl.addEventListener('arError', function () {
    document.getElementById('ar-hint').classList.add('hidden');
    showErrorMessage(
      'Não foi possível iniciar a câmera.\n\n' +
      'Verifique se:\n' +
      '• Você concedeu permissão de câmera\n' +
      '• A página está em HTTPS\n' +
      '• Nenhum outro app usa a câmera'
    );
  });

  var attempts    = 0;
  var MAX_ATTEMPTS = 50; // 5 segundos

  function tryStart() {
    var arSystem = sceneEl.systems['mindar-image-system'];
    if (arSystem) {
      try {
        registerTargetAnimations();
        arSystem.start();
      } catch (err) {
        console.error('[WebAR] arSystem.start() falhou:', err);
        showErrorMessage('Erro ao iniciar AR:\n' + err.message);
      }
    } else if (attempts < MAX_ATTEMPTS) {
      attempts++;
      setTimeout(tryStart, 100);
    } else {
      document.getElementById('ar-hint').querySelector('span').textContent =
        '❌ Erro — recarregue a página';
    }
  }

  tryStart();
}

// ================================================================
//  ANIMAÇÃO SEQUENCIAL DOS TARGETS
//  Fluxo por target:
//    1. Nome da marca + nó central aparecem
//    2. Linha 0 cresce → botão 0 poppa + label "Galeria" aparece e desvanece
//    3. Linha 1 cresce → botão 1 poppa + label "Video"   aparece e desvanece
//    4. Linha 2 cresce → botão 2 poppa + label "Site"    aparece e desvanece
//    5. Frase desliza de baixo para cima
// ================================================================
function registerTargetAnimations() {
  brandsData.forEach(function (_, idx) {
    var targetEl  = document.getElementById('target-' + idx);
    if (!targetEl) return;

    var brandEl   = targetEl.querySelector('.ar-brand');
    var centerEl  = targetEl.querySelector('.ar-center');
    var growLines = Array.from(targetEl.querySelectorAll('.ar-grow-line'));
    var buttons   = Array.from(targetEl.querySelectorAll('.ar-btn'));
    var labels    = Array.from(targetEl.querySelectorAll('.ar-label'));
    var scanEl    = targetEl.querySelector('.ar-scan');
    var introEls  = Array.from(targetEl.querySelectorAll('.ar-intro-line'));
    var orbitEl   = targetEl.querySelector('.ar-orbit-tags');
    var finalCtaEl = targetEl.querySelector('.ar-final-cta');
    var darkOverlay = document.getElementById('ar-dark-overlay');
    var phraseEl  = targetEl.querySelector('.ar-phrase');
    var phraseText = phraseEl ? phraseEl.getAttribute('value') : '';
    var phraseTypingTimer = null;
    var sequenceTimers = [];

    function setIntroText(selector, text) {
      var el = targetEl.querySelector(selector);
      if (!el) return;
      el._fullText = text || '';
      el.setAttribute('hud-label', 'text', el._fullText);
    }

    function configureDynamicContent() {
      var brandData = brandsData[idx] || {};
      var words = Array.isArray(brandData.keywords) ? brandData.keywords : [];

      if (brandEl) brandEl.setAttribute('value', brandData.name || '');
      if (phraseEl) {
        phraseText = brandData.phrase || '';
        phraseEl.setAttribute('value', phraseText);
      }

      setIntroText('.ar-intro-top', brandData.introTop || '');
      setIntroText('.ar-intro-bottom', brandData.introBottom || '');

      if (orbitEl && words.length) {
        orbitEl.setAttribute('orbit-tags', 'words', words.join(','));
      }
    }

    configureDynamicContent();

    buttons.forEach(function (b) {
      if (b.object3D) b._basePosition = b.object3D.position.clone();
    });

    var cancelled = false; // cancela a sequência se o target for perdido

    // ── Limpa tudo de volta ao estado inicial ─────────────────────
    function resetAll() {
      cancelled = true;
      sequenceTimers.forEach(function (timer) {
        clearTimeout(timer);
        clearInterval(timer);
      });
      sequenceTimers = [];
      if (brandEl)  brandEl.setAttribute('visible', false);
      if (centerEl) centerEl.setAttribute('visible', false);
      if (scanEl)   scanEl.setAttribute('visible', false);
      if (darkOverlay) darkOverlay.classList.add('hidden');
      introEls.forEach(function (el) {
        el.setAttribute('visible', false);
        el.removeAttribute('animation__intro');
        el.removeAttribute('animation__slide');
        el.removeAttribute('animation__out');
        el.removeAttribute('animation__fade');
        el.setAttribute('opacity', 1);
        el.setAttribute('scale', '0.001 0.001 0.001');
        if (el.classList.contains('ar-intro-top') && el.object3D) el.object3D.position.y = 0.58;
        if (el.classList.contains('ar-intro-bottom') && el.object3D) el.object3D.position.y = -0.58;
      });
      if (orbitEl) {
        orbitEl.setAttribute('visible', false);
        if (orbitEl.components && orbitEl.components['orbit-tags']) {
          orbitEl.components['orbit-tags'].reset();
        }
      }
      if (finalCtaEl) {
        finalCtaEl.setAttribute('visible', false);
        finalCtaEl.removeAttribute('animation__in');
        finalCtaEl.removeAttribute('animation__pulse');
        finalCtaEl.setAttribute('scale', '0.001 0.001 0.001');
      }
      if (phraseEl) {
        if (phraseTypingTimer) {
          clearInterval(phraseTypingTimer);
          phraseTypingTimer = null;
        }
        phraseEl.setAttribute('visible', false);
        phraseEl.setAttribute('value', phraseText);
        phraseEl.removeAttribute('animation__enter');
        if (phraseEl.object3D) phraseEl.object3D.position.y = -0.46;
      }
      growLines.forEach(function (l) {
        if (l.components && l.components['grow-line']) l.components['grow-line'].reset();
      });
      buttons.forEach(function (b) {
        b.removeAttribute('animation__float');
        b.removeAttribute('animation__pop');
        if (b.object3D && b._basePosition) b.object3D.position.copy(b._basePosition);
        if (b.object3D) b.object3D.scale.set(0.001, 0.001, 0.001);
        var glow = b.querySelector('a-circle:not(.clickable)');
        if (glow) {
          glow.removeAttribute('animation__glow');
          glow.removeAttribute('animation__glowfade');
          glow.setAttribute('scale', '1 1 1');
        }
      });
      labels.forEach(function (l) {
        l.setAttribute('visible', false);
        l.removeAttribute('animation__fade');
        l.setAttribute('opacity', 1);
      });
    }

    // ── Cresce uma linha e chama callback quando termina ──────────
    function growLine(lineEl, cb) {
      if (cancelled) return;
      var cmp = lineEl && lineEl.components && lineEl.components['grow-line'];
      if (!cmp) { cb(); return; }
      cmp.startGrow();
      var h = function () {
        lineEl.removeEventListener('grow-complete', h);
        if (!cancelled) cb();
      };
      lineEl.addEventListener('grow-complete', h);
    }

    // ── Faz o botão "poppar" em spring ───────────────────────────
    function popBtn(btnEl) {
      if (!btnEl || !btnEl.object3D || cancelled) return;
      if (!btnEl._basePosition) btnEl._basePosition = btnEl.object3D.position.clone();

      btnEl.removeAttribute('animation__float');
      btnEl.object3D.scale.set(0.001, 0.001, 0.001);
      btnEl.object3D.position.copy(btnEl._basePosition);
      btnEl.setAttribute('animation__pop',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:280; easing:easeOutBack');

      var glow = btnEl.querySelector('a-circle:not(.clickable)');
      if (glow) {
        glow.setAttribute('animation__glow',
          'property:scale; from:1.08 1.08 1.08; to:1.48 1.48 1.48; dir:alternate; dur:1050; loop:true; easing:easeInOutSine');
        glow.setAttribute('animation__glowfade',
          'property:opacity; from:0.28; to:0.74; dir:alternate; dur:1050; loop:true; easing:easeInOutSine');
      }

      setTimeout(function () {
        if (cancelled || !btnEl.object3D || !btnEl._basePosition) return;
        var from = btnEl._basePosition;
        var toY = from.y + 0.07;
        btnEl.setAttribute('animation__float',
          'property:position; from:' + from.x + ' ' + from.y + ' ' + from.z +
          '; to:' + from.x + ' ' + toY + ' ' + from.z +
          '; dir:alternate; dur:1800; loop:true; easing:easeInOutSine');
      }, 280);
    }

    // ── Mostra o label e o desfaz depois de 2 s ──────────────────
    function flashLabel(lblEl) {
      if (!lblEl || cancelled) return;
      lblEl.setAttribute('visible', true);
      lblEl.setAttribute('opacity', 1);
      setTimeout(function () {
        if (cancelled) return;
        lblEl.setAttribute('animation__fade',
          'property:opacity; from:1; to:0; dur:500; easing:easeInQuad');
        setTimeout(function () { lblEl.setAttribute('visible', false); }, 500);
      }, 2000);
    }

    function showIntro() {
      if (scanEl) scanEl.setAttribute('visible', true);
      introEls.forEach(function (el, i) {
        if (!el._fullText) {
          var labelData = el.getAttribute('hud-label');
          el._fullText = labelData && labelData.text ? labelData.text : '';
        }

        el.setAttribute('visible', true);
        el.setAttribute('opacity', 0);
        el.setAttribute('hud-label', 'text', '');
        el.setAttribute('animation__intro',
          'property:scale; from:0.92 0.92 0.92; to:1 1 1; dur:520; delay:' + (i * 180) +
          '; easing:easeOutCubic');
        el.setAttribute('animation__fade',
          'property:opacity; from:0; to:1; dur:360; delay:' + (i * 180) + '; easing:easeOutQuad');
        var fromY = el.classList.contains('ar-intro-top') ? 0.7 : -0.7;
        var toY = el.classList.contains('ar-intro-top') ? 0.58 : -0.58;
        el.setAttribute('animation__slide',
          'property:object3D.position.y; from:' + fromY + '; to:' + toY +
          '; dur:520; delay:' + (i * 180) + '; easing:easeOutCubic');

        var startTimer = setTimeout(function () {
          var pos = 0;
          var typingTimer = setInterval(function () {
            if (cancelled) {
              clearInterval(typingTimer);
              return;
            }
            pos++;
            el.setAttribute('hud-label', 'text', el._fullText.slice(0, pos));
            if (pos >= el._fullText.length) clearInterval(typingTimer);
          }, 46);
          sequenceTimers.push(typingTimer);
        }, 320 + i * 500);
        sequenceTimers.push(startTimer);
      });
    }

    function hideIntro() {
      if (scanEl) scanEl.setAttribute('visible', false);
      introEls.forEach(function (el, i) {
        el.setAttribute('animation__out',
          'property:scale; from:1 1 1; to:0.92 0.92 0.92; dur:240; delay:' + (i * 80) +
          '; easing:easeInCubic');
        el.setAttribute('animation__fade',
          'property:opacity; from:1; to:0; dur:240; delay:' + (i * 80) + '; easing:easeInQuad');
        var timer = setTimeout(function () {
          if (!cancelled) el.setAttribute('visible', false);
        }, 360 + i * 80);
        sequenceTimers.push(timer);
      });
    }

    function burstWords() {
      if (!orbitEl) return;
      orbitEl.setAttribute('visible', true);
      if (orbitEl.components && orbitEl.components['orbit-tags']) {
        orbitEl.components['orbit-tags'].present();
      }
    }

    function playWordSequence(next) {
      if (!orbitEl || !orbitEl.components || !orbitEl.components['orbit-tags']) return;
      var completed = false;
      var done = function () {
        if (completed) return;
        completed = true;
        orbitEl.removeEventListener('word-sequence-complete', done);
        next();
      };
      orbitEl.addEventListener('word-sequence-complete', done);
      burstWords();
      var fallback = setTimeout(done, 11200);
      sequenceTimers.push(fallback);
    }

    function showFinalStage() {
      if (darkOverlay) darkOverlay.classList.remove('hidden');
      if (!finalCtaEl) return;
      finalCtaEl.setAttribute('visible', true);
      finalCtaEl.setAttribute('animation__in',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:520; easing:easeOutBack');
      finalCtaEl.setAttribute('animation__pulse',
        'property:scale; from:1 1 1; to:1.08 1.08 1.08; dir:alternate; dur:1300; loop:true; easing:easeInOutSine');
    }

    function typePhrase() {
      if (!phraseEl || cancelled) return;

      if (phraseTypingTimer) clearInterval(phraseTypingTimer);

      var i = 0;
      phraseEl.setAttribute('value', '');
      phraseEl.setAttribute('visible', true);

      phraseTypingTimer = setInterval(function () {
        if (cancelled) {
          clearInterval(phraseTypingTimer);
          phraseTypingTimer = null;
          return;
        }

        i++;
        phraseEl.setAttribute('value', phraseText.slice(0, i));

        if (i >= phraseText.length) {
          clearInterval(phraseTypingTimer);
          phraseTypingTimer = null;
        }
      }, 42);
    }

    // ── Executor de passos sequenciais ───────────────────────────
    // Cada passo: { delay: ms, fn: function(next) {} }
    // delay é esperado ANTES de chamar fn (relativo ao next() anterior)
    function runSeq(steps) {
      var i = 0;
      function advance() {
        if (cancelled || i >= steps.length) return;
        var s = steps[i++];
        var timer = setTimeout(function () {
          if (cancelled) return;
          s.fn(advance);
        }, s.delay || 0);
        sequenceTimers.push(timer);
      }
      advance();
    }

    // ── Sequência completa de entrada ─────────────────────────────
    function playSequence() {
      runSeq([
        // 1. Nome + nó central
        { delay: 0, fn: function (next) {
          if (brandEl)  brandEl.setAttribute('visible', false);
          if (centerEl) centerEl.setAttribute('visible', true);
          showIntro();
          next();
        }},
        // 2. Linha → Botão Coleção
        { delay: 4200, fn: function (next) {
          hideIntro();
          playWordSequence(next);
        }},
        { delay: 150, fn: function (next) {
          showFinalStage();
          next();
        }},
        { delay: 80, fn: function (next) { growLine(growLines[0], next); } },
        { delay: 50, fn: function (next) { popBtn(buttons[0]); flashLabel(labels[0]); next(); } },
        // 3. Linha → Botão Vídeo
        { delay: 260, fn: function (next) { growLine(growLines[1], next); } },
        { delay: 50,  fn: function (next) { popBtn(buttons[1]); flashLabel(labels[1]); next(); } },
        // 4. Linha → Botão Site
        { delay: 260, fn: function (next) { growLine(growLines[2], next); } },
        { delay: 50,  fn: function (next) { popBtn(buttons[2]); flashLabel(labels[2]); next(); } },
        // 5. Frase aparece com efeito de digitação
      ]);
    }

    targetEl.addEventListener('targetFound', function () {
      configureDynamicContent();
      resetAll();
      cancelled = false;
      setTimeout(playSequence, 60);
    });

    targetEl.addEventListener('targetLost', resetAll);
  });
}

// ================================================================
//  TELA DE BOAS-VINDAS (aparece após arReady)
// ================================================================
var _welcomeTimer = null;

function showWelcome() {
  var el  = document.getElementById('ar-welcome');
  var cnt = document.getElementById('welcome-countdown');
  if (!el) return;

  el.classList.remove('hidden');
  var secs = 6;

  _welcomeTimer = setInterval(function () {
    secs--;
    if (cnt) cnt.textContent = secs;
    if (secs <= 0) dismissWelcome();
  }, 1000);
}

function dismissWelcome() {
  var el = document.getElementById('ar-welcome');
  if (el) el.classList.add('hidden');
  if (_welcomeTimer) { clearInterval(_welcomeTimer); _welcomeTimer = null; }
}

// ================================================================
//  ANIMAÇÃO DE ENTRADA — aparece com spring ao detectar o target
//  A frase desliza de baixo para cima (entrada secundária)
// ================================================================
// ================================================================
//  DESPACHO DO CLIQUE NO BOTÃO AR
//  Debounce de 600 ms para evitar disparos duplos em toque mobile.
// ================================================================
function handleARButtonClick(action, index) {
  var now = Date.now();
  if (now - lastClickTime < 600) return;
  lastClickTime = now;

  if (isModalOpen) return; // não abre segundo modal

  if (action === 'collection') openCollectionModal(index);
  else if (action === 'video')      openVideoModal(index);
  else if (action === 'site')       openSite(index);
}

// ================================================================
//  MODAL DE COLEÇÃO — abrir
// ================================================================
function openCollectionModal(brandIndex) {
  currentBrandIdx = brandIndex;
  currentImageIdx = 0;

  var brand = brandsData[brandIndex];
  document.getElementById('collection-brand-name').textContent = brand.name;

  isModalOpen = true;
  document.getElementById('ar-hint').classList.add('hidden');
  document.getElementById('collection-modal').classList.remove('hidden');

  updateCollectionCarousel();
}

// ================================================================
//  MODAL DE COLEÇÃO — fechar
// ================================================================
function closeCollectionModal() {
  document.getElementById('collection-modal').classList.add('hidden');
  if (activeModelBrandIdx === null) document.getElementById('ar-hint').classList.remove('hidden');
  isModalOpen = false;
}

// ================================================================
//  CARROSSEL — navegar
// ================================================================
function nextCollectionImage() {
  var total = brandsData[currentBrandIdx].collection.length;
  currentImageIdx = (currentImageIdx + 1) % total;
  updateCollectionCarousel();
}

function prevCollectionImage() {
  var total = brandsData[currentBrandIdx].collection.length;
  currentImageIdx = (currentImageIdx - 1 + total) % total;
  updateCollectionCarousel();
}

function getCollectionItem(brandIndex, itemIndex) {
  var brand = brandsData[brandIndex];
  var rawItem = brand && brand.collection ? brand.collection[itemIndex] : null;
  if (!rawItem) return null;

  if (typeof rawItem === 'string') {
    return {
      name: 'Item da coleção',
      image: rawItem,
      model: ''
    };
  }

  return rawItem;
}

// ================================================================
//  CARROSSEL — renderizar imagem e dots
// ================================================================
function updateCollectionCarousel() {
  var brand  = brandsData[currentBrandIdx];
  var imgEl  = document.getElementById('carousel-img');
  var nameEl = document.getElementById('carousel-item-name');
  var modelBtns = [
    document.getElementById('view-3d-btn'),
    document.getElementById('view-3d-overlay-btn')
  ].filter(Boolean);
  var empty  = document.getElementById('carousel-empty');
  var item   = getCollectionItem(currentBrandIdx, currentImageIdx);
  var src    = item && item.image ? item.image : '';

  if (nameEl) nameEl.textContent = item && item.name ? item.name : 'Item da coleção';
  var hasModel = !!(item && item.model);
  modelBtns.forEach(function (modelBtn) {
    modelBtn.disabled = !hasModel;
    modelBtn.textContent = hasModel ? 'Ver modelo 3D' : 'Modelo 3D indisponível';
  });

  imgEl.style.opacity = '0';

  imgEl.onload = function () {
    imgEl.style.opacity = '1';
    empty.classList.add('hidden');
    imgEl.style.display = 'block';
  };

  imgEl.onerror = function () {
    imgEl.style.display = 'none';
    empty.classList.remove('hidden');
    imgEl.style.opacity = '1';
  };

  imgEl.src = src;

  // Dots
  var dotsEl = document.getElementById('carousel-dots');
  dotsEl.innerHTML = '';
  brand.collection.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className = 'dot' + (i === currentImageIdx ? ' active' : '');
    dot.setAttribute('aria-label', 'Imagem ' + (i + 1));
    dot.addEventListener('click', function () {
      currentImageIdx = i;
      updateCollectionCarousel();
    });
    dotsEl.appendChild(dot);
  });
}

function openModel3DFromCollection() {
  var brand = brandsData[currentBrandIdx];
  var item = getCollectionItem(currentBrandIdx, currentImageIdx);
  if (!item || !item.model) return;

  var brandIndex = currentBrandIdx;
  var itemIndex = currentImageIdx;
  closeCollectionModal();
  showModel3D(brandIndex, itemIndex);
}

function showModel3D(brandIndex, itemIndex) {
  var brand = brandsData[brandIndex];
  var item = getCollectionItem(brandIndex, itemIndex);
  if (!item || !item.model) return;

  hideModel3D(false);

  var showcaseEl = document.getElementById('model-showcase-' + brandIndex);
  var modelEl = document.getElementById('active-model-' + brandIndex);
  var labelEl = document.getElementById('active-model-label-' + brandIndex);
  var closeBtn = document.getElementById('close-3d-btn');
  if (!showcaseEl || !modelEl) return;

  activeModelBrandIdx = brandIndex;
  activeModelItemIdx = itemIndex;

  if (modelEl._modelLoadedHandler) {
    modelEl.removeEventListener('model-loaded', modelEl._modelLoadedHandler);
  }
  if (modelEl._modelErrorHandler) {
    modelEl.removeEventListener('model-error', modelEl._modelErrorHandler);
  }

  modelEl._modelLoadedHandler = function () {
    if (labelEl) labelEl.setAttribute('value', item.name || '');
  };
  modelEl._modelErrorHandler = function () {
    if (labelEl) labelEl.setAttribute('value', 'Erro ao carregar 3D');
  };
  modelEl.addEventListener('model-loaded', modelEl._modelLoadedHandler);
  modelEl.addEventListener('model-error', modelEl._modelErrorHandler);

  if (labelEl) labelEl.setAttribute('value', 'Carregando 3D...');
  modelEl.setAttribute('src', item.model);
  showcaseEl.setAttribute('visible', true);

  if (closeBtn) closeBtn.classList.remove('hidden');
  document.getElementById('ar-hint').classList.add('hidden');
}

function hideModel3D(clearState) {
  var shouldClearState = clearState !== false;

  if (activeModelBrandIdx !== null) {
    var showcaseEl = document.getElementById('model-showcase-' + activeModelBrandIdx);
    var modelEl = document.getElementById('active-model-' + activeModelBrandIdx);
    var labelEl = document.getElementById('active-model-label-' + activeModelBrandIdx);

    if (showcaseEl) showcaseEl.setAttribute('visible', false);
    if (modelEl) modelEl.removeAttribute('src');
    if (labelEl) labelEl.setAttribute('value', '');
  }

  if (shouldClearState) {
    activeModelBrandIdx = null;
    activeModelItemIdx = null;
  }

  var closeBtn = document.getElementById('close-3d-btn');
  if (closeBtn) closeBtn.classList.add('hidden');
  if (!isModalOpen) document.getElementById('ar-hint').classList.remove('hidden');
}

// Fecha ao clicar fora do card
function handleCollectionOverlayClick(event) {
  if (event.target === document.getElementById('collection-modal')) {
    closeCollectionModal();
  }
}

// ================================================================
//  MODAL DE VÍDEO — abrir
// ================================================================
function openVideoModal(brandIndex) {
  var brand = brandsData[brandIndex];
  if (!brand) return;

  isModalOpen = true;

  document.getElementById('modal-title').textContent = brand.name;

  var video = document.getElementById('modal-video');
  video.src = brand.video;
  video.load();

  document.getElementById('ar-hint').classList.add('hidden');
  document.getElementById('video-modal').classList.remove('hidden');

  var p = video.play();
  if (p !== undefined) {
    p.catch(function (err) {
      console.info('[WebAR] Autoplay bloqueado:', err.message);
    });
  }
}

// ================================================================
//  MODAL DE VÍDEO — fechar
// ================================================================
function closeVideoModal() {
  var video = document.getElementById('modal-video');
  video.pause();
  video.removeAttribute('src');
  video.load();

  document.getElementById('video-modal').classList.add('hidden');
  if (activeModelBrandIdx === null) document.getElementById('ar-hint').classList.remove('hidden');
  isModalOpen = false;
}

// Fecha ao clicar fora do card
function handleVideoOverlayClick(event) {
  if (event.target === document.getElementById('video-modal')) {
    closeVideoModal();
  }
}

// ================================================================
//  ABRIR SITE EM NOVA ABA
// ================================================================
function openSite(brandIndex) {
  var brand = brandsData[brandIndex];
  if (brand && brand.site) {
    window.open(brand.site, '_blank', 'noopener,noreferrer');
  }
}

// ================================================================
//  TECLA ESCAPE — fecha qualquer modal aberto
// ================================================================
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  if (!document.getElementById('video-modal').classList.contains('hidden'))      closeVideoModal();
  if (!document.getElementById('collection-modal').classList.contains('hidden')) closeCollectionModal();
  if (activeModelBrandIdx !== null) hideModel3D();
});

// ================================================================
//  UTILITÁRIO: MENSAGEM DE ERRO
// ================================================================
function showErrorMessage(msg) {
  var banner = document.getElementById('error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'error-banner';
    Object.assign(banner.style, {
      position: 'fixed', inset: '0', zIndex: '2000',
      background: 'rgba(0,0,0,0.92)', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
      textAlign: 'center', color: '#fff', fontFamily: 'system-ui, sans-serif'
    });
    document.body.appendChild(banner);
  }
  banner.innerHTML =
    '<div style="font-size:3rem;margin-bottom:1rem">⚠️</div>' +
    '<pre style="white-space:pre-wrap;font-family:inherit;line-height:1.6;max-width:380px">' +
    escapeHtml(msg) + '</pre>' +
    '<button onclick="location.reload()" style="margin-top:1.5rem;padding:0.75rem 2rem;' +
    'background:#b1121b;color:#fff;border:1px solid rgba(207,211,220,0.35);border-radius:6px;font-size:1rem;cursor:pointer">' +
    'Tentar novamente</button>';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
