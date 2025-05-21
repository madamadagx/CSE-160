// js/sphere.js
import { Matrix4 } from './cuon-matrix.js';

export class Sphere {
  constructor(gl, slices = 24, stacks = 16, textureIndex = 0, texWeight = 0.0, baseColor = [1, 1, 1, 1]) {
    this.gl = gl;
    this.textureIndex = textureIndex;
    this.texWeight = texWeight;
    this.baseColor = baseColor;
    this.modelMatrix = new Matrix4();

    const positions = [];
    const normals   = [];
    const uvs       = [];

    for (let stack = 0; stack <= stacks; stack++) {
      const phi = stack * Math.PI / stacks;
      const y = Math.cos(phi);
      const r = Math.sin(phi);

      for (let slice = 0; slice <= slices; slice++) {
        const theta = slice * 2 * Math.PI / slices;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        positions.push(x, y, z);
        normals.push(x, y, z); 
        uvs.push(slice / slices, 1 - stack / stacks);
      }
    }

    const indices = [];
    for (let stack = 0; stack < stacks; stack++) {
      for (let slice = 0; slice < slices; slice++) {
        const i1 = stack * (slices + 1) + slice;
        const i2 = i1 + slices + 1;

        indices.push(i1, i2, i1 + 1);
        indices.push(i1 + 1, i2, i2 + 1);
      }
    }

    this.indexCount = indices.length;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  draw(shader) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(shader.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(shader.a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(shader.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.a_Normal);

    gl.uniformMatrix4fv(shader.u_ModelMatrix, false, this.modelMatrix.elements);
    gl.uniform1f(shader.u_TexWeight, this.texWeight);
    gl.uniform4fv(shader.u_BaseColor, this.baseColor);
    gl.uniform1i(shader.u_TexIndex, this.textureIndex);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }
}
