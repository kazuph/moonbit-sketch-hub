// Bootstrap: Moonpad (MoonBit compiler in browser) + Preview
import * as moonbitMode from "@moonbit/moonpad-monaco";
import * as monaco from "monaco-editor-core";

// Monaco editor worker
self.MonacoEnvironment = {
  getWorkerUrl: () => "/moonpad/editor.worker.js",
};

import { EXAMPLES } from './examples.js';


// MoonBit FFI declarations - compiled together with user code
const FFI_MBT = `
// ━━ Internal: Canvas/Ctx accessed via JS globals ━━
// Users never see these. The runtime sets window._ctx and window._frame.

#external
type Canvas

#external
type Ctx

extern "js" fn _get_canvas(id : String) -> Canvas =
  #|(id) => document.getElementById(id)

extern "js" fn _get_context(c : Canvas) -> Ctx =
  #|(c) => c.getContext("2d")

extern "js" fn _set_canvas_size(c : Canvas, w : Int, h : Int) -> Unit =
  #|(c, w, h) => { c.width = w; c.height = h; }

extern "js" fn _store_ctx(ctx : Ctx) -> Unit =
  #|(ctx) => { window._ctx = ctx; }

extern "js" fn _load_ctx() -> Ctx =
  #|() => window._ctx

extern "js" fn _store_width(w : Int) -> Unit =
  #|(w) => { window._w = w; }

extern "js" fn _store_height(h : Int) -> Unit =
  #|(h) => { window._h = h; }

extern "js" fn _load_width() -> Int =
  #|() => window._w

extern "js" fn _load_height() -> Int =
  #|() => window._h

extern "js" fn _store_frame(f : Int) -> Unit =
  #|(f) => { window._frame = f; }

extern "js" fn _load_frame() -> Int =
  #|() => window._frame

// ━━ Low-level ctx calls (private) ━━

extern "js" fn _set_fill_style(ctx : Ctx, s : String) -> Unit =
  #|(ctx, s) => { ctx.fillStyle = s; }

extern "js" fn _set_stroke_style(ctx : Ctx, s : String) -> Unit =
  #|(ctx, s) => { ctx.strokeStyle = s; }

extern "js" fn _set_line_width(ctx : Ctx, w : Double) -> Unit =
  #|(ctx, w) => { ctx.lineWidth = w; }

extern "js" fn _fill_rect(ctx : Ctx, x : Double, y : Double, w : Double, h : Double) -> Unit =
  #|(ctx, x, y, w, h) => ctx.fillRect(x, y, w, h)

extern "js" fn _begin_path(ctx : Ctx) -> Unit =
  #|(ctx) => ctx.beginPath()

extern "js" fn _close_path(ctx : Ctx) -> Unit =
  #|(ctx) => ctx.closePath()

extern "js" fn _arc(ctx : Ctx, x : Double, y : Double, r : Double, s : Double, e : Double) -> Unit =
  #|(ctx, x, y, r, s, e) => ctx.arc(x, y, r, s, e)

extern "js" fn _ctx_ellipse(ctx : Ctx, x : Double, y : Double, rx : Double, ry : Double, rot : Double, s : Double, e : Double) -> Unit =
  #|(ctx, x, y, rx, ry, rot, s, e) => ctx.ellipse(x, y, rx, ry, rot, s, e)

extern "js" fn _fill(ctx : Ctx) -> Unit =
  #|(ctx) => ctx.fill()

extern "js" fn _stroke_path(ctx : Ctx) -> Unit =
  #|(ctx) => ctx.stroke()

extern "js" fn _move_to(ctx : Ctx, x : Double, y : Double) -> Unit =
  #|(ctx, x, y) => ctx.moveTo(x, y)

extern "js" fn _line_to(ctx : Ctx, x : Double, y : Double) -> Unit =
  #|(ctx, x, y) => ctx.lineTo(x, y)

extern "js" fn _save(ctx : Ctx) -> Unit =
  #|(ctx) => ctx.save()

extern "js" fn _restore(ctx : Ctx) -> Unit =
  #|(ctx) => ctx.restore()

extern "js" fn _translate(ctx : Ctx, x : Double, y : Double) -> Unit =
  #|(ctx, x, y) => ctx.translate(x, y)

extern "js" fn _rotate(ctx : Ctx, a : Double) -> Unit =
  #|(ctx, a) => ctx.rotate(a)

extern "js" fn _scale(ctx : Ctx, x : Double, y : Double) -> Unit =
  #|(ctx, x, y) => ctx.scale(x, y)

extern "js" fn _fill_text(ctx : Ctx, s : String, x : Double, y : Double) -> Unit =
  #|(ctx, s, x, y) => ctx.fillText(s, x, y)

extern "js" fn _set_font(ctx : Ctx, f : String) -> Unit =
  #|(ctx, f) => { ctx.font = f; }

extern "js" fn _set_global_alpha(ctx : Ctx, a : Double) -> Unit =
  #|(ctx, a) => { ctx.globalAlpha = a; }

// ━━ Math (no ctx needed) ━━

extern "js" fn sin(x : Double) -> Double =
  #|(x) => Math.sin(x)

extern "js" fn cos(x : Double) -> Double =
  #|(x) => Math.cos(x)

extern "js" fn sqrt(x : Double) -> Double =
  #|(x) => Math.sqrt(x)

extern "js" fn abs_double(x : Double) -> Double =
  #|(x) => Math.abs(x)

extern "js" fn floor(x : Double) -> Double =
  #|(x) => Math.floor(x)

extern "js" fn random_double() -> Double =
  #|() => Math.random()

extern "js" fn request_animation_frame_loop(f : () -> Unit) -> Unit =
  #|(f) => { function loop() { f(); requestAnimationFrame(loop); } requestAnimationFrame(loop); }

// ━━ Mouse state (stored by runtime) ━━

extern "js" fn _load_mouse_x() -> Int =
  #|() => (window._mouseX || 0)

extern "js" fn _load_mouse_y() -> Int =
  #|() => (window._mouseY || 0)

extern "js" fn _load_mouse_pressed() -> Bool =
  #|() => (window._mousePressed || false)

// ━━ Processing-style public API (no ctx argument) ━━

fn size(w : Int, h : Int) -> Unit {
  let canvas = _get_canvas("canvas")
  _set_canvas_size(canvas, w, h)
  let ctx = _get_context(canvas)
  _store_ctx(ctx)
  _store_width(w)
  _store_height(h)
}

fn frame_count() -> Int {
  _load_frame()
}

fn width() -> Int {
  _load_width()
}

fn height() -> Int {
  _load_height()
}

fn mouse_x() -> Int {
  _load_mouse_x()
}

fn mouse_y() -> Int {
  _load_mouse_y()
}

fn mouse_is_pressed() -> Bool {
  _load_mouse_pressed()
}

fn background(r : Int, g : Int, b : Int) -> Unit {
  let ctx = _load_ctx()
  _save(ctx)
  _set_fill_style(ctx, rgb(r, g, b))
  _fill_rect(ctx, 0.0, 0.0, _load_width().to_double(), _load_height().to_double())
  _restore(ctx)
}

fn background_a(r : Int, g : Int, b : Int, a : Double) -> Unit {
  let ctx = _load_ctx()
  _save(ctx)
  _set_global_alpha(ctx, a)
  _set_fill_style(ctx, rgb(r, g, b))
  _fill_rect(ctx, 0.0, 0.0, _load_width().to_double(), _load_height().to_double())
  _restore(ctx)
}

fn set_fill_style(color : String) -> Unit {
  _set_fill_style(_load_ctx(), color)
}

fn set_stroke_style(color : String) -> Unit {
  _set_stroke_style(_load_ctx(), color)
}

fn set_line_width(w : Double) -> Unit {
  _set_line_width(_load_ctx(), w)
}

fn set_global_alpha(a : Double) -> Unit {
  _set_global_alpha(_load_ctx(), a)
}

fn set_font(f : String) -> Unit {
  _set_font(_load_ctx(), f)
}

fn fill_rect(x : Double, y : Double, w : Double, h : Double) -> Unit {
  _fill_rect(_load_ctx(), x, y, w, h)
}

fn begin_path() -> Unit {
  _begin_path(_load_ctx())
}

fn close_path() -> Unit {
  _close_path(_load_ctx())
}

fn arc(x : Double, y : Double, r : Double, start : Double, end : Double) -> Unit {
  _arc(_load_ctx(), x, y, r, start, end)
}

fn fill() -> Unit {
  _fill(_load_ctx())
}

fn stroke_path() -> Unit {
  _stroke_path(_load_ctx())
}

fn move_to(x : Double, y : Double) -> Unit {
  _move_to(_load_ctx(), x, y)
}

fn line_to(x : Double, y : Double) -> Unit {
  _line_to(_load_ctx(), x, y)
}

fn save() -> Unit {
  _save(_load_ctx())
}

fn restore() -> Unit {
  _restore(_load_ctx())
}

fn translate(x : Double, y : Double) -> Unit {
  _translate(_load_ctx(), x, y)
}

fn rotate(a : Double) -> Unit {
  _rotate(_load_ctx(), a)
}

fn scale(x : Double, y : Double) -> Unit {
  _scale(_load_ctx(), x, y)
}

fn fill_text(s : String, x : Double, y : Double) -> Unit {
  _fill_text(_load_ctx(), s, x, y)
}

// ━━ High-level drawing (Processing-style, no ctx) ━━

fn circle(x : Double, y : Double, d : Double) -> Unit {
  let ctx = _load_ctx()
  _begin_path(ctx)
  _arc(ctx, x, y, d / 2.0, 0.0, tau)
  _fill(ctx)
}

fn ellipse(x : Double, y : Double, w : Double, h : Double) -> Unit {
  let ctx = _load_ctx()
  _begin_path(ctx)
  _ctx_ellipse(ctx, x, y, w / 2.0, h / 2.0, 0.0, 0.0, tau)
  _fill(ctx)
}

fn draw_line(x1 : Double, y1 : Double, x2 : Double, y2 : Double) -> Unit {
  let ctx = _load_ctx()
  _begin_path(ctx)
  _move_to(ctx, x1, y1)
  _line_to(ctx, x2, y2)
  _stroke_path(ctx)
}

fn draw_rect(x : Double, y : Double, w : Double, h : Double) -> Unit {
  _fill_rect(_load_ctx(), x, y, w, h)
}

fn triangle(x1 : Double, y1 : Double, x2 : Double, y2 : Double, x3 : Double, y3 : Double) -> Unit {
  let ctx = _load_ctx()
  _begin_path(ctx)
  _move_to(ctx, x1, y1)
  _line_to(ctx, x2, y2)
  _line_to(ctx, x3, y3)
  _close_path(ctx)
  _fill(ctx)
}

fn draw_text(s : String, x : Double, y : Double) -> Unit {
  _fill_text(_load_ctx(), s, x, y)
}

// ━━ Helper types ━━

struct Vec2 {
  x : Double
  y : Double
}

fn Vec2::new(x : Double, y : Double) -> Vec2 {
  { x, y }
}

fn Vec2::add(self : Vec2, other : Vec2) -> Vec2 {
  { x: self.x + other.x, y: self.y + other.y }
}

fn Vec2::scale(self : Vec2, s : Double) -> Vec2 {
  { x: self.x * s, y: self.y * s }
}

fn Vec2::length(self : Vec2) -> Double {
  sqrt(self.x * self.x + self.y * self.y)
}

fn Vec2::dist(self : Vec2, other : Vec2) -> Double {
  let dx = self.x - other.x
  let dy = self.y - other.y
  sqrt(dx * dx + dy * dy)
}

fn lerp(a : Double, b : Double, t : Double) -> Double {
  a + (b - a) * t
}

fn map_range(v : Double, in_min : Double, in_max : Double, out_min : Double, out_max : Double) -> Double {
  out_min + (out_max - out_min) * ((v - in_min) / (in_max - in_min))
}

let tau : Double = 6.283185307179586

fn rgba(r : Int, g : Int, b : Int, a : Double) -> String {
  "rgba(" + r.to_string() + "," + g.to_string() + "," + b.to_string() + "," + a.to_string() + ")"
}

fn rgb(r : Int, g : Int, b : Int) -> String {
  "rgb(" + r.to_string() + "," + g.to_string() + "," + b.to_string() + ")"
}
`;

// Suppress LSP diagnostics (LSP can't see FFI file, so it reports false errors).
// We show compile errors from moonc-worker instead.
const _origSetMarkers = monaco.editor.setModelMarkers.bind(monaco.editor);
monaco.editor.setModelMarkers = (mdl, owner, markers) => {
  if (owner === "moonbit") return; // suppress LSP markers
  _origSetMarkers(mdl, owner, markers);
};

// Init moonpad
const moon = moonbitMode.init({
  onigWasmUrl: "/moonpad/onig.wasm",
  lspWorker: new Worker("/moonpad/lsp-server.js"),
  mooncWorkerFactory: () => new Worker("/moonpad/moonc-worker.js"),
  codeLensFilter: () => false,
});

// Restore saved example index from localStorage
const savedExample = parseInt(localStorage.getItem('currentExample') || '0', 10);
const initialExample = (savedExample >= 0 && savedExample < EXAMPLES.length) ? savedExample : 0;

// Editor shows ONLY user code. FFI is added at compile time.
const editorContainer = document.getElementById("editor");
const model = monaco.editor.createModel(EXAMPLES[initialExample].code, "moonbit");
const editor = monaco.editor.create(editorContainer, {
  model,
  theme: "vs-dark",
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 8 },
});

// Preview iframe
const preview = document.getElementById("preview");

function makePreviewHtml(compiledJs) {
  return `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e1e2e;overflow:hidden;}canvas{border-radius:4px;}</style></head><body><canvas id="canvas"></canvas><script>
window._mouseX=0;window._mouseY=0;window._mousePressed=false;
document.getElementById("canvas").addEventListener("mousemove",function(e){var r=e.target.getBoundingClientRect();window._mouseX=Math.round(e.clientX-r.left);window._mouseY=Math.round(e.clientY-r.top);});
document.getElementById("canvas").addEventListener("mousedown",function(){window._mousePressed=true;});
document.getElementById("canvas").addEventListener("mouseup",function(){window._mousePressed=false;});
document.getElementById("canvas").addEventListener("mouseleave",function(){window._mousePressed=false;});
document.getElementById("canvas").addEventListener("touchmove",function(e){e.preventDefault();var t=e.touches[0];var r=e.target.getBoundingClientRect();window._mouseX=Math.round(t.clientX-r.left);window._mouseY=Math.round(t.clientY-r.top);},{passive:false});
document.getElementById("canvas").addEventListener("touchstart",function(e){window._mousePressed=true;var t=e.touches[0];var r=e.target.getBoundingClientRect();window._mouseX=Math.round(t.clientX-r.left);window._mouseY=Math.round(t.clientY-r.top);});
document.getElementById("canvas").addEventListener("touchend",function(){window._mousePressed=false;});
${compiledJs}<\/script></body></html>`;
}

function showError(msg) {
  preview.srcdoc = `<!DOCTYPE html><html><body style="background:#1e1e2e;color:#f38ba8;padding:20px;font-family:monospace;font-size:14px;white-space:pre-wrap;">${msg}</body></html>`;
}

async function runSketch() {
  const code = model.getValue();
  const statusEl = document.getElementById("status");
  statusEl.textContent = "Compiling...";

  try {
    // FFI in separate file, user code + auto-main in sketch.mbt
    let userCode = code;
    if (!code.includes("fn main")) {
      userCode += `\n\nfn main {\n  setup()\n  _store_frame(0)\n  request_animation_frame_loop(fn() {\n    _store_frame(_load_frame() + 1)\n    draw()\n  })\n}\n`;
    }
    const result = await moon.compile({
      libInputs: [["ffi.mbt", FFI_MBT], ["sketch.mbt", userCode]],
      isMain: true,
    });

    if (result.kind === "success") {
      const js = new TextDecoder().decode(result.js);
      preview.srcdoc = makePreviewHtml(js);
      statusEl.textContent = "Running";
    } else {
      const msgs = result.diagnostics.map(d =>
        `[${d.level}] Line ${d.loc.start.line}: ${d.message}`
      ).join("\n");
      showError(msgs);
      statusEl.textContent = "Error";
    }
  } catch (e) {
    showError("Compile error: " + e.message);
    statusEl.textContent = "Error";
  }
}

// File browser
let currentExample = initialExample;
const fileBrowser = document.getElementById("file-browser");
const fileDrawer = document.getElementById("file-drawer");
const fileBackdrop = document.getElementById("file-backdrop");

EXAMPLES.forEach((ex, i) => {
  const item = document.createElement("div");
  item.className = i === currentExample ? "file-item active" : "file-item";
  item.innerHTML = `<span class="file-icon">${String(i + 1).padStart(2, "0")}</span><span class="file-name">${ex.name}</span>`;
  item.addEventListener("click", () => {
    currentExample = i;
    localStorage.setItem('currentExample', i);
    model.setValue(ex.code);
    document.querySelectorAll(".file-item").forEach(el => el.classList.remove("active"));
    item.classList.add("active");
    closeDrawer();
    runSketch();
  });
  fileBrowser.appendChild(item);
});

function openDrawer() {
  fileDrawer.classList.add("open");
  fileBackdrop.classList.add("open");
}
function closeDrawer() {
  fileDrawer.classList.remove("open");
  fileBackdrop.classList.remove("open");
}

document.getElementById("menu-btn").addEventListener("click", openDrawer);
document.getElementById("file-close").addEventListener("click", closeDrawer);
fileBackdrop.addEventListener("click", closeDrawer);

// Buttons
document.getElementById("run-btn").addEventListener("click", runSketch);
document.getElementById("reset-btn").addEventListener("click", () => {
  model.setValue(EXAMPLES[currentExample].code);
  runSketch();
});

// Ctrl+Enter
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runSketch();
  }
});

// Auto-run first example
runSketch();
