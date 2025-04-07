let canvas, ctx;

function main() {  
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  ctx = canvas.getContext('2d');
  clearCanvas();

  let v1 = new Vector3([2.25, 2.25, 0]);
  let v2 = new Vector3([1.5, 0.5, 0]);
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);
}

function handleDrawEvent() {
  clearCanvas();
  let x1 = parseFloat(document.getElementById("x").value);
  let y1 = parseFloat(document.getElementById("y").value);
  let x2 = parseFloat(document.getElementById("x2").value);
  let y2 = parseFloat(document.getElementById("y2").value);
  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);
}

function handleDrawOperationEvent() {
  clearCanvas();

  // Get v1 and v2 from inputs
  let x1 = parseFloat(document.getElementById("x").value);
  let y1 = parseFloat(document.getElementById("y").value);
  let v1 = new Vector3([x1, y1, 0]);

  let x2 = parseFloat(document.getElementById("x2").value);
  let y2 = parseFloat(document.getElementById("y2").value);
  let v2 = new Vector3([x2, y2, 0]);

  // Draw original vectors
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);

  // Get the selected operation and scalar
  let op = document.getElementById("operation").value;
  let scalar = parseFloat(document.getElementById("scalar").value);

  if (op === "add") {
    let v3 = new Vector3([x1, y1, 0]);
    v3.add(new Vector3([x2, y2, 0]));
    drawVector(v3, "green", ctx);
  } else if (op === "sub") {
    let v3 = new Vector3([x1, y1, 0]);
    v3.sub(new Vector3([x2, y2, 0]));
    drawVector(v3, "green", ctx);
  } else if (op === "mul") {
    let v3 = new Vector3([x1, y1, 0]);
    let v4 = new Vector3([x2, y2, 0]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, "green", ctx);
    drawVector(v4, "green", ctx);
  } else if (op === "div") {
    let v3 = new Vector3([x1, y1, 0]);
    let v4 = new Vector3([x2, y2, 0]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, "green", ctx);
    drawVector(v4, "green", ctx);
  } else if (op === "magnitude") {
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    console.log("v1 magnitude:", mag1);
    console.log("v2 magnitude:", mag2);

    let nv1 = new Vector3([x1, y1, 0]).normalize();
    let nv2 = new Vector3([x2, y2, 0]).normalize();
    drawVector(nv1, "green", ctx);
    drawVector(nv2, "green", ctx);
  } else if (op === "normalize") {
    // Normalize v1 and v2 in place and draw them in green.
    v1.normalize();
    v2.normalize();
    drawVector(v1, "green", ctx);
    drawVector(v2, "green", ctx);
  } else if (op === "angle") {
    const angleDeg = angleBetween(v1, v2);
    console.log("Angle between v1 and v2:", angleDeg.toFixed(2), "degrees");
  
    const nv1 = new Vector3([x1, y1, 0]).normalize();
    const nv2 = new Vector3([x2, y2, 0]).normalize();
    drawVector(nv1, "green", ctx);
    drawVector(nv2, "green", ctx);
  } else if (op === "area") {
    const area = areaTriangle(v1, v2);
    console.log("Area of triangle spanned by v1 and v2:", area.toFixed(2));
  
    drawVector(v1, "red", ctx);
    drawVector(v2, "blue", ctx);
  }
  
  
  
}
function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();

  if (mag1 === 0 || mag2 === 0) return NaN;

  const cosTheta = dot / (mag1 * mag2);

  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  const radians = Math.acos(clampedCos);
  const degrees = radians * (180 / Math.PI);
  return degrees;
}

function drawVector(v, color, ctx) {
  const scale = 20;
  const originX = 200;
  const originY = 200;
  const endX = originX + v.elements[0] * scale;
  const endY = originY - v.elements[1] * scale; 
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
function areaTriangle(v1, v2) {
  const crossVec = Vector3.cross(v1, v2);
  const areaParallelogram = crossVec.magnitude();
  const areaTriangle = areaParallelogram / 2;
  return areaTriangle;
}
function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
