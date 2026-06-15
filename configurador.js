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
  { value: 'image', label: 'Imagem interativa' },
  { value: 'collection', label: 'Galeria de imagens' },
  { value: 'carousel3d', label: 'Carrossel 3D' },
  { value: 'model3d', label: 'Modelo 3D direto' }
];

var STEP_TYPE_OPTIONS = [
  { value: 'logoText', label: 'Texto saindo do logo' },
  { value: 'scanner', label: 'Scanner + frases de entrada' },
  { value: 'phrase', label: 'Frase digitada' },
  { value: 'words', label: 'Palavras futuristas' },
  { value: 'actions', label: 'Icones Galeria + Video + Site' },
  { value: 'collection', label: 'Icone Galeria' },
  { value: 'video', label: 'Icone Video' },
  { value: 'site', label: 'Icone Site' },
  { value: 'image', label: 'Imagem' },
  { value: 'carousel3d', label: 'Carrossel 3D' },
  { value: 'model3d', label: 'Modelo 3D' }
];

var WORD_ANIMATION_OPTIONS = [
  { value: 'vortex', label: 'Vortex + orbita' },
  { value: 'orbit', label: 'Orbita direta' },
  { value: 'wave', label: 'Onda magnetica' },
  { value: 'spiral', label: 'Espiral 3D' },
  { value: 'rain', label: 'Chuva neon' },
  { value: 'constellation', label: 'Constelacao' },
  { value: 'clickCollect', label: 'Interativo: clicar em todas' },
  { value: 'dragCenter', label: 'Interativo: arrastar para o centro' },
  { value: 'scratchFind', label: 'Interativo: raspadinha das palavras' }
];

var WORD_LAYOUT_OPTIONS = [
  { value: 'circle', label: 'Circular' },
  { value: 'row', label: 'Linha horizontal' },
  { value: 'column', label: 'Linha vertical' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'grid', label: 'Grade compacta' }
];

var IMAGE_INTERACTION_OPTIONS = [
  { value: 'spin', label: 'Giro 360' },
  { value: 'float', label: 'Flutuar' },
  { value: 'pulse', label: 'Pulsar' },
  { value: 'tilt', label: 'Inclinar' },
  { value: 'glow', label: 'Brilho' }
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

function fieldHtml(field, label, value, type, stepValue) {
  return (
    '<div class="field">' +
      '<label for="field-' + field + '">' + escapeHtml(label) + '</label>' +
      '<input id="field-' + field + '" type="' + type + '" data-point-field="' + field + '"' +
        (stepValue ? ' step="' + escapeHtml(stepValue) + '"' : '') +
        ' value="' + escapeHtml(String(value)) + '" />' +
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

function checkboxGroupHtml(field, label, selected, options) {
  var selectedMap = {};
  (Array.isArray(selected) ? selected : String(selected || '').split(/\n|,/))
    .map(function (item) { return String(item).trim(); })
    .filter(Boolean)
    .forEach(function (item) { selectedMap[item] = true; });

  return (
    '<div class="field full checkbox-field">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<div class="checkbox-grid">' +
        options.map(function (option) {
          return (
            '<label class="checkbox-option">' +
              '<input type="checkbox" data-point-multi="' + escapeHtml(field) + '" value="' + escapeHtml(option.value) + '"' +
                (selectedMap[option.value] ? ' checked' : '') + ' />' +
              '<span>' + escapeHtml(option.label) + '</span>' +
            '</label>'
          );
        }).join('') +
      '</div>' +
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
      (field === 'feature' ? '<span class="upload-hint">Use Sequencia personalizada para combinar varios blocos na mesma ilha.</span>' : '') +
    '</div>'
  );
}

function pointCheckboxHtml(field, label, checked) {
  return (
    '<div class="field full">' +
      '<label class="checkbox-option">' +
        '<input type="checkbox" data-point-field="' + field + '"' + (checked ? ' checked' : '') + ' />' +
        '<span>' + escapeHtml(label) + '</span>' +
      '</label>' +
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
          '<button id="add-logo-text-step-btn" type="button" class="secondary">Adicionar texto inicial</button>' +
          '<button id="add-image-step-btn" type="button" class="secondary">Adicionar imagem</button>' +
          '<button id="add-carousel-step-btn" type="button" class="secondary">Adicionar carrossel 3D</button>' +
          '<button id="add-sequence-step-btn" type="button">Adicionar funcionalidade</button>' +
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

  if (feature === 'image') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Imagem interativa</h2>' +
        '<div class="editor-grid">' +
          fieldHtml('image', 'Caminho da imagem', point.image || '', 'text') +
          uploadHtml('image-file', 'Enviar imagem desta ilha', point._imageFile) +
          fieldHtml('imageTitle', 'Titulo da imagem', point.imageTitle || '', 'text') +
          fieldHtml('imageWidth', 'Largura da imagem', point.imageWidth || 0.82, 'number', '0.01') +
          fieldHtml('imageHeight', 'Altura da imagem', point.imageHeight || 0.56, 'number', '0.01') +
          fieldHtml('imageX', 'Posicao X', point.imageX || 0, 'number', '0.01') +
          fieldHtml('imageY', 'Posicao Y', point.imageY || 0.05, 'number', '0.01') +
          fieldHtml('imageZ', 'Posicao Z', point.imageZ || 0.28, 'number', '0.01') +
          fieldHtml('imageBg', 'Cor do fundo da imagem', point.imageBg || '#ffffff', 'text') +
          fieldHtml('imageTitleBg', 'Cor do fundo do titulo', point.imageTitleBg || 'rgba(177,18,27,0.72)', 'text') +
          fieldHtml('imageTitleColor', 'Cor do titulo', point.imageTitleColor || '#ffffff', 'text') +
          fieldHtml('imageTitleFont', 'Fonte do titulo', point.imageTitleFont || 38, 'number') +
          fieldHtml('imageSpinSpeed', 'Velocidade do giro', point.imageSpinSpeed || 42, 'number') +
          fieldHtml('imageFloatAmount', 'Intensidade da flutuacao', point.imageFloatAmount || 0.06, 'number', '0.01') +
          checkboxGroupHtml('imageInteractions', 'Interacoes da imagem', point.imageInteractions || ['float'], IMAGE_INTERACTION_OPTIONS) +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'collection') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Galeria de imagens</h2>' +
        '<p class="note">Esta ilha abre somente a galeria em modal. Para uma galeria em AR, use Carrossel 3D.</p>' +
        '<div id="collection-list" class="collection-list">' + collectionHtml(point.collection) + '</div>' +
        '<div class="editor-actions">' +
          '<button id="add-collection-item-btn" type="button">Adicionar item</button>' +
        '</div>' +
      '</section>'
    );
  }

  if (feature === 'carousel3d') {
    return (
      '<section class="feature-card">' +
        '<h2>Funcionalidade: Carrossel 3D</h2>' +
        '<p class="note">Cada item abaixo vira um card no espaco AR. Se o item tiver modelo 3D, o modelo aparece; se nao tiver, aparece a imagem.</p>' +
        '<div class="editor-grid">' +
          fieldHtml('carouselTitle', 'Titulo do carrossel', point.carouselTitle || '', 'text') +
          fieldHtml('carouselTitleBg', 'Cor do fundo do titulo', point.carouselTitleBg || 'rgba(177,18,27,0.72)', 'text') +
          fieldHtml('carouselTitleColor', 'Cor do titulo', point.carouselTitleColor || '#ffffff', 'text') +
          fieldHtml('carouselTitleFont', 'Tamanho da fonte do titulo', point.carouselTitleFont || 50, 'number') +
          fieldHtml('carouselRadius', 'Raio do carrossel', point.carouselRadius || 0.82, 'number', '0.01') +
          fieldHtml('carouselSpeed', 'Velocidade de giro', point.carouselSpeed || 18, 'number') +
          pointCheckboxHtml('carouselFocusAnimation', 'Animacao destaque: gira rapido e da zoom no item', point.carouselFocusAnimation) +
          fieldHtml('carouselItemWidth', 'Largura dos cards', point.carouselItemWidth || 0.52, 'number', '0.01') +
          fieldHtml('carouselItemHeight', 'Altura dos cards', point.carouselItemHeight || 0.68, 'number', '0.01') +
          fieldHtml('carouselCardBg', 'Cor do fundo das imagens', point.carouselCardBg || '#ffffff', 'text') +
          fieldHtml('carouselItemTitleBg', 'Cor do fundo das legendas', point.carouselItemTitleBg || 'rgba(177,18,27,0.72)', 'text') +
          fieldHtml('carouselItemTitleColor', 'Cor das legendas', point.carouselItemTitleColor || '#ffffff', 'text') +
          fieldHtml('carouselItemTitleFont', 'Tamanho da fonte das legendas', point.carouselItemTitleFont || 38, 'number') +
          fieldHtml('carouselModelSize', 'Tamanho dos modelos 3D', point.carouselModelSize || 0.46, 'number', '0.01') +
          fieldHtml('carouselY', 'Posicao Y do carrossel', point.carouselY || 0.05, 'number', '0.01') +
        '</div>' +
        '<h2>Itens do carrossel</h2>' +
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
          selectHtml('wordAnimation', 'Animacao das palavras', point.wordAnimation || 'vortex', WORD_ANIMATION_OPTIONS) +
          selectHtml('wordLayout', 'Posicionamento das palavras', point.wordLayout || 'circle', WORD_LAYOUT_OPTIONS) +
          pointCheckboxHtml('wordBackdropEffect', 'Fundo escuro clareando nas palavras', point.wordBackdropEffect) +
          pointCheckboxHtml('wordFireflyEffect', 'Ambiente escuro com palavras vagalumes', point.wordFireflyEffect) +
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
        selectHtml('wordAnimation', 'Animacao das palavras', point.wordAnimation || 'vortex', WORD_ANIMATION_OPTIONS) +
        selectHtml('wordLayout', 'Posicionamento das palavras', point.wordLayout || 'circle', WORD_LAYOUT_OPTIONS) +
        pointCheckboxHtml('wordBackdropEffect', 'Fundo escuro clareando nas palavras', point.wordBackdropEffect) +
        pointCheckboxHtml('wordFireflyEffect', 'Ambiente escuro com palavras vagalumes', point.wordFireflyEffect) +
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

function stepUploadHtml(index, field, label, file, accept) {
  return (
    '<div class="field full">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<div class="upload-row">' +
        '<input type="file" data-step-index="' + index + '" data-step-file="' + escapeHtml(field) + '"' +
          (accept ? ' accept="' + escapeHtml(accept) + '"' : '') + ' />' +
        '<span class="upload-hint">' + (file ? 'Arquivo pendente: ' + escapeHtml(file.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
      '</div>' +
    '</div>'
  );
}

function stepCheckboxGroupHtml(index, field, label, selected, options) {
  var selectedMap = {};
  (Array.isArray(selected) ? selected : String(selected || '').split(/\n|,/))
    .map(function (item) { return String(item).trim(); })
    .filter(Boolean)
    .forEach(function (item) { selectedMap[item] = true; });

  return (
    '<div class="field full checkbox-field">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<div class="checkbox-grid">' +
        options.map(function (option) {
          return (
            '<label class="checkbox-option">' +
              '<input type="checkbox" data-step-index="' + index + '" data-step-multi="' + escapeHtml(field) + '" value="' + escapeHtml(option.value) + '"' +
                (selectedMap[option.value] ? ' checked' : '') + ' />' +
              '<span>' + escapeHtml(option.label) + '</span>' +
            '</label>'
          );
        }).join('') +
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
          '<label>Titulo exibido no AR</label>' +
          '<input data-item-field="title" value="' + escapeHtml(item.title || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Caminho da imagem</label>' +
          '<input data-item-field="image" value="' + escapeHtml(item.image || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Caminho do modelo 3D opcional</label>' +
          '<input data-item-field="model" value="' + escapeHtml(item.model || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Escala do modelo opcional</label>' +
          '<input data-item-field="modelScale" value="' + escapeHtml(item.modelScale || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Enviar imagem do item</label>' +
          '<input type="file" accept="image/*" data-item-file="image" />' +
          '<span class="upload-hint">' + (item._imageFile ? 'Arquivo pendente: ' + escapeHtml(item._imageFile.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
        '</div>' +
        '<div class="field full">' +
          '<label>Enviar modelo 3D do item</label>' +
          '<input type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" data-item-file="model" />' +
          '<span class="upload-hint">' + (item._modelFile ? 'Arquivo pendente: ' + escapeHtml(item._modelFile.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
        '</div>' +
        '<div class="field full">' +
          '<button type="button" class="danger" data-remove-item="' + index + '">Remover item</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function stepItemsHtml(step, stepIndex) {
  var items = Array.isArray(step.items) ? step.items : [];
  if (!items.length) {
    return '<p class="note">Nenhum item cadastrado neste bloco.</p>';
  }

  return items.map(function (item, itemIndex) {
    return (
      '<div class="collection-item" data-step-index="' + stepIndex + '" data-step-item-index="' + itemIndex + '">' +
        '<h3>Item ' + (itemIndex + 1) + '</h3>' +
        '<div class="field full">' +
          '<label>Nome interno</label>' +
          '<input data-step-item-field="name" value="' + escapeHtml(item.name || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Titulo exibido no AR</label>' +
          '<input data-step-item-field="title" value="' + escapeHtml(item.title || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Caminho da imagem</label>' +
          '<input data-step-item-field="image" value="' + escapeHtml(item.image || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Enviar imagem deste item</label>' +
          '<input type="file" accept="image/*" data-step-item-file="image" />' +
          '<span class="upload-hint">' + (item._imageFile ? 'Arquivo pendente: ' + escapeHtml(item._imageFile.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
        '</div>' +
        '<div class="field full">' +
          '<label>Caminho do modelo 3D opcional</label>' +
          '<input data-step-item-field="model" value="' + escapeHtml(item.model || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<label>Enviar modelo 3D deste item</label>' +
          '<input type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" data-step-item-file="model" />' +
          '<span class="upload-hint">' + (item._modelFile ? 'Arquivo pendente: ' + escapeHtml(item._modelFile.name) : 'Nenhum arquivo novo selecionado.') + '</span>' +
        '</div>' +
        '<div class="field full">' +
          '<label>Escala do modelo opcional</label>' +
          '<input data-step-item-field="modelScale" value="' + escapeHtml(item.modelScale || '') + '" />' +
        '</div>' +
        '<div class="field full">' +
          '<button type="button" class="danger" data-remove-step-item="' + itemIndex + '">Remover item</button>' +
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

  if (type === 'logoText') {
    details =
      stepTextareaHtml(index, 'text', 'Texto que sai do logo', step.text || '') +
      stepFieldHtml(index, 'x', 'Posicao X final', valueOrDefault(step.x, 0), 'number', '0.01') +
      stepFieldHtml(index, 'y', 'Posicao Y final', valueOrDefault(step.y, 0.72), 'number', '0.01') +
      stepFieldHtml(index, 'width', 'Largura da tarja', valueOrDefault(step.width, 1.45), 'number', '0.01') +
      stepFieldHtml(index, 'height', 'Altura da tarja', valueOrDefault(step.height, 0.24), 'number', '0.01') +
      stepFieldHtml(index, 'bg', 'Cor do fundo do texto', step.bg || 'rgba(177,18,27,0.72)', 'text') +
      stepFieldHtml(index, 'color', 'Cor do texto', step.color || '#ffffff', 'text') +
      stepFieldHtml(index, 'font', 'Fonte do texto que sai do logo', valueOrDefault(step.font, 44), 'number');
  } else if (type === 'scanner') {
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
      stepSelectHtml(index, 'animation', 'Animacao', step.animation || 'vortex', WORD_ANIMATION_OPTIONS) +
      stepSelectHtml(index, 'layout', 'Posicionamento', step.layout || 'circle', WORD_LAYOUT_OPTIONS) +
      stepCheckboxHtml(index, 'backdropEffect', 'Ativar fundo escuro clareando', step.backdropEffect) +
      stepCheckboxHtml(index, 'fireflyEffect', 'Ambiente escuro com palavras vagalumes', step.fireflyEffect) +
      stepFieldHtml(index, 'wordBg', 'Cor do fundo das palavras', step.wordBg || 'rgba(177,18,27,0.72)', 'text') +
      stepFieldHtml(index, 'wordColor', 'Cor das palavras', step.wordColor || '#ffffff', 'text') +
      stepFieldHtml(index, 'wordFont', 'Tamanho da fonte das palavras', valueOrDefault(step.wordFont, 56), 'number');
  } else if (type === 'actions') {
    details =
      stepFieldHtml(index, 'actions', 'Acoes, separadas por virgula', (step.actions || ['collection', 'video', 'site']).join(', '), 'text') +
      stepFieldHtml(index, 'cta', 'Texto grande abaixo dos botoes', step.cta || '', 'text');
  } else if (type === 'collection') {
    step.items = Array.isArray(step.items) ? step.items : [];
    details =
      stepFieldHtml(index, 'cta', 'Texto grande abaixo do botao', step.cta || '', 'text') +
      '<div class="field full"><h3>Itens da galeria</h3></div>' +
      '<div class="collection-list full">' + stepItemsHtml(step, index) + '</div>' +
      '<div class="editor-actions full">' +
        '<button type="button" data-add-step-item="' + index + '">Adicionar item</button>' +
      '</div>';
  } else if (type === 'video') {
    details =
      stepFieldHtml(index, 'cta', 'Texto grande abaixo do botao', step.cta || '', 'text') +
      stepFieldHtml(index, 'video', 'Caminho do video', step.video || '', 'text') +
      stepUploadHtml(index, 'video', 'Enviar video deste bloco', step._videoFile, 'video/*');
  } else if (type === 'site') {
    details =
      stepFieldHtml(index, 'cta', 'Texto grande abaixo do botao', step.cta || '', 'text') +
      stepFieldHtml(index, 'site', 'Link do site', step.site || '', 'text');
  } else if (type === 'image') {
    details =
      stepFieldHtml(index, 'image', 'Caminho da imagem', step.image || '', 'text') +
      stepUploadHtml(index, 'image', 'Enviar imagem deste bloco', step._imageFile, 'image/*') +
      stepFieldHtml(index, 'title', 'Titulo da imagem', step.title || '', 'text') +
      stepFieldHtml(index, 'width', 'Largura da imagem', valueOrDefault(step.width, 0.82), 'number', '0.01') +
      stepFieldHtml(index, 'height', 'Altura da imagem', valueOrDefault(step.height, 0.56), 'number', '0.01') +
      stepFieldHtml(index, 'x', 'Posicao X', valueOrDefault(step.x, 0), 'number', '0.01') +
      stepFieldHtml(index, 'y', 'Posicao Y', valueOrDefault(step.y, 0.05), 'number', '0.01') +
      stepFieldHtml(index, 'z', 'Posicao Z', valueOrDefault(step.z, 0.28), 'number', '0.01') +
      stepFieldHtml(index, 'bg', 'Cor do fundo da imagem', step.bg || '#ffffff', 'text') +
      stepFieldHtml(index, 'titleBg', 'Cor do fundo do titulo', step.titleBg || 'rgba(177,18,27,0.72)', 'text') +
      stepFieldHtml(index, 'titleColor', 'Cor do titulo', step.titleColor || '#ffffff', 'text') +
      stepFieldHtml(index, 'titleFont', 'Fonte do titulo', valueOrDefault(step.titleFont, 38), 'number') +
      stepFieldHtml(index, 'spinSpeed', 'Velocidade do giro', valueOrDefault(step.spinSpeed, 42), 'number') +
      stepFieldHtml(index, 'floatAmount', 'Intensidade da flutuacao', valueOrDefault(step.floatAmount, 0.06), 'number', '0.01') +
      stepCheckboxGroupHtml(index, 'interactions', 'Interacoes da imagem', step.interactions || ['float'], IMAGE_INTERACTION_OPTIONS);
  } else if (type === 'carousel3d') {
    step.items = Array.isArray(step.items) ? step.items : [];
    details =
      stepFieldHtml(index, 'title', 'Titulo do carrossel', step.title || '', 'text') +
      stepFieldHtml(index, 'titleBg', 'Cor do fundo do titulo do carrossel', step.titleBg || 'rgba(177,18,27,0.72)', 'text') +
      stepFieldHtml(index, 'titleColor', 'Cor do titulo do carrossel', step.titleColor || '#ffffff', 'text') +
      stepFieldHtml(index, 'titleFont', 'Tamanho da fonte do titulo do carrossel', valueOrDefault(step.titleFont, 50), 'number') +
      stepFieldHtml(index, 'radius', 'Raio do carrossel', valueOrDefault(step.radius, 0.82), 'number', '0.01') +
      stepFieldHtml(index, 'speed', 'Velocidade de giro', valueOrDefault(step.speed, 18), 'number') +
      stepCheckboxHtml(index, 'focusAnimation', 'Animacao destaque: gira rapido e da zoom no item', step.focusAnimation) +
      stepFieldHtml(index, 'focusScale', 'Zoom do item em destaque', valueOrDefault(step.focusScale, 2.15), 'number', '0.01') +
      stepFieldHtml(index, 'focusY', 'Altura do item em destaque', valueOrDefault(step.focusY, 0.04), 'number', '0.01') +
      stepFieldHtml(index, 'focusZ', 'Distancia frontal do destaque', valueOrDefault(step.focusZ, 0.72), 'number', '0.01') +
      stepFieldHtml(index, 'focusSpinDuration', 'Tempo do giro rapido', valueOrDefault(step.focusSpinDuration, 1200), 'number') +
      stepFieldHtml(index, 'focusHoldDuration', 'Tempo parado no item', valueOrDefault(step.focusHoldDuration, 900), 'number') +
      stepFieldHtml(index, 'itemWidth', 'Largura dos cards', valueOrDefault(step.itemWidth, 0.52), 'number', '0.01') +
      stepFieldHtml(index, 'itemHeight', 'Altura dos cards', valueOrDefault(step.itemHeight, 0.68), 'number', '0.01') +
      stepFieldHtml(index, 'cardBg', 'Cor do fundo das imagens', step.cardBg || '#ffffff', 'text') +
      stepFieldHtml(index, 'itemTitleBg', 'Cor do fundo das legendas', step.itemTitleBg || 'rgba(177,18,27,0.72)', 'text') +
      stepFieldHtml(index, 'itemTitleColor', 'Cor das legendas', step.itemTitleColor || '#ffffff', 'text') +
      stepFieldHtml(index, 'itemTitleFont', 'Tamanho da fonte das legendas', valueOrDefault(step.itemTitleFont, 38), 'number') +
      stepFieldHtml(index, 'modelSize', 'Tamanho dos modelos 3D', valueOrDefault(step.modelSize, 0.46), 'number', '0.01') +
      stepFieldHtml(index, 'y', 'Posicao Y do carrossel', valueOrDefault(step.y, 0.05), 'number', '0.01') +
      '<div class="field full"><h3>Itens do carrossel</h3></div>' +
      '<div class="collection-list full">' + stepItemsHtml(step, index) + '</div>' +
      '<div class="editor-actions full">' +
        '<button type="button" data-add-step-item="' + index + '">Adicionar item</button>' +
      '</div>';
  } else if (type === 'model3d') {
    details =
      stepFieldHtml(index, 'model', 'Caminho do modelo desta etapa', step.model || '', 'text') +
      stepUploadHtml(index, 'model', 'Enviar modelo 3D deste bloco', step._modelFile, '.glb,.gltf,model/gltf-binary,model/gltf+json') +
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
        stepCheckboxHtml(index, 'scratchEffect', 'Raspadinha interativa antes do bloco', step.scratchEffect) +
        stepFieldHtml(index, 'stepTitle', 'Titulo do bloco', step.stepTitle || '', 'text') +
        stepFieldHtml(index, 'stepTitleBg', 'Cor do fundo do titulo do bloco', step.stepTitleBg || 'rgba(177,18,27,0.72)', 'text') +
        stepFieldHtml(index, 'stepTitleColor', 'Cor do titulo do bloco', step.stepTitleColor || '#ffffff', 'text') +
        stepFieldHtml(index, 'stepTitleFont', 'Fonte do titulo do bloco', valueOrDefault(step.stepTitleFont, 64), 'number') +
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

function stepCheckboxHtml(index, field, label, checked) {
  return (
    '<div class="field full">' +
      '<label class="checkbox-option">' +
        '<input type="checkbox" data-step-index="' + index + '" data-step-field="' + field + '"' + (checked ? ' checked' : '') + ' />' +
        '<span>' + escapeHtml(label) + '</span>' +
      '</label>' +
    '</div>'
  );
}

function valueOrDefault(value, fallback) {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function defaultDurationForStep(type) {
  if (type === 'logoText') return 1600;
  if (type === 'scanner') return 4200;
  if (type === 'words') return 11200;
  if (type === 'phrase') return 1800;
  if (type === 'carousel3d') return 0;
  if (type === 'image') return 0;
  return 0;
}

function defaultStep(type, order) {
  if (type === 'logoText') {
    return {
      type: 'logoText',
      order: order,
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 1600,
      text: '',
      x: 0,
      y: 0.72,
      width: 1.45,
      height: 0.24,
      font: 44
    };
  }

  if (type === 'scanner') {
    return {
      type: 'scanner',
      order: order,
      stepTitle: '',
      scratchEffect: false,
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
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 11200,
      words: [],
      animation: 'vortex',
      layout: 'circle',
      backdropEffect: false,
      fireflyEffect: false
    };
  }

  if (type === 'phrase') {
    return {
      type: 'phrase',
      order: order,
      stepTitle: '',
      scratchEffect: false,
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
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 0,
      actions: ['collection', 'video', 'site'],
      cta: 'veja mais informacoes'
    };
  }

  if (type === 'image') {
    return {
      type: 'image',
      order: order,
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 0,
      image: '',
      title: '',
      width: 0.82,
      height: 0.56,
      x: 0,
      y: 0.05,
      z: 0.28,
      bg: '#ffffff',
      titleBg: 'rgba(177,18,27,0.72)',
      titleColor: '#ffffff',
      titleFont: 38,
      interactions: ['float'],
      spinSpeed: 42,
      floatAmount: 0.06
    };
  }

  if (type === 'carousel3d') {
    return {
      type: 'carousel3d',
      order: order,
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 0,
      title: '',
      titleBg: 'rgba(177,18,27,0.72)',
      titleColor: '#ffffff',
      titleFont: 50,
      radius: 0.82,
      speed: 18,
      focusAnimation: false,
      focusScale: 2.15,
      focusY: 0.04,
      focusZ: 0.72,
      focusSpinDuration: 1200,
      focusHoldDuration: 900,
      itemWidth: 0.52,
      itemHeight: 0.68,
      cardBg: '#ffffff',
      itemTitleBg: 'rgba(177,18,27,0.72)',
      itemTitleColor: '#ffffff',
      itemTitleFont: 38,
      modelSize: 0.46,
      y: 0.05
    };
  }

  if (type === 'collection') {
    return {
      type: 'collection',
      order: order,
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 0,
      cta: '',
      items: []
    };
  }

  if (type === 'video') {
    return {
      type: 'video',
      order: order,
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 0,
      cta: '',
      video: ''
    };
  }

  if (type === 'site') {
    return {
      type: 'site',
      order: order,
      stepTitle: '',
      scratchEffect: false,
      delay: 0,
      duration: 0,
      cta: '',
      site: ''
    };
  }

  if (type === 'model3d') {
    return {
      type: 'model3d',
      order: order,
      stepTitle: '',
      scratchEffect: false,
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
    stepTitle: '',
    scratchEffect: false,
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
        animation: point.wordAnimation || 'vortex',
        layout: point.wordLayout || 'circle',
        backdropEffect: !!point.wordBackdropEffect,
        fireflyEffect: !!point.wordFireflyEffect
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
        animation: point.wordAnimation || 'vortex',
        layout: point.wordLayout || 'circle',
        backdropEffect: !!point.wordBackdropEffect,
        fireflyEffect: !!point.wordFireflyEffect
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

  if (feature === 'image') {
    return [
      {
        type: 'image',
        order: 1,
        delay: 0,
        duration: Number(point.imageDuration || 0),
        image: point.image || '',
        title: point.imageTitle || '',
        width: Number(point.imageWidth || 0.82),
        height: Number(point.imageHeight || 0.56),
        x: Number(point.imageX || 0),
        y: Number(point.imageY || 0.05),
        z: Number(point.imageZ || 0.28),
        bg: point.imageBg || '#ffffff',
        titleBg: point.imageTitleBg || 'rgba(177,18,27,0.72)',
        titleColor: point.imageTitleColor || '#ffffff',
        titleFont: Number(point.imageTitleFont || 38),
        interactions: Array.isArray(point.imageInteractions) ? point.imageInteractions : ['float'],
        spinSpeed: Number(point.imageSpinSpeed || 42),
        floatAmount: Number(point.imageFloatAmount || 0.06)
      }
    ];
  }

  if (feature === 'carousel3d') {
    return [
      {
        type: 'carousel3d',
        order: 1,
        delay: 0,
        duration: Number(point.carouselDuration || 0),
        title: point.carouselTitle || '',
        titleBg: point.carouselTitleBg || 'rgba(177,18,27,0.72)',
        titleColor: point.carouselTitleColor || '#ffffff',
        titleFont: Number(point.carouselTitleFont || 50),
        radius: Number(point.carouselRadius || 0.82),
        speed: Number(point.carouselSpeed || 18),
        focusAnimation: !!point.carouselFocusAnimation,
        itemWidth: Number(point.carouselItemWidth || 0.52),
        itemHeight: Number(point.carouselItemHeight || 0.68),
        cardBg: point.carouselCardBg || '#ffffff',
        itemTitleBg: point.carouselItemTitleBg || 'rgba(177,18,27,0.72)',
        itemTitleColor: point.carouselItemTitleColor || '#ffffff',
        itemTitleFont: Number(point.carouselItemTitleFont || 38),
        modelSize: Number(point.carouselModelSize || 0.46),
        y: Number(point.carouselY || 0.05),
        items: normalizeCollectionForSave(point.collection)
      }
    ];
  }

  if (feature === 'collection') {
    return [
      {
        type: 'collection',
        order: 1,
        delay: 0,
        duration: 0,
        cta: point.cta || '',
        items: normalizeCollectionForSave(point.collection)
      }
    ];
  }

  if (feature === 'video') {
    return [
      {
        type: 'video',
        order: 1,
        delay: 0,
        duration: 0,
        cta: point.cta || '',
        video: point.video || ''
      }
    ];
  }

  if (feature === 'site') {
    return [
      {
        type: 'site',
        order: 1,
        delay: 0,
        duration: 0,
        cta: point.cta || '',
        site: point.site || ''
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

function normalizeCollectionForEditor(collection) {
  return (Array.isArray(collection) ? collection : []).map(function (item) {
    if (typeof item === 'string') {
      return { name: 'Item', title: '', image: item, model: '', modelScale: '' };
    }

    return Object.assign({
      name: 'Item',
      title: '',
      image: '',
      model: '',
      modelScale: ''
    }, item || {});
  });
}

function normalizeStepsForEditor(steps) {
  return (Array.isArray(steps) ? steps : [])
    .map(function (step, index) {
      var clean = Object.assign(defaultStep(step.type || 'scanner', index + 1), step);
      clean.order = Number(clean.order || index + 1);
      clean.delay = Number(clean.delay || 0);
      clean.duration = Number(valueOrDefault(clean.duration, defaultDurationForStep(clean.type)));
      clean.scratchEffect = clean.scratchEffect === true || clean.scratchEffect === 'true' || clean.scratchEffect === 1 || clean.scratchEffect === '1';
      if (clean.type === 'words') {
        clean.words = Array.isArray(clean.words) ? clean.words : String(clean.words || '').split(/\n|,/).map(function (word) {
          return word.trim();
        }).filter(Boolean);
        clean.backdropEffect = clean.backdropEffect === true || clean.backdropEffect === 'true' || clean.backdropEffect === 1 || clean.backdropEffect === '1';
        clean.fireflyEffect = clean.fireflyEffect === true || clean.fireflyEffect === 'true' || clean.fireflyEffect === 1 || clean.fireflyEffect === '1';
      }
      if (clean.type === 'actions') {
        clean.actions = Array.isArray(clean.actions) ? clean.actions : String(clean.actions || '').split(/\n|,/).map(function (action) {
          return action.trim();
        }).filter(Boolean);
      }
      if (clean.type === 'collection' || clean.type === 'carousel3d') {
        clean.items = normalizeCollectionForEditor(clean.items || []);
      }
      if (clean.type === 'carousel3d') {
        clean.focusAnimation = clean.focusAnimation === true || clean.focusAnimation === 'true' || clean.focusAnimation === 1 || clean.focusAnimation === '1';
      }
      return clean;
    })
    .sort(function (a, b) { return a.order - b.order; });
}

function bindEditorEvents(point) {
  document.querySelectorAll('[data-point-field]').forEach(function (input) {
    var eventName = input.tagName === 'SELECT' || input.type === 'checkbox' ? 'change' : 'input';
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

      if (input.type === 'checkbox') {
        point[field] = input.checked;
      } else if (field === 'keywords') {
        point.keywords = input.value.split(/\n|,/).map(function (word) { return word.trim(); }).filter(Boolean);
      } else if (
        field === 'targetIndex' ||
        field === 'trailStep' ||
        field === 'imageWidth' ||
        field === 'imageHeight' ||
        field === 'imageX' ||
        field === 'imageY' ||
        field === 'imageZ' ||
        field === 'imageTitleFont' ||
        field === 'imageSpinSpeed' ||
        field === 'imageFloatAmount' ||
        field === 'carouselRadius' ||
        field === 'carouselSpeed' ||
        field === 'carouselItemWidth' ||
        field === 'carouselItemHeight' ||
        field === 'carouselTitleFont' ||
        field === 'carouselItemTitleFont' ||
        field === 'carouselModelSize' ||
        field === 'carouselY'
      ) {
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

  document.querySelectorAll('[data-point-multi]').forEach(function (input) {
    input.addEventListener('change', function () {
      var field = input.getAttribute('data-point-multi');
      point[field] = Array.from(document.querySelectorAll('[data-point-multi="' + field + '"]:checked'))
        .map(function (item) { return item.value; });
    });
  });

  document.querySelectorAll('[data-step-field]').forEach(function (input) {
    var eventName = input.tagName === 'SELECT' || input.type === 'checkbox' ? 'change' : 'input';
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

      if (input.type === 'checkbox') {
        step[field] = input.checked;
      } else if (field === 'words') {
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
        field === 'z' ||
        field === 'width' ||
        field === 'height' ||
        field === 'floatAmount' ||
        field === 'font' ||
        field === 'stepTitleFont' ||
        field === 'wordFont' ||
        field === 'titleFont' ||
        field === 'itemTitleFont' ||
        field === 'radius' ||
        field === 'speed' ||
        field === 'itemWidth' ||
        field === 'itemHeight' ||
        field === 'modelSize' ||
        field === 'focusScale' ||
        field === 'focusY' ||
        field === 'focusZ' ||
        field === 'focusSpinDuration' ||
        field === 'focusHoldDuration' ||
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

  document.querySelectorAll('[data-step-multi]').forEach(function (input) {
    input.addEventListener('change', function () {
      var stepIndex = Number(input.getAttribute('data-step-index'));
      var field = input.getAttribute('data-step-multi');
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      step[field] = Array.from(document.querySelectorAll('[data-step-index="' + stepIndex + '"][data-step-multi="' + field + '"]:checked'))
        .map(function (item) { return item.value; });
    });
  });

  document.querySelectorAll('[data-step-file]').forEach(function (input) {
    input.addEventListener('change', function () {
      var stepIndex = Number(input.getAttribute('data-step-index'));
      var field = input.getAttribute('data-step-file');
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      var file = input.files[0] || null;
      if (field === 'video') step._videoFile = file;
      if (field === 'model') step._modelFile = file;
      if (field === 'image') step._imageFile = file;
      renderEditor();
    });
  });

  document.querySelectorAll('[data-step-item-field]').forEach(function (input) {
    input.addEventListener('input', function () {
      var itemEl = input.closest('[data-step-item-index]');
      var stepIndex = Number(itemEl.getAttribute('data-step-index'));
      var itemIndex = Number(itemEl.getAttribute('data-step-item-index'));
      var field = input.getAttribute('data-step-item-field');
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      step.items = normalizeCollectionForEditor(step.items || []);
      if (!step.items[itemIndex]) return;
      step.items[itemIndex][field] = input.value;
    });
  });

  document.querySelectorAll('[data-step-item-file]').forEach(function (input) {
    input.addEventListener('change', function () {
      var itemEl = input.closest('[data-step-item-index]');
      var stepIndex = Number(itemEl.getAttribute('data-step-index'));
      var itemIndex = Number(itemEl.getAttribute('data-step-item-index'));
      var field = input.getAttribute('data-step-item-file');
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      step.items = normalizeCollectionForEditor(step.items || []);
      if (!step.items[itemIndex]) return;
      var file = input.files[0] || null;
      if (field === 'image') step.items[itemIndex]._imageFile = file;
      if (field === 'model') step.items[itemIndex]._modelFile = file;
      renderEditor();
    });
  });

  document.querySelectorAll('[data-remove-step-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var itemEl = btn.closest('[data-step-item-index]');
      var stepIndex = Number(itemEl.getAttribute('data-step-index'));
      var itemIndex = Number(btn.getAttribute('data-remove-step-item'));
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      step.items = normalizeCollectionForEditor(step.items || []);
      step.items.splice(itemIndex, 1);
      renderEditor();
    });
  });

  document.querySelectorAll('[data-add-step-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stepIndex = Number(btn.getAttribute('data-add-step-item'));
      point.steps = normalizeStepsForEditor(point.steps || []);
      var step = point.steps[stepIndex];
      if (!step) return;

      step.items = normalizeCollectionForEditor(step.items || []);
      step.items.push({ name: 'Novo item', title: '', image: '', model: '', modelScale: '' });
      renderEditor();
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

  var addLogoTextStepBtn = document.getElementById('add-logo-text-step-btn');
  if (addLogoTextStepBtn) {
    addLogoTextStepBtn.addEventListener('click', function () {
      point.steps = normalizeStepsForEditor(point.steps || []);
      point.steps.forEach(function (step) {
        step.order = Number(step.order || 0) + 1;
      });
      point.steps.unshift(defaultStep('logoText', 1));
      point.steps = normalizeStepsForEditor(point.steps);
      renderEditor();
    });
  }

  var addCarouselStepBtn = document.getElementById('add-carousel-step-btn');
  if (addCarouselStepBtn) {
    addCarouselStepBtn.addEventListener('click', function () {
      point.steps = normalizeStepsForEditor(point.steps || []);
      point.steps.push(defaultStep('carousel3d', point.steps.length + 1));
      renderEditor();
    });
  }

  var addImageStepBtn = document.getElementById('add-image-step-btn');
  if (addImageStepBtn) {
    addImageStepBtn.addEventListener('click', function () {
      point.steps = normalizeStepsForEditor(point.steps || []);
      point.steps.push(defaultStep('image', point.steps.length + 1));
      renderEditor();
    });
  }

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

  var imageFile = document.getElementById('image-file');
  if (imageFile) {
    imageFile.addEventListener('change', function () {
      point._imageFile = imageFile.files[0] || null;
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
      point.collection.push({ name: 'Novo item', title: '', image: '', model: '', modelScale: '' });
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
    setStatus('Arquivos salvos. Recompile targets/targets.mind apenas se voce trocou alguma imagem target do scan.', 'ok');
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

    if ((feature === 'image' || feature === 'custom') && point._imageFile) {
      point.image = await writeUploadedFile(point._imageFile, ['assets', 'images', panelSlug], 'image-' + pointSlug);
      point._imageFile = null;
    }

    if ((feature === 'model3d' || feature === 'custom') && point._modelFile) {
      point.model = await writeUploadedFile(point._modelFile, ['assets', 'models', panelSlug], 'model-' + pointSlug);
      point._modelFile = null;
    }

    if (feature === 'custom' && Array.isArray(point.steps)) {
      point.steps = normalizeStepsForEditor(point.steps);
      for (var s = 0; s < point.steps.length; s++) {
        var step = point.steps[s];
        var stepSlug = slugify((s + 1) + '-' + (step.type || 'bloco'));

        if (step._videoFile) {
          step.video = await writeUploadedFile(step._videoFile, ['videos', panelSlug], 'video-' + pointSlug + '-' + stepSlug);
          step._videoFile = null;
        }

        if (step._modelFile) {
          step.model = await writeUploadedFile(step._modelFile, ['assets', 'models', panelSlug], 'model-' + pointSlug + '-' + stepSlug);
          step._modelFile = null;
        }

        if (step._imageFile) {
          step.image = await writeUploadedFile(step._imageFile, ['assets', 'images', panelSlug], 'image-' + pointSlug + '-' + stepSlug);
          step._imageFile = null;
        }

        if (step.type === 'collection' || step.type === 'carousel3d') {
          step.items = normalizeCollectionForEditor(step.items || []);
          for (var si = 0; si < step.items.length; si++) {
            var stepItem = step.items[si];
            var stepItemSlug = slugify((si + 1) + '-' + (stepItem.name || 'item'));

            if (stepItem._imageFile) {
              stepItem.image = await writeUploadedFile(stepItem._imageFile, ['assets', 'collections', panelSlug], pointSlug + '-' + stepSlug + '-' + stepItemSlug);
              stepItem._imageFile = null;
            }

            if (stepItem._modelFile) {
              stepItem.model = await writeUploadedFile(stepItem._modelFile, ['assets', 'models', panelSlug], 'model-' + pointSlug + '-' + stepSlug + '-' + stepItemSlug);
              stepItem._modelFile = null;
            }
          }
        }
      }
    }

    if (feature !== 'collection' && feature !== 'carousel3d' && feature !== 'menu' && feature !== 'custom') continue;

    var collection = Array.isArray(point.collection) ? point.collection : [];
    for (var j = 0; j < collection.length; j++) {
      var item = collection[j];
      var itemSlug = slugify((j + 1) + '-' + (item.name || 'item'));

      if (item._imageFile) {
        item.image = await writeUploadedFile(item._imageFile, ['assets', 'collections', panelSlug], itemSlug);
        item._imageFile = null;
      }

      if (item._modelFile) {
        item.model = await writeUploadedFile(item._modelFile, ['assets', 'models', panelSlug], 'model-' + itemSlug);
        item._modelFile = null;
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

function normalizeCollectionForSave(collection) {
  return (Array.isArray(collection) ? collection : []).map(function (item) {
    return {
      name: item.name || 'Item',
      title: item.title || '',
      image: item.image || '',
      model: item.model || '',
      modelScale: item.modelScale || ''
    };
  });
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
    var customSteps = normalizeStepsForEditor(point.steps && point.steps.length ? point.steps : legacyStepsFromPoint(point));
    var firstVideoStep = customSteps.filter(function (step) { return step.type === 'video' && step.video; })[0];
    var firstSiteStep = customSteps.filter(function (step) { return step.type === 'site' && step.site; })[0];
    var firstModelStep = customSteps.filter(function (step) { return step.type === 'model3d' && step.model; })[0];
    var firstCollectionStep = customSteps.filter(function (step) {
      return step.type === 'collection' && Array.isArray(step.items) && step.items.length;
    })[0];
    var firstCarouselStep = customSteps.filter(function (step) {
      return step.type === 'carousel3d' && Array.isArray(step.items) && step.items.length;
    })[0];

    clean.steps = normalizeStepsForSave(customSteps);
    clean.video = (firstVideoStep && firstVideoStep.video) || point.video || '';
    clean.site = (firstSiteStep && firstSiteStep.site) || point.site || '';
    clean.model = (firstModelStep && firstModelStep.model) || point.model || '';
    clean.modelScale = point.modelScale || '0.55 0.55 0.55';
    clean.spinSpeed = Number(point.spinSpeed || 45);
    clean.collection = normalizeCollectionForSave(
      (firstCollectionStep && firstCollectionStep.items) ||
      (firstCarouselStep && firstCarouselStep.items) ||
      point.collection
    );
  } else if (feature === 'info' || feature === 'menu') {
    clean.phrase = point.phrase || '';
    clean.introTop = point.introTop || '';
    clean.introBottom = point.introBottom || '';
    clean.keywords = Array.isArray(point.keywords) ? point.keywords : [];
    clean.wordAnimation = point.wordAnimation || 'vortex';
    clean.wordLayout = point.wordLayout || 'circle';
    clean.wordBackdropEffect = !!point.wordBackdropEffect;
    clean.wordFireflyEffect = !!point.wordFireflyEffect;
    if (feature === 'menu') {
      clean.video = point.video || '';
      clean.site = point.site || '';
      clean.collection = normalizeCollectionForSave(point.collection);
    }
  } else if (feature === 'video') {
    clean.video = point.video || '';
  } else if (feature === 'site') {
    clean.site = point.site || '';
  } else if (feature === 'image') {
    clean.image = point.image || '';
    clean.imageTitle = point.imageTitle || '';
    clean.imageWidth = Number(point.imageWidth || 0.82);
    clean.imageHeight = Number(point.imageHeight || 0.56);
    clean.imageX = Number(point.imageX || 0);
    clean.imageY = Number(point.imageY || 0.05);
    clean.imageZ = Number(point.imageZ || 0.28);
    clean.imageBg = point.imageBg || '#ffffff';
    clean.imageTitleBg = point.imageTitleBg || 'rgba(177,18,27,0.72)';
    clean.imageTitleColor = point.imageTitleColor || '#ffffff';
    clean.imageTitleFont = Number(point.imageTitleFont || 38);
    clean.imageInteractions = Array.isArray(point.imageInteractions) ? point.imageInteractions : ['float'];
    clean.imageSpinSpeed = Number(point.imageSpinSpeed || 42);
    clean.imageFloatAmount = Number(point.imageFloatAmount || 0.06);
  } else if (feature === 'collection') {
    clean.collection = normalizeCollectionForSave(point.collection);
  } else if (feature === 'carousel3d') {
    clean.carouselTitle = point.carouselTitle || '';
    clean.carouselTitleBg = point.carouselTitleBg || 'rgba(177,18,27,0.72)';
    clean.carouselTitleColor = point.carouselTitleColor || '#ffffff';
    clean.carouselTitleFont = Number(point.carouselTitleFont || 50);
    clean.carouselRadius = Number(point.carouselRadius || 0.82);
    clean.carouselSpeed = Number(point.carouselSpeed || 18);
    clean.carouselFocusAnimation = !!point.carouselFocusAnimation;
    clean.carouselItemWidth = Number(point.carouselItemWidth || 0.52);
    clean.carouselItemHeight = Number(point.carouselItemHeight || 0.68);
    clean.carouselCardBg = point.carouselCardBg || '#ffffff';
    clean.carouselItemTitleBg = point.carouselItemTitleBg || 'rgba(177,18,27,0.72)';
    clean.carouselItemTitleColor = point.carouselItemTitleColor || '#ffffff';
    clean.carouselItemTitleFont = Number(point.carouselItemTitleFont || 38);
    clean.carouselModelSize = Number(point.carouselModelSize || 0.46);
    clean.carouselY = Number(point.carouselY || 0.05);
    clean.collection = normalizeCollectionForSave(point.collection);
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
      stepTitle: step.stepTitle || '',
      stepTitleBg: step.stepTitleBg || 'rgba(177,18,27,0.72)',
      stepTitleColor: step.stepTitleColor || '#ffffff',
      stepTitleFont: Number(valueOrDefault(step.stepTitleFont, 64)),
      scratchEffect: !!step.scratchEffect,
      delay: Number(step.delay || 0),
      duration: Number(valueOrDefault(step.duration, defaultDurationForStep(type)))
    };

    if (type === 'logoText') {
      clean.text = step.text || '';
      clean.x = Number(valueOrDefault(step.x, 0));
      clean.y = Number(valueOrDefault(step.y, 0.72));
      clean.width = Number(valueOrDefault(step.width, 1.45));
      clean.height = Number(valueOrDefault(step.height, 0.24));
      clean.bg = step.bg || 'rgba(177,18,27,0.72)';
      clean.color = step.color || '#ffffff';
      clean.font = Number(valueOrDefault(step.font, 44));
    } else if (type === 'scanner') {
      clean.introTop = step.introTop || '';
      clean.introBottom = step.introBottom || '';
      clean.topY = Number(valueOrDefault(step.topY, 0.58));
      clean.bottomY = Number(valueOrDefault(step.bottomY, -0.58));
    } else if (type === 'words') {
      clean.words = Array.isArray(step.words) ? step.words : [];
      clean.animation = step.animation || 'vortex';
      clean.layout = step.layout || 'circle';
      clean.backdropEffect = !!step.backdropEffect;
      clean.fireflyEffect = !!step.fireflyEffect;
      clean.wordBg = step.wordBg || 'rgba(177,18,27,0.72)';
      clean.wordColor = step.wordColor || '#ffffff';
      clean.wordFont = Number(valueOrDefault(step.wordFont, 56));
    } else if (type === 'phrase') {
      clean.text = step.text || '';
      clean.x = Number(valueOrDefault(step.x, 0));
      clean.y = Number(valueOrDefault(step.y, -0.46));
      clean.width = Number(valueOrDefault(step.width, 1.05));
    } else if (type === 'actions') {
      clean.actions = Array.isArray(step.actions) && step.actions.length ? step.actions : ['collection', 'video', 'site'];
      clean.cta = step.cta || '';
    } else if (type === 'collection') {
      clean.cta = step.cta || '';
      clean.items = normalizeCollectionForSave(step.items);
    } else if (type === 'video') {
      clean.cta = step.cta || '';
      clean.video = step.video || '';
    } else if (type === 'site') {
      clean.cta = step.cta || '';
      clean.site = step.site || '';
    } else if (type === 'image') {
      clean.image = step.image || '';
      clean.title = step.title || '';
      clean.width = Number(valueOrDefault(step.width, 0.82));
      clean.height = Number(valueOrDefault(step.height, 0.56));
      clean.x = Number(valueOrDefault(step.x, 0));
      clean.y = Number(valueOrDefault(step.y, 0.05));
      clean.z = Number(valueOrDefault(step.z, 0.28));
      clean.bg = step.bg || '#ffffff';
      clean.titleBg = step.titleBg || 'rgba(177,18,27,0.72)';
      clean.titleColor = step.titleColor || '#ffffff';
      clean.titleFont = Number(valueOrDefault(step.titleFont, 38));
      clean.interactions = Array.isArray(step.interactions) ? step.interactions : ['float'];
      clean.spinSpeed = Number(valueOrDefault(step.spinSpeed, 42));
      clean.floatAmount = Number(valueOrDefault(step.floatAmount, 0.06));
    } else if (type === 'carousel3d') {
      clean.title = step.title || '';
      clean.titleBg = step.titleBg || 'rgba(177,18,27,0.72)';
      clean.titleColor = step.titleColor || '#ffffff';
      clean.titleFont = Number(valueOrDefault(step.titleFont, 50));
      clean.radius = Number(valueOrDefault(step.radius, 0.82));
      clean.speed = Number(valueOrDefault(step.speed, 18));
      clean.focusAnimation = !!step.focusAnimation;
      clean.focusScale = Number(valueOrDefault(step.focusScale, 2.15));
      clean.focusY = Number(valueOrDefault(step.focusY, 0.04));
      clean.focusZ = Number(valueOrDefault(step.focusZ, 0.72));
      clean.focusSpinDuration = Number(valueOrDefault(step.focusSpinDuration, 1200));
      clean.focusHoldDuration = Number(valueOrDefault(step.focusHoldDuration, 900));
      clean.itemWidth = Number(valueOrDefault(step.itemWidth, 0.52));
      clean.itemHeight = Number(valueOrDefault(step.itemHeight, 0.68));
      clean.cardBg = step.cardBg || '#ffffff';
      clean.itemTitleBg = step.itemTitleBg || 'rgba(177,18,27,0.72)';
      clean.itemTitleColor = step.itemTitleColor || '#ffffff';
      clean.itemTitleFont = Number(valueOrDefault(step.itemTitleFont, 38));
      clean.modelSize = Number(valueOrDefault(step.modelSize, 0.46));
      clean.y = Number(valueOrDefault(step.y, 0.05));
      clean.items = normalizeCollectionForSave(step.items);
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
