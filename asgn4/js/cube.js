// js/cube.js
import { Matrix4 } from './cuon-matrix.js';

const verticesUV = new Float32Array([
// front face
 -0.5,-0.5, 0.5,  0.0,0.0,
  0.5,-0.5, 0.5,  1.0,0.0,
  0.5, 0.5, 0.5,  1.0,1.0,
 -0.5,-0.5, 0.5,  0.0,0.0,
  0.5, 0.5, 0.5,  1.0,1.0,
 -0.5, 0.5, 0.5,  0.0,1.0,
// back face
  0.5,-0.5,-0.5,  0.0,0.0,
 -0.5,-0.5,-0.5,  1.0,0.0,
 -0.5, 0.5,-0.5,  1.0,1.0,
  0.5,-0.5,-0.5,  0.0,0.0,
 -0.5, 0.5,-0.5,  1.0,1.0,
  0.5, 0.5,-0.5,  0.0,1.0,
// top face
 -0.5, 0.5, 0.5,  0.0,0.0,
  0.5, 0.5, 0.5,  1.0,0.0,
  0.5, 0.5,-0.5,  1.0,1.0,
 -0.5, 0.5, 0.5,  0.0,0.0,
  0.5, 0.5,-0.5,  1.0,1.0,
 -0.5, 0.5,-0.5,  0.0,1.0,
// bottom face
 -0.5,-0.5,-0.5,  0.0,0.0,
  0.5,-0.5,-0.5,  1.0,0.0,
  0.5,-0.5, 0.5,  1.0,1.0,
 -0.5,-0.5,-0.5,  0.0,0.0,
  0.5,-0.5, 0.5,  1.0,1.0,
 -0.5,-0.5, 0.5,  0.0,1.0,
// right face
  0.5,-0.5, 0.5,  0.0,0.0,
  0.5,-0.5,-0.5,  1.0,0.0,
  0.5, 0.5,-0.5,  1.0,1.0,
  0.5,-0.5, 0.5,  0.0,0.0,
  0.5, 0.5,-0.5,  1.0,1.0,
  0.5, 0.5, 0.5,  0.0,1.0,
// left face
 -0.5,-0.5,-0.5,  0.0,0.0,
 -0.5,-0.5, 0.5,  1.0,0.0,
 -0.5, 0.5, 0.5,  1.0,1.0,
 -0.5,-0.5,-0.5,  0.0,0.0,
 -0.5, 0.5, 0.5,  1.0,1.0,
 -0.5, 0.5,-0.5,  0.0,1.0,
]);

const normals = new Float32Array([
  // front face
  0, 0, 1,  0, 0, 1,  0, 0, 1,
  0, 0, 1,  0, 0, 1,  0, 0, 1,
  // back face
  0, 0,-1,  0, 0,-1,  0, 0,-1,
  0, 0,-1,  0, 0,-1,  0, 0,-1,
  // top face
  0, 1, 0,  0, 1, 0,  0, 1, 0,
  0, 1, 0,  0, 1, 0,  0, 1, 0,
  // bottom face
  0,-1, 0,  0,-1, 0,  0,-1, 0,
  0,-1, 0,  0,-1, 0,  0,-1, 0,
  // right face
  1, 0, 0,  1, 0, 0,  1, 0, 0,
  1, 0, 0,  1, 0, 0,  1, 0, 0,
  // left face
 -1, 0, 0, -1, 0, 0, -1, 0, 0,
 -1, 0, 0, -1, 0, 0, -1, 0, 0,
]);

export class Cube {
  constructor(gl, textureIndex = 0, texWeight = 1.0, baseColor = [0,0,0,1]) {
    this.gl = gl;
    this.textureIndex = textureIndex;
    this.texWeight = texWeight;
    this.baseColor = baseColor;
    this.vertexCount = 36;

    // Shared vertex and normal buffers
    if (!Cube.buffer) {
      Cube.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, Cube.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, verticesUV, gl.STATIC_DRAW);
    }

    if (!Cube.normalBuffer) {
      Cube.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    }

    this.modelMatrix = new Matrix4();
  }

  draw(shader) {
    const gl = this.gl;

    // Vertex position and UVs
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.buffer);
    gl.vertexAttribPointer(shader.a_Position, 3, gl.FLOAT, false, 5*4, 0);
    gl.enableVertexAttribArray(shader.a_Position);
    gl.vertexAttribPointer(shader.a_UV, 2, gl.FLOAT, false, 5*4, 3*4);
    gl.enableVertexAttribArray(shader.a_UV);

    // Normals
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    gl.vertexAttribPointer(shader.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.a_Normal);

    // Matrices and material
    gl.uniformMatrix4fv(shader.u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniform1f(shader.u_TexWeight, this.texWeight);
    gl.uniform4fv(shader.u_BaseColor, this.baseColor);
    gl.uniform1i(shader.u_TexIndex, this.textureIndex);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}
