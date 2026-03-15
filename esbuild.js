import esbuild from "esbuild";
import fs from "fs";

fs.rmSync("./dist", { recursive: true, force: true });
fs.mkdirSync("./dist/moonpad", { recursive: true });

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
