import { createId, escapeHTML, storage } from './utils.js';

const taskId = new URLSearchParams(window.location.search).get('task');
const TASKS_KEY = 'organizate_tasks';
const BOARDS_KEY = 'organizate_boards';

const boardTitle = document.querySelector('[data-board-title]');
const boardCanvas = document.querySelector('[data-board-canvas]');
const boardDrawing = document.querySelector('[data-board-drawing]');
const drawColorInput = document.querySelector('[data-draw-color]');
const drawSizeInput = document.querySelector('[data-draw-size]');
const toolButtons = document.querySelectorAll('[data-tool]');
const toolImageInput = document.querySelector('[data-tool-image]');
const toolPanels = document.querySelectorAll('[data-panel]');
const createButtons = document.querySelectorAll('[data-create-item]');

const noteTitleInput = document.querySelector('[data-note-title]');
const noteBgInput = document.querySelector('[data-note-bg]');
const textBodyInput = document.querySelector('[data-text-body]');
const linkTitleInput = document.querySelector('[data-link-title]');
const linkUrlInput = document.querySelector('[data-link-url]');

const textFontInput = document.querySelector('[data-text-font]');
const textSizeInput = document.querySelector('[data-text-size]');
const textColorInput = document.querySelector('[data-text-color]');
const styleToggles = document.querySelectorAll('[data-style-toggle]');

let boards = storage.get(BOARDS_KEY, {});
let activeTool = 'select';
let selectedItemId = null;
let draggingItem = null;
let resizingItem = null;
let dragOffset = { x: 0, y: 0 };
let resizeStart = null;

let isDrawing = false;
let lastPoint = null;

function loadTaskName() {
  const tasks = storage.get(TASKS_KEY, []);
  const task = tasks.find((item) => item.id === taskId);
  if (boardTitle) {
    boardTitle.textContent = task ? `Pizarra: ${task.title}` : 'Pizarra colaborativa';
  }
}

function saveBoards() {
  storage.set(BOARDS_KEY, boards);
}

function getBoard() {
  const key = taskId || 'global';
  if (!boards[key]) {
    boards[key] = { items: [], drawings: [] };
  }
  normalizeBoard(boards[key]);
  return boards[key];
}

function normalizeBoard(board) {
  board.items = (board.items || []).map((item, index) => {
    const fallbackW = item.type === 'text' ? 260 : item.type === 'link' ? 240 : item.type === 'image' ? 260 : 220;
    const fallbackH = item.type === 'text' ? 90 : item.type === 'link' ? 90 : item.type === 'image' ? 190 : 160;
    return {
      x: 120 + index * 16,
      y: 120 + index * 16,
      w: fallbackW,
      h: fallbackH,
      textStyle: getDefaultTextStyle(),
      ...item,
      x: Number.isFinite(item.x) ? item.x : 120 + index * 16,
      y: Number.isFinite(item.y) ? item.y : 120 + index * 16,
      w: Number.isFinite(item.w) ? item.w : fallbackW,
      h: Number.isFinite(item.h) ? item.h : fallbackH,
      textStyle: { ...getDefaultTextStyle(), ...(item.textStyle || {}) },
    };
  });
  board.drawings = Array.isArray(board.drawings) ? board.drawings : [];
}

function getDefaultTextStyle() {
  return {
    fontFamily: "'Times New Roman', serif",
    fontSize: 20,
    color: '#3b3b3b',
    bold: false,
    italic: false,
    underline: false,
  };
}

function getSelectedItem() {
  if (!selectedItemId) return null;
  return getBoard().items.find((item) => item.id === selectedItemId) || null;
}

function showPanel(tool) {
  toolPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tool || panel.dataset.panel === 'typography');
  });
}

function applyTextStyle(el, style = getDefaultTextStyle()) {
  el.style.fontFamily = style.fontFamily;
  el.style.fontSize = `${style.fontSize}px`;
  el.style.color = style.color;
  el.style.fontWeight = style.bold ? '700' : '400';
  el.style.fontStyle = style.italic ? 'italic' : 'normal';
  el.style.textDecoration = style.underline ? 'underline' : 'none';
}

function syncStyleInputs(item) {
  if (!item || (item.type !== 'note' && item.type !== 'text')) {
    return;
  }
  const style = item.textStyle || getDefaultTextStyle();
  textFontInput.value = style.fontFamily;
  textSizeInput.value = style.fontSize;
  textColorInput.value = style.color;
  styleToggles.forEach((btn) => {
    btn.classList.toggle('active', Boolean(style[btn.dataset.styleToggle]));
  });
}


function refreshSelectionUI() {
  boardCanvas.querySelectorAll('.board-item').forEach((el) => {
    el.classList.toggle('selected', el.dataset.itemId === selectedItemId);
  });
}

function renderBoard() {
  if (!boardCanvas) return;
  boardCanvas.querySelectorAll('.board-item').forEach((el) => el.remove());

  const { items } = getBoard();
  items.forEach((item) => {
    const el = document.createElement('article');
    el.className = `board-item ${item.type}`;
    if (item.id === selectedItemId) el.classList.add('selected');
    el.dataset.itemId = item.id;
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;
    el.style.width = `${item.w}px`;
    el.style.height = `${item.h}px`;

    if (item.type === 'image') {
      el.innerHTML = `<img src="${item.src}" alt="${escapeHTML(item.title || 'Imagen')}" />`;
    } else if (item.type === 'link') {
      el.innerHTML = `<a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title || item.url)}</a>`;
    } else {
      if (item.type === 'note') {
        el.style.background = item.color || '#f0e766';
      }
      const content = document.createElement('div');
      content.className = 'board-item-content';
      content.contentEditable = 'true';
      content.dataset.itemText = item.id;
      content.textContent = item.body || '';
      applyTextStyle(content, item.textStyle || getDefaultTextStyle());
      el.appendChild(content);
    }

    const handle = document.createElement('span');
    handle.className = 'resize-handle';
    handle.dataset.resizeId = item.id;
    el.appendChild(handle);
    boardCanvas.appendChild(el);
  });

  drawAll();
}

function createItem(type, payload = {}) {
  const board = getBoard();
  const item = {
    id: createId(type),
    type,
    x: 150 + board.items.length * 18,
    y: 130 + board.items.length * 18,
    w: type === 'text' ? 260 : 220,
    h: type === 'text' ? 90 : 160,
    textStyle: getDefaultTextStyle(),
    ...payload,
  };
  board.items.push(item);
  selectedItemId = item.id;
  saveBoards();
  renderBoard();
  syncStyleInputs(item);
}

function setActiveTool(tool) {
  activeTool = tool;
  toolButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tool === tool));
  showPanel(tool);
  if (boardDrawing) {
    boardDrawing.style.pointerEvents = tool === 'draw' ? 'auto' : 'none';
    boardDrawing.style.cursor = tool === 'draw' ? 'crosshair' : 'default';
  }
}

function pointerDown(event) {
  if (event.target.closest('.board-toolbar, .board-mini-menu, .board-controls')) return;

  const resizeHandle = event.target.closest('.resize-handle');
  if (resizeHandle && activeTool === 'select') {
    const itemEl = resizeHandle.closest('.board-item');
    const item = getBoard().items.find((entry) => entry.id === itemEl.dataset.itemId);
    if (!item) return;
    selectedItemId = item.id;
    refreshSelectionUI();
    resizingItem = itemEl;
    resizeStart = {
      x: event.clientX,
      y: event.clientY,
      w: item.w,
      h: item.h,
    };
    return;
  }

  const card = event.target.closest('.board-item');
  if (!card || activeTool !== 'select') return;

  selectedItemId = card.dataset.itemId;
  refreshSelectionUI();
  syncStyleInputs(getSelectedItem());


  draggingItem = card;
  const rect = card.getBoundingClientRect();
  dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  card.classList.add('dragging');
}

function pointerMove(event) {
  const boardRect = boardCanvas.getBoundingClientRect();

  if (draggingItem) {
    const x = Math.max(0, event.clientX - boardRect.left - dragOffset.x);
    const y = Math.max(0, event.clientY - boardRect.top - dragOffset.y);
    draggingItem.style.left = `${x}px`;
    draggingItem.style.top = `${y}px`;
  }

  if (resizingItem && resizeStart) {
    const dx = event.clientX - resizeStart.x;
    const dy = event.clientY - resizeStart.y;
    const w = Math.max(90, resizeStart.w + dx);
    const h = Math.max(40, resizeStart.h + dy);
    resizingItem.style.width = `${w}px`;
    resizingItem.style.height = `${h}px`;
  }
}

function pointerUp() {
  if (draggingItem) {
    const item = getBoard().items.find((entry) => entry.id === draggingItem.dataset.itemId);
    if (item) {
      item.x = parseFloat(draggingItem.style.left);
      item.y = parseFloat(draggingItem.style.top);
      saveBoards();
    }
    draggingItem.classList.remove('dragging');
    draggingItem = null;
  }

  if (resizingItem) {
    const item = getBoard().items.find((entry) => entry.id === resizingItem.dataset.itemId);
    if (item) {
      item.w = parseFloat(resizingItem.style.width);
      item.h = parseFloat(resizingItem.style.height);
      saveBoards();
    }
    resizingItem = null;
    resizeStart = null;
  }
}

function handleTextInput(event) {
  const editable = event.target.closest('[data-item-text]');
  if (!editable) return;
  const item = getBoard().items.find((entry) => entry.id === editable.dataset.itemText);
  if (!item) return;
  item.body = editable.textContent;
  saveBoards();
}

function updateSelectedTextStyle(patch) {
  const item = getSelectedItem();
  if (!item || (item.type !== 'note' && item.type !== 'text')) return;
  item.textStyle = { ...(item.textStyle || getDefaultTextStyle()), ...patch };
  saveBoards();
  renderBoard();
  syncStyleInputs(item);
}

function resizeCanvas() {
  if (!boardDrawing || !boardCanvas) return;
  const rect = boardCanvas.getBoundingClientRect();
  boardDrawing.width = rect.width;
  boardDrawing.height = rect.height;
  drawAll();
}

function drawLine(start, end, color, size) {
  const ctx = boardDrawing.getContext('2d');
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function drawAll() {
  if (!boardDrawing) return;
  const ctx = boardDrawing.getContext('2d');
  ctx.clearRect(0, 0, boardDrawing.width, boardDrawing.height);
  getBoard().drawings.forEach((stroke) => {
    stroke.points.forEach((point, idx) => {
      if (idx === 0) return;
      drawLine(stroke.points[idx - 1], point, stroke.color, stroke.size);
    });
  });
}

function startDrawing(event) {
  if (activeTool !== 'draw') return;
  isDrawing = true;
  lastPoint = { x: event.offsetX, y: event.offsetY };
  getBoard().drawings.push({
    color: drawColorInput.value,
    size: parseInt(drawSizeInput.value, 10),
    points: [lastPoint],
  });
  saveBoards();
}

function drawingMove(event) {
  if (!isDrawing || activeTool !== 'draw') return;
  const point = { x: event.offsetX, y: event.offsetY };
  drawLine(lastPoint, point, drawColorInput.value, parseInt(drawSizeInput.value, 10));
  lastPoint = point;
  const stroke = getBoard().drawings.at(-1);
  if (stroke) {
    stroke.points.push(point);
    saveBoards();
  }
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

createButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.createItem;
    if (type === 'note') {
      createItem('note', {
        title: noteTitleInput.value.trim() || 'Post-it',
        body: noteTitleInput.value.trim() || 'Nuevo post-it',
        color: noteBgInput.value || '#f0e766',
      });
      setActiveTool('select');
      return;
    }
    if (type === 'text') {
      createItem('text', {
        body: textBodyInput.value.trim() || 'Texto plano',
      });
      setActiveTool('select');
      return;
    }
    if (type === 'link') {
      createItem('link', {
        title: linkTitleInput.value.trim() || 'Abrir link',
        url: linkUrlInput.value.trim() || 'https://',
        w: 240,
        h: 90,
      });
      setActiveTool('select');
    }
  });
});

toolButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
});

if (toolImageInput) {
  toolImageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      createItem('image', { src: reader.result, title: file.name, w: 260, h: 190 });
      setActiveTool('select');
    };
    reader.readAsDataURL(file);
  });
}

textFontInput?.addEventListener('change', () => updateSelectedTextStyle({ fontFamily: textFontInput.value }));
textSizeInput?.addEventListener('input', () => updateSelectedTextStyle({ fontSize: parseInt(textSizeInput.value, 10) || 20 }));
textColorInput?.addEventListener('input', () => updateSelectedTextStyle({ color: textColorInput.value }));

styleToggles.forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.styleToggle;
    const item = getSelectedItem();
    if (!item || (item.type !== 'note' && item.type !== 'text')) return;
    const current = item.textStyle || getDefaultTextStyle();
    updateSelectedTextStyle({ [key]: !current[key] });
  });
});

if (boardCanvas) {
  boardCanvas.addEventListener('pointerdown', pointerDown);
  boardCanvas.addEventListener('input', handleTextInput);
  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
}

if (boardDrawing) {
  boardDrawing.addEventListener('pointerdown', startDrawing);
  boardDrawing.addEventListener('pointermove', drawingMove);
  boardDrawing.addEventListener('pointerup', stopDrawing);
  boardDrawing.addEventListener('pointerleave', stopDrawing);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

loadTaskName();
setActiveTool('select');
renderBoard();
