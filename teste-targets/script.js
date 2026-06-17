'use strict';

var arStarted = false;
var visibleTargets = new Set();
var sceneEl = document.getElementById('ar-scene');
var statusTextEl = document.getElementById('status-text');

function setStatus(message) {
  if (statusTextEl) statusTextEl.textContent = message;
}

function refreshStatus() {
  if (!visibleTargets.size) {
    setStatus('Aponte a camera para um dos 4 image targets.');
    return;
  }

  var detected = Array.from(visibleTargets)
    .sort(function (a, b) { return a - b; })
    .map(function (index) { return (index + 1) + ' detectado'; });

  setStatus(detected.join(' | '));
}

function registerTargetEvents() {
  var targets = sceneEl.querySelectorAll('[mindar-image-target]');

  targets.forEach(function (targetEl) {
    var attr = targetEl.getAttribute('mindar-image-target');
    var targetIndex = Number(attr && attr.targetIndex);

    targetEl.addEventListener('targetFound', function () {
      visibleTargets.add(targetIndex);
      refreshStatus();
    });

    targetEl.addEventListener('targetLost', function () {
      visibleTargets.delete(targetIndex);
      refreshStatus();
    });
  });
}

function startAR() {
  if (arStarted) return;
  arStarted = true;

  var arSystem = sceneEl.systems['mindar-image-system'];
  if (!arSystem) {
    setStatus('MindAR ainda nao carregou. Recarregue a pagina.');
    return;
  }

  registerTargetEvents();

  sceneEl.addEventListener('arReady', function () {
    setStatus('Camera pronta. Teste os 4 image targets.');
  }, { once: true });

  sceneEl.addEventListener('arError', function () {
    setStatus('Erro ao iniciar a camera. Verifique permissao e HTTPS/localhost.');
  }, { once: true });

  arSystem.start();
}

document.addEventListener('DOMContentLoaded', function () {
  if (!sceneEl) return;

  var attempts = 0;
  var maxAttempts = 50;

  function tryStart() {
    if (sceneEl.systems['mindar-image-system']) {
      startAR();
      return;
    }

    attempts += 1;
    if (attempts >= maxAttempts) {
      setStatus('Nao foi possivel carregar o MindAR nesta pagina.');
      return;
    }

    setTimeout(tryStart, 100);
  }

  tryStart();
});
