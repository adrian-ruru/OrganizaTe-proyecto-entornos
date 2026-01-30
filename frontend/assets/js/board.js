import { createId, escapeHTML, storage } from './utils.js';

const taskId = new URLSearchParams(window.location.search).get('task');
const TASKS_KEY = 'organizate_tasks';
const BOARDS_KEY = 'organizate_boards';

const boardTitle = document.querySelector('[data-board-title]');
const boardCanvas = document.querySelector('[data-board-canvas]');
const form = document.querySelector('[data-board-form]');
const itemType = document.querySelector('[data-item-type]');
const itemContent = document.querySelector('[data-item-content]');
const itemImage = document.querySelector('[data-item-image]');

let boards = storage.get(BOARDS_KEY, {});

function loadTaskName() {
  const tasks = storage.get(TASKS_KEY, []);
  const task = tasks.find((item) => item.id === taskId);
  if (boardTitle) {
    boardTitle.textContent = task ? `Pizarra: ${task.title}` : 'Pizarra colaborativa';
  }
}

function renderBoard() {
  if (!boardCanvas) {
    return;
  }
  boardCanvas.innerHTML = '';
  const items = boards[taskId] ?? [];
  items.forEach((item) => {
    const el = document.createElement('article');
    el.className = `board-item ${item.type}`;
    el.dataset.itemId = item.id;
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;
    if (item.type === 'image') {
      el.innerHTML = `<strong>${escapeHTML(item.title)}</strong><img src="${item.src}" alt="${escapeHTML(item.title)}" />`;
    } else {
      el.innerHTML = `<strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.body)}</p>`;
    }
    boardCanvas.appendChild(el);
  });
}

function saveBoards() {
  storage.set(BOARDS_KEY, boards);
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
  const items = boards[taskId] ?? [];
  if (type === 'image') {
    const file = itemImage.files[0];
    if (!file) {
      itemImage.focus();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      items.push({
        id: createId('board'),
        type,
        title,
        src: reader.result,
        x: 40 + items.length * 20,
        y: 40 + items.length * 20,
      });
      boards[taskId] = items;
      saveBoards();
      renderBoard();
      form.reset();
    };
    reader.readAsDataURL(file);
  } else {
    items.push({
      id: createId('board'),
      type,
      title,
      body: itemType.value === 'note' ? '' : 'Haz doble clic para editar contenido',
      x: 40 + items.length * 20,
      y: 40 + items.length * 20,
    });
    boards[taskId] = items;
    saveBoards();
    renderBoard();
    form.reset();
  }
}

function updateText(event) {
  const card = event.target.closest('.board-item');
  if (!card) {
    return;
  }
  const itemId = card.dataset.itemId;
  const items = boards[taskId] ?? [];
  const item = items.find((entry) => entry.id === itemId);
  if (!item || item.type === 'image') {
    return;
  }
  const newBody = prompt('Actualizar texto', item.body);
  if (newBody !== null) {
    item.body = newBody;
    saveBoards();
    renderBoard();
  }
}

let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

function onPointerDown(event) {
  const card = event.target.closest('.board-item');
  if (!card) {
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
  const items = boards[taskId] ?? [];
  const item = items.find((entry) => entry.id === id);
  if (item) {
    item.x = parseFloat(dragTarget.style.left);
    item.y = parseFloat(dragTarget.style.top);
    saveBoards();
  }
  dragTarget.classList.remove('dragging');
  dragTarget = null;
}

if (boardCanvas) {
  boardCanvas.addEventListener('dblclick', updateText);
  boardCanvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

if (form) {
  form.addEventListener('submit', addItem);
}

loadTaskName();
renderBoard();
