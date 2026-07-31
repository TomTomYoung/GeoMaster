const TAU = Math.PI * 2;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.gridSize = 25;
    this.showGrid = true;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  worldToScreen(p) {
    return {
      x: this.width / 2 + (p.x - this.camera.x) * this.camera.zoom,
      y: this.height / 2 - (p.y - this.camera.y) * this.camera.zoom,
    };
  }

  screenToWorld(p) {
    return {
      x: (p.x - this.width / 2) / this.camera.zoom + this.camera.x,
      y: -(p.y - this.height / 2) / this.camera.zoom + this.camera.y,
    };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, this.width, this.height);
    if (this.showGrid) this.drawGrid();
    this.drawAxes();
  }

  drawGrid() {
    const ctx = this.ctx;
    const step = this.gridSize * this.camera.zoom;
    if (step < 7) return;
    const origin = this.worldToScreen({ x: 0, y: 0 });
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = ((origin.x % step) + step) % step; x <= this.width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = ((origin.y % step) + step) % step; y <= this.height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawAxes() {
    const ctx = this.ctx;
    const origin = this.worldToScreen({ x: 0, y: 0 });
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(this.width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, this.height);
    ctx.stroke();
    ctx.restore();
  }

  drawScene(objects, preview = null) {
    this.clear();
    for (const object of objects) this.drawObject(object, false);
    if (preview) this.drawObject(preview, true);
  }

  drawObject(object, preview) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = preview ? '#64748b' : '#0f172a';
    ctx.fillStyle = preview ? '#64748b' : '#2563eb';
    ctx.lineWidth = preview ? 1.5 : 2;
    if (preview) ctx.setLineDash([6, 5]);

    switch (object.type) {
      case 'point': this.drawPoint(object.p, object.label); break;
      case 'segment': this.drawSegment(object.a, object.b); break;
      case 'line': this.drawInfiniteLine(object.a, object.b); break;
      case 'ray': this.drawRay(object.a, object.b); break;
      case 'circle': this.drawCircle(object.center, object.radius); break;
      default: break;
    }
    ctx.restore();
  }

  drawPoint(p, label = '') {
    const s = this.worldToScreen(p);
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4.5, 0, TAU);
    ctx.fill();
    if (label) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(label, s.x + 8, s.y - 8);
    }
  }

  drawSegment(a, b) {
    const sa = this.worldToScreen(a);
    const sb = this.worldToScreen(b);
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sb.x, sb.y);
    ctx.stroke();
  }

  drawInfiniteLine(a, b) {
    const sa = this.worldToScreen(a);
    const sb = this.worldToScreen(b);
    const dx = sb.x - sa.x;
    const dy = sb.y - sa.y;
    if (Math.hypot(dx, dy) < 0.001) return;
    const length = Math.max(this.width, this.height) * 3;
    const norm = Math.hypot(dx, dy);
    const ux = dx / norm;
    const uy = dy / norm;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(sa.x - ux * length, sa.y - uy * length);
    ctx.lineTo(sa.x + ux * length, sa.y + uy * length);
    ctx.stroke();
  }

  drawRay(a, b) {
    const sa = this.worldToScreen(a);
    const sb = this.worldToScreen(b);
    const dx = sb.x - sa.x;
    const dy = sb.y - sa.y;
    const norm = Math.hypot(dx, dy);
    if (norm < 0.001) return;
    const length = Math.max(this.width, this.height) * 3;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sa.x + (dx / norm) * length, sa.y + (dy / norm) * length);
    ctx.stroke();
  }

  drawCircle(center, radius) {
    const s = this.worldToScreen(center);
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.abs(radius * this.camera.zoom), 0, TAU);
    ctx.stroke();
  }
}
