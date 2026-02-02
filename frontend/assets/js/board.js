import { createId, escapeHTML, storage } from './utils.js';

const taskId = new URLSearchParams(window.location.search).get('task');
const TASKS_KEY = 'organizate_tasks';
const BOARDS_KEY = 'organizate_boards';

const boardTitle = document.querySelector('[data-board-title]');
const boardCanvas = document.querySelector('[data-board-canvas]');
const boardDrawing = document.querySelector('[data-board-drawing]');
const form = document.querySelector('[data-board-form]');
const itemType = document.querySelector('[data-item-type]');
const itemContent = document.querySelector('[data-item-content]');
const itemImage = document.querySelector('[data-item-image]');
const itemLink = document.querySelector('[data-item-link]');
const itemColor = document.querySelector('[data-item-color]');
const drawColorInput = document.querySelector('[data-draw-color]');
const drawSizeInput = document.querySelector('[data-draw-size]');
const toolButtons = document.querySelectorAll('[data-tool]');
const toolImageInput = document.querySelector('[data-tool-image]');

let boards = storage.get(BOARDS_KEY, {});
let activeTool = 'select';
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

function getItems() {
  if (!boards[taskId]) {
    boards[taskId] = { items: [], drawings: [] };
  }
  return boards[taskId];
}

function renderBoard() {
  if (!boardCanvas) {
    return;
  }
  const drawingEl = boardCanvas.querySelector('[data-board-drawing]');
  boardCanvas.innerHTML = '';
  if (drawingEl) {
    boardCanvas.appendChild(drawingEl);
  }
  const controls = document.createElement('div');
  controls.className = 'board-controls';
  controls.innerHTML = `
    <button title="Alejar">−</button>
    <span>100%</span>
    <button title="Acercar">＋</button>
  `;
  boardCanvas.appendChild(controls);
  const { items } = getItems();
  items.forEach((item) => {
    const el = document.createElement('article');
    el.className = `board-item ${item.type}`;
    el.dataset.itemId = item.id;
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;
    if (item.type === 'image') {
      el.innerHTML = `<strong>${escapeHTML(item.title)}</strong><img src="${item.src}" alt="${escapeHTML(item.title)}" />`;
    } else if (item.type === 'link') {
      el.innerHTML = `
        <strong>${escapeHTML(item.title)}</strong>
        <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">Abrir enlace</a>
      `;
    } else {
      el.style.background = item.color || '';
      el.innerHTML = `
        <strong>${escapeHTML(item.title)}</strong>
        <textarea data-item-text="${item.id}">${item.body}</textarea>
      `;
    }
    boardCanvas.appendChild(el);
  });
  drawAll();
}

function addItem(event) {
  event.preventDefault();
  if (!taskId) {
    return;
  }
  const type = itemType.value;
  const title = itemContent.value.trim();
  if (!title) {
    itemContent.focus();
    return;
  }
  const boardData = getItems();
  if (type === 'image') {
    const file = itemImage.files[0];
    if (!file) {
      itemImage.focus();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      boardData.items.push({
        id: createId('board'),
        type,
        title,
        src: reader.result,
        x: 80 + boardData.items.length * 20,
        y: 80 + boardData.items.length * 20,
      });
      saveBoards();
      renderBoard();
      form.reset();
    };
    reader.readAsDataURL(file);
  } else if (type === 'link') {
    const url = itemLink.value.trim();
    boardData.items.push({
      id: createId('board'),
      type,
      title,
      url: url || 'https://',
      x: 80 + boardData.items.length * 20,
      y: 80 + boardData.items.length * 20,
    });
    saveBoards();
    renderBoard();
    form.reset();
  } else {
    boardData.items.push({
      id: createId('board'),
      type,
      title,
      body: '',
      color: itemColor.value,
      x: 80 + boardData.items.length * 20,
      y: 80 + boardData.items.length * 20,
    });
    saveBoards();
    renderBoard();
    form.reset();
  }
}

let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

function onPointerDown(event) {
  const card = event.target.closest('.board-item');
  if (!card || activeTool !== 'select') {
    return;
  }
  dragTarget = card;
  const rect = card.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
  card.classList.add('dragging');
}

function onPointerMove(event) {
  if (!dragTarget) {
    return;
  }
  const canvasRect = boardCanvas.getBoundingClientRect();
  const x = event.clientX - canvasRect.left - offsetX;
  const y = event.clientY - canvasRect.top - offsetY;
  dragTarget.style.left = `${Math.max(0, x)}px`;
  dragTarget.style.top = `${Math.max(0, y)}px`;
}

function onPointerUp() {
  if (!dragTarget) {
    return;
  }
  const id = dragTarget.dataset.itemId;
  const boardData = getItems();
  const item = boardData.items.find((entry) => entry.id === id);
  if (item) {
    item.x = parseFloat(dragTarget.style.left);
    item.y = parseFloat(dragTarget.style.top);
    saveBoards();
  }
  dragTarget.classList.remove('dragging');
  dragTarget = null;
}

function handleTextChange(event) {
  const textarea = event.target.closest('[data-item-text]');
  if (!textarea) {
    return;
  }
  const itemId = textarea.dataset.itemText;
  const boardData = getItems();
  const item = boardData.items.find((entry) => entry.id === itemId);
  if (item) {
    item.body = textarea.value;
    saveBoards();
  }
}

function setActiveTool(tool) {
  activeTool = tool;
  toolButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tool === tool);
  });
  if (boardDrawing) {
    boardDrawing.style.pointerEvents = tool === 'draw' ? 'auto' : 'none';
    boardDrawing.style.cursor = tool === 'draw' ? 'crosshair' : 'default';
  }
}

function resizeCanvas() {
  if (!boardDrawing || !boardCanvas) {
    return;
  }
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
  if (!boardDrawing) {
    return;
  }
  const ctx = boardDrawing.getContext('2d');
  ctx.clearRect(0, 0, boardDrawing.width, boardDrawing.height);
  const { drawings } = getItems();
  drawings.forEach((stroke) => {
    stroke.points.forEach((point, index) => {
      if (index === 0) {
        return;
      }
      drawLine(stroke.points[index - 1], point, stroke.color, stroke.size);
    });
  });
}

function startDrawing(event) {
  if (activeTool !== 'draw') {
    return;
  }
  isDrawing = true;
  lastPoint = { x: event.offsetX, y: event.offsetY };
  const boardData = getItems();
  boardData.drawings.push({
    color: drawColorInput.value,
    size: parseInt(drawSizeInput.value, 10),
    points: [lastPoint],
  });
  saveBoards();
}

function drawMove(event) {
  if (!isDrawing || activeTool !== 'draw') {
    return;
  }
  const point = { x: event.offsetX, y: event.offsetY };
  drawLine(lastPoint, point, drawColorInput.value, parseInt(drawSizeInput.value, 10));
  lastPoint = point;
  const boardData = getItems();
  const stroke = boardData.drawings.at(-1);
  if (stroke) {
    stroke.points.push(point);
    saveBoards();
  }
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

function addQuickItem(type) {
  const boardData = getItems();
  if (type === 'note') {
    boardData.items.push({
      id: createId('note'),
      type: 'note',
      title: 'Post-it',
      body: '',
      color: itemColor ? itemColor.value : '#fff6bf',
      x: 120 + boardData.items.length * 16,
      y: 120 + boardData.items.length * 16,
    });
  }
  if (type === 'text') {
    boardData.items.push({
      id: createId('text'),
      type: 'text',
      title: 'Texto',
      body: 'Escribe aquí...',
      color: '#ffffff',
      x: 120 + boardData.items.length * 16,
      y: 120 + boardData.items.length * 16,
    });
  }
  if (type === 'link') {
    boardData.items.push({
      id: createId('link'),
      type: 'link',
      title: 'Link',
      url: 'https://',
      x: 120 + boardData.items.length * 16,
      y: 120 + boardData.items.length * 16,
    });
  }
  saveBoards();
  renderBoard();
}

if (boardCanvas) {
  boardCanvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  boardCanvas.addEventListener('input', handleTextChange);
}

if (boardDrawing) {
  boardDrawing.addEventListener('pointerdown', startDrawing);
  boardDrawing.addEventListener('pointermove', drawMove);
  boardDrawing.addEventListener('pointerup', stopDrawing);
  boardDrawing.addEventListener('pointerleave', stopDrawing);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setActiveTool('select');
}

toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const tool = button.dataset.tool;
    setActiveTool(tool);
    if (tool === 'note' || tool === 'text' || tool === 'link') {
      addQuickItem(tool);
    }
  });
});

if (toolImageInput) {
  toolImageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const boardData = getItems();
    const reader = new FileReader();
    reader.onload = () => {
      boardData.items.push({
        id: createId('image'),
        type: 'image',
        title: 'Imagen',
        src: reader.result,
        x: 120 + boardData.items.length * 16,
        y: 120 + boardData.items.length * 16,
      });
      saveBoards();
      renderBoard();
    };
    reader.readAsDataURL(file);
  });
}

if (form) {
  form.addEventListener('submit', addItem);
}

loadTaskName();
renderBoard();
