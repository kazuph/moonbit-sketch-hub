// Sketch Hub - MoonBit Creative Coding Platform
// All UI logic in MoonBit via JS FFI

// ============================================================
// External JS Types
// ============================================================

#external
priv type Element

#external
priv type EditorView

#external
priv type IFrame

// ============================================================
// DOM FFI
// ============================================================

extern "js" fn js_get_element(id : String) -> Element =
  #|(id) => document.getElementById(id)

extern "js" fn js_create_element(tag : String) -> Element =
  #|(tag) => document.createElement(tag)

extern "js" fn js_append_child(parent : Element, child : Element) -> Unit =
  #|(p, c) => p.appendChild(c)

extern "js" fn js_set_text(el : Element, text : String) -> Unit =
  #|(el, t) => { el.textContent = t; }

extern "js" fn js_set_class(el : Element, cls : String) -> Unit =
  #|(el, c) => { el.className = c; }

extern "js" fn js_set_inner_html(el : Element, html : String) -> Unit =
  #|(el, html) => { el.innerHTML = html; }

extern "js" fn js_add_click(el : Element, f : () -> Unit) -> Unit =
  #|(el, f) => el.addEventListener("click", f)

extern "js" fn js_add_keydown(f : (Bool, Bool, String) -> Unit) -> Unit =
  #|(f) => document.addEventListener("keydown", (e) => f(e.ctrlKey || e.metaKey, e.shiftKey, e.key))

extern "js" fn js_prevent_default_keydown(key : String) -> Unit =
  #|(key) => document.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === key) e.preventDefault(); })

extern "js" fn js_query_all_remove_class(selector : String, cls : String) -> Unit =
  #|(sel, cls) => document.querySelectorAll(sel).forEach(el => el.classList.remove(cls))

extern "js" fn js_add_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => el.classList.add(cls)

extern "js" fn js_toggle_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => el.classList.toggle(cls)

extern "js" fn js_remove_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => el.classList.remove(cls)

// ============================================================
// CodeMirror FFI
// ============================================================

extern "js" fn js_create_editor(parent : Element, initial_code : String) -> EditorView =
  #|(parent, code) => window.__createEditor(parent, code)

extern "js" fn js_get_editor_content(editor : EditorView) -> String =
  #|(editor) => editor.state.doc.toString()

extern "js" fn js_set_editor_content(editor : EditorView, content : String) -> Unit =
  #|(editor, content) => editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: content } })

// ============================================================
// Preview IFrame FFI
// ============================================================

extern "js" fn js_get_iframe(id : String) -> IFrame =
  #|(id) => document.getElementById(id)

extern "js" fn js_set_srcdoc(iframe : IFrame, html : String) -> Unit =
  #|(iframe, html) => { iframe.srcdoc = html; }

// ============================================================
// Console
// ============================================================

extern "js" fn js_log(msg : String) -> Unit =
  #|(msg) => console.log(msg)

// ============================================================
// App State
// ============================================================

priv struct App {
  mut editor : EditorView
  mut iframe : IFrame
  mut current_example : Int
}

let app : App = {
  editor: EditorView::cast(0),
  iframe: IFrame::cast(0),
  current_example: 0,
}

extern "js" fn EditorView::cast(v : Int) -> EditorView =
  #|(v) => v

extern "js" fn IFrame::cast(v : Int) -> IFrame =
  #|(v) => v

// ============================================================
// Example Sketches (MoonBit p5.mbt syntax)
// ============================================================

priv struct Example {
  name : String
  icon : String
  code : String
}

fn examples() -> Array[Example] {
  [
    {
      name: "Orbiting Circles",
      icon: "01",
      code:
        #|// Orbiting Circles - p5.mbt
        #|// カラフルな円が軌道上を回転する
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|}
        #|
        #|fn draw() {
        #|  @p5.background(30, g=30, b=46)
        #|  let t = @p5.frame_count().to_double() * 0.02
        #|
        #|  for i in 0..<12 {
        #|    let fi = i.to_double()
        #|    let angle = t + fi * @p5.pi / 6.0
        #|    let x = 200.0 + @p5.cos(angle) * 120.0
        #|    let y = 200.0 + @p5.sin(angle) * 120.0
        #|    let size = @p5.map(
        #|      @p5.sin(t + fi * 0.5), -1.0, 1.0, 10.0, 50.0,
        #|    )
        #|    let r = ((@p5.sin(t + fi * 0.3) + 1.0) * 127.0).to_int()
        #|    let g = ((@p5.cos(t + fi * 0.5) + 1.0) * 127.0).to_int()
        #|    @p5.fill(r, g=g, b=200, a=0.8)
        #|    @p5.no_stroke()
        #|    @p5.circle(x, y, size)
        #|  }
        #|
        #|  // マウス追従
        #|  if @p5.mouse_x() > 0.0 {
        #|    @p5.fill(255, g=100, b=100, a=0.6)
        #|    @p5.circle(@p5.mouse_x(), @p5.mouse_y(), 30.0)
        #|  }
        #|}
      ,
    },
    {
      name: "Perlin Flow Field",
      icon: "02",
      code:
        #|// Perlin Noise Flow Field - p5.mbt
        #|// ノイズベースのフローフィールド
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|  @p5.background(15, g=15, b=25)
        #|}
        #|
        #|fn draw() {
        #|  let t = @p5.frame_count().to_double() * 0.005
        #|
        #|  for i in 0..<50 {
        #|    let x = @p5.random(high=400.0)
        #|    let y = @p5.random(high=400.0)
        #|    let n = @p5.noise(x * 0.01 + t, y=y * 0.01)
        #|    let angle = n * @p5.pi * 4.0
        #|    let len = 15.0
        #|    let x2 = x + @p5.cos(angle) * len
        #|    let y2 = y + @p5.sin(angle) * len
        #|
        #|    let hue = (n * 255.0).to_int()
        #|    @p5.stroke(hue, g=180, b=255, a=0.15)
        #|    @p5.stroke_weight(1.0)
        #|    @p5.line(x, y, x2, y2)
        #|  }
        #|}
      ,
    },
    {
      name: "Particle System",
      icon: "03",
      code:
        #|// Particle System - p5.mbt
        #|// マウス位置からパーティクルを放出
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|}
        #|
        #|fn draw() {
        #|  @p5.background(20, g=20, b=35, a=0.1)
        #|
        #|  let cx = if @p5.mouse_x() > 0.0 {
        #|    @p5.mouse_x()
        #|  } else {
        #|    200.0
        #|  }
        #|  let cy = if @p5.mouse_y() > 0.0 {
        #|    @p5.mouse_y()
        #|  } else {
        #|    200.0
        #|  }
        #|  let t = @p5.frame_count().to_double()
        #|
        #|  for i in 0..<30 {
        #|    let fi = i.to_double()
        #|    let angle = @p5.random(high=@p5.pi * 2.0)
        #|    let speed = @p5.random(low=2.0, high=8.0)
        #|    let life = @p5.random(low=0.3, high=1.0)
        #|    let x = cx + @p5.cos(angle) * speed * life * 20.0
        #|    let y = cy + @p5.sin(angle) * speed * life * 20.0
        #|    let size = life * 6.0
        #|
        #|    let r = (((@p5.sin(t * 0.01 + fi) + 1.0) / 2.0) * 255.0).to_int()
        #|    let g = (((@p5.cos(t * 0.02 + fi) + 1.0) / 2.0) * 200.0).to_int()
        #|    @p5.fill(r, g=g, b=255, a=life * 0.6)
        #|    @p5.no_stroke()
        #|    @p5.circle(x, y, size)
        #|  }
        #|}
      ,
    },
    {
      name: "Recursive Tree",
      icon: "04",
      code:
        #|// Recursive Tree - p5.mbt
        #|// フラクタルツリー（風に揺れる）
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|}
        #|
        #|fn draw() {
        #|  @p5.background(20, g=20, b=40)
        #|  let t = @p5.frame_count().to_double() * 0.02
        #|
        #|  @p5.push()
        #|  @p5.translate(200.0, 380.0)
        #|  @p5.stroke(180, g=140, b=100)
        #|  @p5.stroke_weight(2.0)
        #|  branch(80.0, t, 0)
        #|  @p5.pop()
        #|}
        #|
        #|fn branch(len : Double, t : Double, depth : Int) {
        #|  if len < 4.0 || depth > 10 { return }
        #|
        #|  let sway = @p5.sin(t + len * 0.1) * 0.05
        #|
        #|  @p5.line(0.0, 0.0, 0.0, -len)
        #|  @p5.translate(0.0, -len)
        #|
        #|  let g = (len * 2.0 + 50.0).to_int()
        #|  let r = (120.0 - len).to_int()
        #|  @p5.stroke(r, g=g, b=80, a=0.9)
        #|  @p5.stroke_weight(@p5.max(len * 0.08, 0.5))
        #|
        #|  @p5.push()
        #|  @p5.rotate(0.4 + sway)
        #|  branch(len * 0.72, t, depth + 1)
        #|  @p5.pop()
        #|
        #|  @p5.push()
        #|  @p5.rotate(-0.5 + sway)
        #|  branch(len * 0.68, t, depth + 1)
        #|  @p5.pop()
        #|
        #|  if len > 20.0 {
        #|    @p5.push()
        #|    @p5.rotate(0.1 + sway * 2.0)
        #|    branch(len * 0.5, t, depth + 1)
        #|    @p5.pop()
        #|  }
        #|}
      ,
    },
    {
      name: "Wave Interference",
      icon: "05",
      code:
        #|// Wave Interference - p5.mbt
        #|// 波の干渉パターン
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|}
        #|
        #|fn draw() {
        #|  @p5.background(10, g=10, b=30)
        #|  let t = @p5.frame_count().to_double() * 0.03
        #|  let spacing = 8.0
        #|
        #|  let mut y = 0.0
        #|  while y < 400.0 {
        #|    let mut x = 0.0
        #|    while x < 400.0 {
        #|      let d1 = @p5.dist(x, y, 100.0, 100.0)
        #|      let d2 = @p5.dist(x, y, 300.0, 300.0)
        #|      let d3 = @p5.dist(x, y, @p5.mouse_x(), @p5.mouse_y())
        #|
        #|      let wave1 = @p5.sin(d1 * 0.05 - t)
        #|      let wave2 = @p5.sin(d2 * 0.05 - t * 1.3)
        #|      let wave3 = if d3 > 0.0 {
        #|        @p5.sin(d3 * 0.08 - t * 0.8) * 0.5
        #|      } else {
        #|        0.0
        #|      }
        #|
        #|      let v = (wave1 + wave2 + wave3 + 3.0) / 6.0
        #|      let r = (v * 100.0 + 50.0).to_int()
        #|      let g = (v * 150.0 + 80.0).to_int()
        #|      let b = (v * 255.0).to_int()
        #|      let size = v * 5.0 + 1.0
        #|
        #|      @p5.fill(r, g=g, b=b)
        #|      @p5.no_stroke()
        #|      @p5.circle(x, y, size)
        #|
        #|      x += spacing
        #|    }
        #|    y += spacing
        #|  }
        #|}
      ,
    },
    {
      name: "Spirograph",
      icon: "06",
      code:
        #|// Spirograph - p5.mbt
        #|// スピログラフアニメーション
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|  @p5.background(10, g=5, b=20)
        #|}
        #|
        #|fn draw() {
        #|  @p5.translate(200.0, 200.0)
        #|  let t = @p5.frame_count().to_double() * 0.01
        #|
        #|  let r1 = 120.0
        #|  let r2 = 45.0
        #|  let d_val = 80.0
        #|
        #|  for i in 0..<360 {
        #|    let fi = i.to_double() * 0.05 + t
        #|    let x = (r1 - r2) * @p5.cos(fi) + d_val * @p5.cos((r1 - r2) / r2 * fi)
        #|    let y = (r1 - r2) * @p5.sin(fi) - d_val * @p5.sin((r1 - r2) / r2 * fi)
        #|
        #|    let fi2 = fi + 0.05
        #|    let x2 = (r1 - r2) * @p5.cos(fi2) + d_val * @p5.cos((r1 - r2) / r2 * fi2)
        #|    let y2 = (r1 - r2) * @p5.sin(fi2) - d_val * @p5.sin((r1 - r2) / r2 * fi2)
        #|
        #|    let hue = ((fi * 30.0) % 255.0).to_int()
        #|    @p5.stroke(hue, g=200, b=255, a=0.3)
        #|    @p5.stroke_weight(0.5)
        #|    @p5.line(x, y, x2, y2)
        #|  }
        #|}
      ,
    },
    {
      name: "Bouncing Balls",
      icon: "07",
      code:
        #|// Bouncing Balls - p5.mbt
        #|// 弾むボール群
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|}
        #|
        #|fn draw() {
        #|  @p5.background(25, g=25, b=45)
        #|  let t = @p5.frame_count().to_double()
        #|
        #|  for i in 0..<20 {
        #|    let fi = i.to_double()
        #|    let speed = 0.02 + fi * 0.003
        #|    let phase = fi * 0.7
        #|
        #|    let x = ((fi * 47.0 + 50.0) % 350.0) + 25.0
        #|    let raw_y = @p5.sin(t * speed + phase)
        #|    let y = @p5.map(@p5.abs(raw_y), 0.0, 1.0, 350.0, 50.0)
        #|    let squash = if raw_y > 0.9 { 1.5 } else { 1.0 }
        #|    let size = 15.0 + fi * 1.5
        #|
        #|    let r = ((fi * 25.0 + 100.0) % 255.0).to_int()
        #|    let g = ((fi * 35.0 + 80.0) % 255.0).to_int()
        #|    let b = 220
        #|
        #|    // 影
        #|    @p5.fill(0, g=0, b=0, a=0.15)
        #|    @p5.no_stroke()
        #|    @p5.ellipse(x, 370.0, size * 1.2, 4.0)
        #|
        #|    // ボール
        #|    @p5.fill(r, g=g, b=b, a=0.85)
        #|    @p5.push()
        #|    @p5.translate(x, y)
        #|    @p5.scale(1.0, y=1.0 / squash)
        #|    @p5.circle(0.0, 0.0, size)
        #|    @p5.pop()
        #|  }
        #|}
      ,
    },
    {
      name: "Matrix Rain",
      icon: "08",
      code:
        #|// Matrix Rain - p5.mbt
        #|// マトリックス風デジタルレイン
        #|
        #|fn setup() {
        #|  @p5.create_canvas(400, 400)
        #|  @p5.background(0)
        #|}
        #|
        #|fn draw() {
        #|  @p5.background(0, g=0, b=0, a=0.05)
        #|  let t = @p5.frame_count().to_double()
        #|
        #|  let cols = 25
        #|  let cell = 16.0
        #|
        #|  for i in 0..<cols {
        #|    let fi = i.to_double()
        #|    let x = fi * cell + 4.0
        #|    // 各列が異なる速度で落下
        #|    let speed = 2.0 + @p5.noise(fi * 0.3) * 5.0
        #|    let head_y = (t * speed + fi * 50.0) % 500.0 - 50.0
        #|
        #|    for j in 0..<25 {
        #|      let fj = j.to_double()
        #|      let y = head_y - fj * cell
        #|      if y < 0.0 || y > 400.0 { continue }
        #|
        #|      let brightness = @p5.map(fj, 0.0, 25.0, 255.0, 0.0).to_int()
        #|      if fj == 0.0 {
        #|        @p5.fill(200, g=255, b=200)
        #|      } else {
        #|        @p5.fill(0, g=brightness, b=0)
        #|      }
        #|      @p5.no_stroke()
        #|      @p5.text_size(14)
        #|      // ランダムな文字コード
        #|      let code = @p5.random_int(0x30, 0x7E)
        #|      let ch = Char::from_int(code).to_string()
        #|      @p5.text(ch, x, y)
        #|    }
        #|  }
        #|}
      ,
    },
  ]
}

// ============================================================
// Preview HTML builder (runtime embeds p5-compatible API)
// ============================================================

fn make_preview_html(user_code : String) -> String {
  let head = "<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e1e2e;overflow:hidden;}canvas{border-radius:4px;}</style></head><body><canvas id=\"canvas\"></canvas><script>"
  let runtime = "const canvas=document.getElementById('canvas');const ctx=canvas.getContext('2d');let _w=400,_h=400,_fc='rgba(255,255,255,1)',_sc='rgba(0,0,0,1)',_df=true,_ds=true,_mx=0,_my=0,_fn=0;Object.defineProperty(window,'width',{get:()=>_w});Object.defineProperty(window,'height',{get:()=>_h});Object.defineProperty(window,'mouseX',{get:()=>_mx});Object.defineProperty(window,'mouseY',{get:()=>_my});Object.defineProperty(window,'frameCount',{get:()=>_fn});canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();_mx=e.clientX-r.left;_my=e.clientY-r.top;});canvas.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0],r=canvas.getBoundingClientRect();_mx=t.clientX-r.left;_my=t.clientY-r.top;},{passive:false});function createCanvas(w,h){_w=w;_h=h;canvas.width=w;canvas.height=h;}function background(r,g,b,a){if(g===undefined){g=r;b=r;a=1;}if(a===undefined)a=1;ctx.save();ctx.fillStyle='rgba('+r+','+g+','+b+','+a+')';ctx.fillRect(0,0,_w,_h);ctx.restore();}function fill(r,g,b,a){if(g===undefined){g=r;b=r;a=1;}if(a===undefined)a=1;_df=true;ctx.fillStyle='rgba('+r+','+g+','+b+','+a+')';}function noFill(){_df=false;}function stroke(r,g,b,a){if(g===undefined){g=r;b=r;a=1;}if(a===undefined)a=1;_ds=true;ctx.strokeStyle='rgba('+r+','+g+','+b+','+a+')';}function noStroke(){_ds=false;}function strokeWeight(w){ctx.lineWidth=w;}function circle(x,y,d){ellipse(x,y,d,d);}function ellipse(x,y,w,h){ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.closePath();if(_df)ctx.fill();if(_ds)ctx.stroke();}function rect(x,y,w,h){if(_df)ctx.fillRect(x,y,w,h);if(_ds)ctx.strokeRect(x,y,w,h);}function line(x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);if(_ds)ctx.stroke();}function triangle(x1,y1,x2,y2,x3,y3){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();if(_df)ctx.fill();if(_ds)ctx.stroke();}function point(x,y){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}function push(){ctx.save();}function pop(){ctx.restore();}function translate(x,y){ctx.translate(x,y);}function rotate(a){ctx.rotate(a);}function scale(x,y){ctx.scale(x,y===undefined?x:y);}function map(v,s1,e1,s2,e2){return s2+(e2-s2)*((v-s1)/(e1-s1));}function lerp(a,b,t){return a+(b-a)*t;}function constrain(v,lo,hi){return Math.max(lo,Math.min(hi,v));}function dist(x1,y1,x2,y2){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}function random(lo,hi){if(lo===undefined)return Math.random();if(hi===undefined){hi=lo;lo=0;}return lo+Math.random()*(hi-lo);}function textSize(s){ctx.font=s+'px monospace';}function text(s,x,y){if(_df)ctx.fillText(s,x,y);if(_ds)ctx.strokeText(s,x,y);}function abs(x){return Math.abs(x);}const _pm=new Uint8Array(512);const _bs=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];for(let i=0;i<256;i++){_pm[i]=_bs[i];_pm[i+256]=_bs[i];}function _fd(t){return t*t*t*(t*(t*6-15)+10);}function _gd(h,x,y){return((h&1)===0?x:-x)+((h&2)===0?y:-y);}function noise(x,y){if(y===undefined)y=0;const xi=Math.floor(x)&255,yi=Math.floor(y)&255,xf=x-Math.floor(x),yf=y-Math.floor(y),u=_fd(xf),v=_fd(yf),aa=_pm[_pm[xi]+yi],ab=_pm[_pm[xi]+yi+1],ba=_pm[_pm[xi+1]+yi],bb=_pm[_pm[xi+1]+yi+1];return(lerp(lerp(_gd(aa,xf,yf),_gd(ba,xf-1,yf),u),lerp(_gd(ab,xf,yf-1),_gd(bb,xf-1,yf-1),u),v)+1)/2;}"
  let tail = "</script></body></html>"
  let try_start = "\ntry{\n"
  let try_end = "\nif(typeof setup==='function')setup();if(typeof draw==='function'){function _loop(){_fn++;draw();requestAnimationFrame(_loop);}requestAnimationFrame(_loop);}}catch(e){document.body.innerHTML='<pre style=\"color:#f38ba8;padding:20px;font-size:14px;\">Error: '+e.message+'\\n'+e.stack+'</pre>';}"
  head + runtime + try_start + user_code + try_end + tail
}

// ============================================================
// File browser builder
// ============================================================

fn build_file_browser() -> Unit {
  let container = js_get_element("file-browser")
  let exs = examples()
  for i, ex in exs {
    let item = js_create_element("div")
    let cls = if i == 0 { "file-item active" } else { "file-item" }
    js_set_class(item, cls)
    js_set_inner_html(item, "<span class=\"file-icon\">" + ex.icon + "</span><span class=\"file-name\">" + ex.name + "</span>")
    let idx = i
    js_add_click(item, fn() { select_example(idx) })
    js_append_child(container, item)
  }
}

fn close_drawer() -> Unit {
  js_remove_class(js_get_element("file-drawer"), "open")
  js_remove_class(js_get_element("file-backdrop"), "open")
}

fn open_drawer() -> Unit {
  js_add_class(js_get_element("file-drawer"), "open")
  js_add_class(js_get_element("file-backdrop"), "open")
}

fn select_example(idx : Int) -> Unit {
  let exs = examples()
  if idx >= exs.length() { return }
  app.current_example = idx
  let code = exs[idx].code
  js_set_editor_content(app.editor, code)
  run_sketch(code)

  // Update active class
  js_query_all_remove_class(".file-item", "active")
  let container = js_get_element("file-browser")
  js_select_child(container, idx)

  // Close drawer after selection
  close_drawer()
}

extern "js" fn js_select_child(parent : Element, idx : Int) -> Unit =
  #|(parent, idx) => { const c = parent.children[idx]; if(c) c.classList.add("active"); }

// ============================================================
// Public API
// ============================================================

pub fn run_sketch(code : String) -> Unit {
  let html = make_preview_html(code)
  js_set_srcdoc(app.iframe, html)
}

pub fn start() -> Unit {
  let editor_el = js_get_element("editor")
  let iframe = js_get_iframe("preview")
  let exs = examples()
  let initial_code = exs[0].code

  app.editor = js_create_editor(editor_el, initial_code)
  app.iframe = iframe

  // Build file browser
  build_file_browser()

  // Drawer toggle
  js_add_click(js_get_element("menu-btn"), fn() { open_drawer() })
  js_add_click(js_get_element("file-close"), fn() { close_drawer() })
  js_add_click(js_get_element("file-backdrop"), fn() { close_drawer() })

  // Run button
  js_add_click(js_get_element("run-btn"), fn() {
    let code = js_get_editor_content(app.editor)
    run_sketch(code)
  })

  // Reset button
  js_add_click(js_get_element("reset-btn"), fn() {
    let exs2 = examples()
    let code = exs2[app.current_example].code
    js_set_editor_content(app.editor, code)
    run_sketch(code)
  })

  // Ctrl+Enter to run
  js_prevent_default_keydown("Enter")
  js_add_keydown(fn(ctrl, _shift, key) {
    if ctrl && key == "Enter" {
      let code = js_get_editor_content(app.editor)
      run_sketch(code)
    }
  })

  // Auto-run first example
  run_sketch(initial_code)
  js_log("[SketchHub] initialized with " + exs.length().to_string() + " examples")
}
