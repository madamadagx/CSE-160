let canvas, gl;
let a_Position, u_FragColor, u_Size;
let g_shapesList = [];
let g_selectedType = 'point';
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 10;
let g_selectedSegments = 20;
let g_mouseDown = false;

class Point {
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
  }
  render() {
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniform1f(u_Size, this.size);
  
    gl.disableVertexAttribArray(a_Position);
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
  
    gl.drawArrays(gl.POINTS, 0, 1);
  }
  
}

class Triangle {
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
  }
  render() {
    let [x, y] = this.position;
    let d = this.size / 200;
    let verts = new Float32Array([
      x, y + d,
      x - d, y - d,
      x + d, y - d
    ]);
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniform1f(u_Size, this.size);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

class Circle {
  constructor(position, color, size, segments) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.segments = segments;
  }
  render() {
    let [x, y] = this.position;
    let r = this.size / 200;
    let verts = [];
    for (let i = 0; i < this.segments; i++) {
      let angle1 = (i * 2 * Math.PI) / this.segments;
      let angle2 = ((i + 1) * 2 * Math.PI) / this.segments;
      verts.push(x, y);
      verts.push(x + r * Math.cos(angle1), y + r * Math.sin(angle1));
      verts.push(x + r * Math.cos(angle2), y + r * Math.sin(angle2));
    }
    gl.uniform4f(u_FragColor, ...this.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  }
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  canvas.onmousedown = (ev) => { g_mouseDown = true; click(ev); };
  canvas.onmousemove = (ev) => { if (g_mouseDown) click(ev); };
  canvas.onmouseup = () => { g_mouseDown = false; };
}

function connectVariablesToGLSL() {
  const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = u_Size;
    }`;
  const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }`;
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    alert('Failed to load shaders');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
}

function click(ev) {
  const [x, y] = convertCoordinates(ev);
  const shape = g_selectedType === 'point'
    ? new Point([x, y], g_selectedColor, g_selectedSize)
    : g_selectedType === 'triangle'
    ? new Triangle([x, y], g_selectedColor, g_selectedSize)
    : new Circle([x, y], g_selectedColor, g_selectedSize, g_selectedSegments);

  //g_shapesList.push(shape);
  g_shapesList.push(shape);
  shape.render(); // only draw the new shape
  }

function convertCoordinates(ev) {
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);
  return [x, y];
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let s of g_shapesList) s.render();
}

function clearCanvas() {
  g_shapesList = [];
  renderAllShapes();
}

function drawPicture() {
  const size = 30;
  const trunkColor = [0.55, 0.27, 0.07, g_selectedColor[3]];
  const leafColor = [0.0, 0.6, 0.0, g_selectedColor[3]];
  const mountainColor = [0.5, 0.5, 0.5, g_selectedColor[3]];
  const sunColor = [1.0, 0.8, 0.0, g_selectedColor[3]];
  const houseBaseColor = [0.7, 0.3, 0.3, g_selectedColor[3]];
  const roofColor = [0.5, 0.0, 0.0, g_selectedColor[3]];

  // Tree 1
  let x = -0.5;
  let y = -0.3;
  g_shapesList.push(new Triangle([x, y - 0.15], trunkColor, size));
  g_shapesList.push(new Triangle([x, y], leafColor, size));
  g_shapesList.push(new Triangle([x, y + 0.1], leafColor, size * 1.2));
  g_shapesList.push(new Triangle([x, y + 0.22], leafColor, size * 1.4));
  g_shapesList.push(new Triangle([x, y + 0.30], leafColor, size * 1.5));

  // Tree 2
  x = 0.5;
  y = -0.3;
  g_shapesList.push(new Triangle([x, y - 0.15], trunkColor, size));
  g_shapesList.push(new Triangle([x, y], leafColor, size));
  g_shapesList.push(new Triangle([x, y + 0.1], leafColor, size * 1.2));
  g_shapesList.push(new Triangle([x, y + 0.22], leafColor, size * 1.4));
  g_shapesList.push(new Triangle([x, y + 0.30], leafColor, size * 1.5));

  // Mountains
  g_shapesList.push(new Triangle([-0.3, 0.60], mountainColor, 70));
  g_shapesList.push(new Triangle([-0.8, 0.60], mountainColor, 60));
  g_shapesList.push(new Triangle([0.2, 0.60], mountainColor, 50));

  // Sun in top right corner
  g_shapesList.push(new Triangle([0.75, 0.65], sunColor, 25));
  g_shapesList.push(new Triangle([0.75, 0.75], sunColor, 25));
  g_shapesList.push(new Triangle([0.65, 0.7], sunColor, 25));
  g_shapesList.push(new Triangle([0.75, 0.8], sunColor, 25));


  g_shapesList.push(new Triangle([0.0, -0.5], houseBaseColor, 30));
  g_shapesList.push(new Triangle([0.0, -0.5], houseBaseColor, -30));

  g_shapesList.push(new Triangle([0.0, -0.3], roofColor, 40));

  renderAllShapes();
}


function main() {
  setupWebGL();
  connectVariablesToGLSL();

  document.getElementById('clearButton').onclick = clearCanvas;
  document.getElementById('pointButton').onclick = () => g_selectedType = 'point';
  document.getElementById('triangleButton').onclick = () => g_selectedType = 'triangle';
  document.getElementById('circleButton').onclick = () => g_selectedType = 'circle';
  document.getElementById('pictureButton').onclick = drawPicture;

  document.getElementById('red').oninput = (e) => g_selectedColor[0] = e.target.value / 100;
  document.getElementById('green').oninput = (e) => g_selectedColor[1] = e.target.value / 100;
  document.getElementById('blue').oninput = (e) => g_selectedColor[2] = e.target.value / 100;
  document.getElementById('size').oninput = (e) => g_selectedSize = +e.target.value;
  document.getElementById('segments').oninput = (e) => g_selectedSegments = +e.target.value;
  document.getElementById('alpha').oninput = (e) => g_selectedColor[3] = e.target.value / 100;
}