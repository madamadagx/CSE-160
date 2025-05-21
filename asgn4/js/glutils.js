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

  const vShader = loadShader(gl.VERTEX_SHADER, vShaderSource);
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
  attribute vec3 a_Normal;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjMatrix;
  uniform vec3 u_LightPos;

  varying vec2 v_UV;
  varying vec3 v_NormalDir;
  varying vec3 v_LightDir;

  void main() {
    // Position in world coordinates
    vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

    // Light direction in world coordinates
    v_LightDir = u_LightPos - worldPos.xyz;

    // Normal transformed into world coordinates (approx: ignore scaling)
    v_NormalDir = mat3(u_ModelMatrix) * a_Normal;

    // Pass UV
    v_UV = a_UV;

    // Final vertex position
    gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
  }

  
`;

  
    
  const FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  varying vec3 v_LightDir;
  varying vec3 v_NormalDir;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;

  uniform int u_TexIndex;
  uniform float u_TexWeight;
  uniform vec4 u_BaseColor;
  uniform bool u_ShowNormals;
  uniform bool u_UseLighting;

  uniform vec3 u_LightColor;

  void main() {
    vec4 texColor;
    if      (u_TexIndex == 0) texColor = texture2D(u_Sampler0, v_UV);
    else if (u_TexIndex == 1) texColor = texture2D(u_Sampler1, v_UV);
    else if (u_TexIndex == 2) texColor = texture2D(u_Sampler2, v_UV);
    else                      texColor = vec4(1.0);

    vec4 base = mix(u_BaseColor, texColor, u_TexWeight);

    if (u_ShowNormals) {
      gl_FragColor = vec4(normalize(v_NormalDir) * 0.5 + 0.5, 1.0);
      return;
    }

    if (!u_UseLighting) {
      gl_FragColor = base;
      return;
    }

    vec3 N = normalize(v_NormalDir);
    vec3 L = normalize(v_LightDir);
    vec3 V = normalize(-L);
    vec3 R = reflect(-L, N);

    float ambientStrength = 0.2;
    float specularStrength = 0.5;
    float shininess = 32.0;

    vec3 ambient  = ambientStrength * base.rgb;
    float diff    = max(dot(N, L), 0.0);
    vec3 diffuse  = diff * base.rgb;
    float spec    = pow(max(dot(R, V), 0.0), shininess);
    vec3 specular = specularStrength * spec * u_LightColor;

    vec3 finalColor = ambient + (diffuse + specular) * u_LightColor;

    gl_FragColor = vec4(finalColor, base.a);
  }
  `;



  const program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  gl.useProgram(program);
  const shader = { program };

  // Attributes
  shader.a_Position = gl.getAttribLocation(program, 'a_Position');
  shader.a_UV       = gl.getAttribLocation(program, 'a_UV');
  shader.a_Normal   = gl.getAttribLocation(program, 'a_Normal');

  // Matrices
  shader.u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
  shader.u_ViewMatrix  = gl.getUniformLocation(program, 'u_ViewMatrix');
  shader.u_ProjMatrix  = gl.getUniformLocation(program, 'u_ProjMatrix');

  // Samplers
  shader.u_Sampler0 = gl.getUniformLocation(program, 'u_Sampler0');
  shader.u_Sampler1 = gl.getUniformLocation(program, 'u_Sampler1');
  shader.u_Sampler2 = gl.getUniformLocation(program, 'u_Sampler2');
  gl.uniform1i(shader.u_Sampler0, 0);
  gl.uniform1i(shader.u_Sampler1, 1);
  gl.uniform1i(shader.u_Sampler2, 2);

  // Material
  shader.u_TexIndex    = gl.getUniformLocation(program, 'u_TexIndex');
  shader.u_TexWeight   = gl.getUniformLocation(program, 'u_TexWeight');
  shader.u_BaseColor   = gl.getUniformLocation(program, 'u_BaseColor');
  shader.u_LightPos = gl.getUniformLocation(program, 'u_LightPos');
  shader.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
  shader.u_SpotPos    = gl.getUniformLocation(program, 'u_SpotPos');
  shader.u_SpotDir    = gl.getUniformLocation(program, 'u_SpotDir');
  shader.u_SpotCutoff = gl.getUniformLocation(program, 'u_SpotCutoff');




  shader.u_ShowNormals = gl.getUniformLocation(program, 'u_ShowNormals');
  shader.u_UseLighting = gl.getUniformLocation(program, 'u_UseLighting');


  return shader;
}

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

export function loadTexture(gl, url, unit = 0) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0])
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
