import { Renderer } from './renderer.js';
import { InteractionController } from './interaction.js';

const canvas = document.querySelector('#geometry-canvas');
const renderer = new Renderer(canvas);
const status = document.querySelector('#status');
const count = document.querySelector('#object-count');
const jsonOutput = document.querySelector('#json-output');

const controller = new InteractionController(canvas, renderer, objects => {
  count.textContent = String(objects.length);
  jsonOutput.value = JSON.stringify(objects, null, 2);
});

const toolButtons = [...document.querySelectorAll('[data-tool]')];
for (const button of toolButtons) {
  button.addEventListener('click', () => {
    toolButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    controller.setTool(button.dataset.tool);
    status.textContent = button.dataset.label;
  });
}

document.querySelector('#undo').addEventListener('click', () => controller.undo());
document.querySelector('#clear').addEventListener('click', () => controller.clear());
document.querySelector('#reset-view').addEventListener('click', () => controller.resetView());
document.querySelector('#toggle-grid').addEventListener('change', event => {
  renderer.showGrid = event.target.checked;
  controller.render();
});
document.querySelector('#toggle-snap').addEventListener('change', event => {
  controller.setSnap(event.target.checked);
});
document.querySelector('#copy-json').addEventListener('click', async () => {
  await navigator.clipboard.writeText(jsonOutput.value);
  const button = document.querySelector('#copy-json');
  const previous = button.textContent;
  button.textContent = 'Copied';
  setTimeout(() => { button.textContent = previous; }, 900);
});

const resizeObserver = new ResizeObserver(() => {
  renderer.resize();
  controller.render();
});
resizeObserver.observe(canvas);
renderer.resize();
controller.changed();
