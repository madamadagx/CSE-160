import { initShaders, loadTexture } from './glutils.js';
import { Cube }     from './cube.js';
import { Sphere }   from './sphere.js';
import { Camera }   from './camera.js';
import { buildWorld } from './world.js';

let gl, shader, camera, scene, lightMarker, spotMarker;
let showNormals = false;
let lightingEnabled = true;

let lightColor = [1.0, 1.0, 1.0];
let lightAngle = 0;
let lightRadius = 3;
let lightHeight = 2;

const spotlightPos = [4, 2, 4];       
const spotlightDir = [0, 1, 0];      
const spotlightCutoff = Math.cos(Math.PI / 360); 
const texFiles = [
  'textures/bark.png',
  'textures/brickov.png',
  'textures/ice.png',
];

function getLightPos() {
  const x = Math.cos(lightAngle) * lightRadius;
  const z = Math.sin(lightAngle) * lightRadius;
  const y = lightHeight;
  return [x, y, z];
}

function hexToRGBArray(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255
  ];
}

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
  const lightPos = getLightPos();
  const world = buildWorld(gl, textures, lightPos,spotlightPos);
  scene = world.objs;
  lightMarker = world.lightMarker;
  spotMarker = world.spotMarker;


  // UI handlers
  document.getElementById("toggleNormals").onclick = () => {
    showNormals = !showNormals;
  };

  document.getElementById("radiusSlider").oninput = (e) => {
    lightRadius = parseFloat(e.target.value);
  };

  document.getElementById("heightSlider").oninput = (e) => {
    lightHeight = parseFloat(e.target.value);
  };

  document.getElementById("lightColorSlider").oninput = (e) => {
    lightColor = hexToRGBArray(e.target.value);
  };
  document.getElementById("toggleLighting").onclick = () => {
    lightingEnabled = !lightingEnabled;
  };

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
  lightAngle += 0.01;
  const lightPos = getLightPos();

  gl.clearColor(0.53, 0.81, 0.98, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shader.program);
  
  gl.uniform1i(shader.u_UseLighting, lightingEnabled);
  gl.uniform1i(shader.u_ShowNormals, showNormals);
  gl.uniform3fv(shader.u_LightPos, lightPos);
  gl.uniform3fv(shader.u_LightColor, lightColor);




  gl.uniformMatrix4fv(shader.u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ProjMatrix, false, camera.projMatrix.elements);

  for (const obj of scene) {
    obj.draw(shader);
  }

  lightMarker.modelMatrix.setTranslate(lightPos[0], lightPos[1], lightPos[2]);
  lightMarker.modelMatrix.scale(0.1, 0.1, 0.1);
  lightMarker.draw(shader);
  spotMarker.modelMatrix.setTranslate(spotlightPos[0], spotlightPos[1], spotlightPos[2]);
  spotMarker.modelMatrix.scale(0.1, 0.1, 0.1);
  spotMarker.draw(shader);

  requestAnimationFrame(render);
}
