// js/world.js
import { Cube }    from './cube.js';
import { Matrix4 } from './cuon-matrix.js';

export function buildWorld(gl, textures) {
  const cubes = [];
  const [tex0, tex1, tex2] = textures;   // adjust as needed
  const MAP_SIZE     = 32;
  const MAX_HEIGHT   = 5;    // heights 0..4
  const WALL_DENSITY = 0.5;  // 50% of non‑zero columns

  // Ground (flat green)
  const ground = new Cube(gl, 0, 0.0, [0.2, 0.8, 0.2, 1.0]);
  ground.modelMatrix
        .translate(0, -0.05, 0)
        .scale(MAP_SIZE, 0.1, MAP_SIZE);
  cubes.push(ground);

  // Sky (flat blue)
  const sky = new Cube(gl, 0, 0.0, [0.53, 0.81, 0.98, 1.0]);
  sky.modelMatrix.scale(1000, 1000, 1000);
  cubes.push(sky);

  // Walls: generate h & t per cell, then apply density filter
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let z = 0; z < MAP_SIZE; z++) {
      const h = Math.floor(Math.random() * MAX_HEIGHT);
      if (h > 0 && Math.random() <= WALL_DENSITY) {
        // pick a texture index 0..2
        const t = Math.floor(Math.random() * textures.length);
        for (let y = 0; y < h; y++) {
          const w = new Cube(gl, t, 1.0, [1,1,1,1]);
          w.modelMatrix.translate(
            x - MAP_SIZE/2 + 0.5,
            y + 0.5,
            z - MAP_SIZE/2 + 0.5
          );
          cubes.push(w);
        }
      }
    }
  }

  return cubes;
}
