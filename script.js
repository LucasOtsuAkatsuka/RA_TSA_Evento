'use strict';

// ================================================================
//  DADOS DOS PONTOS DA TRILHA
//  Cada objeto representa uma imagem/icone que sera escaneado.
//
//  Para adicionar outro painel ou ponto:
//  1. Adicione a imagem no compilador do MindAR.
//  2. Recompile targets/targets.mind.
//  3. Copie um objeto abaixo e ajuste targetIndex + conteudo.
//
//  A interface AR e sempre criada pelo JavaScript.
//  O que muda de um ponto para outro e apenas este conteudo.
// ================================================================
const brandsData = (window.TRAIL_CONFIG && Array.isArray(window.TRAIL_CONFIG.brandsData)) ? window.TRAIL_CONFIG.brandsData : [
  {
    targetIndex: 0,
    panel: 'Painel 01',
    trailStep: 1,
    feature: 'menu',
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
    targetIndex: 1,
    panel: 'Painel 01',
    trailStep: 2,
    feature: 'video',
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
    targetIndex: 2,
    panel: 'Painel 01',
    trailStep: 3,
    feature: 'collection',
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
    targetIndex: 3,
    panel: 'Painel 01',
    trailStep: 4,
    feature: 'site',
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
  },
  /*
    ── COMO ADICIONAR MAIS PONTOS ──────────────────────────────────
    1. Copie e cole um objeto { name, phrase, introTop, introBottom, keywords, video, site, collection }
       aqui e preencha com os dados da nova marca.
    2. Nao precisa copiar blocos no index.html; os targets sao gerados pelo JavaScript.
    3. Ajuste targetIndex no objeto e recompile targets.mind.
    ──────────────────────────────────────────────────────────────
  */
];

// Targets de produto que mostram modelo 3D direto ao escanear.
// Para adicionar outro produto, adicione outro objeto e recompile o .mind.
const productTargetsData = (window.TRAIL_CONFIG && Array.isArray(window.TRAIL_CONFIG.productTargetsData)) ? window.TRAIL_CONFIG.productTargetsData : [
  {
    id: 'camisa',
    targetIndex: 4,
    name: 'Camisa TSA',
    model: 'assets/models/marca_01/camisa.glb',
    spinSpeed: 45
  },
  {
    id: 'bone',
    targetIndex: 5,
    name: 'Boné TSA',
    model: 'assets/models/marca_01/bone.glb',
    spinSpeed: 45
  },
  {
    id: 'chaveiro',
    targetIndex: 6,
    name: 'Chaveiro TSA',
    model: 'assets/models/marca_01/chaveiro.glb',
    spinSpeed: 48
  }
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
var assetCacheVersion   = Date.now();
var imageGlowTextureUrl = '';
var imageAspectCache    = {};
var videoAspectCache    = {};

function withAssetCacheBuster(src) {
  if (!src) return '';
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  return src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=' + assetCacheVersion;
}

function getImageGlowTextureUrl() {
  if (imageGlowTextureUrl) return imageGlowTextureUrl;

  var canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  var ctx = canvas.getContext('2d');
  var gradient = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
  gradient.addColorStop(0.16, 'rgba(207, 211, 220, 0.24)');
  gradient.addColorStop(0.4, 'rgba(233, 69, 96, 0.12)');
  gradient.addColorStop(0.72, 'rgba(233, 69, 96, 0.04)');
  gradient.addColorStop(1, 'rgba(233, 69, 96, 0)');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  imageGlowTextureUrl = canvas.toDataURL('image/png');
  return imageGlowTextureUrl;
}

function getImageNaturalAspect(src, callback) {
  if (!src) {
    callback(null);
    return;
  }

  var key = src;
  if (imageAspectCache[key]) {
    callback(imageAspectCache[key]);
    return;
  }

  var img = new Image();
  img.onload = function () {
    var aspect = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null;
    imageAspectCache[key] = aspect;
    callback(aspect);
  };
  img.onerror = function () {
    imageAspectCache[key] = null;
    callback(null);
  };
  img.src = withAssetCacheBuster(src);
}

function sizeFromNaturalAspect(aspect, width, height) {
  var fallback = {
    width: isFinite(Number(width)) ? Number(width) : 0.82,
    height: isFinite(Number(height)) ? Number(height) : 0.56
  };

  if (!aspect || !isFinite(aspect) || aspect <= 0) return fallback;

  var maxSide = Math.max(fallback.width, fallback.height);
  if (aspect >= 1) {
    return {
      width: maxSide,
      height: maxSide / aspect
    };
  }

  return {
    width: maxSide * aspect,
    height: maxSide
  };
}

function getVideoNaturalAspect(src, callback) {
  if (!src) {
    callback(null);
    return;
  }

  var key = src;
  if (videoAspectCache[key]) {
    callback(videoAspectCache[key]);
    return;
  }

  var video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.onloadedmetadata = function () {
    var aspect = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : null;
    videoAspectCache[key] = aspect;
    callback(aspect);
    video.removeAttribute('src');
    video.load();
  };
  video.onerror = function () {
    videoAspectCache[key] = null;
    callback(null);
  };
  video.src = withAssetCacheBuster(src);
}

var scratchRevealState = null;

function cancelScratchReveal() {
  if (!scratchRevealState) return;

  var state = scratchRevealState;
  scratchRevealState = null;

  window.removeEventListener('resize', state.resize);
  state.canvas.removeEventListener('pointerdown', state.pointerDown);
  state.canvas.removeEventListener('pointermove', state.pointerMove);
  window.removeEventListener('pointerup', state.pointerUp);
  window.removeEventListener('pointercancel', state.pointerUp);

  state.overlay.classList.add('hidden');
  state.overlay.setAttribute('aria-hidden', 'true');
  if (state.handHint) state.handHint.classList.add('is-hidden');
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
}

function startScratchReveal(options, done) {
  var overlay = document.getElementById('scratch-reveal');
  var canvas = document.getElementById('scratch-canvas');
  var handHint = document.getElementById('scratch-hand-hint');
  if (!overlay || !canvas) {
    done();
    return;
  }

  cancelScratchReveal();

  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var threshold = Number(options && options.scratchThreshold ? options.scratchThreshold : 0.2);
  var brush = Number(options && options.scratchBrush ? options.scratchBrush : 88);
  var onScratch = options && typeof options.onScratch === 'function' ? options.onScratch : null;
  var disableAutoComplete = !!(options && options.disableAutoComplete);
  var completed = false;
  var drawing = false;
  var last = null;
  var checkCount = 0;

  function hideHandHint() {
    if (handHint) handHint.classList.add('is-hidden');
  }

  function resize() {
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintCover();
  }

  function paintCover() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var gradient = ctx.createRadialGradient(
      window.innerWidth * 0.5,
      window.innerHeight * 0.42,
      0,
      window.innerWidth * 0.5,
      window.innerHeight * 0.42,
      Math.max(window.innerWidth, window.innerHeight) * 0.85
    );
    gradient.addColorStop(0, 'rgba(4, 4, 6, 0.985)');
    gradient.addColorStop(0.58, 'rgba(0, 0, 0, 0.995)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = 'rgba(233, 69, 96, 0.045)';
    for (var y = 0; y < window.innerHeight; y += 26) {
      ctx.fillRect(0, y, window.innerWidth, 1);
    }
  }

  function getPoint(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function scratchAt(point) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brush;

    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(point.x, point.y, brush * 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    last = point;
    if (onScratch) onScratch(point);
  }

  function getClearedRatio() {
    var sampleW = 96;
    var sampleH = Math.max(54, Math.round(sampleW * window.innerHeight / Math.max(window.innerWidth, 1)));
    var sample = document.createElement('canvas');
    sample.width = sampleW;
    sample.height = sampleH;
    var sampleCtx = sample.getContext('2d', { willReadFrequently: true });
    sampleCtx.drawImage(canvas, 0, 0, sampleW, sampleH);
    var data = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;
    var clearPixels = 0;
    var total = sampleW * sampleH;

    for (var i = 3; i < data.length; i += 4) {
      if (data[i] < 32) clearPixels++;
    }

    return clearPixels / total;
  }

  function complete() {
    if (completed) return;
    completed = true;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    cancelScratchReveal();
    done();
  }

  function maybeComplete(force) {
    if (disableAutoComplete) return;
    checkCount++;
    if (!force && checkCount % 5 !== 0) return;
    if (getClearedRatio() >= threshold) complete();
  }

  function pointerDown(event) {
    event.preventDefault();
    hideHandHint();
    drawing = true;
    last = null;
    canvas.setPointerCapture && canvas.setPointerCapture(event.pointerId);
    scratchAt(getPoint(event));
    maybeComplete(false);
  }

  function pointerMove(event) {
    if (!drawing) return;
    event.preventDefault();
    scratchAt(getPoint(event));
    maybeComplete(false);
  }

  function pointerUp(event) {
    if (!drawing) return;
    drawing = false;
    last = null;
    maybeComplete(true);
  }

  scratchRevealState = {
    overlay: overlay,
    canvas: canvas,
    handHint: handHint,
    ctx: ctx,
    resize: resize,
    pointerDown: pointerDown,
    pointerMove: pointerMove,
    pointerUp: pointerUp
  };

  resize();
  if (handHint) handHint.classList.remove('is-hidden');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', pointerUp);
  window.addEventListener('resize', resize);
}

window.startScratchReveal = startScratchReveal;
window.cancelScratchReveal = cancelScratchReveal;

// ================================================================
//  GERACAO MODULAR DOS TARGETS AR
//  O index.html contem apenas a cena. Os targets da trilha e de
//  produto sao criados aqui a partir dos arrays acima.
// ================================================================
function getMindTargetIndex(item, fallbackIndex) {
  return typeof item.targetIndex === 'number' ? item.targetIndex : fallbackIndex;
}

function getIslandFeature(item) {
  return (item && (item.feature || item.type)) || 'info';
}

function getFeatureAction(feature) {
  if (feature === 'collection') return 'collection';
  if (feature === 'video') return 'video';
  if (feature === 'site') return 'site';
  return '';
}

function getFeatureCta(feature) {
  if (feature === 'menu') return 'veja mais informações';
  if (feature === 'collection') return 'abrir galeria';
  if (feature === 'video') return 'assistir video';
  if (feature === 'site') return 'abrir site';
  if (feature === 'model3d') return 'ver modelo 3D';
  return '';
}

function getFeatureActions(feature) {
  if (feature === 'menu') return ['collection', 'video', 'site'];
  var action = getFeatureAction(feature);
  return action ? [action] : [];
}

function getIslandSteps(item) {
  if (item && Array.isArray(item.steps) && item.steps.length) {
    return item.steps
      .map(function (step, index) {
        var normalized = Object.assign({}, step);
        normalized.order = typeof normalized.order === 'number' ? normalized.order : index + 1;
        return normalized;
      })
      .sort(function (a, b) { return a.order - b.order; });
  }

  var feature = getIslandFeature(item);
  if (feature === 'menu') {
    return [
      {
        type: 'scanner',
        order: 1,
        duration: 4200,
        introTop: item.introTop || '',
        introBottom: item.introBottom || '',
        topY: 0.58,
        bottomY: -0.58
      },
      {
        type: 'words',
        order: 2,
        duration: 11200,
        words: item.keywords || [],
        animation: item.wordAnimation || 'vortex',
        layout: item.wordLayout || 'circle',
        backdropEffect: !!item.wordBackdropEffect,
        fireflyEffect: !!item.wordFireflyEffect
      },
      {
        type: 'actions',
        order: 3,
        duration: 0,
        actions: ['collection', 'video', 'site'],
        cta: item.cta || getFeatureCta(feature)
      }
    ];
  }

  if (feature === 'info') {
    return [
      {
        type: 'scanner',
        order: 1,
        duration: 4200,
        introTop: item.introTop || '',
        introBottom: item.introBottom || '',
        topY: 0.58,
        bottomY: -0.58
      },
      {
        type: 'words',
        order: 2,
        duration: 11200,
        words: item.keywords || [],
        animation: item.wordAnimation || 'vortex',
        layout: item.wordLayout || 'circle',
        backdropEffect: !!item.wordBackdropEffect,
        fireflyEffect: !!item.wordFireflyEffect
      },
      {
        type: 'phrase',
        order: 3,
        duration: 1800,
        text: item.phrase || '',
        x: 0,
        y: -0.46,
        width: 1.05
      }
    ];
  }

  if (feature === 'model3d') {
    return [
      {
        type: 'model3d',
        order: 1,
        duration: 0,
        model: item.model || '',
        modelScale: item.modelScale || '0.55 0.55 0.55',
        spinSpeed: item.spinSpeed || 45
      }
    ];
  }

  if (feature === 'image') {
    return [
      {
        type: 'image',
        order: 1,
        duration: Number(item.imageDuration || 0),
        image: item.image || '',
        title: item.imageTitle || '',
        width: Number(item.imageWidth || 0.82),
        height: Number(item.imageHeight || 0.56),
        x: Number(item.imageX || 0),
        y: Number(item.imageY || 0.05),
        z: Number(item.imageZ || 0.28),
        bg: item.imageBg || '#ffffff',
        titleBg: item.imageTitleBg || 'rgba(177,18,27,0.72)',
        titleColor: item.imageTitleColor || '#ffffff',
        titleFont: Number(item.imageTitleFont || 38),
        interactions: Array.isArray(item.imageInteractions) ? item.imageInteractions : ['float'],
        spinSpeed: Number(item.imageSpinSpeed || 42),
        floatAmount: Number(item.imageFloatAmount || 0.06)
      }
    ];
  }

  if (feature === 'videoPlayer') {
    return [
      {
        type: 'videoPlayer',
        order: 1,
        duration: Number(item.videoDuration || 0),
        video: item.video || '',
        title: item.videoTitle || '',
        width: Number(item.videoWidth || 0.82),
        height: Number(item.videoHeight || 0.56),
        x: Number(item.videoX || 0),
        y: Number(item.videoY || 0.05),
        z: Number(item.videoZ || 0.28),
        bg: item.videoBg || '#000000',
        titleBg: item.videoTitleBg || 'rgba(177,18,27,0.72)',
        titleColor: item.videoTitleColor || '#ffffff',
        titleFont: Number(item.videoTitleFont || 38),
        floatAmount: Number(item.videoFloatAmount || 0.04),
        muted: item.videoMuted !== false,
        loop: item.videoLoop !== false
      }
    ];
  }

  if (feature === 'carousel3d') {
    return [
      {
        type: 'carousel3d',
        order: 1,
        duration: Number(item.carouselDuration || 0),
        animation: item.carouselAnimation || 'orbit',
        radius: Number(item.carouselRadius || 0.82),
        speed: Number(item.carouselSpeed || 18),
        focusAnimation: !!item.carouselFocusAnimation,
        stackInterval: Number(item.carouselStackInterval || 1700),
        stackDepth: Number(item.carouselStackDepth || 0.18),
        stackOffsetY: Number(item.carouselStackOffsetY || 0.055),
        itemWidth: Number(item.carouselItemWidth || 0.52),
        itemHeight: Number(item.carouselItemHeight || 0.68),
        modelSize: Number(item.carouselModelSize || 0.46),
        y: Number(item.carouselY || 0.05),
        title: item.carouselTitle || '',
        titleBg: item.carouselTitleBg || 'rgba(177,18,27,0.72)',
        titleColor: item.carouselTitleColor || '#ffffff',
        titleFont: Number(item.carouselTitleFont || 50),
        cardBg: item.carouselCardBg || '#ffffff',
        itemTitleBg: item.carouselItemTitleBg || 'rgba(177,18,27,0.72)',
        itemTitleColor: item.carouselItemTitleColor || '#ffffff',
        itemTitleFont: Number(item.carouselItemTitleFont || 38)
      }
    ];
  }

  var action = getFeatureAction(feature);
  return action ? [
    {
      type: 'actions',
      order: 1,
      duration: 0,
      actions: [action],
      cta: item.cta || getFeatureCta(feature)
    }
  ] : [];
}

function getStepActions(item) {
  var seen = {};
  var actions = [];

  getIslandSteps(item || {}).forEach(function (step) {
    var stepActions = [];
    if (step.type === 'actions') {
      stepActions = Array.isArray(step.actions)
        ? step.actions
        : String(step.actions || '').split(/\n|,/).map(function (action) { return action.trim(); }).filter(Boolean);
    }
    else {
      var action = getFeatureAction(step.type);
      if (action) stepActions = [action];
    }

    stepActions.forEach(function (action) {
      if (!seen[action]) {
        seen[action] = true;
        actions.push(action);
      }
    });
  });

  return actions;
}

function getFeatureButtonMarkup(action, dataIndex) {
  var layouts = {
    collection: {
      position: '-0.82 0.48 0.1',
      line: 'start:0 0 0.07; cp:-0.32 0.28 0.08; end:-0.62 0.36 0.1; duration:500',
      color: '#e94560',
      glowOpacity: '0.18',
      icon: 'collection',
      label: 'Galeria',
      radius: '0.21'
    },
    video: {
      position: '0.82 0.48 0.1',
      line: 'start:0 0 0.07; cp:0.32 0.28 0.08; end:0.62 0.36 0.1; duration:500',
      color: '#b1121b',
      glowOpacity: '0.22',
      icon: 'video',
      label: 'Video',
      radius: '0.21'
    },
    site: {
      position: '0.82 -0.34 0.1',
      line: 'start:0 0 0.07; cp:0.55 0.08 0.08; end:0.61 -0.25 0.1; duration:500',
      color: '#b1121b',
      glowOpacity: '0.22',
      icon: 'site',
      label: 'Site',
      radius: '0.21'
    }
  };
  var item = layouts[action];
  if (!item) return { lines: '', buttons: '' };

  var buttonBg = action === 'site'
    ? '<a-entity class="clickable ar-button" data-action="' + action + '" data-brand="' + dataIndex + '" link-button-bg></a-entity>'
    : '<a-circle class="clickable ar-button" data-action="' + action + '" data-brand="' + dataIndex + '" radius="' + item.radius + '" color="' + item.color + '" material="shader:flat"></a-circle>';

  return {
    lines: '<a-entity class="ar-grow-line" data-action-slot="' + action + '" grow-line="' + item.line + '"></a-entity>',
    buttons:
      '<a-entity class="ar-btn" data-action-slot="' + action + '" position="' + item.position + '" scale="0.001 0.001 0.001">' +
        '<a-circle radius="0.27" color="' + item.color + '" opacity="' + item.glowOpacity + '" material="shader:flat"></a-circle>' +
        buttonBg +
        '<a-entity ar-icon="type:' + item.icon + '" position="0 0 0.025"></a-entity>' +
        '<a-text class="ar-label" value="' + item.label + '" position="0 0.38 0.02" align="center" color="#ffffff" width="0.65" scale="2.2 2.2 2.2" visible="false"></a-text>' +
      '</a-entity>'
  };
}

function createTrailTarget(brand, dataIndex) {
  var targetIndex = getMindTargetIndex(brand || {}, dataIndex);
  var feature = getIslandFeature(brand || {});
  var featureActions = getStepActions(brand || {});
  var actionMarkup = featureActions.reduce(function (markup, action) {
    var part = getFeatureButtonMarkup(action, dataIndex);
    markup.lines += part.lines;
    markup.buttons += part.buttons;
    return markup;
  }, { lines: '', buttons: '' });
  var target = document.createElement('a-entity');

  target.id = 'target-' + dataIndex;
  target.setAttribute('mindar-image-target', 'targetIndex: ' + targetIndex);
  target.setAttribute('data-feature', feature);

  target.innerHTML =
    '<a-entity id="text-group-' + dataIndex + '" class="text-group" adaptive-scale="factor:0.75; min:0.52; max:2.25; screen:410; lerp:0.08; deadband:0.018">' +
      '<a-text class="ar-brand" value="" position="0 0.78 0.08" align="center" color="#e94560" width="1.4" visible="false"></a-text>' +
      '<a-entity class="ar-intro-line ar-intro-top" hud-label="text:; width:1.36; height:0.21; bg:#b1121b; color:#ffffff; font:40; variant:glass" position="0 0.58 0.18" scale="0.001 0.001 0.001" visible="false"></a-entity>' +
      '<a-entity class="ar-intro-line ar-intro-bottom" hud-label="text:; width:1.48; height:0.21; bg:#b1121b; color:#ffffff; font:38; variant:glass" position="0 -0.58 0.18" scale="0.001 0.001 0.001" visible="false"></a-entity>' +
      '<a-entity class="ar-logo-text" hud-label="text:; width:1.45; height:0.24; bg:#b1121b; color:#ffffff; font:44; variant:glass" position="0 0 0.22" scale="0.001 0.001 0.001" visible="false"></a-entity>' +
      '<a-entity class="ar-step-title" hud-label="text:; width:1.58; height:0.28; bg:rgba(177,18,27,0.72); color:#ffffff; font:64; variant:glass" position="0 0.88 0.24" scale="0.001 0.001 0.001" visible="false"></a-entity>' +
      '<a-entity class="ar-final-cta" hud-label="text:veja mais informações; width:1.55; height:0.24; bg:#b1121b; color:#ffffff; font:44; variant:glass" position="0 -0.82 0.2" scale="0.001 0.001 0.001" visible="false"></a-entity>' +
      '<a-text class="ar-phrase" value="" position="0 -0.46 0.09" align="center" color="#ffffff" width="1.05" scale="1.7 1.7 1.7" visible="false" animation__float="property:object3D.position.y; from:-0.46; to:-0.4; dir:alternate; dur:4500; loop:true; easing:easeInOutSine"></a-text>' +
    '</a-entity>' +

    '<a-entity id="words-group-' + dataIndex + '" class="words-group" adaptive-scale="factor:0.68; min:0.48; max:2.05; screen:360; lerp:0.08; deadband:0.018">' +
      '<a-entity class="ar-orbit-tags" orbit-tags="words:; radius:0.94; speed:15000" visible="false"></a-entity>' +
    '</a-entity>' +

    '<a-entity id="lines-group-' + dataIndex + '" class="lines-group">' +
      '<a-circle class="ar-center" position="0 0 0.07" radius="0.032" color="#cfd3dc" opacity="0.85" material="shader:flat" visible="false"></a-circle>' +
      '<a-entity class="ar-scan" scan-frame visible="false"></a-entity>' +
      actionMarkup.lines +
    '</a-entity>' +

    '<a-entity id="buttons-group-' + dataIndex + '" class="buttons-group">' +
      actionMarkup.buttons +
    '</a-entity>' +

    '<a-entity id="model-showcase-' + dataIndex + '" visible="false" position="0 0.15 0.35" adaptive-scale="factor:0.56; min:0.72; max:2.05; screen:320; lerp:0.08; deadband:0.014">' +
      '<a-gltf-model id="active-model-' + dataIndex + '" src="" position="0 0 0" scale="0.25 0.25 0.25" rotation="0 0 0" continuous-spin="axis:y; speed:45" animation__float="property:position; from:0 0 0; to:0 0.08 0; dir:alternate; dur:1800; loop:true; easing:easeInOutSine"></a-gltf-model>' +
      '<a-text id="active-model-label-' + dataIndex + '" value="" position="0 -0.45 0" align="center" color="#ffffff" width="1.2"></a-text>' +
    '</a-entity>' +

    '<a-entity id="image-showcase-' + dataIndex + '" visible="false" position="0 0.05 0.28" scale="0.001 0.001 0.001">' +
      '<a-entity class="ar-image-content" adaptive-scale="factor:0.78; min:0.9; max:2.7; screen:350; lerp:0.08; deadband:0.014">' +
        '<a-entity class="ar-image-card">' +
          '<a-entity class="ar-image-spin">' +
            '<a-plane class="ar-image-glow" width="1.18" height="0.92" position="0 0 0.006" opacity="0.82" material="shader:flat; transparent:true; depthWrite:false; side:double" visible="false"></a-plane>' +
            '<a-plane class="ar-image-bg" width="0.82" height="0.56" position="0 0 0.012" color="#ffffff" material="shader:flat; side:double"></a-plane>' +
            '<a-plane class="ar-image-plane" width="0.82" height="0.56" position="0 0 0.02" material="shader:flat; transparent:true; side:front"></a-plane>' +
          '</a-entity>' +
        '</a-entity>' +
        '<a-entity class="ar-image-title" hud-label="text:; width:1.1; height:0.18; bg:rgba(177,18,27,0.72); color:#ffffff; font:38; variant:glass" position="0 -0.43 0.05" visible="false"></a-entity>' +
      '</a-entity>' +
    '</a-entity>' +

    '<a-entity id="video-showcase-' + dataIndex + '" visible="false" position="0 0.05 0.28" scale="0.001 0.001 0.001">' +
      '<a-entity class="ar-video-content" adaptive-scale="factor:0.78; min:0.9; max:2.7; screen:350; lerp:0.08; deadband:0.014">' +
        '<a-entity class="ar-video-card">' +
          '<a-plane class="ar-video-bg" width="0.82" height="0.56" position="0 0 0.012" color="#000000" material="shader:flat; side:double"></a-plane>' +
          '<a-plane class="ar-video-plane" width="0.82" height="0.56" position="0 0 0.02" material="shader:flat; transparent:true; side:front"></a-plane>' +
        '</a-entity>' +
        '<a-entity class="ar-video-title" hud-label="text:; width:1.1; height:0.18; bg:rgba(177,18,27,0.72); color:#ffffff; font:38; variant:glass" position="0 -0.43 0.05" visible="false"></a-entity>' +
      '</a-entity>' +
    '</a-entity>' +

    '<a-entity id="carousel-showcase-' + dataIndex + '" visible="false" position="0 0.05 0.28" scale="0.001 0.001 0.001">' +
      '<a-entity class="ar-carousel-content" adaptive-scale="factor:0.74; min:0.88; max:2.6; screen:340; lerp:0.08; deadband:0.014">' +
        '<a-entity class="ar-carousel-stage"></a-entity>' +
        '<a-entity class="ar-carousel-title" hud-label="text:; width:1.35; height:0.2; bg:#b1121b; color:#ffffff; font:38; variant:glass" position="0 -0.72 0" visible="false"></a-entity>' +
      '</a-entity>' +
    '</a-entity>';

  return target;
}

function createProductTarget(product, dataIndex) {
  var targetIndex = getMindTargetIndex(product || {}, brandsData.length + dataIndex);
  var target = document.createElement('a-entity');
  var model = document.createElement('a-gltf-model');
  var id = product && product.id ? product.id : String(dataIndex);

  target.id = 'product-target-' + id;
  target.setAttribute('mindar-image-target', 'targetIndex: ' + targetIndex);

  model.setAttribute('src', product.model || '');
  model.setAttribute('position', product.position || '0 0 0.16');
  model.setAttribute('rotation', product.rotation || '0 0 0');
  model.setAttribute('scale', product.scale || '0.55 0.55 0.55');
  model.setAttribute('product-model-status', 'name:' + (product.name || 'Produto'));
  model.setAttribute('continuous-spin', 'axis:y; speed:' + (product.spinSpeed || 45));

  target.appendChild(model);
  return target;
}

function buildARTargets() {
  var sceneEl = document.getElementById('ar-scene');
  if (!sceneEl || sceneEl.dataset.targetsBuilt === 'true') return;

  Array.from(sceneEl.querySelectorAll('[mindar-image-target]')).forEach(function (targetEl) {
    targetEl.parentNode.removeChild(targetEl);
  });

  var usedTargetIndexes = {};

  brandsData.forEach(function (brand, index) {
    usedTargetIndexes[getMindTargetIndex(brand || {}, index)] = true;
    sceneEl.appendChild(createTrailTarget(brand, index));
  });

  productTargetsData.forEach(function (product, index) {
    var targetIndex = getMindTargetIndex(product || {}, brandsData.length + index);
    if (usedTargetIndexes[targetIndex]) {
      console.warn('[WebAR] Produto 3D ignorado porque targetIndex ja esta em uso por uma ilha:', targetIndex, product);
      return;
    }
    sceneEl.appendChild(createProductTarget(product, index));
  });

  sceneEl.dataset.targetsBuilt = 'true';
}

function registerARButtonListeners() {
  document.querySelectorAll('.clickable[data-action]').forEach(function (el) {
    el.addEventListener('click', function () {
      var action = el.getAttribute('data-action');
      var index  = parseInt(el.getAttribute('data-brand'), 10);
      handleARButtonClick(action, index);
    });
  });
}

// ================================================================
//  REGISTRO DOS BOTÕES AR
//  Chamado ao carregar a página — registra o evento "click" nos
//  <a-plane class="clickable"> dentro dos targets A-Frame.
//  A-Frame despacha eventos DOM nativos via cursor+raycaster.
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
  buildARTargets();
  registerARButtonListeners();
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
  buildARTargets();
  arStarted = true;

  var sceneEl = document.getElementById('ar-scene');
  sceneEl.setAttribute('mindar-image', 'imageTargetSrc', withAssetCacheBuster('./targets/targets.mind'));

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
  brandsData.forEach(function (brandConfig, idx) {
    var targetEl  = document.getElementById('target-' + idx);
    if (!targetEl) return;

    var feature = getIslandFeature(brandConfig);
    var action = getFeatureAction(feature);
    var brandEl   = targetEl.querySelector('.ar-brand');
    var centerEl  = targetEl.querySelector('.ar-center');
    var growLines = Array.from(targetEl.querySelectorAll('.ar-grow-line'));
    var buttons   = Array.from(targetEl.querySelectorAll('.ar-btn'));
    var labels    = Array.from(targetEl.querySelectorAll('.ar-label'));
    var scanEl    = targetEl.querySelector('.ar-scan');
    var introEls  = Array.from(targetEl.querySelectorAll('.ar-intro-line'));
    var orbitEl   = targetEl.querySelector('.ar-orbit-tags');
    var logoTextEl = targetEl.querySelector('.ar-logo-text');
    var stepTitleEl = targetEl.querySelector('.ar-step-title');
    var finalCtaEl = targetEl.querySelector('.ar-final-cta');
    var darkOverlay = document.getElementById('ar-dark-overlay');
    var phraseEl  = targetEl.querySelector('.ar-phrase');
    var phraseText = phraseEl ? phraseEl.getAttribute('value') : '';
    var modelShowcaseEl = targetEl.querySelector('#model-showcase-' + idx);
    var modelEl = targetEl.querySelector('#active-model-' + idx);
    var modelLabelEl = targetEl.querySelector('#active-model-label-' + idx);
    var imageShowcaseEl = targetEl.querySelector('#image-showcase-' + idx);
    var imageCardEl = imageShowcaseEl ? imageShowcaseEl.querySelector('.ar-image-card') : null;
    var imageSpinEl = imageShowcaseEl ? imageShowcaseEl.querySelector('.ar-image-spin') : null;
    var imagePlaneEl = imageShowcaseEl ? imageShowcaseEl.querySelector('.ar-image-plane') : null;
    var imageBgEl = imageShowcaseEl ? imageShowcaseEl.querySelector('.ar-image-bg') : null;
    var imageGlowEl = imageShowcaseEl ? imageShowcaseEl.querySelector('.ar-image-glow') : null;
    var imageTitleEl = imageShowcaseEl ? imageShowcaseEl.querySelector('.ar-image-title') : null;
    var videoShowcaseEl = targetEl.querySelector('#video-showcase-' + idx);
    var videoCardEl = videoShowcaseEl ? videoShowcaseEl.querySelector('.ar-video-card') : null;
    var videoPlaneEl = videoShowcaseEl ? videoShowcaseEl.querySelector('.ar-video-plane') : null;
    var videoBgEl = videoShowcaseEl ? videoShowcaseEl.querySelector('.ar-video-bg') : null;
    var videoTitleEl = videoShowcaseEl ? videoShowcaseEl.querySelector('.ar-video-title') : null;
    var carouselShowcaseEl = targetEl.querySelector('#carousel-showcase-' + idx);
    var carouselStageEl = carouselShowcaseEl ? carouselShowcaseEl.querySelector('.ar-carousel-stage') : null;
    var carouselTitleEl = carouselShowcaseEl ? carouselShowcaseEl.querySelector('.ar-carousel-title') : null;
    var carouselFocusFrame = null;
    var carouselFocusState = null;
    var carouselStackFrame = null;
    var carouselStackState = null;
    var videoSourceEl = null;
    var phraseTypingTimer = null;
    var wordBackdropTimer = null;
    var wordBackdropFrame = null;
    var fireflyWorldPos = new THREE.Vector3();
    var fireflyWorldScale = new THREE.Vector3();
    var sequenceTimers = [];

    function setIntroText(selector, text) {
      var el = targetEl.querySelector(selector);
      if (!el) return;
      el._fullText = text || '';
      el.setAttribute('hud-label', 'text', el._fullText);
    }

    function configureDynamicContent() {
      var brandData = brandsData[idx] || {};
      feature = getIslandFeature(brandData);
      action = getFeatureAction(feature);
      var steps = getIslandSteps(brandData);
      var wordsStep = steps.filter(function (step) { return step.type === 'words'; })[0];
      var phraseStep = steps.filter(function (step) { return step.type === 'phrase'; })[0];
      var scannerStep = steps.filter(function (step) { return step.type === 'scanner'; })[0];
      var actionsStep = steps.filter(function (step) { return step.type === 'actions' || getFeatureAction(step.type); })[0];
      var modelStep = steps.filter(function (step) { return step.type === 'model3d'; })[0];
      var words = wordsStep && Array.isArray(wordsStep.words) ? wordsStep.words :
        (Array.isArray(brandData.keywords) ? brandData.keywords : []);
      var hasText = !!(scannerStep || wordsStep || phraseStep);

      if (brandEl) brandEl.setAttribute('value', brandData.name || '');
      if (phraseEl) {
        phraseText = phraseStep ? (phraseStep.text || '') : (hasText ? (brandData.phrase || '') : '');
        phraseEl.setAttribute('value', phraseText);
      }

      setIntroText('.ar-intro-top', scannerStep ? (scannerStep.introTop || '') : '');
      setIntroText('.ar-intro-bottom', scannerStep ? (scannerStep.introBottom || '') : '');

      if (orbitEl) {
        orbitEl.setAttribute('orbit-tags', 'words', words.length ? words.join(',') : '');
      }

      if (finalCtaEl) {
        finalCtaEl.setAttribute('hud-label', 'text', actionsStep && actionsStep.cta ? actionsStep.cta : getFeatureCta(feature));
      }

      if (modelEl && modelStep) {
        modelEl.setAttribute('src', modelStep.model || brandData.model || '');
        modelEl.setAttribute('scale', modelStep.modelScale || brandData.modelScale || '0.55 0.55 0.55');
        modelEl.setAttribute('continuous-spin', 'axis:y; speed:' + (modelStep.spinSpeed || brandData.spinSpeed || 45));
        modelEl.setAttribute('product-model-status', 'name:' + (brandData.name || 'Modelo 3D'));
      }

      if (modelLabelEl && modelStep) {
        modelLabelEl.setAttribute('value', brandData.name || 'Modelo 3D');
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
      cancelScratchReveal();
      clearWordBackdrop(false);
      if (darkOverlay) darkOverlay.classList.add('hidden');
      if (darkOverlay) darkOverlay.classList.remove('image-glow-backdrop');
      if (modelShowcaseEl) modelShowcaseEl.setAttribute('visible', false);
      if (imageShowcaseEl) {
        imageShowcaseEl.setAttribute('visible', false);
        imageShowcaseEl.removeAttribute('animation__pop');
        imageShowcaseEl.removeAttribute('animation__float');
        imageShowcaseEl.removeAttribute('animation__out');
        imageShowcaseEl.setAttribute('position', '0 0.05 0.28');
        imageShowcaseEl.setAttribute('scale', '0.001 0.001 0.001');
      }
      if (imageCardEl) {
        imageCardEl.removeAttribute('animation__pulse');
        imageCardEl.removeAttribute('animation__tilt');
        imageCardEl.setAttribute('rotation', '0 0 0');
        imageCardEl.setAttribute('scale', '1 1 1');
      }
      if (imageSpinEl) {
        imageSpinEl.removeAttribute('continuous-spin');
        imageSpinEl.setAttribute('rotation', '0 0 0');
      }
      if (imageGlowEl) {
        imageGlowEl.setAttribute('visible', false);
        imageGlowEl.removeAttribute('animation__glow');
      }
      if (imageTitleEl) imageTitleEl.setAttribute('visible', false);
      if (videoShowcaseEl) {
        videoShowcaseEl.setAttribute('visible', false);
        videoShowcaseEl.removeAttribute('animation__pop');
        videoShowcaseEl.removeAttribute('animation__float');
        videoShowcaseEl.removeAttribute('animation__out');
        videoShowcaseEl.setAttribute('position', '0 0.05 0.28');
        videoShowcaseEl.setAttribute('scale', '0.001 0.001 0.001');
      }
      if (videoCardEl) {
        videoCardEl.setAttribute('rotation', '0 0 0');
        videoCardEl.setAttribute('scale', '1 1 1');
      }
      if (videoTitleEl) videoTitleEl.setAttribute('visible', false);
      if (videoSourceEl) {
        try {
          videoSourceEl.pause();
          videoSourceEl.currentTime = 0;
        } catch (err) {
          console.warn('[WebAR] Nao foi possivel resetar o video AR:', err);
        }
      }
      if (carouselShowcaseEl) {
        carouselShowcaseEl.setAttribute('visible', false);
        carouselShowcaseEl.removeAttribute('animation__pop');
        carouselShowcaseEl.removeAttribute('animation__float');
        carouselShowcaseEl.setAttribute('position', '0 0.05 0.28');
        carouselShowcaseEl.setAttribute('scale', '0.001 0.001 0.001');
      }
      stopCarouselFocus();
      stopCarouselStack();
      if (carouselStageEl) {
        carouselStageEl.removeAttribute('continuous-spin');
        while (carouselStageEl.firstChild) {
          carouselStageEl.removeChild(carouselStageEl.firstChild);
        }
      }
      if (carouselTitleEl) carouselTitleEl.setAttribute('visible', false);
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
      if (logoTextEl) {
        logoTextEl.setAttribute('visible', false);
        logoTextEl.removeAttribute('animation__rise');
        logoTextEl.removeAttribute('animation__expand');
        logoTextEl.removeAttribute('animation__settle');
        logoTextEl.removeAttribute('animation__pulse');
        logoTextEl.removeAttribute('animation__out');
        logoTextEl.setAttribute('position', '0 0 0.22');
        logoTextEl.setAttribute('scale', '0.001 0.001 0.001');
      }
      if (stepTitleEl) {
        stepTitleEl.setAttribute('visible', false);
        stepTitleEl.removeAttribute('animation__in');
        stepTitleEl.removeAttribute('animation__out');
        stepTitleEl.removeAttribute('animation__pulse');
        stepTitleEl.setAttribute('position', '0 0.88 0.24');
        stepTitleEl.setAttribute('scale', '0.001 0.001 0.001');
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

    function showIntro(options) {
      options = options || {};
      var topY = isFinite(Number(options.topY)) ? Number(options.topY) : 0.58;
      var bottomY = isFinite(Number(options.bottomY)) ? Number(options.bottomY) : -0.58;
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
        var isTop = el.classList.contains('ar-intro-top');
        var toY = isTop ? topY : bottomY;
        var fromY = isTop ? topY + 0.12 : bottomY - 0.12;
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

    function burstWords(duration) {
      if (!orbitEl) return;
      orbitEl.setAttribute('visible', true);
      if (orbitEl.components && orbitEl.components['orbit-tags']) {
        orbitEl.components['orbit-tags'].present(duration);
      }
    }

    function isOptionEnabled(value) {
      return value === true || value === 'true' || value === 1 || value === '1' || value === 'on';
    }

    function clearWordBackdrop(keepVisible) {
      if (wordBackdropTimer) {
        clearTimeout(wordBackdropTimer);
        wordBackdropTimer = null;
      }
      if (wordBackdropFrame) {
        cancelAnimationFrame(wordBackdropFrame);
        wordBackdropFrame = null;
      }
      if (!darkOverlay) return;
      darkOverlay.classList.remove('word-backdrop');
      darkOverlay.classList.remove('word-firefly-backdrop');
      darkOverlay.classList.remove('image-glow-backdrop');
      darkOverlay.style.removeProperty('--word-backdrop-duration');
      darkOverlay.style.removeProperty('--firefly-x1');
      darkOverlay.style.removeProperty('--firefly-y1');
      darkOverlay.style.removeProperty('--firefly-x2');
      darkOverlay.style.removeProperty('--firefly-y2');
      darkOverlay.style.removeProperty('--firefly-x3');
      darkOverlay.style.removeProperty('--firefly-y3');
      if (!keepVisible) darkOverlay.classList.add('hidden');
    }

    function updateFireflyMask() {
      if (!darkOverlay || !darkOverlay.classList.contains('word-firefly-backdrop') || cancelled) {
        wordBackdropFrame = null;
        return;
      }

      var sceneEl = document.getElementById('ar-scene');
      var camera = sceneEl && sceneEl.camera;
      var orbitComponent = orbitEl && orbitEl.components && orbitEl.components['orbit-tags'];
      var tags = orbitComponent && orbitComponent._tags;
      var delayedFirefly = orbitComponent && orbitComponent._fireflySyncMode === 'delayed';

      if (camera && tags && tags.length) {
        var visibleTags = tags.filter(function (tagData) {
          if (!tagData || !tagData.el || !tagData.el.object3D) return false;
          if (!tagData.el.object3D.visible) return false;
          if (delayedFirefly) return tagData.fireflyActive === true;
          tagData.el.object3D.getWorldScale(fireflyWorldScale);
          return Math.max(fireflyWorldScale.x, fireflyWorldScale.y, fireflyWorldScale.z) > 0.08;
        });

        for (var i = 0; i < 3; i++) {
          var tagData = visibleTags[i];
          if (!tagData || !tagData.el || !tagData.el.object3D) {
            darkOverlay.style.setProperty('--firefly-x' + (i + 1), '-200%');
            darkOverlay.style.setProperty('--firefly-y' + (i + 1), '-200%');
            continue;
          }

          tagData.el.object3D.getWorldPosition(fireflyWorldPos);
          fireflyWorldPos.project(camera);

          if (fireflyWorldPos.z < -1 || fireflyWorldPos.z > 1) {
            darkOverlay.style.setProperty('--firefly-x' + (i + 1), '-200%');
            darkOverlay.style.setProperty('--firefly-y' + (i + 1), '-200%');
            continue;
          }

          var x = Math.max(0, Math.min(100, (fireflyWorldPos.x * 0.5 + 0.5) * 100));
          var y = Math.max(0, Math.min(100, (-fireflyWorldPos.y * 0.5 + 0.5) * 100));
          darkOverlay.style.setProperty('--firefly-x' + (i + 1), x.toFixed(2) + '%');
          darkOverlay.style.setProperty('--firefly-y' + (i + 1), y.toFixed(2) + '%');
        }
      }

      wordBackdropFrame = requestAnimationFrame(updateFireflyMask);
    }

    function startWordBackdrop(options) {
      if (!darkOverlay) return;

      var useReveal = isOptionEnabled(options.backdropEffect || options.wordBackdropEffect);
      var useFirefly = isOptionEnabled(options.fireflyEffect || options.wordFireflyEffect);
      if (!useReveal && !useFirefly) return;

      var duration = Number(options.backdropDuration || options.duration || 5600);
      clearWordBackdrop(false);
      darkOverlay.style.setProperty('--word-backdrop-duration', duration + 'ms');
      darkOverlay.classList.remove('hidden');
      void darkOverlay.offsetWidth;
      darkOverlay.classList.add(useFirefly ? 'word-firefly-backdrop' : 'word-backdrop');
      if (useFirefly) {
        updateFireflyMask();
      }

      wordBackdropTimer = setTimeout(function () {
        clearWordBackdrop(false);
      }, duration + 280);
      sequenceTimers.push(wordBackdropTimer);
    }

    function playWordSequence(next, options) {
      options = options || {};
      if (options.words && orbitEl) {
        var nextWords = Array.isArray(options.words) ? options.words : String(options.words).split(/\n|,/);
        nextWords = nextWords.map(function (word) { return String(word).trim(); }).filter(Boolean);
        orbitEl.setAttribute('orbit-tags', 'words', nextWords.join(','));
      }

      if (orbitEl) {
        orbitEl.setAttribute('orbit-tags', 'bg', options.wordBg || 'rgba(177,18,27,0.72)');
        orbitEl.setAttribute('orbit-tags', 'color', options.wordColor || '#ffffff');
        orbitEl.setAttribute('orbit-tags', 'font', isFinite(Number(options.wordFont)) ? Number(options.wordFont) : 56);
        orbitEl.setAttribute('orbit-tags', 'width', isFinite(Number(options.wordWidth)) ? Number(options.wordWidth) : 0.84);
        orbitEl.setAttribute('orbit-tags', 'height', isFinite(Number(options.wordHeight)) ? Number(options.wordHeight) : 0.23);
        orbitEl.setAttribute('orbit-tags', 'layout', options.layout || options.wordLayout || 'circle');
        orbitEl.setAttribute('orbit-tags', 'firefly', isOptionEnabled(options.fireflyEffect || options.wordFireflyEffect));
      }

      if (!orbitEl || !orbitEl.components || !orbitEl.components['orbit-tags']) {
        next();
        return;
      }

      var wordAnimation = options.animation || 'vortex';
      if (orbitEl.components && orbitEl.components['orbit-tags']) {
        orbitEl.components['orbit-tags']._fireflySyncMode = wordAnimation === 'vortex' ? 'delayed' : 'scale';
      }

      startWordBackdrop(options);

      if (wordAnimation === 'orbit') {
        orbitEl.setAttribute('visible', true);
        orbitEl.components['orbit-tags'].startOrbit();
        var orbitTimer = setTimeout(function () {
          clearWordBackdrop(false);
          next();
        }, Number(options.duration || 4200));
        sequenceTimers.push(orbitTimer);
        return;
      }

      var completed = false;
      var done = function () {
        if (completed) return;
        completed = true;
        orbitEl.removeEventListener('word-sequence-complete', done);
        clearWordBackdrop(false);
        next();
      };
      orbitEl.addEventListener('word-sequence-complete', done);
      orbitEl.setAttribute('visible', true);
      if (wordAnimation === 'clickCollect' && orbitEl.components['orbit-tags'].presentClickCollect) {
        orbitEl.components['orbit-tags'].presentClickCollect(Number(options.duration || 0));
      } else if (wordAnimation === 'dragCenter' && orbitEl.components['orbit-tags'].presentDragCenter) {
        orbitEl.components['orbit-tags'].presentDragCenter(Number(options.duration || 0));
      } else if (wordAnimation === 'scratchFind' && orbitEl.components['orbit-tags'].presentScratchFind) {
        orbitEl.components['orbit-tags'].presentScratchFind(Number(options.duration || 0));
      } else if (wordAnimation === 'wave' && orbitEl.components['orbit-tags'].presentWave) {
        orbitEl.components['orbit-tags'].presentWave(Number(options.duration || 5200));
      } else if (wordAnimation === 'spiral' && orbitEl.components['orbit-tags'].presentSpiral) {
        orbitEl.components['orbit-tags'].presentSpiral(Number(options.duration || 5600));
      } else if (wordAnimation === 'rain' && orbitEl.components['orbit-tags'].presentRain) {
        orbitEl.components['orbit-tags'].presentRain(Number(options.duration || 5200));
      } else if (wordAnimation === 'constellation' && orbitEl.components['orbit-tags'].presentConstellation) {
        orbitEl.components['orbit-tags'].presentConstellation(Number(options.duration || 5200));
      } else {
        burstWords(Number(options.duration || 11200));
      }
      if (wordAnimation !== 'clickCollect' && wordAnimation !== 'dragCenter' && wordAnimation !== 'scratchFind') {
        var fallback = setTimeout(done, Number(options.duration || 11200) + 1400);
        sequenceTimers.push(fallback);
      }
    }

    function showFinalStage(ctaText) {
      if (finalCtaEl && ctaText) finalCtaEl.setAttribute('hud-label', 'text', ctaText);
      clearWordBackdrop(true);
      if (darkOverlay) darkOverlay.classList.remove('hidden');
      if (!finalCtaEl) return;
      var labelData = finalCtaEl.getAttribute('hud-label');
      if (!labelData || !labelData.text) return;
      finalCtaEl.setAttribute('visible', true);
      finalCtaEl.setAttribute('animation__in',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:520; easing:easeOutBack');
      finalCtaEl.setAttribute('animation__pulse',
        'property:scale; from:1 1 1; to:1.08 1.08 1.08; dir:alternate; dur:1300; loop:true; easing:easeInOutSine');
    }

    function typePhrase(options) {
      options = options || {};
      if (!phraseEl || cancelled) return;

      if (phraseTypingTimer) clearInterval(phraseTypingTimer);

      var i = 0;
      phraseText = options.text || phraseText;
      if (phraseEl.object3D) {
        if (isFinite(Number(options.x))) phraseEl.object3D.position.x = Number(options.x);
        if (isFinite(Number(options.y))) phraseEl.object3D.position.y = Number(options.y);
      }
      if (options.width) phraseEl.setAttribute('width', options.width);
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

    function showStepTitle(options) {
      if (!stepTitleEl || cancelled) return;

      options = typeof options === 'string' ? { stepTitle: options } : (options || {});
      var text = options.stepTitle || '';
      var bg = options.stepTitleBg || 'rgba(177,18,27,0.72)';
      var color = options.stepTitleColor || '#ffffff';
      var font = isFinite(Number(options.stepTitleFont)) ? Number(options.stepTitleFont) : 64;
      var width = isFinite(Number(options.stepTitleWidth)) ? Number(options.stepTitleWidth) : 1.58;
      var height = isFinite(Number(options.stepTitleHeight)) ? Number(options.stepTitleHeight) : 0.28;

      stepTitleEl.removeAttribute('animation__in');
      stepTitleEl.removeAttribute('animation__out');
      stepTitleEl.removeAttribute('animation__pulse');

      if (!text) {
        stepTitleEl.setAttribute('visible', false);
        stepTitleEl.setAttribute('scale', '0.001 0.001 0.001');
        return;
      }

      stepTitleEl.setAttribute('hud-label', 'text', text);
      stepTitleEl.setAttribute('hud-label', 'bg', bg);
      stepTitleEl.setAttribute('hud-label', 'color', color);
      stepTitleEl.setAttribute('hud-label', 'font', font);
      stepTitleEl.setAttribute('hud-label', 'width', width);
      stepTitleEl.setAttribute('hud-label', 'height', height);
      stepTitleEl.setAttribute('visible', true);
      stepTitleEl.setAttribute('scale', '0.001 0.001 0.001');
      stepTitleEl.setAttribute('animation__in',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:320; easing:easeOutBack');
      stepTitleEl.setAttribute('animation__pulse',
        'property:scale; from:1 1 1; to:1.035 1.035 1.035; dir:alternate; dur:1600; delay:320; loop:true; easing:easeInOutSine');
    }

    function hideStepTitle() {
      if (!stepTitleEl || cancelled || stepTitleEl.getAttribute('visible') === false) return;

      stepTitleEl.removeAttribute('animation__pulse');
      stepTitleEl.setAttribute('animation__out',
        'property:scale; from:1 1 1; to:0.001 0.001 0.001; dur:180; easing:easeInBack');

      var titleTimer = setTimeout(function () {
        if (cancelled || !stepTitleEl) return;
        stepTitleEl.setAttribute('visible', false);
        stepTitleEl.removeAttribute('animation__out');
        stepTitleEl.setAttribute('scale', '0.001 0.001 0.001');
      }, 200);
      sequenceTimers.push(titleTimer);
    }

    function showLogoText(options) {
      options = options || {};
      if (!logoTextEl || cancelled) return;

      var text = options.text || '';
      if (!text) return;

      var x = isFinite(Number(options.x)) ? Number(options.x) : 0;
      var y = isFinite(Number(options.y)) ? Number(options.y) : 0.72;
      var z = 0.22;
      var width = isFinite(Number(options.width)) ? Number(options.width) : 1.45;
      var height = isFinite(Number(options.height)) ? Number(options.height) : 0.24;
      var font = isFinite(Number(options.font)) ? Number(options.font) : 44;
      var bg = options.bg || 'rgba(177,18,27,0.72)';
      var color = options.color || '#ffffff';
      var totalDuration = Math.max(500, Number(options.duration || 1600));
      var duration = Math.min(900, Math.max(300, Math.round(totalDuration * 0.62)));
      var settleDelay = Math.max(160, Math.round(duration * 0.72));

      logoTextEl.removeAttribute('animation__rise');
      logoTextEl.removeAttribute('animation__expand');
      logoTextEl.removeAttribute('animation__settle');
      logoTextEl.removeAttribute('animation__pulse');
      logoTextEl.removeAttribute('animation__out');
      logoTextEl.setAttribute('hud-label', 'text', text);
      logoTextEl.setAttribute('hud-label', 'width', width);
      logoTextEl.setAttribute('hud-label', 'height', height);
      logoTextEl.setAttribute('hud-label', 'font', font);
      logoTextEl.setAttribute('hud-label', 'bg', bg);
      logoTextEl.setAttribute('hud-label', 'color', color);
      logoTextEl.setAttribute('position', '0 0 ' + z);
      logoTextEl.setAttribute('scale', '0.001 0.001 0.001');
      logoTextEl.setAttribute('visible', true);
      logoTextEl.setAttribute('animation__rise',
        'property:position; from:0 0 ' + z + '; to:' + x + ' ' + y + ' ' + z +
        '; dur:' + duration + '; easing:easeOutCubic');
      logoTextEl.setAttribute('animation__expand',
        'property:scale; from:0.001 0.001 0.001; to:1.12 1.12 1.12; dur:' + settleDelay +
        '; easing:easeOutBack');
      logoTextEl.setAttribute('animation__settle',
        'property:scale; from:1.12 1.12 1.12; to:1 1 1; dur:260; delay:' + settleDelay +
        '; easing:easeInOutSine');
      logoTextEl.setAttribute('animation__pulse',
        'property:scale; from:1 1 1; to:1.035 1.035 1.035; dir:alternate; dur:1600; delay:' +
        (settleDelay + 260) + '; loop:true; easing:easeInOutSine');
    }

    function hideLogoText() {
      if (!logoTextEl || cancelled) return;

      logoTextEl.removeAttribute('animation__pulse');
      logoTextEl.setAttribute('animation__out',
        'property:scale; from:1 1 1; to:0.001 0.001 0.001; dur:240; easing:easeInBack');

      var hideTimer = setTimeout(function () {
        if (cancelled || !logoTextEl) return;
        logoTextEl.setAttribute('visible', false);
        logoTextEl.removeAttribute('animation__out');
        logoTextEl.setAttribute('position', '0 0 0.22');
        logoTextEl.setAttribute('scale', '0.001 0.001 0.001');
      }, 260);
      sequenceTimers.push(hideTimer);
    }

    function normalizeCarouselItems(items) {
      return (Array.isArray(items) ? items : [])
        .map(function (item) {
          if (typeof item === 'string') {
            return { name: 'Item', title: '', image: item, model: '' };
          }
          return {
            name: item && item.name ? item.name : 'Item',
            title: item && item.title ? item.title : '',
            image: item && item.image ? item.image : '',
            model: item && item.model ? item.model : '',
            modelScale: item && item.modelScale ? item.modelScale : '',
            spinSpeed: item && item.spinSpeed ? item.spinSpeed : ''
          };
        })
        .filter(function (item) { return item.image || item.model; });
    }

    function makeCarouselLabel(item, options, width, height) {
      var text = (item && (item.title || item.name)) || '';
      if (!text) return null;

      var label = document.createElement('a-entity');
      var labelWidth = Number(options.itemTitleWidth || Math.max(width, 0.68));
      var labelHeight = Number(options.itemTitleHeight || 0.16);

      label.classList.add('ar-carousel-label');
      label.setAttribute('position', '0 ' + (-(height / 2) - 0.12) + ' 0.06');
      label.setAttribute('hud-label', 'text', text);
      label.setAttribute('hud-label', 'width', labelWidth);
      label.setAttribute('hud-label', 'height', labelHeight);
      label.setAttribute('hud-label', 'bg', options.itemTitleBg || 'rgba(177,18,27,0.72)');
      label.setAttribute('hud-label', 'color', options.itemTitleColor || '#ffffff');
      label.setAttribute('hud-label', 'font', isFinite(Number(options.itemTitleFont)) ? Number(options.itemTitleFont) : 38);
      label.setAttribute('hud-label', 'variant', 'glass');
      return label;
    }

    function createCarouselCard(item, index, total, options) {
      var radius = Number(options.radius || Math.max(0.72, total * 0.12));
      var width = Number(options.itemWidth || 0.52);
      var height = Number(options.itemHeight || 0.68);
      var cardBg = options.cardBg || '#ffffff';
      var angle = (Math.PI * 2 * index) / Math.max(total, 1);
      var angleDeg = THREE.MathUtils.radToDeg(angle);
      var x = Math.sin(angle) * radius;
      var z = Math.cos(angle) * radius;
      var card = document.createElement('a-entity');

      card.setAttribute('position', x + ' 0 ' + z);
      card.setAttribute('rotation', '0 ' + angleDeg + ' 0');
      card.setAttribute('scale', '0.001 0.001 0.001');
      card.dataset.carouselIndex = String(index);
      card.dataset.basePosition = x + ' 0 ' + z;
      card.dataset.baseRotation = '0 ' + angleDeg + ' 0';
      card.setAttribute('animation__in',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:420; delay:' +
        (index * 90) + '; easing:easeOutBack');

      if (item.model) {
        var model = document.createElement('a-gltf-model');
        model.setAttribute('src', withAssetCacheBuster(item.model));
        model.setAttribute('position', '0 0.04 0.06');
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('scale', item.modelScale || options.modelScale || '0.45 0.45 0.45');
        model.setAttribute('fit-gltf-model', 'size: ' + Number(options.modelSize || 0.46));
        model.setAttribute('continuous-spin', 'axis:y; speed:' + Number(item.spinSpeed || options.itemSpinSpeed || 28));
        card.appendChild(model);
      } else {
        var backing = document.createElement('a-plane');
        backing.setAttribute('position', '0 0 0.018');
        backing.setAttribute('width', width);
        backing.setAttribute('height', height);
        backing.setAttribute('material', {
          shader: 'flat',
          color: cardBg,
          transparent: false,
          side: 'double'
        });
        card.appendChild(backing);

        var plane = document.createElement('a-plane');
        plane.setAttribute('position', '0 0 0.025');
        plane.setAttribute('width', width);
        plane.setAttribute('height', height);
        plane.setAttribute('material', {
          shader: 'flat',
          src: withAssetCacheBuster(item.image),
          transparent: true,
          side: 'front'
        });
        card.appendChild(plane);
      }

      var label = makeCarouselLabel(item, options, width, height);
      if (label) card.appendChild(label);

      if (!item.model && item.image && plane && backing) {
        getImageNaturalAspect(item.image, function (aspect) {
          if (cancelled || !card.parentNode) return;
          var naturalSize = sizeFromNaturalAspect(aspect, width, height);
          backing.setAttribute('width', naturalSize.width);
          backing.setAttribute('height', naturalSize.height);
          plane.setAttribute('width', naturalSize.width);
          plane.setAttribute('height', naturalSize.height);
          if (label) {
            label.setAttribute('position', '0 ' + (-(naturalSize.height / 2) - 0.12) + ' 0.06');
            label.setAttribute('hud-label', 'width', Number(options.itemTitleWidth || Math.max(naturalSize.width, 0.68)));
          }
        });
      }

      return card;
    }

    function stopCarouselFocus() {
      if (carouselFocusFrame) {
        cancelAnimationFrame(carouselFocusFrame);
        carouselFocusFrame = null;
      }
      if (carouselFocusState && carouselFocusState.focusEl && carouselFocusState.focusEl.parentNode) {
        carouselFocusState.focusEl.parentNode.removeChild(carouselFocusState.focusEl);
      }
      carouselFocusState = null;
      if (!carouselStageEl) return;
      Array.from(carouselStageEl.children).forEach(function (cardEl) {
        if (cardEl.dataset.basePosition) cardEl.setAttribute('position', cardEl.dataset.basePosition);
        if (cardEl.dataset.baseRotation) cardEl.setAttribute('rotation', cardEl.dataset.baseRotation);
        if (cardEl.object3D) cardEl.object3D.scale.set(1, 1, 1);
      });
    }

    function stopCarouselStack() {
      if (carouselStackFrame) {
        cancelAnimationFrame(carouselStackFrame);
        carouselStackFrame = null;
      }
      carouselStackState = null;
    }

    function setStackCardTransform(cardEl, y, z, scale, visible, labelVisible, rotationX, rotationZ) {
      cardEl.setAttribute('visible', visible !== false);
      cardEl.setAttribute('position', '0 ' + y + ' ' + z);
      cardEl.setAttribute('rotation', Number(rotationX || 0) + ' 0 ' + Number(rotationZ || 0));
      cardEl.setAttribute('scale', scale + ' ' + scale + ' ' + scale);
      Array.from(cardEl.querySelectorAll('.ar-carousel-label')).forEach(function (labelEl) {
        labelEl.setAttribute('visible', labelVisible === true);
      });
      if (cardEl.object3D) {
        cardEl.object3D.renderOrder = Math.round((z + 2) * 1000);
        cardEl.object3D.traverse(function (child) {
          child.renderOrder = cardEl.object3D.renderOrder;
        });
      }
    }

    function startCarouselStack(items, options) {
      stopCarouselStack();
      if (!carouselStageEl || !items.length) return;

      var cards = Array.from(carouselStageEl.children);
      var total = cards.length;
      var visibleLayers = Math.min(total, Math.max(3, Number(options.stackLayers || 4)));
      var intervalMs = Math.max(900, Number(options.stackInterval || 1700));
      var transitionMs = Math.min(intervalMs * 0.55, Math.max(420, Number(options.stackTransition || 680)));
      var holdMs = Math.max(180, intervalMs - transitionMs);
      var depth = Math.max(0.04, Number(options.stackDepth || 0.18));
      var offsetY = Math.max(0.01, Number(options.stackOffsetY || 0.055));
      var frontZ = Number(options.stackFrontZ || 0.22);
      var startTime = null;

      cards.forEach(function (cardEl) {
        cardEl.removeAttribute('animation__in');
      });
      carouselStackState = { cards: cards };
      carouselStageEl.object3D.rotation.set(0, 0, 0);

      function layerScale(order) {
        return Math.max(0.76, 1 - order * 0.07);
      }

      function layerY(order) {
        return -order * offsetY;
      }

      function layerZ(order) {
        return frontZ - order * depth;
      }

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function placeAtLayer(cardEl, order, visiblePadding, labelVisible) {
        var clampedOrder = Math.max(0, order);
        var visible = clampedOrder < visibleLayers + Number(visiblePadding || 0);
        var showLabel = labelVisible === undefined ? visible && clampedOrder < 0.35 : labelVisible;
        setStackCardTransform(
          cardEl,
          layerY(clampedOrder),
          layerZ(clampedOrder),
          layerScale(clampedOrder),
          visible,
          showLabel
        );
      }

      function tick(time) {
        if (!carouselStackState || cancelled || !carouselStageEl) {
          carouselStackFrame = null;
          return;
        }

        if (startTime === null) startTime = time;
        var elapsed = time - startTime;
        var segment = Math.floor(elapsed / intervalMs);
        var local = elapsed % intervalMs;
        var frontIndex = segment % total;
        var transitioning = total > 1 && local >= holdMs;
        var t = transitioning ? easeInOutCubic((local - holdMs) / transitionMs) : 0;

        cards.forEach(function (cardEl, index) {
          var order = (index - frontIndex + total) % total;

          if (!transitioning) {
            placeAtLayer(cardEl, order);
            return;
          }

          if (order === 0) {
            var backOrder = Math.max(1, total - 1);
            var arc = Math.sin(Math.PI * t);
            var yOut = lerp(layerY(0), layerY(backOrder), t) - arc * 0.22;
            var zOut = lerp(layerZ(0), layerZ(backOrder), t) - arc * 0.06;
            var scaleOut = lerp(layerScale(0), layerScale(backOrder), t);
            setStackCardTransform(cardEl, yOut, zOut, scaleOut, true, false, -10 * arc, -5 * t);
            return;
          }

          if (order === 1) {
            var incomingArc = Math.sin(Math.PI * t);
            var yIn = lerp(layerY(1), layerY(0), t) + incomingArc * 0.22;
            var zIn = lerp(layerZ(1), layerZ(0), t) + incomingArc * 0.08;
            var scaleIn = lerp(layerScale(1), layerScale(0), t);
            setStackCardTransform(cardEl, yIn, zIn, scaleIn, true, t > 0.62, 8 * incomingArc, 5 * (1 - t));
            return;
          }

          if (order < visibleLayers + 1) {
            placeAtLayer(cardEl, order - t, 1, false);
            return;
          }

          placeAtLayer(cardEl, order);
        });

        carouselStackFrame = requestAnimationFrame(tick);
      }

      carouselStackFrame = requestAnimationFrame(tick);
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function createFocusedCarouselCard(item, options) {
      var width = Number(options.itemWidth || 0.52);
      var height = Number(options.itemHeight || 0.68);
      var cardBg = options.cardBg || '#ffffff';
      var card = document.createElement('a-entity');

      card.classList.add('ar-carousel-focus-card');
      card.setAttribute('position', '0 ' + Number(options.focusY || 0.04) + ' ' + Number(options.focusZ || 0.72));
      card.setAttribute('rotation', '0 0 0');
      card.setAttribute('scale', '0.001 0.001 0.001');

      if (item.model) {
        var model = document.createElement('a-gltf-model');
        model.setAttribute('src', withAssetCacheBuster(item.model));
        model.setAttribute('position', '0 0.04 0.06');
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('scale', item.modelScale || options.modelScale || '0.45 0.45 0.45');
        model.setAttribute('fit-gltf-model', 'size: ' + Number(options.modelSize || 0.46));
        model.setAttribute('continuous-spin', 'axis:y; speed:' + Number(item.spinSpeed || options.itemSpinSpeed || 20));
        card.appendChild(model);
      } else {
        var backing = document.createElement('a-plane');
        backing.setAttribute('position', '0 0 0.018');
        backing.setAttribute('width', width);
        backing.setAttribute('height', height);
        backing.setAttribute('material', {
          shader: 'flat',
          color: cardBg,
          transparent: false,
          side: 'double'
        });
        card.appendChild(backing);

        var plane = document.createElement('a-plane');
        plane.setAttribute('position', '0 0 0.025');
        plane.setAttribute('width', width);
        plane.setAttribute('height', height);
        plane.setAttribute('material', {
          shader: 'flat',
          src: withAssetCacheBuster(item.image),
          transparent: true,
          side: 'front'
        });
        card.appendChild(plane);
      }

      var label = makeCarouselLabel(item, options, width, height);
      if (label) card.appendChild(label);

      if (!item.model && item.image && plane && backing) {
        getImageNaturalAspect(item.image, function (aspect) {
          if (cancelled || !card.parentNode) return;
          var naturalSize = sizeFromNaturalAspect(aspect, width, height);
          backing.setAttribute('width', naturalSize.width);
          backing.setAttribute('height', naturalSize.height);
          plane.setAttribute('width', naturalSize.width);
          plane.setAttribute('height', naturalSize.height);
          if (label) {
            label.setAttribute('position', '0 ' + (-(naturalSize.height / 2) - 0.12) + ' 0.06');
            label.setAttribute('hud-label', 'width', Number(options.itemTitleWidth || Math.max(naturalSize.width, 0.68)));
          }
        });
      }

      return card;
    }

    function clearFocusedCarouselCard() {
      if (!carouselFocusState || !carouselFocusState.focusEl) return;
      var focusEl = carouselFocusState.focusEl;
      focusEl.removeAttribute('animation__focusin');
      focusEl.setAttribute('animation__focusout',
        'property:scale; to:0.001 0.001 0.001; dur:260; easing:easeInBack');
      var removeTimer = setTimeout(function () {
        if (focusEl.parentNode) focusEl.parentNode.removeChild(focusEl);
      }, 280);
      sequenceTimers.push(removeTimer);
      carouselFocusState.focusEl = null;
    }

    function showFocusedCarouselCard(index, options) {
      if (!carouselShowcaseEl || !carouselFocusState || !carouselFocusState.items[index]) return;
      clearFocusedCarouselCard();

      var focusScale = Number(options.focusScale || 2.15);
      var focusEl = createFocusedCarouselCard(carouselFocusState.items[index], options);
      carouselShowcaseEl.appendChild(focusEl);
      carouselFocusState.focusEl = focusEl;

      focusEl.setAttribute('animation__focusin',
        'property:scale; from:0.001 0.001 0.001; to:' + focusScale + ' ' + focusScale + ' ' + focusScale +
        '; dur:460; easing:easeOutBack');
    }

    function startCarouselFocus(items, options) {
      var total = items.length;
      if (!carouselStageEl || total <= 1) return;

      stopCarouselFocus();
      carouselStageEl.removeAttribute('continuous-spin');

      var spinMs = Number(options.focusSpinDuration || 1200);
      var holdMs = Number(options.focusHoldDuration || 900);
      var zoomMs = Number(options.focusZoomDuration || 420);
      var rotationsPerStep = Number(options.focusRotations || 1.25);
      var segmentMs = spinMs + holdMs + zoomMs;
      var stepAngle = 360 / total;

      carouselFocusState = {
        start: null,
        currentIndex: -1,
        focusEl: null,
        items: items,
        total: total,
        stepAngle: stepAngle,
        segmentMs: segmentMs
      };

      function tick(time) {
        if (!carouselFocusState || cancelled || !carouselStageEl) {
          carouselFocusFrame = null;
          return;
        }

        if (carouselFocusState.start === null) carouselFocusState.start = time;

        var elapsed = time - carouselFocusState.start;
        var segmentIndex = Math.floor(elapsed / segmentMs);
        var local = elapsed % segmentMs;
        var targetIndex = segmentIndex % total;
        var previousAngle = segmentIndex * stepAngle;
        var targetAngle = (segmentIndex + 1) * stepAngle;
        var fastAngle = rotationsPerStep * 360;
        var rotation;

        if (local < spinMs) {
          var t = easeInOutCubic(local / spinMs);
          rotation = previousAngle + fastAngle * t + stepAngle * t;
        } else {
          rotation = targetAngle;
        }

        carouselStageEl.object3D.rotation.y = THREE.MathUtils.degToRad(rotation);

        if (local >= spinMs && carouselFocusState.currentIndex !== targetIndex) {
          carouselFocusState.currentIndex = targetIndex;
          showFocusedCarouselCard(targetIndex, options);
        }

        if (local > spinMs + holdMs && carouselFocusState.currentIndex === targetIndex) {
          carouselFocusState.currentIndex = -1;
          clearFocusedCarouselCard();
        }

        carouselFocusFrame = requestAnimationFrame(tick);
      }

      carouselFocusFrame = requestAnimationFrame(tick);
    }

    function normalizeImageInteractions(value) {
      return (Array.isArray(value) ? value : String(value || '').split(/\n|,/))
        .map(function (item) { return String(item).trim(); })
        .filter(Boolean);
    }

    function ensureVideoSourceEl() {
      if (videoSourceEl && videoSourceEl.parentNode) return videoSourceEl;

      videoSourceEl = document.createElement('video');
      videoSourceEl.id = 'ar-video-source-' + idx;
      videoSourceEl.className = 'ar-video-source';
      videoSourceEl.setAttribute('playsinline', '');
      videoSourceEl.setAttribute('webkit-playsinline', '');
      videoSourceEl.setAttribute('crossorigin', 'anonymous');
      videoSourceEl.preload = 'auto';
      videoSourceEl.muted = true;
      videoSourceEl.loop = true;
      videoSourceEl.autoplay = false;
      document.body.appendChild(videoSourceEl);
      return videoSourceEl;
    }

    function setImageGlowSize(width, height) {
      if (!imageGlowEl) return;
      imageGlowEl.setAttribute('width', width + 0.72);
      imageGlowEl.setAttribute('height', height + 0.72);
    }

    function hideImageShowcase() {
      if (!imageShowcaseEl || cancelled) return;
      imageShowcaseEl.removeAttribute('animation__float');
      imageShowcaseEl.setAttribute('animation__out',
        'property:scale; from:1 1 1; to:0.001 0.001 0.001; dur:220; easing:easeInBack');
      var hideTimer = setTimeout(function () {
        if (cancelled || !imageShowcaseEl) return;
        imageShowcaseEl.setAttribute('visible', false);
        imageShowcaseEl.removeAttribute('animation__out');
        if (darkOverlay) {
          darkOverlay.classList.remove('image-glow-backdrop');
          darkOverlay.classList.add('hidden');
        }
      }, 240);
      sequenceTimers.push(hideTimer);
    }

    function hideVideoShowcase() {
      if (!videoShowcaseEl || cancelled) return;
      videoShowcaseEl.removeAttribute('animation__float');
      videoShowcaseEl.setAttribute('animation__out',
        'property:scale; from:1 1 1; to:0.001 0.001 0.001; dur:220; easing:easeInBack');
      var hideTimer = setTimeout(function () {
        if (cancelled || !videoShowcaseEl) return;
        videoShowcaseEl.setAttribute('visible', false);
        videoShowcaseEl.removeAttribute('animation__out');
        if (videoSourceEl) {
          try {
            videoSourceEl.pause();
            videoSourceEl.currentTime = 0;
          } catch (err) {
            console.warn('[WebAR] Nao foi possivel pausar o video AR:', err);
          }
        }
      }, 240);
      sequenceTimers.push(hideTimer);
    }

    function showImageShowcase(options) {
      options = options || {};
      if (!imageShowcaseEl || !imagePlaneEl || cancelled) return;

      var brandData = brandsData[idx] || {};
      var src = options.image || brandData.image || '';
      if (!src) {
        showErrorMessage('Esta ilha nao tem imagem configurada.');
        return;
      }

      var width = isFinite(Number(options.width)) ? Number(options.width) : Number(brandData.imageWidth || 0.82);
      var height = isFinite(Number(options.height)) ? Number(options.height) : Number(brandData.imageHeight || 0.56);
      var x = isFinite(Number(options.x)) ? Number(options.x) : Number(brandData.imageX || 0);
      var y = isFinite(Number(options.y)) ? Number(options.y) : Number(brandData.imageY || 0.05);
      var z = isFinite(Number(options.z)) ? Number(options.z) : Number(brandData.imageZ || 0.28);
      var bg = options.bg || brandData.imageBg || '#ffffff';
      var interactions = normalizeImageInteractions(options.interactions || brandData.imageInteractions || ['float']);
      var hasInteraction = function (name) { return interactions.indexOf(name) !== -1; };

      function applyImageShowcaseSize(nextWidth, nextHeight) {
        width = nextWidth;
        height = nextHeight;

        if (imageBgEl) {
          imageBgEl.setAttribute('width', width);
          imageBgEl.setAttribute('height', height);
          imageBgEl.setAttribute('color', bg);
          imageBgEl.setAttribute('visible', bg !== 'transparent');
        }

        if (imageGlowEl) {
          setImageGlowSize(width, height);
        }

        imagePlaneEl.setAttribute('width', width);
        imagePlaneEl.setAttribute('height', height);

        if (imageTitleEl) {
          imageTitleEl.setAttribute('hud-label', 'width', Math.max(width, 0.9));
          imageTitleEl.setAttribute('position', '0 ' + (-(height / 2) - 0.15) + ' 0.05');
        }
      }

      imageShowcaseEl.removeAttribute('animation__pop');
      imageShowcaseEl.removeAttribute('animation__float');
      imageShowcaseEl.removeAttribute('animation__out');
      imageShowcaseEl.setAttribute('position', x + ' ' + y + ' ' + z);
      imageShowcaseEl.setAttribute('scale', '0.001 0.001 0.001');
      imageShowcaseEl.setAttribute('visible', true);

      if (imageCardEl) {
        imageCardEl.removeAttribute('animation__pulse');
        imageCardEl.removeAttribute('animation__tilt');
        imageCardEl.setAttribute('rotation', '0 0 0');
        imageCardEl.setAttribute('scale', '1 1 1');
      }
      if (imageSpinEl) {
        imageSpinEl.removeAttribute('continuous-spin');
        imageSpinEl.setAttribute('rotation', '0 0 0');
      }
      applyImageShowcaseSize(width, height);
      if (imageGlowEl) {
        imageGlowEl.setAttribute('visible', hasInteraction('glow'));
        imageGlowEl.removeAttribute('animation__glow');
        if (hasInteraction('glow')) {
          if (darkOverlay) {
            darkOverlay.classList.remove('word-backdrop');
            darkOverlay.classList.remove('word-firefly-backdrop');
            darkOverlay.classList.add('image-glow-backdrop');
            darkOverlay.classList.remove('hidden');
          }
          imageGlowEl.setAttribute('material', {
            shader: 'flat',
            src: getImageGlowTextureUrl(),
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            side: 'double'
          });
          imageGlowEl.setAttribute('animation__glow',
            'property:material.opacity; from:0.55; to:0.95; dir:alternate; dur:1350; loop:true; easing:easeInOutSine');
        } else if (darkOverlay) {
          darkOverlay.classList.remove('image-glow-backdrop');
        }
      }

      imagePlaneEl.setAttribute('material', {
        shader: 'flat',
        src: withAssetCacheBuster(src),
        transparent: true,
        side: 'front'
      });

      if (imageTitleEl) {
        var title = options.title || brandData.imageTitle || '';
        imageTitleEl.setAttribute('hud-label', 'text', title);
        imageTitleEl.setAttribute('hud-label', 'bg', options.titleBg || brandData.imageTitleBg || 'rgba(177,18,27,0.72)');
        imageTitleEl.setAttribute('hud-label', 'color', options.titleColor || brandData.imageTitleColor || '#ffffff');
        imageTitleEl.setAttribute('hud-label', 'font', isFinite(Number(options.titleFont)) ? Number(options.titleFont) : Number(brandData.imageTitleFont || 38));
        imageTitleEl.setAttribute('visible', !!title);
      }

      getImageNaturalAspect(src, function (aspect) {
        if (cancelled || !imageShowcaseEl || imageShowcaseEl.getAttribute('visible') === false) return;
        var naturalSize = sizeFromNaturalAspect(aspect, width, height);
        applyImageShowcaseSize(naturalSize.width, naturalSize.height);
      });

      imageShowcaseEl.setAttribute('animation__pop',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:480; easing:easeOutBack');

      if (hasInteraction('float')) {
        var floatAmount = isFinite(Number(options.floatAmount)) ? Number(options.floatAmount) : Number(brandData.imageFloatAmount || 0.06);
        imageShowcaseEl.setAttribute('animation__float',
          'property:position; from:' + x + ' ' + y + ' ' + z + '; to:' + x + ' ' + (y + floatAmount) + ' ' + z +
          '; dir:alternate; dur:1900; loop:true; easing:easeInOutSine');
      }
      if (hasInteraction('spin') && imageSpinEl) {
        var spinSpeed = isFinite(Number(options.spinSpeed)) ? Number(options.spinSpeed) : Number(brandData.imageSpinSpeed || 42);
        imageSpinEl.setAttribute('continuous-spin', 'axis:z; speed:' + spinSpeed);
      }
      if (hasInteraction('pulse') && imageCardEl) {
        imageCardEl.setAttribute('animation__pulse',
          'property:scale; from:1 1 1; to:1.055 1.055 1.055; dir:alternate; dur:1300; loop:true; easing:easeInOutSine');
      }
      if (hasInteraction('tilt') && imageCardEl) {
        imageCardEl.setAttribute('animation__tilt',
          'property:rotation; from:0 -8 0; to:0 8 0; dir:alternate; dur:1600; loop:true; easing:easeInOutSine');
      }
    }

    function showVideoShowcase(options) {
      options = options || {};
      if (!videoShowcaseEl || !videoPlaneEl || cancelled) return;

      var brandData = brandsData[idx] || {};
      var src = options.video || brandData.video || '';
      if (!src) {
        showErrorMessage('Esta ilha nao tem video configurado.');
        return;
      }

      var width = isFinite(Number(options.width)) ? Number(options.width) : Number(brandData.videoWidth || 0.82);
      var height = isFinite(Number(options.height)) ? Number(options.height) : Number(brandData.videoHeight || 0.56);
      var x = isFinite(Number(options.x)) ? Number(options.x) : Number(brandData.videoX || 0);
      var y = isFinite(Number(options.y)) ? Number(options.y) : Number(brandData.videoY || 0.05);
      var z = isFinite(Number(options.z)) ? Number(options.z) : Number(brandData.videoZ || 0.28);
      var bg = options.bg || brandData.videoBg || '#000000';
      var floatAmount = isFinite(Number(options.floatAmount)) ? Number(options.floatAmount) : Number(brandData.videoFloatAmount || 0.04);
      var previewOnly = options.previewOnly === true;
      var sourceEl = ensureVideoSourceEl();
      var sourceId = '#' + sourceEl.id;
      var resolvedSrc = withAssetCacheBuster(src);

      function applyVideoShowcaseSize(nextWidth, nextHeight) {
        width = nextWidth;
        height = nextHeight;

        if (videoBgEl) {
          videoBgEl.setAttribute('width', width);
          videoBgEl.setAttribute('height', height);
          videoBgEl.setAttribute('color', bg);
          videoBgEl.setAttribute('visible', bg !== 'transparent');
        }

        videoPlaneEl.setAttribute('width', width);
        videoPlaneEl.setAttribute('height', height);

        if (videoTitleEl) {
          videoTitleEl.setAttribute('hud-label', 'width', Math.max(width, 0.9));
          videoTitleEl.setAttribute('position', '0 ' + (-(height / 2) - 0.15) + ' 0.05');
        }
      }

      var wasVisible = videoShowcaseEl.getAttribute('visible') === true || videoShowcaseEl.getAttribute('visible') === 'true';
      videoShowcaseEl.removeAttribute('animation__pop');
      videoShowcaseEl.removeAttribute('animation__float');
      videoShowcaseEl.removeAttribute('animation__out');
      videoShowcaseEl.setAttribute('position', x + ' ' + y + ' ' + z);
      videoShowcaseEl.setAttribute('scale', wasVisible ? '1 1 1' : '0.001 0.001 0.001');
      videoShowcaseEl.setAttribute('visible', true);
      applyVideoShowcaseSize(width, height);

      if (videoTitleEl) {
        var title = options.title || brandData.videoTitle || '';
        videoTitleEl.setAttribute('hud-label', 'text', title);
        videoTitleEl.setAttribute('hud-label', 'bg', options.titleBg || brandData.videoTitleBg || 'rgba(177,18,27,0.72)');
        videoTitleEl.setAttribute('hud-label', 'color', options.titleColor || brandData.videoTitleColor || '#ffffff');
        videoTitleEl.setAttribute('hud-label', 'font', isFinite(Number(options.titleFont)) ? Number(options.titleFont) : Number(brandData.videoTitleFont || 38));
        videoTitleEl.setAttribute('visible', !!title);
      }

      sourceEl.pause();
      sourceEl.muted = options.muted !== false;
      sourceEl.loop = options.loop !== false;
      sourceEl.playsInline = true;
      sourceEl.src = resolvedSrc;
      sourceEl.load();

      videoPlaneEl.setAttribute('material', {
        shader: 'flat',
        src: sourceId,
        transparent: true,
        side: 'front'
      });

      getVideoNaturalAspect(src, function (aspect) {
        if (cancelled || !videoShowcaseEl || videoShowcaseEl.getAttribute('visible') === false) return;
        var naturalSize = sizeFromNaturalAspect(aspect, width, height);
        applyVideoShowcaseSize(naturalSize.width, naturalSize.height);
      });

      var tryPlay = function () {
        if (cancelled || !videoShowcaseEl || videoShowcaseEl.getAttribute('visible') === false) return;
        if (previewOnly) {
          try {
            sourceEl.pause();
            sourceEl.currentTime = 0;
          } catch (err) {
            console.warn('[WebAR] Nao foi possivel preparar preview do video:', err);
          }
          return;
        }
        var playPromise = sourceEl.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function (err) {
            console.warn('[WebAR] Autoplay do video AR bloqueado:', err);
          });
        }
      };
      sourceEl.onloadeddata = tryPlay;
      sourceEl.oncanplay = tryPlay;

      if (!wasVisible) {
        videoShowcaseEl.setAttribute('animation__pop',
          'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:480; easing:easeOutBack');
      }
      videoShowcaseEl.setAttribute('animation__float',
        'property:position; from:' + x + ' ' + y + ' ' + z + '; to:' + x + ' ' + (y + floatAmount) + ' ' + z +
        '; dir:alternate; dur:1900; loop:true; easing:easeInOutSine');

      if (previewOnly) {
        var previewTimer = setTimeout(function () {
          if (cancelled || !sourceEl || !videoShowcaseEl || videoShowcaseEl.getAttribute('visible') === false) return;
          try {
            sourceEl.pause();
            sourceEl.currentTime = 0;
          } catch (err) {
            console.warn('[WebAR] Nao foi possivel pausar preview do video:', err);
          }
        }, 180);
        sequenceTimers.push(previewTimer);
      }
    }

    function showCarousel3D(options) {
      options = options || {};
      if (!carouselShowcaseEl || !carouselStageEl || cancelled) return;

      var brandData = brandsData[idx] || {};
      var items = normalizeCarouselItems(options.items || brandData.collection || []);
      if (!items.length) {
        showErrorMessage('Esta ilha nao tem itens configurados para o carrossel 3D.');
        return;
      }

      while (carouselStageEl.firstChild) {
        carouselStageEl.removeChild(carouselStageEl.firstChild);
      }
      stopCarouselFocus();
      stopCarouselStack();
      carouselStageEl.removeAttribute('continuous-spin');
      carouselStageEl.object3D.rotation.set(0, 0, 0);

      items.forEach(function (item, index) {
        carouselStageEl.appendChild(createCarouselCard(item, index, items.length, options));
      });

      if ((options.animation || brandData.carouselAnimation || 'orbit') === 'stack') {
        startCarouselStack(items, options);
      } else if (isOptionEnabled(options.focusAnimation || brandData.carouselFocusAnimation)) {
        carouselStageEl.removeAttribute('continuous-spin');
        var focusStartTimer = setTimeout(function () {
          startCarouselFocus(items, options);
        }, Math.min(900, 360 + items.length * 90));
        sequenceTimers.push(focusStartTimer);
      } else {
        carouselStageEl.setAttribute('continuous-spin', 'axis:y; speed:' + Number(options.speed || 18));
      }

      if (carouselTitleEl) {
        var title = options.title || brandData.carouselTitle || '';
        carouselTitleEl.setAttribute('hud-label', 'text', title);
        carouselTitleEl.setAttribute('hud-label', 'bg', options.titleBg || brandData.carouselTitleBg || 'rgba(177,18,27,0.72)');
        carouselTitleEl.setAttribute('hud-label', 'color', options.titleColor || brandData.carouselTitleColor || '#ffffff');
        carouselTitleEl.setAttribute('hud-label', 'font', isFinite(Number(options.titleFont)) ? Number(options.titleFont) : Number(brandData.carouselTitleFont || 50));
        carouselTitleEl.setAttribute('visible', !!title);
      }

      carouselShowcaseEl.setAttribute('position', '0 ' + Number(options.y || 0.05) + ' 0.28');
      carouselShowcaseEl.setAttribute('visible', true);
      carouselShowcaseEl.setAttribute('animation__pop',
        'property:scale; from:0.001 0.001 0.001; to:1 1 1; dur:520; easing:easeOutBack');
      carouselShowcaseEl.setAttribute('animation__float',
        'property:position; from:0 ' + Number(options.y || 0.05) + ' 0.28; to:0 ' +
        (Number(options.y || 0.05) + 0.055) + ' 0.28; dir:alternate; dur:2100; loop:true; easing:easeInOutSine');
    }

    function showIslandModel(options) {
      options = options || {};
      if (!modelShowcaseEl || !modelEl) return;
      if (options.model) modelEl.setAttribute('src', options.model);
      if (options.modelScale) modelEl.setAttribute('scale', options.modelScale);
      if (options.spinSpeed) modelEl.setAttribute('continuous-spin', 'axis:y; speed:' + options.spinSpeed);
      if (darkOverlay) darkOverlay.classList.remove('hidden');
      modelShowcaseEl.setAttribute('visible', true);
      if (modelLabelEl) {
        modelLabelEl.setAttribute('value', (brandsData[idx] && brandsData[idx].name) || 'Modelo 3D');
      }
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
    function normalizeActionList(actions) {
      if (Array.isArray(actions)) {
        return actions.map(function (item) { return String(item).trim(); }).filter(Boolean);
      }
      return String(actions || '')
        .split(/\n|,/)
        .map(function (item) { return item.trim(); })
        .filter(Boolean);
    }

    function getLineForAction(actionName) {
      return targetEl.querySelector('.ar-grow-line[data-action-slot="' + actionName + '"]');
    }

    function getButtonForAction(actionName) {
      return targetEl.querySelector('.ar-btn[data-action-slot="' + actionName + '"]');
    }

    function getLabelForButton(btnEl) {
      return btnEl ? btnEl.querySelector('.ar-label') : null;
    }

    function playActions(actions, ctaText, next) {
      actions = normalizeActionList(actions);
      if (!actions.length) {
        next();
        return;
      }

      if (centerEl) centerEl.setAttribute('visible', true);
      showFinalStage(ctaText);

      var actionIndex = 0;
      function playNextAction() {
        if (cancelled) return;
        if (actionIndex >= actions.length) {
          next();
          return;
        }

        var actionName = actions[actionIndex++];
        growLine(getLineForAction(actionName), function () {
          var popTimer = setTimeout(function () {
            if (cancelled) return;
            var btnEl = getButtonForAction(actionName);
            popBtn(btnEl);
            flashLabel(getLabelForButton(btnEl));
            var nextTimer = setTimeout(playNextAction, 260);
            sequenceTimers.push(nextTimer);
          }, 50);
          sequenceTimers.push(popTimer);
        });
      }

      playNextAction();
    }

    function playConfiguredSteps(configuredSteps) {
      runSeq(configuredSteps.map(function (step) {
        return {
          delay: Number(step.delay || 0),
          fn: function (next) {
            var type = step.type || 'scanner';
            var actionName = getFeatureAction(type);

            function runStep() {
            showStepTitle(step);

            if (type === 'logoText') {
              showLogoText(step);
              var logoTextTimer = setTimeout(function () {
                hideStepTitle();
                hideLogoText();
                var logoTextNextTimer = setTimeout(next, 280);
                sequenceTimers.push(logoTextNextTimer);
              }, Number(step.duration || 1600));
              sequenceTimers.push(logoTextTimer);
              return;
            }

            if (type === 'scanner') {
              setIntroText('.ar-intro-top', step.introTop || '');
              setIntroText('.ar-intro-bottom', step.introBottom || '');
              if (centerEl) centerEl.setAttribute('visible', true);
              showIntro(step);
              var introTimer = setTimeout(function () {
                hideStepTitle();
                hideIntro();
                next();
              }, Number(step.duration || 4200));
              sequenceTimers.push(introTimer);
              return;
            }

            if (type === 'words') {
              playWordSequence(function () {
                hideStepTitle();
                next();
              }, step);
              return;
            }

            if (type === 'phrase') {
              typePhrase(step);
              var phraseTimer = setTimeout(function () {
                hideStepTitle();
                next();
              }, Number(step.duration || 1800));
              sequenceTimers.push(phraseTimer);
              return;
            }

            if (type === 'model3d') {
              if (centerEl) centerEl.setAttribute('visible', true);
              if (scanEl) scanEl.setAttribute('visible', true);
              var scanTimer = setTimeout(function () {
                if (scanEl) scanEl.setAttribute('visible', false);
                showIslandModel(step);
                if (Number(step.duration || 0) > 0) {
                  var modelTimer = setTimeout(function () {
                    hideStepTitle();
                    next();
                  }, Number(step.duration || 0));
                  sequenceTimers.push(modelTimer);
                } else {
                  next();
                }
              }, 450);
              sequenceTimers.push(scanTimer);
              return;
            }

            if (type === 'carousel3d') {
              if (centerEl) centerEl.setAttribute('visible', true);
              showCarousel3D(step);
              if (Number(step.duration || 0) > 0) {
                var carouselTimer = setTimeout(function () {
                  hideStepTitle();
                  next();
                }, Number(step.duration || 0));
                sequenceTimers.push(carouselTimer);
              } else {
                next();
              }
              return;
            }

            if (type === 'image') {
              if (centerEl) centerEl.setAttribute('visible', true);
              showImageShowcase(step);
              if (Number(step.duration || 0) > 0) {
                var imageTimer = setTimeout(function () {
                  hideStepTitle();
                  hideImageShowcase();
                  var imageNextTimer = setTimeout(next, 260);
                  sequenceTimers.push(imageNextTimer);
                }, Number(step.duration || 0));
                sequenceTimers.push(imageTimer);
              } else {
                next();
              }
              return;
            }

            if (type === 'videoPlayer') {
              if (centerEl) centerEl.setAttribute('visible', true);
              showVideoShowcase(step);
              if (Number(step.duration || 0) > 0) {
                var videoTimer = setTimeout(function () {
                  hideStepTitle();
                  hideVideoShowcase();
                  var videoNextTimer = setTimeout(next, 260);
                  sequenceTimers.push(videoNextTimer);
                }, Number(step.duration || 0));
                sequenceTimers.push(videoTimer);
              } else {
                next();
              }
              return;
            }

            if (type === 'actions') {
              playActions(step.actions || [], step.cta || getFeatureCta(feature), function () {
                if (Number(step.duration || 0) > 0) {
                  var actionsTimer = setTimeout(function () {
                    hideStepTitle();
                    next();
                  }, Number(step.duration || 0));
                  sequenceTimers.push(actionsTimer);
                } else {
                  next();
                }
              });
              return;
            }

            if (actionName) {
              playActions([actionName], step.cta || getFeatureCta(type), function () {
                if (Number(step.duration || 0) > 0) {
                  var actionTimer = setTimeout(function () {
                    hideStepTitle();
                    next();
                  }, Number(step.duration || 0));
                  sequenceTimers.push(actionTimer);
                } else {
                  next();
                }
              });
              return;
            }

            next();
            }

            if (isOptionEnabled(step.scratchEffect)) {
              if (type === 'videoPlayer') {
                showVideoShowcase(Object.assign({}, step, { previewOnly: true }));
              }
              startScratchReveal(step, function () {
                if (cancelled) return;
                runStep();
              });
              return;
            }

            runStep();
          }
        };
      }));
    }

    function playSequence() {
      var configuredSteps = getIslandSteps(brandsData[idx] || {});
      if (configuredSteps.length) {
        playConfiguredSteps(configuredSteps);
        return;
      }

      if (feature === 'model3d') {
        runSeq([
          { delay: 0, fn: function (next) {
            if (centerEl) centerEl.setAttribute('visible', true);
            if (scanEl) scanEl.setAttribute('visible', true);
            next();
          }},
          { delay: 450, fn: function (next) {
            if (scanEl) scanEl.setAttribute('visible', false);
            showIslandModel();
            next();
          }}
        ]);
        return;
      }

      if (feature === 'videoPlayer') {
        runSeq([
          { delay: 0, fn: function (next) {
            if (centerEl) centerEl.setAttribute('visible', true);
            showVideoShowcase((brandsData[idx] && brandsData[idx].steps && brandsData[idx].steps[0]) || brandsData[idx] || {});
            next();
          }}
        ]);
        return;
      }

      if (feature === 'menu') {
        runSeq([
          { delay: 0, fn: function (next) {
            if (brandEl)  brandEl.setAttribute('visible', false);
            if (centerEl) centerEl.setAttribute('visible', true);
            showIntro();
            next();
          }},
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
          { delay: 260, fn: function (next) { growLine(growLines[1], next); } },
          { delay: 50,  fn: function (next) { popBtn(buttons[1]); flashLabel(labels[1]); next(); } },
          { delay: 260, fn: function (next) { growLine(growLines[2], next); } },
          { delay: 50,  fn: function (next) { popBtn(buttons[2]); flashLabel(labels[2]); next(); } }
        ]);
        return;
      }

      if (feature !== 'info') {
        runSeq([
          { delay: 0, fn: function (next) {
            if (centerEl) centerEl.setAttribute('visible', true);
            showFinalStage();
            next();
          }},
          { delay: 120, fn: function (next) { growLine(growLines[0], next); } },
          { delay: 50, fn: function (next) { popBtn(buttons[0]); flashLabel(labels[0]); next(); } }
        ]);
        return;
      }

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
          typePhrase();
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
  var el = document.getElementById('ar-welcome');
  if (!el) return;

  el.classList.remove('hidden');
}

function nextWelcomeStep() {
  dismissWelcome();
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
  if (!brand) return;
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
  var collection = getBrandCollection(currentBrandIdx);
  var total = collection.length;
  if (!total) return;
  currentImageIdx = (currentImageIdx + 1) % total;
  updateCollectionCarousel();
}

function prevCollectionImage() {
  var collection = getBrandCollection(currentBrandIdx);
  var total = collection.length;
  if (!total) return;
  currentImageIdx = (currentImageIdx - 1 + total) % total;
  updateCollectionCarousel();
}

function getBrandCollection(brandIndex) {
  var brand = brandsData[brandIndex];
  return brand && Array.isArray(brand.collection) ? brand.collection : [];
}

function getCollectionItem(brandIndex, itemIndex) {
  var rawItem = getBrandCollection(brandIndex)[itemIndex] || null;
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
  var collection = getBrandCollection(currentBrandIdx);

  if (!brand || !collection.length) {
    if (nameEl) nameEl.textContent = 'Nenhum item cadastrado';
    imgEl.removeAttribute('src');
    imgEl.style.display = 'none';
    imgEl.style.opacity = '1';
    empty.innerHTML = 'Nenhum item cadastrado nesta ilha.<br><code>Abra o configurador e salve a galeria novamente.</code>';
    empty.classList.remove('hidden');
    document.getElementById('carousel-dots').innerHTML = '';
    return;
  }

  if (currentImageIdx >= collection.length) currentImageIdx = 0;

  var item   = getCollectionItem(currentBrandIdx, currentImageIdx);
  var src    = item && item.image ? item.image : '';

  if (nameEl) nameEl.textContent = item && (item.title || item.name) ? (item.title || item.name) : 'Item da coleção';
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
    empty.innerHTML = 'Nao consegui carregar a imagem:<br><code>' + escapeHtml(src || 'caminho vazio') + '</code>';
    console.error('[WebAR] Imagem da colecao nao carregou:', src, item);
  };

  if (!src) {
    imgEl.onerror();
  } else {
    imgEl.src = withAssetCacheBuster(src);
  }

  // Dots
  var dotsEl = document.getElementById('carousel-dots');
  dotsEl.innerHTML = '';
  collection.forEach(function (_, i) {
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
  if (!brand.video) {
    showErrorMessage('Esta ilha nao tem video configurado.');
    return;
  }

  isModalOpen = true;

  document.getElementById('modal-title').textContent = brand.name;

  var video = document.getElementById('modal-video');
  video.onerror = function () {
    console.error('[WebAR] Video nao carregou:', brand.video);
  };
  video.src = withAssetCacheBuster(brand.video);
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
