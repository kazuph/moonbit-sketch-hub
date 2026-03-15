// Bootstrap: Moonpad (MoonBit compiler in browser) + Preview
import * as moonbitMode from "@moonbit/moonpad-monaco";
import * as monaco from "monaco-editor-core";

// Monaco editor worker
self.MonacoEnvironment = {
  getWorkerUrl: () => "/moonpad/editor.worker.js",
};

import { EXAMPLES } from './examples.js';
import { FFI_MBT } from './_ffi_generated.js';

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
