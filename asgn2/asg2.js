// animal.js

let gl, a_Position, u_MVP, u_Color;
let projMatrix, viewMatrix;
let canvas, stats;       

let modelMatrix = new Matrix4();
const stack = [];

let gViewY    = 30,    
    gViewX    = 10,    
    gJointA   = 0,     // hip
    gJointB   = 0,     // knee
    gJointC   = 0,     // foot
    gHeadZ    = 0,     
    isWalking = false,
    isPoked   = false,
    pokeStart = 0;

function pushMatrix(m){ stack.push(new Matrix4(m)); }
function popMatrix()   { return stack.pop(); }

function initCubeBuffer(){
  const verts = new Float32Array([
    // front
    -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
    // back
    -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,   0.5,-0.5,-0.5,
  ]);
  const idx = new Uint8Array([
    0,1,2, 0,2,3,   4,5,6, 4,6,7,
    5,3,2, 5,2,6,   4,0,3, 4,3,5,
    7,6,2, 7,2,1,   4,7,1, 4,1,0
  ]);

  const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(a_Position);

  const ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
}
  
function drawCube(localModel, colorRGBA){
  const R = new Matrix4()
    .setRotate(gViewY, 0,1,0)
    .rotate(gViewX, 1,0,0);

  const mvp = new Matrix4(projMatrix)
    .multiply(viewMatrix)
    .multiply(R)
    .multiply(localModel);

  gl.uniformMatrix4fv(u_MVP, false, mvp.elements);
  gl.uniform4fv(u_Color, colorRGBA);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
}

function drawLeg(x,z, hip,knee,foot,color){
  pushMatrix(modelMatrix);
    modelMatrix.translate(x,-0.5,z);
    modelMatrix.rotate( hip, 0,0,1);
    modelMatrix.scale(0.2,1.0,0.2);
    drawCube(modelMatrix, color);

    pushMatrix(modelMatrix);
      modelMatrix.translate(0,-0.7,0);
      modelMatrix.rotate(knee, 0,0,1);
      modelMatrix.scale(1.0,1.0,1.0);
      drawCube(modelMatrix, color);

      pushMatrix(modelMatrix);
        modelMatrix.translate(0,-0.6,0.1);
        modelMatrix.rotate(foot, 0,0,1);
        modelMatrix.scale(0.2,0.4,0.5);
        drawCube(modelMatrix, color);
      modelMatrix = popMatrix();

    modelMatrix = popMatrix();
  modelMatrix = popMatrix();
}

function renderScene(){
  stats.begin();                      

  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  modelMatrix.setIdentity();

  const t = performance.now() * 0.002;
  const bodyBob  = isWalking ? 0.05 * Math.abs(Math.sin(t*2)) : 0;
  const headNod  = isWalking ?  5 * Math.sin(t*2)           : 0;
  const hip      = isWalking ? 30 * Math.sin(t)             : gJointA;
  const knee     = isWalking ? 30 * Math.sin(t + Math.PI/4) : gJointB;
  const foot     = isWalking ? 15 * Math.sin(t + Math.PI/2) : gJointC;

  // Body
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, bodyBob, 0);
    modelMatrix.scale(2,1,1);
    drawCube(modelMatrix, [0.8,0.6,0.3,1]);
  modelMatrix = popMatrix();

  // Legs
  drawLeg( 0.8,  0.5, -hip, -knee, -foot, [0.3,0.5,0.2,1]);
  drawLeg(-0.8,  0.5,  hip,  knee,  foot, [0.3,0.5,0.2,1]);
  drawLeg( 0.8, -0.5,  hip,  knee,  foot, [0.3,0.5,0.2,1]);
  drawLeg(-0.8, -0.5, -hip, -knee, -foot, [0.3,0.5,0.2,1]);

  // Head
  pushMatrix(modelMatrix);
    if(isPoked){
      let dt = (performance.now() - pokeStart)/200;
      if(dt > 1) isPoked = false;
      modelMatrix.rotate(15 * Math.sin(dt*10), 0,0,1);
    }
    modelMatrix.translate(1.3, 0.4+ bodyBob, gHeadZ);
    modelMatrix.rotate(headNod, 0,0,1);
    modelMatrix.scale(0.6,0.6,0.6);
    drawCube(modelMatrix, [0.2,0.7,0.9,1]);
  modelMatrix = popMatrix();

  stats.end();                        
}

function tick(){
  renderScene();
  requestAnimationFrame(tick);
}

function main(){
  canvas = document.getElementById('webgl');
  gl     = canvas.getContext('webgl');
  if(!gl) return alert('WebGL unavailable');

  gl.viewport(0,0,canvas.width,canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.9,0.9,0.9,1);

  // Shaders
  const VSHADER = `
    attribute vec4 a_Position;
    uniform mat4 u_MVP;
    void main() { gl_Position = u_MVP * a_Position; }`;
  const FSHADER = `
    precision mediump float;
    uniform vec4 u_Color;
    void main() { gl_FragColor = u_Color; }`;
  initShaders(gl, VSHADER, FSHADER);

  // Locations
  a_Position = gl.getAttribLocation(gl.program,'a_Position');
  u_MVP      = gl.getUniformLocation(gl.program,'u_MVP');
  u_Color    = gl.getUniformLocation(gl.program,'u_Color');

  // Camera
  projMatrix = new Matrix4().setPerspective(45, canvas.width/canvas.height, 0.1, 100);
  viewMatrix = new Matrix4().setLookAt(3,3,7,  0,0,0,  0,1,0);

  initCubeBuffer();

  stats = new Stats();
  stats.showPanel(0);               
  document.body.appendChild(stats.dom);

  document.getElementById('slider-global').oninput = e=>{
    gViewY = +e.target.value; renderScene();
  };
  document.getElementById('slider-viewX').oninput = e=>{
    gViewX = +e.target.value; renderScene();
  };
  document.getElementById('slider-jointA').oninput = e=>{
    gJointA = +e.target.value; renderScene();
  };
  document.getElementById('slider-jointB').oninput = e=>{
    gJointB = +e.target.value; renderScene();
  };
  document.getElementById('slider-jointC').oninput = e=>{
    gJointC = +e.target.value; renderScene();
  };
  document.getElementById('slider-head').oninput = e=>{
    gHeadZ = +e.target.value; renderScene();
  };
  document.getElementById('btn-animate').onclick = ()=>{
    isWalking = !isWalking;
    if(isWalking) requestAnimationFrame(tick);
  };

  // Poke
  canvas.addEventListener('click', e=>{
    if(e.shiftKey){
      isPoked   = true;
      pokeStart = performance.now();
      renderScene();
    }
  });

  // Mouse-drag for rotate
  let drag=false, lastX, lastY;
  canvas.onmousedown = e=>{
    drag=true; lastX=e.clientX; lastY=e.clientY; canvas.style.cursor='grabbing';
  };
  canvas.onmouseup =   e=>{ drag=false; canvas.style.cursor='grab'; };
  canvas.onmousemove = e=>{
    if(!drag) return;
    let dx=e.clientX-lastX, dy=e.clientY-lastY;
    gViewY+=dx*0.5; gViewX+=dy*0.5;
    lastX=e.clientX; lastY=e.clientY;
    renderScene();
  };

  renderScene();
}

window.onload = main;
