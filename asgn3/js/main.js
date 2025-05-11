// js/main.js
import { initShaders, loadTexture } from './glutils.js';
import { Cube }     from './cube.js';
import { Camera }   from './camera.js';
import { buildWorld } from './world.js';

let gl, shader, camera, scene;

const texFiles = [
  'textures/bark.png',   
  'textures/brickov.png',
  'textures/ice.png',    
];

window.onload = async () => {
  const canvas = document.getElementById('glcanvas');
  canvas.width  = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL not supported');
    return;
  }

  shader = await initShaders(gl);


  const textures = texFiles.map((url, unit) =>
    loadTexture(gl, url, unit)
  );

  camera = new Camera(canvas);
  scene = buildWorld(gl, textures);

  document.addEventListener('keydown', onKey);
  canvas.addEventListener('mousemove', onMouse);

  gl.enable(gl.DEPTH_TEST);
  requestAnimationFrame(render);
};

function onKey(e) {
  switch (e.code) {
    case 'KeyW': camera.moveForward(); break;
    case 'KeyS': camera.moveBack();    break;
    case 'KeyA': camera.moveLeft();    break;
    case 'KeyD': camera.moveRight();   break;
    case 'KeyQ': camera.panLeft();     break;
    case 'KeyE': camera.panRight();    break;
  }
}

let lastX = 0, lastY = 0;
function onMouse(e) {
  if ((e.buttons & 1) === 0) {
    lastX = e.clientX;
    lastY = e.clientY;
    return;
  }
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;

  camera.pan(dx);
  camera.tilt(-dy);
}

function render() {
  gl.clearColor(0.53, 0.81, 0.98, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shader.program);
  gl.uniformMatrix4fv(
    shader.u_ViewMatrix, false,
    camera.viewMatrix.elements
  );
  gl.uniformMatrix4fv(
    shader.u_ProjMatrix, false,
    camera.projMatrix.elements
  );

  for (const obj of scene) {
    obj.draw(shader);
  }

  requestAnimationFrame(render);
}
