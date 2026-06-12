'use strict';

var configState = {
  points: cloneConfig((window.TRAIL_CONFIG && window.TRAIL_CONFIG.brandsData) || []),
  products: cloneConfig((window.TRAIL_CONFIG && window.TRAIL_CONFIG.productTargetsData) || [])
};

var selectedPanelName = '';
var selectedPointIndex = null;
var projectDirHandle = null;

var FEATURE_OPTIONS = [
  { value: 'menu', label: 'Menu completo antigo' },
  { value: 'custom', label: 'Sequencia personalizada' },
  { value: 'info', label: 'Informacao / frases e palavras' },
  { value: 'video', label: 'Video' },
  { value: 'site', label: 'Link externo' },
  { value: 'collection', label: 'Galeria de imagens' },
  { value: 'model3d', label: 'Modelo 3D direto' }
];

var STEP_TYPE_OPTIONS = [
  { value: 'scanner', label: 'Scanner + frases de entrada' },
  { value: 'phrase', label: 'Frase digitada' },
  { value: 'words', label: 'Palavras futuristas' },
  { value: 'actions', label: 'Icones Galeria + Video + Site' },
  { value: 'collection', label: 'Icone Galeria' },
  { value: 'video', label: 'Icone Video' },
  { value: 'site', label: 'Icone Site' },
  { value: 'model3d', label: 'Modelo 3D' }
];

var WORD_ANIMATION_OPTIONS = [
  { value: 'vortex', label: 'Vortex + orbita' },
  { value: 'orbit', label: 'Orbita direta' }
];

window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('pick-folder-btn').addEventListener('click', pickProjectFolder);
  document.getElementById('save-project-btn').addEventListener('click', saveProjectConfig);
  document.getElementById('download-config-btn').addEventListener('click', downloadConfig);
  document.getElementById('add-panel-btn').addEventListener('click', addPanel);
  document.getElementById('add-island-btn').addEventListener('click', addIsland);

  if (!window.showDirectoryPicker) {
    setStatus('Seu navegador nao salva direto na pasta. Use Chrome/Edge em localhost ou use "Baixar config".', 'error');
  }

  selectedPanelName = getPanels()[0] || '';
  if (selectedPanelName) {
    var firstPoint = findFirstPointIndex(selectedPanelName);
    selectedPointIndex = firstPoint;
  }

  renderAll();
});

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value || []));
}

function getPanels() {
  var seen = {};
  return configState.points
    .map(function (point) { return point.panel || 'Painel 01'; })
    .filter(function (panel) {
      if (seen[panel]) return false;
      seen[panel] = true;
      return true;
    });
}

function findFirstPointIndex(panelName) {
  for (var i = 0; i < configState.points.length; i++) {
    if ((configState.points[i].panel || 'Painel 01') === panelName) return i;
  }
  return null;
}

function getPanelPoints(panelName) {
  return configState.points
    .map(function (point, index) { return { point: point, index: index }; })
    .filter(function (entry) { return (entry.point.panel || 'Painel 01') === panelName; })
    .sort(function (a, b) {
      return Number(a.point.trailStep || 0) - Number(b.point.trailStep || 0);
    });
}

function renderAll() {
  renderPanels();
  renderIslands();
  renderEditor();
}

function renderPanels() {
  var list = document.getElementById('panels-list');
  var panels = getPanels();

  if (!panels.length) {
    list.innerHTML = '<p class="note">Nenhum painel criado.</p>';
    return;
  }

  list.innerHTML = '';
  panels.forEach(function (panelName) {
    var count = getPanelPoints(panelName).length;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-card' + (panelName === selectedPanelName ? ' active' : '');
    btn.innerHTML = '<strong>' + escapeHtml(panelName) + '</strong><small>' + count + ' ilha(s)</small>';
    btn.addEventListener('click', function () {
      selectedPanelName = panelName;
      selectedPointIndex = findFirstPointIndex(panelName);
      renderAll();
    });
    list.appendChild(btn);
  });
}

function renderIslands() {
  var title = document.getElementById('selected-panel-title');
  var list = document.getElementById('islands-list');
  title.textContent = selectedPanelName || 'Selecione um painel';

  if (!selectedPanelName) {
    list.innerHTML = '<p class="note">Crie ou selecione um painel.</p>';
    return;
  }

  var entries = getPanelPoints(selectedPanelName);
  if (!entries.length) {
    list.innerHTML = '<p class="note">Este painel ainda nao tem ilhas.</p>';
    return;
  }

  list.innerHTML = '';
  entries.forEach(function (entry) {
    var point = entry.point;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'island-card' + (entry.index === selectedPointIndex ? ' active' : '');
    btn.innerHTML =
      '<strong>Ilha ' + escapeHtml(String(point.trailStep || '?')) + ' - ' + escapeHtml(point.name || 'Sem nome') + '</strong>' +
      '<small>' + escapeHtml(featureLabel(getPointFeature(point))) + ' | targetIndex ' + escapeHtml(String(point.targetIndex)) + '</small>';
    btn.addEventListener('click', function () {
      selectedPointIndex = entry.index;
      renderAll();
    });
    list.appendChild(btn);
  });
}

function renderEditor() {
  var editor = document.getElementById('point-editor');
  if (selectedPointIndex === null || !configState.points[selectedPointIndex]) {
    editor.innerHTML =
      '<div class="empty-state">' +
        '<h2>Nenhuma ilha selecionada</h2>' +
        '<p>Escolha um painel e uma ilha para editar o conteudo exibido no scan.</p>' +
      '</div>';
    return;
  }

  var point = configState.points[selectedPointIndex];
  point.collection = Array.isArray(point.collection) ? point.collection : [];
  point.feature = getPointFeature(point);

  editor.innerHTML =
    '<h2>' + escapeHtml(point.name || 'Ilha sem nome') + '</h2>' +
    '<div class="editor-grid">' +
      selectHtml('feature', 'Funcionalidade da ilha', point.feature, FEATURE_OPTIONS) +
      fieldHtml('panel', 'Painel', point.panel || '', 'text') +
      fieldHtml('trailStep', 'Numero da ilha', point.trailStep || '', 'number') +
      fieldHtml('targetIndex', 'Target index no .mind', point.targetIndex || 0, 'number') +
      fieldHtml('name', 'Nome exibido', point.name || '', 'text') +
      fieldHtml('targetImage', 'Imagem target salva', point.targetImage || '', 'text') +
      uploadHtml('target-file', 'Enviar imagem target desta ilha', point._targetFile) +
    '</div>' +
    featureEditorHtml(point) +
    '<div class="editor-actions">' +
      '<button id="duplicate-island-btn" type="button" class="secondary">Duplicar ilha</button>' +
      '<button id="remove-island-btn" type="button" class="danger">Remover ilha</button>' +
    '</div>';

  bindEditorEvents(point);
}

function fieldHtml(field, label, value, type) {
  return (
    '<div class="field">' +
      '<label for="field-' + field + '">' + escapeHtml(label) + '</label>' +
      '<input id="field-' + field + '" type="' + type + '" data-point-field="' + field + '" value="' + escapeHtml(String(value)) + '" />' +
    '</div>'
  );
}

function textareaHtml(field, label, value) {
  return (
    '<div class="field full">' +
      '<label for="field-' + field + '">' + escapeHtml(label) + '</label>' +
      '<textarea id="field-' + field + '" data-point-field="' + field + '">' + escapeHtml(String(value)) + '</textarea>' +
    '</div>'
  );
}

function selectHtml(field, label, value, options) {
  return (
    '<div class="field full feature-field">' +
      '<label for="field-' + field + '">' + escapeHtml(label) + '</label>' +
      '<select id="field-' + field + '" data-point-field="' + field + '">' +
        options.map(function (option) {
          return '<option value="' + escapeHtml(option.value) + '"' +
            (option.value === value ? ' selected' : '') + '>' +
            escapeHtml(option.label) + '</option>';
        }).join('') +
      '</select>' +
      '<span class="upload-hint">Use Sequencia personalizada para combinar varios blocos na mesma ilha.</span>' +
    '</div>'
  );
}

function getPointFeature(point) {
  return (point && (point.feature || point.type)) || 'info';
}

function featureLabel(feature) {
  var found = FEATURE_OPTIONS.filter(function (option) { return option.value === feature; })[0];
  return found ? found.label : 'Informacao / frases e palavras';
}

function featureEditorHtml(point) {
  var feature = getPointFeature(point);

  if (feature === 'custom') {
    point.steps = Array.isArray(point.steps) && point.steps.length ? point.steps : legacyStepsFromPoint(point);
    point.steps = normalizeStepsForEditor(point.steps);
    point.collection = Array.isArray(point.collection) ? point.collection : [];

    return (
      '<section class="feature-card">' +
        '<h2>Sequencia personalizada</h2>' +
        '<p class="note">Monte a ordem dos blocos que aparecem depois do scan. Ordem menor aparece primeiro; duracao e atraso sao em milissegundos.</p>' +
        '<div id="sequence-list" class="sequence-list">' + sequenceHtml(point.steps) + '</div>' +
        '<div class="editor-actions">' +
          '<button id="add-sequence-step-btn" type="button">Adicionar funcionalidade</button>' +
        '</div>' +
      '</section>' +
      '<section class="feature-card">' +
        '<h2>Conteudos usados pelos blocos</h2>' +
        '<div class="editor-grid">' +
          fieldHtml('video', 'Caminho do video', point.video || '', 'text') +
          uploadHtml('video-file', 'Enviar video desta ilha', point._videoFile) +
          fieldHtml('site', 'Link do site', point.site || '', 'text') +
          fieldHtml('model', 'Caminho do GLB / GLTF', point.model || '', 'text') +
          uploadHtml('model-file', 'Enviar GLB / GLTF desta ilha', point._modelFile) +
          fieldHtml('modelScale', 'Escala padrao do modelo', point.modelScale || '0.55 0.55 0.55', 'text') +
          fieldHtml('spinSpeed', 'Velocidade padrao de giro', point.spinSpeed || 45, 'number') +
        '</div>' +
        '<h2>Galeria usada pelos blocos</h2>' +
        '<div id="collection-list" class="collection-list">' + collectionHtml(point.collection) + '</div>' +
        '<div class="editor-actions">' +
          '<button id="add-collection-item-btn" type="button">Adicionar item</button>' +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'video') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Video</h2>' +
        '<div class="editor-grid">' +
          fieldHtml('video', 'Caminho do video', point.video || '', 'text') +
          uploadHtml('video-file', 'Enviar video desta ilha', point._videoFile) +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'site') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Link externo</h2>' +
        '<div class="editor-grid">' +
          fieldHtml('site', 'Link do site', point.site || '', 'text') +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'collection') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Galeria de imagens</h2>' +
        '<p class="note">Esta ilha abre somente a galeria. Modelos 3D ficam em ilhas do tipo Modelo 3D direto.</p>' +
        '<div id="collection-list" class="collection-list">' + collectionHtml(point.collection) + '</div>' +
        '<div class="editor-actions">' +
          '<button id="add-collection-item-btn" type="button">Adicionar item</button>' +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'model3d') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Modelo 3D direto</h2>' +
        '<div class="editor-grid">' +
          fieldHtml('model', 'Caminho do GLB / GLTF', point.model || '', 'text') +
          uploadHtml('model-file', 'Enviar GLB / GLTF desta ilha', point._modelFile) +
          fieldHtml('spinSpeed', 'Velocidade de giro', point.spinSpeed || 45, 'number') +
          fieldHtml('modelScale', 'Escala do modelo', point.modelScale || '0.55 0.55 0.55', 'text') +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'menu') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Menu completo</h2>' +
        '<p class="note">Esta opcao restaura a etapa antiga: frases, palavras e os tres icones Galeria, Video e Site.</p>' +
        '<div class="editor-grid">' +
          textareaHtml('phrase', 'Frase principal', point.phrase || '') +
          textareaHtml('introTop', 'Frase de cima', point.introTop || '') +
          textareaHtml('introBottom', 'Frase de baixo', point.introBottom || '') +
          textareaHtml('keywords', 'Palavras futuristas, uma por linha', (point.keywords || []).join('\n')) +
          fieldHtml('video', 'Caminho do video', point.video || '', 'text') +
          uploadHtml('video-file', 'Enviar video desta ilha', point._videoFile) +
          fieldHtml('site', 'Link do site', point.site || '', 'text') +
        '</div>' +
        '<h2>Galeria do menu</h2>' +
        '<div id="collection-list" class="collection-list">' + collectionHtml(point.collection) + '</div>' +
        '<div class="editor-actions">' +
          '<button id="add-collection-item-btn" type="button">Adicionar item</button>' +
        '</div>' +
      '</section>'
    );
  }

  return (
    '<section class="feature-card">' +
      '<h2>Funcionalidade: Informacao</h2>' +
      '<div class="editor-grid">' +
        textareaHtml('phrase', 'Frase principal', point.phrase || '') +
        textareaHtml('introTop', 'Frase de cima', point.introTop || '') +
        textareaHtml('introBottom', 'Frase de baixo', point.introBottom || '') +
        textareaHtml('keywords', 'Palavras futuristas, uma por linha', (point.keywords || []).join('\n')) +
      '</div>' +
    '</section>'
  );
}

function uploadHtml(id, label, file) {
  return (
    '<div class="field full">' +
      '<label for="' + id + '">' + escapeHtml(label) + '</label>' +
      '<div class="upload-row">' +
        '<input id="' + id + '" type="file" />' +
        '<span class="upload-hint">' + (file ? 'Arquivo pendente: ' + escapeHtml(file.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
      '</div>' +
    '</div>'
  );
}

function collectionHtml(collection) {
  if (!collection.length) {
    return '<p class="note">Nenhum item na colecao desta ilha.</p>';
  }

  return collection.map(function (item, index) {
    return (
      '<div class="collection-item" data-item-index="' + index + '">' +
        '<h3>Item ' + (index + 1) + '</h3>' +
        '<div class="field full">' +
          '<label>Nome do item</label>' +
          '<input data-item-field="name" value="' + escapeHtml(item.name || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Caminho da imagem</label>' +
          '<input data-item-field="image" value="' + escapeHtml(item.image || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Enviar imagem do item</label>' +
          '<input type="file" accept="image/*" data-item-file="image" />' +
          '<span class="upload-hint">' + (item._imageFile ? 'Arquivo pendente: ' + escapeHtml(item._imageFile.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
        '</div>' +
        '<div class="field full">' +
          '<button type="button" class="danger" data-remove-item="' + index + '">Remover item</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function sequenceHtml(steps) {
  if (!steps.length) {
    return '<p class="note">Nenhum bloco na sequencia.</p>';
  }

  return normalizeStepsForEditor(steps).map(function (step, index) {
    return stepEditorHtml(step, index);
  }).join('');
}

function stepEditorHtml(step, index) {
  var type = step.type || 'scanner';
  var details = '';

  if (type === 'scanner') {
    details =
      stepTextareaHtml(index, 'introTop', 'Frase de cima', step.introTop || '') +
      stepTextareaHtml(index, 'introBottom', 'Frase de baixo', step.introBottom || '') +
      stepFieldHtml(index, 'topY', 'Posicao Y da frase de cima', valueOrDefault(step.topY, 0.58), 'number', '0.01') +
      stepFieldHtml(index, 'bottomY', 'Posicao Y da frase de baixo', valueOrDefault(step.bottomY, -0.58), 'number', '0.01');
  } else if (type === 'phrase') {
    details =
      stepTextareaHtml(index, 'text', 'Texto da frase', step.text || '') +
      stepFieldHtml(index, 'x', 'Posicao X', valueOrDefault(step.x, 0), 'number', '0.01') +
      stepFieldHtml(index, 'y', 'Posicao Y', valueOrDefault(step.y, -0.46), 'number', '0.01') +
      stepFieldHtml(index, 'width', 'Largura do texto', valueOrDefault(step.width, 1.05), 'number', '0.01');
  } else if (type === 'words') {
    details =
      stepTextareaHtml(index, 'words', 'Palavras, uma por linha', (step.words || []).join('\n')) +
      stepSelectHtml(index, 'animation', 'Animacao', step.animation || 'vortex', WORD_ANIMATION_OPTIONS);
  } else if (type === 'actions') {
    details =
      stepFieldHtml(index, 'actions', 'Acoes, separadas por virgula', (step.actions || ['collection', 'video', 'site']).join(', '), 'text') +
      stepFieldHtml(index, 'cta', 'Texto grande abaixo dos botoes', step.cta || '', 'text');
  } else if (type === 'collection' || type === 'video' || type === 'site') {
    details = stepFieldHtml(index, 'cta', 'Texto grande abaixo do botao', step.cta || '', 'text');
  } else if (type === 'model3d') {
    details =
      stepFieldHtml(index, 'model', 'Caminho do modelo desta etapa', step.model || '', 'text') +
      stepFieldHtml(index, 'modelScale', 'Escala do modelo', step.modelScale || '', 'text') +
      stepFieldHtml(index, 'spinSpeed', 'Velocidade de giro', step.spinSpeed || '', 'number');
  }

  return (
    '<div class="sequence-step" data-step-index="' + index + '">' +
      '<div class="sequence-step-header">' +
        '<h3>Bloco ' + (index + 1) + '</h3>' +
        '<button type="button" class="danger" data-remove-step="' + index + '">Remover</button>' +
      '</div>' +
      '<div class="editor-grid">' +
        stepSelectHtml(index, 'type', 'Funcionalidade', type, STEP_TYPE_OPTIONS) +
        stepFieldHtml(index, 'order', 'Ordem', valueOrDefault(step.order, index + 1), 'number') +
        stepFieldHtml(index, 'delay', 'Atraso antes de iniciar', valueOrDefault(step.delay, 0), 'number') +
        stepFieldHtml(index, 'duration', 'Duracao', valueOrDefault(step.duration, defaultDurationForStep(type)), 'number') +
        details +
      '</div>' +
    '</div>'
  );
}

function stepFieldHtml(index, field, label, value, type, stepValue) {
  return (
    '<div class="field">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<input type="' + type + '" data-step-index="' + index + '" data-step-field="' + field + '"' +
        (stepValue ? ' step="' + escapeHtml(stepValue) + '"' : '') +
        ' value="' + escapeHtml(String(value)) + '" />' +
    '</div>'
  );
}

function stepTextareaHtml(index, field, label, value) {
  return (
    '<div class="field full">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<textarea data-step-index="' + index + '" data-step-field="' + field + '">' + escapeHtml(String(value)) + '</textarea>' +
    '</div>'
  );
}

function stepSelectHtml(index, field, label, value, options) {
  return (
    '<div class="field">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<select data-step-index="' + index + '" data-step-field="' + field + '">' +
        options.map(function (option) {
          return '<option value="' + escapeHtml(option.value) + '"' +
            (option.value === value ? ' selected' : '') + '>' +
            escapeHtml(option.label) + '</option>';
        }).join('') +
      '</select>' +
    '</div>'
  );
}

function valueOrDefault(value, fallback) {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function defaultDurationForStep(type) {
  if (type === 'scanner') return 4200;
  if (type === 'words') return 11200;
  if (type === 'phrase') return 1800;
  return 0;
}

function defaultStep(type, order) {
  if (type === 'scanner') {
    return {
      type: 'scanner',
      order: order,
      delay: 0,
      duration: 4200,
      introTop: '',
      introBottom: '',
      topY: 0.58,
      bottomY: -0.58
    };
  }

  if (type === 'words') {
    return {
      type: 'words',
      order: order,
      delay: 0,
      duration: 11200,
      words: [],
      animation: 'vortex'
    };
  }

  if (type === 'phrase') {
    return {
      type: 'phrase',
      order: order,
      delay: 0,
      duration: 1800,
      text: '',
      x: 0,
      y: -0.46,
      width: 1.05
    };
  }

  if (type === 'actions') {
    return {
      type: 'actions',
      order: order,
      delay: 0,
      duration: 0,
      actions: ['collection', 'video', 'site'],
      cta: 'veja mais informacoes'
    };
  }

  if (type === 'model3d') {
    return {
      type: 'model3d',
      order: order,
      delay: 0,
      duration: 0,
      model: '',
      modelScale: '',
      spinSpeed: ''
    };
  }

  return {
    type: type || 'collection',
    order: order,
    delay: 0,
    duration: 0,
    cta: ''
  };
}

function legacyStepsFromPoint(point) {
  var feature = getPointFeature(point);
  if (feature === 'menu') {
    return [
      {
        type: 'scanner',
        order: 1,
        delay: 0,
        duration: 4200,
        introTop: point.introTop || '',
        introBottom: point.introBottom || '',
        topY: 0.58,
        bottomY: -0.58
      },
      {
        type: 'words',
        order: 2,
        delay: 0,
        duration: 11200,
        words: Array.isArray(point.keywords) ? point.keywords : [],
        animation: 'vortex'
      },
      {
        type: 'actions',
        order: 3,
        delay: 150,
        duration: 0,
        actions: ['collection', 'video', 'site'],
        cta: point.cta || 'veja mais informacoes'
      }
    ];
  }

  if (feature === 'info') {
    return [
      {
        type: 'scanner',
        order: 1,
        delay: 0,
        duration: 4200,
        introTop: point.introTop || '',
        introBottom: point.introBottom || '',
        topY: 0.58,
        bottomY: -0.58
      },
      {
        type: 'words',
        order: 2,
        delay: 0,
        duration: 11200,
        words: Array.isArray(point.keywords) ? point.keywords : [],
        animation: 'vortex'
      },
      {
        type: 'phrase',
        order: 3,
        delay: 150,
        duration: 1800,
        text: point.phrase || '',
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
        delay: 0,
        duration: 0,
        model: point.model || '',
        modelScale: point.modelScale || '0.55 0.55 0.55',
        spinSpeed: Number(point.spinSpeed || 45)
      }
    ];
  }

  return [
    {
      type: feature,
      order: 1,
      delay: 0,
      duration: 0,
      cta: point.cta || ''
    }
  ];
}

function normalizeStepsForEditor(steps) {
  return (Array.isArray(steps) ? steps : [])
    .map(function (step, index) {
      var clean = Object.assign(defaultStep(step.type || 'scanner', index + 1), step);
      clean.order = Number(clean.order || index + 1);
      clean.delay = Number(clean.delay || 0);
      clean.duration = Number(valueOrDefault(clean.duration, defaultDurationForStep(clean.type)));
      if (clean.type === 'words') {
        clean.words = Array.isArray(clean.words) ? clean.words : String(clean.words || '').split(/\n|,/).map(function (word) {
          return word.trim();
        }).filter(Boolean);
      }
      if (clean.type === 'actions') {
        clean.actions = Array.isArray(clean.actions) ? clean.actions : String(clean.actions || '').split(/\n|,/).map(function (action) {
          return action.trim();
        }).filter(Boolean);
      }
      return clean;
    })
    .sort(function (a, b) { return a.order - b.order; });
}

function bindEditorEvents(point) {
  document.querySelectorAll('[data-point-field]').forEach(function (input) {
    var eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, function () {
      var field = input.getAttribute('data-point-field');
      var previousFeature = getPointFeature(point);

      if (field === 'feature') {
        point.feature = input.value;
        if (point.feature === 'custom' && (!Array.isArray(point.steps) || !point.steps.length)) {
          point.steps = legacyStepsFromPoint(Object.assign({}, point, { feature: previousFeature }));
        }
        renderAll();
        return;
      }

      if (field === 'keywords') {
        point.keywords = input.value.split(/\n|,/).map(function (word) { return word.trim(); }).filter(Boolean);
      } else if (field === 'targetIndex' || field === 'trailStep') {
        point[field] = Number(input.value || 0);
      } else if (field === 'spinSpeed') {
        point[field] = Number(input.value || 45);
      } else {
        point[field] = input.value;
      }

      if (field === 'panel') selectedPanelName = point.panel || 'Painel 01';
      renderPanels();
      renderIslands();
    });
  });

  document.querySelectorAll('[data-step-field]').forEach(function (input) {
    var eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, function () {
      var stepIndex = Number(input.getAttribute('data-step-index'));
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      var field = input.getAttribute('data-step-field');
      if (field === 'type') {
        point.steps[stepIndex] = defaultStep(input.value, step.order || stepIndex + 1);
        renderEditor();
        return;
      }

      if (field === 'words') {
        step.words = input.value.split(/\n|,/).map(function (word) { return word.trim(); }).filter(Boolean);
      } else if (field === 'actions') {
        step.actions = input.value.split(/\n|,/).map(function (action) { return action.trim(); }).filter(Boolean);
      } else if (
        field === 'order' ||
        field === 'delay' ||
        field === 'duration' ||
        field === 'topY' ||
        field === 'bottomY' ||
        field === 'x' ||
        field === 'y' ||
        field === 'width' ||
        field === 'spinSpeed'
      ) {
        step[field] = Number(input.value || 0);
      } else {
        step[field] = input.value;
      }

      if (field === 'order') {
        point.steps = normalizeStepsForEditor(point.steps);
        renderEditor();
        return;
      }
    });
  });

  document.querySelectorAll('[data-remove-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stepIndex = Number(btn.getAttribute('data-remove-step'));
      point.steps = normalizeStepsForEditor(point.steps || []);
      point.steps.splice(stepIndex, 1);
      point.steps.forEach(function (step, index) {
        step.order = index + 1;
      });
      renderEditor();
    });
  });

  var addSequenceStepBtn = document.getElementById('add-sequence-step-btn');
  if (addSequenceStepBtn) {
    addSequenceStepBtn.addEventListener('click', function () {
      point.steps = normalizeStepsForEditor(point.steps || []);
      point.steps.push(defaultStep('phrase', point.steps.length + 1));
      renderEditor();
    });
  }

  var targetFile = document.getElementById('target-file');
  if (targetFile) {
    targetFile.addEventListener('change', function () {
      point._targetFile = targetFile.files[0] || null;
      renderEditor();
    });
  }

  var videoFile = document.getElementById('video-file');
  if (videoFile) {
    videoFile.addEventListener('change', function () {
      point._videoFile = videoFile.files[0] || null;
      renderEditor();
    });
  }

  var modelFile = document.getElementById('model-file');
  if (modelFile) {
    modelFile.addEventListener('change', function () {
      point._modelFile = modelFile.files[0] || null;
      renderEditor();
    });
  }

  document.querySelectorAll('[data-item-field]').forEach(function (input) {
    input.addEventListener('input', function () {
      var itemEl = input.closest('.collection-item');
      var itemIndex = Number(itemEl.getAttribute('data-item-index'));
      var field = input.getAttribute('data-item-field');
      point.collection[itemIndex][field] = input.value;
    });
  });

  document.querySelectorAll('[data-item-file]').forEach(function (input) {
    input.addEventListener('change', function () {
      var itemEl = input.closest('.collection-item');
      var itemIndex = Number(itemEl.getAttribute('data-item-index'));
      var field = input.getAttribute('data-item-file');
      var file = input.files[0] || null;

      if (field === 'image') point.collection[itemIndex]._imageFile = file;
      if (field === 'model') point.collection[itemIndex]._modelFile = file;
      renderEditor();
    });
  });

  document.querySelectorAll('[data-remove-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var itemIndex = Number(btn.getAttribute('data-remove-item'));
      point.collection.splice(itemIndex, 1);
      renderEditor();
    });
  });

  var addCollectionBtn = document.getElementById('add-collection-item-btn');
  if (addCollectionBtn) {
    addCollectionBtn.addEventListener('click', function () {
      point.collection.push({ name: 'Novo item', image: '' });
      renderEditor();
    });
  }

  document.getElementById('duplicate-island-btn').addEventListener('click', function () {
    var copy = stripPrivate(point);
    copy.name = (copy.name || 'Ilha') + ' copia';
    copy.targetIndex = nextTargetIndex();
    copy.trailStep = nextTrailStep(selectedPanelName);
    configState.points.push(copy);
    selectedPointIndex = configState.points.length - 1;
    renderAll();
  });

  document.getElementById('remove-island-btn').addEventListener('click', function () {
    if (!confirm('Remover esta ilha da configuracao?')) return;
    configState.points.splice(selectedPointIndex, 1);
    selectedPointIndex = findFirstPointIndex(selectedPanelName);
    renderAll();
  });
}

function addPanel() {
  var name = prompt('Nome do novo painel:', 'Painel ' + String(getPanels().length + 1).padStart(2, '0'));
  if (!name) return;

  var point = createEmptyPoint(name, nextTargetIndex(), 1);
  configState.points.push(point);
  selectedPanelName = name;
  selectedPointIndex = configState.points.length - 1;
  renderAll();
}

function addIsland() {
  if (!selectedPanelName) {
    addPanel();
    return;
  }

  var point = createEmptyPoint(selectedPanelName, nextTargetIndex(), nextTrailStep(selectedPanelName));
  configState.points.push(point);
  selectedPointIndex = configState.points.length - 1;
  renderAll();
}

function createEmptyPoint(panelName, targetIndex, trailStep) {
  return {
    targetIndex: targetIndex,
    panel: panelName,
    trailStep: trailStep,
    feature: 'info',
    targetImage: '',
    name: 'Nova ilha',
    phrase: '',
    introTop: '',
    introBottom: '',
    keywords: [],
    video: '',
    site: '',
    collection: []
  };
}

function nextTargetIndex() {
  var indexes = configState.points.map(function (point) { return Number(point.targetIndex || 0); });
  configState.products.forEach(function (product) { indexes.push(Number(product.targetIndex || 0)); });
  return indexes.length ? Math.max.apply(null, indexes) + 1 : 0;
}

function nextTrailStep(panelName) {
  var entries = getPanelPoints(panelName);
  if (!entries.length) return 1;
  return entries.reduce(function (max, entry) {
    return Math.max(max, Number(entry.point.trailStep || 0));
  }, 0) + 1;
}

async function pickProjectFolder() {
  if (!window.showDirectoryPicker) {
    setStatus('Este navegador nao permite salvar direto em pastas. Use Chrome/Edge em localhost.', 'error');
    return;
  }

  try {
    projectDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    setStatus('Pasta do projeto selecionada. Agora voce pode salvar arquivos e configuracao.', 'ok');
  } catch (err) {
    setStatus('Selecao de pasta cancelada.', '');
  }
}

async function saveProjectConfig() {
  if (!projectDirHandle) {
    setStatus('Escolha a pasta raiz do projeto antes de salvar.', 'error');
    return;
  }

  try {
    setStatus('Salvando arquivos enviados...', '');
    await persistUploads();
    await writeTextFile(projectDirHandle, 'trail-config.js', buildConfigSource());
    setStatus('Arquivos salvos. A imagem nova so funciona depois que voce recompilar e substituir targets/targets.mind.', 'ok');
  } catch (err) {
    console.error(err);
    setStatus('Erro ao salvar: ' + err.message, 'error');
  }
}

async function persistUploads() {
  for (var i = 0; i < configState.points.length; i++) {
    var point = configState.points[i];
    var panelSlug = slugify(point.panel || 'painel');
    var pointSlug = slugify((point.trailStep || i + 1) + '-' + (point.name || 'ilha'));

    if (point._targetFile) {
      point.targetImage = await writeUploadedFile(point._targetFile, ['targets', 'source', panelSlug], 'target-' + pointSlug);
      point._targetFile = null;
    }

    var feature = getPointFeature(point);

    if ((feature === 'video' || feature === 'menu' || feature === 'custom') && point._videoFile) {
      point.video = await writeUploadedFile(point._videoFile, ['videos', panelSlug], 'video-' + pointSlug);
      point._videoFile = null;
    }

    if ((feature === 'model3d' || feature === 'custom') && point._modelFile) {
      point.model = await writeUploadedFile(point._modelFile, ['assets', 'models', panelSlug], 'model-' + pointSlug);
      point._modelFile = null;
    }

    if (feature !== 'collection' && feature !== 'menu' && feature !== 'custom') continue;

    var collection = Array.isArray(point.collection) ? point.collection : [];
    for (var j = 0; j < collection.length; j++) {
      var item = collection[j];
      var itemSlug = slugify((j + 1) + '-' + (item.name || 'item'));

      if (item._imageFile) {
        item.image = await writeUploadedFile(item._imageFile, ['assets', 'collections', panelSlug], itemSlug);
        item._imageFile = null;
      }
    }
  }
}

async function writeUploadedFile(file, dirParts, baseName) {
  var ext = getFileExtension(file.name);
  var fileName = baseName + ext;
  var dir = await ensureDirectory(projectDirHandle, dirParts);
  var handle = await dir.getFileHandle(fileName, { create: true });
  var writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();
  return dirParts.concat(fileName).join('/');
}

async function ensureDirectory(root, parts) {
  var dir = root;
  for (var i = 0; i < parts.length; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: true });
  }
  return dir;
}

async function writeTextFile(root, path, text) {
  var handle = await root.getFileHandle(path, { create: true });
  var writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

function downloadConfig() {
  var blob = new Blob([buildConfigSource()], { type: 'text/javascript;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'trail-config.js';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus('Arquivo trail-config.js baixado.', 'ok');
}

function buildConfigSource() {
  var config = {
    brandsData: configState.points.map(function (point) {
      return normalizePointForSave(stripPrivate(point));
    }),
    productTargetsData: configState.products.map(stripPrivate)
  };

  return 'window.TRAIL_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n';
}

function normalizePointForSave(point) {
  var feature = getPointFeature(point);
  var clean = {
    targetIndex: Number(point.targetIndex || 0),
    panel: point.panel || 'Painel 01',
    trailStep: Number(point.trailStep || 1),
    feature: feature,
    targetImage: point.targetImage || '',
    name: point.name || 'Ilha'
  };

  if (feature === 'custom') {
    clean.steps = normalizeStepsForSave(point.steps && point.steps.length ? point.steps : legacyStepsFromPoint(point));
    clean.video = point.video || '';
    clean.site = point.site || '';
    clean.model = point.model || '';
    clean.modelScale = point.modelScale || '0.55 0.55 0.55';
    clean.spinSpeed = Number(point.spinSpeed || 45);
    clean.collection = (Array.isArray(point.collection) ? point.collection : []).map(function (item) {
      return {
        name: item.name || 'Item',
        image: item.image || ''
      };
    });
  } else if (feature === 'info' || feature === 'menu') {
    clean.phrase = point.phrase || '';
    clean.introTop = point.introTop || '';
    clean.introBottom = point.introBottom || '';
    clean.keywords = Array.isArray(point.keywords) ? point.keywords : [];
    if (feature === 'menu') {
      clean.video = point.video || '';
      clean.site = point.site || '';
      clean.collection = (Array.isArray(point.collection) ? point.collection : []).map(function (item) {
        return {
          name: item.name || 'Item',
          image: item.image || ''
        };
      });
    }
  } else if (feature === 'video') {
    clean.video = point.video || '';
  } else if (feature === 'site') {
    clean.site = point.site || '';
  } else if (feature === 'collection') {
    clean.collection = (Array.isArray(point.collection) ? point.collection : []).map(function (item) {
      return {
        name: item.name || 'Item',
        image: item.image || ''
      };
    });
  } else if (feature === 'model3d') {
    clean.model = point.model || '';
    clean.modelScale = point.modelScale || '0.55 0.55 0.55';
    clean.spinSpeed = Number(point.spinSpeed || 45);
  }

  return clean;
}

function normalizeStepsForSave(steps) {
  return normalizeStepsForEditor(steps).map(function (step, index) {
    var type = step.type || 'scanner';
    var clean = {
      type: type,
      order: Number(step.order || index + 1),
      delay: Number(step.delay || 0),
      duration: Number(valueOrDefault(step.duration, defaultDurationForStep(type)))
    };

    if (type === 'scanner') {
      clean.introTop = step.introTop || '';
      clean.introBottom = step.introBottom || '';
      clean.topY = Number(valueOrDefault(step.topY, 0.58));
      clean.bottomY = Number(valueOrDefault(step.bottomY, -0.58));
    } else if (type === 'words') {
      clean.words = Array.isArray(step.words) ? step.words : [];
      clean.animation = step.animation || 'vortex';
    } else if (type === 'phrase') {
      clean.text = step.text || '';
      clean.x = Number(valueOrDefault(step.x, 0));
      clean.y = Number(valueOrDefault(step.y, -0.46));
      clean.width = Number(valueOrDefault(step.width, 1.05));
    } else if (type === 'actions') {
      clean.actions = Array.isArray(step.actions) && step.actions.length ? step.actions : ['collection', 'video', 'site'];
      clean.cta = step.cta || '';
    } else if (type === 'collection' || type === 'video' || type === 'site') {
      clean.cta = step.cta || '';
    } else if (type === 'model3d') {
      clean.model = step.model || '';
      clean.modelScale = step.modelScale || '';
      clean.spinSpeed = step.spinSpeed === '' || step.spinSpeed === undefined ? '' : Number(step.spinSpeed || 45);
    }

    return clean;
  });
}

function stripPrivate(value) {
  if (Array.isArray(value)) return value.map(stripPrivate);
  if (!value || typeof value !== 'object') return value;

  var clean = {};
  Object.keys(value).forEach(function (key) {
    if (key.charAt(0) === '_') return;
    clean[key] = stripPrivate(value[key]);
  });
  return clean;
}

function getFileExtension(name) {
  var cleanName = String(name || '').split('/').pop().split('\\').pop();
  var dot = cleanName.lastIndexOf('.');
  return dot >= 0 ? cleanName.slice(dot).toLowerCase() : '';
}

function slugify(value) {
  return String(value || 'arquivo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'arquivo';
}

function setStatus(message, type) {
  var bar = document.getElementById('status-bar');
  bar.textContent = message;
  bar.classList.toggle('ok', type === 'ok');
  bar.classList.toggle('error', type === 'error');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
