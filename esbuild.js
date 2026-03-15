import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

fs.rmSync("./dist", { recursive: true, force: true });
fs.mkdirSync("./dist/moonpad", { recursive: true });

// Generate FFI_MBT from p5.mbt's browser runtime (single source of truth)
const browserMbtPath = path.resolve(__dirname, "../p5.mbt/runtime/browser.mbt");
if (!fs.existsSync(browserMbtPath)) {
  console.error("ERROR: p5.mbt browser runtime not found at", browserMbtPath);
  console.error("Make sure the p5.mbt repo is checked out alongside this project.");
  process.exit(1);
}
const ffiContent = fs.readFileSync(browserMbtPath, "utf8");
fs.writeFileSync(
  path.resolve(__dirname, "./src/_ffi_generated.js"),
  `// AUTO-GENERATED — do not edit. Source: p5.mbt/runtime/browser.mbt\nexport const FFI_MBT = ${JSON.stringify(ffiContent)};\n`
);

esbuild.buildSync({
  entryPoints: [
    "./src/bootstrap.js",
    "./node_modules/monaco-editor-core/esm/vs/editor/editor.worker.js",
  ],
  bundle: true,
  minify: true,
  format: "esm",
  outdir: "./dist/moonpad",
  entryNames: "[name]",
  loader: {
    ".ttf": "file",
    ".woff2": "file",
  },
});

// Copy moonpad static files
fs.copyFileSync(
  "./node_modules/@moonbit/moonpad-monaco/dist/lsp-server.js",
  "./dist/moonpad/lsp-server.js"
);
fs.copyFileSync(
  "./node_modules/@moonbit/moonpad-monaco/dist/moonc-worker.js",
  "./dist/moonpad/moonc-worker.js"
);
fs.copyFileSync(
  "./node_modules/@moonbit/moonpad-monaco/dist/onig.wasm",
  "./dist/moonpad/onig.wasm"
);

// Copy HTML
fs.copyFileSync("./index.html", "./dist/index.html");

// Copy p5.mbt runtime (pre-built JS from p5.mbt project)
const p5path = "../p5.mbt/_build/js/release/build/cmd/main/main.js";
if (fs.existsSync(p5path)) {
  fs.copyFileSync(p5path, "./dist/moonpad/p5-runtime.js");
}

console.log("Build complete -> ./dist/");
