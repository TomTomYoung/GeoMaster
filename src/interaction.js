import { circleCenterRadius, distance, snapPoint } from './geometry.js';

export class InteractionController {
  constructor(canvas, renderer, onChange) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.onChange = onChange;
    this.tool = 'point';
    this.objects = [];
    this.anchor = null;
    this.pointer = null;
    this.snapEnabled = true;
    this.draggingCamera = false;
    this.lastScreen = null;
    this.nextPointIndex = 1;
    this.bind();
  }

  bind() {
    this.canvas.addEventListener('pointerdown', event => this.pointerDown(event));
    this.canvas.addEventListener('pointermove', event => this.pointerMove(event));
    this.canvas.addEventListener('pointerup', event => this.pointerUp(event));
    this.canvas.addEventListener('pointercancel', event => this.pointerUp(event));
    this.canvas.addEventListener('wheel', event => this.wheel(event), { passive: false });
    this.canvas.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.anchor = null;
        this.pointer = null;
        this.render();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.undo();
      }
    });
  }

  setTool(tool) {
    this.tool = tool;
    this.anchor = null;
    this.pointer = null;
    this.render();
  }

  setSnap(enabled) {
    this.snapEnabled = enabled;
  }

  eventScreenPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  eventWorldPoint(event) {
    const world = this.renderer.screenToWorld(this.eventScreenPoint(event));
    return this.snapEnabled ? snapPoint(world, this.renderer.gridSize) : world;
  }

  pointerDown(event) {
    this.canvas.setPointerCapture(event.pointerId);
    if (event.button === 1 || event.button === 2 || event.altKey || this.tool === 'pan') {
      this.draggingCamera = true;
      this.lastScreen = this.eventScreenPoint(event);
      return;
    }

    const p = this.eventWorldPoint(event);
    if (this.tool === 'point') {
      this.objects.push({ type: 'point', p, label: `P${this.nextPointIndex++}` });
      this.changed();
      return;
    }

    if (!this.anchor) {
      this.anchor = p;
      this.pointer = p;
      this.render();
      return;
    }

    if (distance(this.anchor, p) < 1e-9) return;
    const object = this.makeObject(this.tool, this.anchor, p);
    if (object) this.objects.push(object);
    this.anchor = null;
    this.pointer = null;
    this.changed();
  }

  pointerMove(event) {
    const screen = this.eventScreenPoint(event);
    if (this.draggingCamera && this.lastScreen) {
      const dx = screen.x - this.lastScreen.x;
      const dy = screen.y - this.lastScreen.y;
      this.renderer.camera.x -= dx / this.renderer.camera.zoom;
      this.renderer.camera.y += dy / this.renderer.camera.zoom;
      this.lastScreen = screen;
      this.render();
      return;
    }
    this.pointer = this.eventWorldPoint(event);
    this.render();
  }

  pointerUp() {
    this.draggingCamera = false;
    this.lastScreen = null;
  }

  wheel(event) {
    event.preventDefault();
    const before = this.renderer.screenToWorld(this.eventScreenPoint(event));
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    this.renderer.camera.zoom = Math.min(8, Math.max(0.15, this.renderer.camera.zoom * factor));
    const after = this.renderer.screenToWorld(this.eventScreenPoint(event));
    this.renderer.camera.x += before.x - after.x;
    this.renderer.camera.y += before.y - after.y;
    this.render();
  }

  makeObject(tool, a, b) {
    if (tool === 'circle') {
      const circle = circleCenterRadius(a, b);
      return { type: 'circle', center: circle.center, radius: circle.radius };
    }
    if (['segment', 'line', 'ray'].includes(tool)) return { type: tool, a, b };
    return null;
  }

  previewObject() {
    if (!this.anchor || !this.pointer) return null;
    return this.makeObject(this.tool, this.anchor, this.pointer);
  }

  undo() {
    this.objects.pop();
    this.changed();
  }

  clear() {
    this.objects.length = 0;
    this.anchor = null;
    this.pointer = null;
    this.nextPointIndex = 1;
    this.changed();
  }

  resetView() {
    this.renderer.camera = { x: 0, y: 0, zoom: 1 };
    this.render();
  }

  changed() {
    this.onChange?.(this.objects);
    this.render();
  }

  render() {
    this.renderer.drawScene(this.objects, this.previewObject());
  }
}
