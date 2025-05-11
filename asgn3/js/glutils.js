// js/glutils.js

export function createProgram(gl, vShaderSource, fShaderSource) {
  function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    }
    return shader;
  }
  const vShader = loadShader(gl.VERTEX_SHADER,   vShaderSource);
  const fShader = loadShader(gl.FRAGMENT_SHADER, fShaderSource);
  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
  }
  return program;
}

export async function initShaders(gl) {
  const VSHADER_SOURCE = `
attribute vec3 a_Position;
attribute vec2 a_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
varying vec2 v_UV;
void main() {
  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
  v_UV = a_UV;
}
`;
  const FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;

// up to 3 texture units shown here; add more if needed
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;

// which one this cube uses
uniform int   u_TexIndex;
// how much to blend texture vs base color
uniform float u_TexWeight;
uniform vec4  u_BaseColor;

void main() {
  vec4 texColor;
  if      (u_TexIndex == 0) texColor = texture2D(u_Sampler0, v_UV);
  else if (u_TexIndex == 1) texColor = texture2D(u_Sampler1, v_UV);
  else if (u_TexIndex == 2) texColor = texture2D(u_Sampler2, v_UV);
  else                       texColor = vec4(1.0);
  gl_FragColor = mix(u_BaseColor, texColor, u_TexWeight);
}
`;

  const program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  gl.useProgram(program);
  const shader = { program };

  // Attributes
  shader.a_Position    = gl.getAttribLocation(program, 'a_Position');
  shader.a_UV          = gl.getAttribLocation(program, 'a_UV');

  // Matrices
  shader.u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
  shader.u_ViewMatrix  = gl.getUniformLocation(program, 'u_ViewMatrix');
  shader.u_ProjMatrix  = gl.getUniformLocation(program, 'u_ProjMatrix');

  // Explicit sampler uniforms
  shader.u_Sampler0 = gl.getUniformLocation(program, 'u_Sampler0');
  shader.u_Sampler1 = gl.getUniformLocation(program, 'u_Sampler1');
  shader.u_Sampler2 = gl.getUniformLocation(program, 'u_Sampler2');
  // Bind each sampler to texture unit
  gl.uniform1i(shader.u_Sampler0, 0);
  gl.uniform1i(shader.u_Sampler1, 1);
  gl.uniform1i(shader.u_Sampler2, 2);

  // Per‑cube texture index and blending
  shader.u_TexIndex  = gl.getUniformLocation(program, 'u_TexIndex');
  shader.u_TexWeight = gl.getUniformLocation(program, 'u_TexWeight');
  shader.u_BaseColor = gl.getUniformLocation(program, 'u_BaseColor');

  return shader;
}

/**
 * Initialize a simple checkerboard texture on TEXTURE0.
 */
export function initTexture(gl) {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = ((x ^ y) & 8) ? 255 : 0;
      const idx = (y * size + x) * 4;
      pixels[idx]   = c;
      pixels[idx+1] = c;
      pixels[idx+2] = c;
      pixels[idx+3] = 255;
    }
  }
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    size, size, 0,
    gl.RGBA, gl.UNSIGNED_BYTE,
    pixels
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

/**
 * Asynchronously load an image into a given texture unit.
 * Returns the WebGLTexture; it will be populated when the image finishes loading.
 */
export function loadTexture(gl, url, unit = 0) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  // placeholder 1×1 transparent pixel
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0])
  );
  // settings so NPOT images work
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const img = new Image();
  img.onload = () => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      gl.RGBA, gl.UNSIGNED_BYTE,
      img
    );
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  img.src = url;

  return tex;
}
